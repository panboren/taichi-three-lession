// V2 - Force reload
import * as THREE from 'three'
import { TransportManager } from './TransportManager'
import { PerformanceMonitor } from './PerformanceMonitor'
import { ResourceManager } from './ResourceManager'
import { AdaptiveController } from './AdaptiveController'
import { AutoOptimizer } from './optimizers/AutoOptimizer'
import type { BridgeOptions } from './types'
import type { TaichiEngine } from './types'
import type { PerformanceMetrics } from './types'
import { TransportMode } from './types'

/**
 * 增强版 Taichi.js + Three.js 桥接器
 *
 * 特性:
 * - 策略模式管理多种传输方式
 * - 自动性能优化和模式切换
 * - 自适应分辨率调整
 * - 详细的性能监控和预测
 * - 智能资源管理
 */
export class EnhancedTaichiThreeBridge {
  // 公开属性
  public renderer: THREE.WebGLRenderer
  public scene: THREE.Scene
  public camera: THREE.Camera
  public texture: THREE.Texture
  public mesh?: THREE.Mesh
  public options: Required<BridgeOptions>

  // 内部组件
  private transportManager: TransportManager
  private performanceMonitor: PerformanceMonitor
  private resourceManager: ResourceManager
  private adaptiveController: AdaptiveController
  private autoOptimizer?: AutoOptimizer

  // 状态
  private taichiEngine?: TaichiEngine
  private running: boolean = false
  private rafId: number = 0
  private initialized: boolean = false

  constructor(options: BridgeOptions) {
    this.options = this.normalizeOptions(options)
    this.renderer = options.renderer
    this.scene = options.scene
    this.camera = options.camera

    // 初始化管理器
    this.resourceManager = new ResourceManager()
    this.performanceMonitor = new PerformanceMonitor(
      this.options.preferredMode || TransportMode.Canvas,
      {
        enabled: this.options.performance.enabled,
        updateInterval: this.options.performance.updateInterval,
        enablePrediction: this.options.performance.enablePrediction,
        historySize: this.options.performance.historySize
      }
    )

    this.transportManager = new TransportManager(
      this.options,
      this.performanceMonitor,
      this.resourceManager
    )

    this.adaptiveController = new AdaptiveController(this.options, this.performanceMonitor)

    // 如果启用自动优化
    if (this.options.enableAutoOptimization) {
      this.autoOptimizer = new AutoOptimizer(this, this.options, this.performanceMonitor)
    }

    // 创建默认纹理
    this.texture = new THREE.Texture()
  }

  /**
   * 规范化选项
   */
  private normalizeOptions(options: BridgeOptions): Required<BridgeOptions> {
    return {
      width: options.width ?? 512,
      height: options.height ?? 512,
      maxResolution: options.maxResolution ?? 2048,
      minResolution: options.minResolution ?? 256,
      preferredMode: options.preferredMode ?? TransportMode.Canvas,
      enableAdaptiveResolution: options.enableAdaptiveResolution ?? false,
      targetFps: options.targetFps ?? 60,
      resolutionScaleFactor: options.resolutionScaleFactor ?? 0.9,
      renderer: options.renderer,
      scene: options.scene,
      camera: options.camera,
      planeSize: options.planeSize ?? { width: 2, height: 2 },
      textureLinear: options.textureLinear ?? true,
      textureWrapS: options.textureWrapS ?? THREE.ClampToEdgeWrapping,
      textureWrapT: options.textureWrapT ?? THREE.ClampToEdgeWrapping,
      generateMipmaps: options.generateMipmaps ?? false,
      autoDetectMode: options.autoDetectMode ?? true,
      enableModeFallback: options.enableModeFallback ?? true,
      fallbackThreshold: options.fallbackThreshold ?? 45,
      upgradeThreshold: options.upgradeThreshold ?? 55,
      enableWebGL2PBO: options.enableWebGL2PBO ?? true,
      pboBufferSize: options.pboBufferSize ?? 16,
      enableAutoOptimization: options.enableAutoOptimization ?? true,
      performance: {
        enabled: options.performance?.enabled ?? true,
        updateInterval: options.performance?.updateInterval ?? 500,
        enablePrediction: options.performance?.enablePrediction ?? true,
        historySize: options.performance?.historySize ?? 120
      },
      onPerformanceUpdate: options.onPerformanceUpdate ?? (() => {}),
      onModeChange: options.onModeChange ?? (() => {}),
      onResolutionChange: options.onResolutionChange ?? (() => {}),
      onError: options.onError ?? console.error,
      onWarning: options.onWarning ?? console.warn
    }
  }

