/**
 * ============================================================================
 * 🚀 终极 Taichi.js + Three.js 集成桥接器 - 主桥接器类
 * ============================================================================
 */

import * as THREE from 'three'
import type {
  WebGLRenderer,
  Scene,
  Camera,
  Texture,
  Mesh,
  Material,
  BufferAttribute,
  WebGL2RenderingContext
} from 'three'
import { TransportManager } from './TransportManager'
import { PerformanceMonitor } from './PerformanceMonitor'
import { ResourceManager } from './ResourceManager'
import { AdaptiveController } from './AdaptiveController'
import { WebGPUHandler } from './WebGPUHandler'
import { WorkerManager } from './WorkerManager'
import {
  UltimateTransferMode,
  UltimateBridgeOptions,
  UltimatePerformanceMetrics,
  TaichiEngine
} from './types'

export class UltimateTaichiThreeBridge {
  public readonly transportManager: TransportManager
  public readonly performanceMonitor: PerformanceMonitor
  public readonly resourceManager: ResourceManager
  public readonly adaptiveController: AdaptiveController
  public readonly webGPUHandler: WebGPUHandler
  public readonly workerManager: WorkerManager

  public taichiEngine: TaichiEngine
  public texture: THREE.Texture
  public mesh?: THREE.Mesh

  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.Camera
  private running = false
  private rafId = 0
  private options: UltimateBridgeOptions

  constructor(options: UltimateBridgeOptions) {
    this.options = options
    this.renderer = options.renderer
    this.scene = options.scene
    this.camera = options.camera

    // 初始化各个管理器
    this.resourceManager = new ResourceManager()
    this.performanceMonitor = new PerformanceMonitor(options.performance)
    this.transportManager = new TransportManager(
      options,
      this.performanceMonitor,
      this.resourceManager
    )
    this.adaptiveController = new AdaptiveController(options, this.performanceMonitor)
    this.webGPUHandler = new WebGPUHandler(options.webgpu)
    this.workerManager = new WorkerManager(options.offscreen)

    // 创建默认纹理
    this.texture = new THREE.Texture()
  }

  async init(taichiEngine: TaichiEngine): Promise<this> {
    this.taichiEngine = taichiEngine

    // 初始化 WebGPU (如果支持)
    await this.webGPUHandler.initialize()

    // 初始化 Worker (如果启用)
    if (this.options.offscreen?.enableWorker) {
      await this.workerManager.initialize()
    }

    // 初始化传输管理器
    await this.transportManager.initialize(this.taichiEngine)

    // 创建默认 Mesh
    this.createDefaultMesh()

    // 启动性能监控
    this.performanceMonitor.start()

    // 启动自适应控制器
    this.adaptiveController.start()

    // 启动渲染循环
    if (this.options.autoStart ?? true) {
      this.start()
    }

    return this
  }

  private createDefaultMesh(): void {
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide
    })

    const geometry = new THREE.PlaneGeometry(
      this.options.planeSize?.width ?? 2,
      this.options.planeSize?.height ?? 2
    )

    this.mesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.mesh)
  }

  async step(time: number = performance.now()): Promise<void> {
    if (!this.running) return

    // 性能监控开始
    this.performanceMonitor.startFrame()

    try {
      // 前置回调
      this.options.onBeforeStep?.(time)

      // 执行 Taichi 计算
      await this.executeTaichiEngine(time)

      // 传输数据到 Three.js
      await this.transportManager.transfer(time)

      // 更新纹理
      this.texture = this.transportManager.getCurrentTexture()

      // 应用到 Mesh
      if (this.mesh && 'map' in this.mesh.material) {
        ;(this.mesh.material as any).map = this.texture
        ;(this.mesh.material as any).needsUpdate = true
      }

      // 自适应控制
      await this.adaptiveController.update()

      // 后置回调
      this.options.onAfterStep?.(time)

      // 性能监控结束
      this.performanceMonitor.endFrame()
    } catch (error) {
      this.options.onError?.(error as Error, 'step')
    }
  }

  private async executeTaichiEngine(time: number): Promise<void> {
    if (typeof this.taichiEngine.runKernel === 'function') {
      await this.taichiEngine.runKernel('main', time)
    } else if (typeof (this.taichiEngine as any).update === 'function') {
      ;(this.taichiEngine as any).update(time)
    } else if (typeof (this.taichiEngine as any).render === 'function') {
      ;(this.taichiEngine as any).render(time)
    }
  }

  start(): void {
    if (this.running) return
    this.running = true

    if (typeof (this.taichiEngine as any).start === 'function') {
      ;(this.taichiEngine as any).start()
    }

    const loop = (time: number) => {
      if (!this.running) return
      this.step(time).then(() => {
        this.rafId = requestAnimationFrame(loop)
      })
    }

    this.rafId = requestAnimationFrame(loop)
  }

  stop(): void {
    this.running = false

    if (typeof (this.taichiEngine as any).stop === 'function') {
      ;(this.taichiEngine as any).stop()
    }

    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }

    this.performanceMonitor.stop()
    this.adaptiveController.stop()
  }

  setMesh(mesh: THREE.Mesh): void {
    if (this.mesh) {
      this.scene.remove(this.mesh)
    }
    this.mesh = mesh
    this.scene.add(mesh)
  }

  applyToMaterial(material: THREE.Material): void {
    if ('map' in material) {
      ;(material as any).map = this.texture
      ;(material as any).needsUpdate = true
    }
  }

  getMetrics(): UltimatePerformanceMetrics {
    return this.performanceMonitor.getMetrics()
  }

  getCurrentMode(): UltimateTransferMode {
    return this.transportManager.getCurrentMode()
  }

  async switchMode(mode: UltimateTransferMode): Promise<void> {
    await this.transportManager.switchMode(mode)
  }

  async setSize(width: number, height: number): Promise<void> {
    this.options.width = width
    this.options.height = height
    await this.transportManager.setSize(width, height)
    this.adaptiveController.updateResolution(width, height)
  }

  dispose(): void {
    this.stop()

    // 清理所有资源
    this.transportManager.dispose()
    this.performanceMonitor.dispose()
    this.resourceManager.dispose()
    this.workerManager.dispose()

    // 清理 Mesh
    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.mesh.geometry.dispose()
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(m => m.dispose())
      } else {
        this.mesh.material.dispose()
      }
    }

    // 清理纹理
    this.texture.dispose()

    // 清理 Taichi 引擎
    if (typeof (this.taichiEngine as any).dispose === 'function') {
      ;(this.taichiEngine as any).dispose()
    }
  }
}
