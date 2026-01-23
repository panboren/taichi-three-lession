import * as THREE from 'three'
import { TransportManager } from './TransportManager'
import { PerformanceMonitor } from './PerformanceMonitor'
import { ResourceManager } from './ResourceManager'
import { AdaptiveController } from './AdaptiveController'
import { BridgeOptions, TaichiEngine, TransportMode, PerformanceMetrics } from './types'

export class TaichiThreeBridge {
  private transportManager: TransportManager
  private performanceMonitor: PerformanceMonitor
  private resourceManager: ResourceManager
  private adaptiveController: AdaptiveController

  public renderer: THREE.WebGLRenderer
  public scene: THREE.Scene
  public camera: THREE.Camera
  public texture: THREE.Texture
  public mesh?: THREE.Mesh

  private taichiEngine?: TaichiEngine
  private running: boolean = false
  private rafId: number = 0
  private options: BridgeOptions

  constructor(options: BridgeOptions) {
    this.options = options
    this.renderer = options.renderer
    this.scene = options.scene
    this.camera = options.camera

    // 初始化管理器
    this.resourceManager = new ResourceManager()
    this.performanceMonitor = new PerformanceMonitor(options.preferredMode || TransportMode.Canvas)
    this.transportManager = new TransportManager(
      options,
      this.performanceMonitor,
      this.resourceManager
    )
    this.adaptiveController = new AdaptiveController(options, this.performanceMonitor)

    // 创建默认纹理
    this.texture = new THREE.Texture()
  }

  async init(taichiEngine: TaichiEngine): Promise<this> {
    this.taichiEngine = taichiEngine

    try {
      // 初始化传输管理器
      await this.transportManager.initialize(taichiEngine)

      // 创建默认平面
      this.createDefaultPlane()

      // 启动性能监控
      this.performanceMonitor.start()

      // 启动自适应控制器
      this.adaptiveController.start()

      return this
    } catch (error) {
      this.options.onError?.(error as Error, 'init')
      throw error
    }
  }

  private createDefaultPlane(): void {
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide
    })

    const geometry = new THREE.PlaneGeometry(
      this.options.planeSize?.width || 2,
      this.options.planeSize?.height || 2
    )

    this.mesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.mesh)
  }

  start(): void {
    if (this.running) return
    this.running = true

    const renderLoop = (time: number): void => {
      if (!this.running) return

      this.updateFrame(time)
        .then(() => {
          this.rafId = requestAnimationFrame(renderLoop)
        })
        .catch(error => {
          this.options.onError?.(error as Error, 'renderLoop')
          this.rafId = requestAnimationFrame(renderLoop)
        })
    }

    this.rafId = requestAnimationFrame(renderLoop)
  }

  private async updateFrame(time: number): Promise<void> {
    this.performanceMonitor.startFrame()

    try {
      // 执行 Taichi 计算
      if (this.taichiEngine) {
        if (typeof this.taichiEngine.runKernel === 'function') {
          await this.taichiEngine.runKernel('main', time)
        } else if (typeof this.taichiEngine.update === 'function') {
          this.taichiEngine.update(time)
        } else if (typeof this.taichiEngine.render === 'function') {
          this.taichiEngine.render(time)
        }
      }

      // 传输数据到 Three.js
      await this.transportManager.transfer()

      // 更新纹理
      this.texture = this.transportManager.getCurrentTexture()

      // 应用到 Mesh
      if (this.mesh) {
        ;(this.mesh.material as THREE.MeshBasicMaterial).map = this.texture
        this.mesh.material.needsUpdate = true
      }

      // 自适应控制
      await this.adaptiveController.update()

      // 性能回调
      const metrics = this.getMetrics()
      this.options.onPerformanceUpdate?.(metrics)
    } catch (error) {
      this.options.onError?.(error as Error, 'updateFrame')
    } finally {
      this.performanceMonitor.endFrame()
    }
  }

  stop(): void {
    this.running = false
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }
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
      material.needsUpdate = true
    }
  }

  getMetrics(): PerformanceMetrics {
    return this.performanceMonitor.getMetrics()
  }

  getCurrentMode(): TransportMode {
    return this.transportManager.getCurrentMode()
  }

  async switchMode(mode: TransportMode): Promise<boolean> {
    const success = await this.transportManager.switchStrategy(mode)
    if (success) {
      this.texture = this.transportManager.getCurrentTexture()
      if (this.mesh) {
        ;(this.mesh.material as THREE.MeshBasicMaterial).map = this.texture
        this.mesh.material.needsUpdate = true
      }
    }
    return success
  }

  async setSize(width: number, height: number): Promise<void> {
    await this.transportManager.setSize(width, height)
    this.adaptiveController.updateResolution(width, height)
  }

  dispose(): void {
    this.stop()

    // 清理所有管理器
    this.transportManager.dispose()
    this.performanceMonitor.stop()
    this.resourceManager.dispose()
    this.adaptiveController.dispose()

    // 清理 Three.js 资源
    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.mesh.geometry.dispose()
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(mat => mat.dispose())
      } else {
        this.mesh.material.dispose()
      }
    }

    this.texture.dispose()

    // 清理 Taichi 引擎
    if (this.taichiEngine && typeof this.taichiEngine.dispose === 'function') {
      this.taichiEngine.dispose()
    }
  }
}