  /**
   * 初始化桥接器
   */
  async init(taichiEngine: TaichiEngine): Promise<this> {
    if (this.initialized) return this

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

      // 启动自动优化器
      if (this.autoOptimizer) {
        this.autoOptimizer.start()
      }

      this.initialized = true
      return this
    } catch (error) {
      this.options.onError(error as Error, 'init')
      throw error
    }
  }

  /**
   * 创建默认平面
   */
  private createDefaultPlane(): void {
    // 从传输管理器获取初始纹理
    const initialTexture = this.transportManager.getCurrentTexture()
    console.log('[Bridge] Creating default plane with texture:', initialTexture)

    const material = new THREE.MeshBasicMaterial({
      map: initialTexture,
      transparent: true,
      side: THREE.DoubleSide
    })

    const geometry = new THREE.PlaneGeometry(
      this.options.planeSize.width,
      this.options.planeSize.height
    )

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.x = 0.8  // 将平面移到右侧
    this.scene.add(this.mesh)

    // 更新内部纹理引用
    this.texture = initialTexture

    console.log('[Bridge] Mesh created and added to scene:', this.mesh)
  }

  /**
   * 启动渲染循环
   */
  start(): void {
    if (this.running) return

    this.running = true

    // 启动 Taichi 引擎
    if (typeof this.taichiEngine?.start === 'function') {
      this.taichiEngine.start()
    }

    const renderLoop = (time: number): void => {
      if (!this.running) return

      this.updateFrame(time)
        .then(() => {
          this.rafId = requestAnimationFrame(renderLoop)
        })
        .catch(error => {
          this.options.onError(error as Error, 'renderLoop')
          this.rafId = requestAnimationFrame(renderLoop)
        })
    }

    this.rafId = requestAnimationFrame(renderLoop)
  }

  /**
   * 更新帧
   */
  private async updateFrame(time: number): Promise<void> {
    this.performanceMonitor.startFrame()

    try {
      // 执行 Taichi 计算
      await this.executeTaichiEngine(time)

      // 传输数据到 Three.js
      await this.transportManager.transfer()

      // 更新纹理
      this.texture = this.transportManager.getCurrentTexture()

      // 应用到 Mesh
      if (this.mesh) {
        const mat = this.mesh.material as THREE.MeshBasicMaterial
        mat.map = this.texture
        mat.needsUpdate = true
      }

      // 自适应控制
      await this.adaptiveController.update()

      // 性能回调
      const metrics = this.getMetrics()
      this.options.onPerformanceUpdate(metrics)
    } catch (error) {
      this.options.onError(error as Error, 'updateFrame')
    } finally {
      this.performanceMonitor.endFrame()
    }
  }

  /**
   * 执行 Taichi 引擎
   */
  private async executeTaichiEngine(time: number): Promise<void> {
    if (!this.taichiEngine) return

    if (typeof this.taichiEngine.runKernel === 'function') {
      await this.taichiEngine.runKernel('main', time)
    } else if (typeof this.taichiEngine.update === 'function') {
      this.taichiEngine.update(time)
    } else if (typeof this.taichiEngine.render === 'function') {
      this.taichiEngine.render(time)
    }
  }

  /**
   * 停止渲染循环
   */
  stop(): void {
    this.running = false

    // 停止 Taichi 引擎
    if (typeof this.taichiEngine?.stop === 'function') {
      this.taichiEngine.stop()
    }

    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }

    this.adaptiveController.stop()
    this.autoOptimizer?.stop()
  }

  /**
   * 设置自定义 Mesh
   */
  setMesh(mesh: THREE.Mesh): void {
    if (this.mesh) {
      this.scene.remove(this.mesh)
    }
    this.mesh = mesh
    this.scene.add(mesh)

    // 应用纹理
    if ('map' in mesh.material) {
      ;(mesh.material as any).map = this.texture
      mesh.material.needsUpdate = true
    }
  }

  /**
   * 应用纹理到材质
   */
  applyToMaterial(material: THREE.Material): void {
    if ('map' in material) {
      ;(material as any).map = this.texture
      material.needsUpdate = true
    }
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return this.performanceMonitor.getMetrics()
  }

  /**
   * 获取当前传输模式
   */
  getCurrentMode(): TransportMode {
    return this.transportManager.getCurrentMode()
  }

  /**
   * 切换传输模式
   */
  async switchMode(mode: TransportMode): Promise<boolean> {
    const oldMode = this.getCurrentMode()
    const success = await this.transportManager.switchStrategy(mode)

    if (success) {
      this.texture = this.transportManager.getCurrentTexture()
      if (this.mesh) {
        ;(this.mesh.material as THREE.MeshBasicMaterial).map = this.texture
        this.mesh.material.needsUpdate = true
      }
      this.options.onModeChange(oldMode, mode)
    }

    return success
  }

  /**
   * 设置分辨率
   */
  async setSize(width: number, height: number): Promise<void> {
    const oldResolution = { width: this.options.width, height: this.options.height }

    await this.transportManager.setSize(width, height)
    this.adaptiveController.updateResolution(width, height)

    this.options.onResolutionChange(oldResolution, { width, height })
  }

  /**
   * 预测性能
   */
  predictPerformance(): {
    nextFps: number
    trend: 'improving' | 'stable' | 'degrading'
    shouldFallback: boolean
    shouldUpgrade: boolean
  } {
    const metrics = this.performanceMonitor.getMetrics()
    const predictedFps = this.performanceMonitor.predictNextFps()
    const trend = this.performanceMonitor.predictTrend()

    return {
      nextFps: predictedFps,
      trend,
      shouldFallback: predictedFps < this.options.fallbackThreshold || trend === 'degrading',
      shouldUpgrade:
        predictedFps > this.options.upgradeThreshold &&
        trend === 'improving' &&
        metrics.stabilityScore > 0.8
    }
  }

  /**
   * 手动触发优化
   */
  async optimize(): Promise<void> {
    if (this.autoOptimizer) {
      await this.autoOptimizer.optimize()
    }
  }

  /**
   * 销毁桥接器
   */
  dispose(): void {
    this.stop()

    // 清理所有管理器
    this.transportManager.dispose()
    this.performanceMonitor.stop()
    this.resourceManager.dispose()
    this.adaptiveController.dispose()
    this.autoOptimizer?.dispose()

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
    if (typeof this.taichiEngine?.dispose === 'function') {
      this.taichiEngine.dispose()
    }

    this.initialized = false
  }
}
