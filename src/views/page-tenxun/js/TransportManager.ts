// V2 - Force reload
import * as THREE from 'three'
import type { BridgeOptions, TaichiEngine, TransportStrategy } from './types'
import { TransportMode } from './types'
import { PerformanceMonitor } from './PerformanceMonitor'
import { ResourceManager } from './ResourceManager'
import { CanvasStrategy } from './strategies/CanvasStrategy'
import { TransferableStrategy } from './strategies/TransferableStrategy'
import { WebGL2PBOStrategy } from './strategies/WebGL2PBOStrategy'
import { DataTextureStrategy } from './strategies/DataTextureStrategy'
import { WebGPUStrategy } from './strategies/WebGPUStrategy'

/**
 * 传输管理器
 * 负责管理不同的传输策略
 */
export class TransportManager {
  private strategies: Map<TransportMode, TransportStrategy> = new Map()
  private currentStrategy: TransportStrategy | null = null
  private options: Required<BridgeOptions>
  private performanceMonitor: PerformanceMonitor
  private resourceManager: ResourceManager
  private taichiEngine: TaichiEngine | null = null

  constructor(
    options: Required<BridgeOptions>,
    performanceMonitor: PerformanceMonitor,
    resourceManager: ResourceManager
  ) {
    this.options = options
    this.performanceMonitor = performanceMonitor
    this.resourceManager = resourceManager

    // 注册所有策略
    this.registerStrategies()
  }

  /**
   * 注册传输策略
   */
  private registerStrategies(): void {
    console.log('[TransportManager] Registering strategies...')

    // Canvas 策略(总是支持)
    this.strategies.set(TransportMode.Canvas, new CanvasStrategy())
    console.log('[TransportManager] Canvas strategy registered')

    // Transferable 策略
    if (TransferableStrategy.isSupported()) {
      this.strategies.set(TransportMode.Transferable, new TransferableStrategy())
      console.log('[TransportManager] Transferable strategy registered')
    }

    // WebGL2 PBO 策略
    if (this.options.enableWebGL2PBO && WebGL2PBOStrategy.isSupported()) {
      this.strategies.set(TransportMode.WebGL2PBO, new WebGL2PBOStrategy())
      console.log('[TransportManager] WebGL2PBO strategy registered')
    }

    // DataTexture 策略
    this.strategies.set(TransportMode.DataTexture, new DataTextureStrategy())
    console.log('[TransportManager] DataTexture strategy registered')

    // 暂时禁用 WebGPU 策略（避免初始化问题）
    // if (WebGPUStrategy.isSupported()) {
    //   this.strategies.set(TransportMode.WebGPU, new WebGPUStrategy())
    //   console.log('[TransportManager] WebGPU strategy registered')
    // }
  }

  /**
   * 初始化传输管理器
   */
  async initialize(taichiEngine: TaichiEngine): Promise<void> {
    this.taichiEngine = taichiEngine

    // 初始化所有策略
    for (const [mode, strategy] of this.strategies) {
      try {
        await strategy.initialize(taichiEngine, this.options)
      } catch (error) {
        console.warn(`Failed to initialize ${mode} strategy:`, error)
        this.strategies.delete(mode)
      }
    }

    // 选择初始策略
    let initialMode = this.options.preferredMode

    // 自动检测最佳模式
    if (this.options.autoDetectMode) {
      initialMode = this.detectBestMode()
    }

    // 如果首选模式不可用,选择回退模式
    if (!this.strategies.has(initialMode)) {
      initialMode = this.findFallbackMode()
    }

    // 切换到初始策略
    await this.switchStrategy(initialMode)
  }

  /**
   * 检测最佳传输模式
   */
  private detectBestMode(): TransportMode {
    // 优先级: WebGPU > Transferable > WebGL2PBO > DataTexture > Canvas
    if (this.strategies.has(TransportMode.WebGPU)) {
      return TransportMode.WebGPU
    }
    if (this.strategies.has(TransportMode.Transferable)) {
      return TransportMode.Transferable
    }
    if (this.strategies.has(TransportMode.WebGL2PBO)) {
      return TransportMode.WebGL2PBO
    }
    if (this.strategies.has(TransportMode.DataTexture)) {
      return TransportMode.DataTexture
    }
    return TransportMode.Canvas
  }

  /**
   * 找到回退模式
   */
  private findFallbackMode(): TransportMode {
    // Canvas 总是作为最后的回退选项
    if (this.strategies.has(TransportMode.Canvas)) {
      return TransportMode.Canvas
    }

    // 如果 Canvas 也不可用(不应该发生),使用任何可用的策略
    const modes = Array.from(this.strategies.keys())
    return modes[0] || TransportMode.Canvas
  }

  /**
   * 切换传输策略
   */
  async switchStrategy(mode: TransportMode): Promise<boolean> {
    const strategy = this.strategies.get(mode)

    if (!strategy) {
      console.warn(`Strategy ${mode} not available`)
      return false
    }

    // 清理当前策略
    if (this.currentStrategy) {
      this.currentStrategy.cleanup()
    }

    // 切换到新策略
    this.currentStrategy = strategy
    this.performanceMonitor.updateMode(mode)

    return true
  }

  /**
   * 执行数据传输
   */
  async transfer(): Promise<void> {
    if (!this.currentStrategy) {
      throw new Error('No strategy initialized')
    }

    this.performanceMonitor.startTransfer()

    try {
      await this.currentStrategy.transfer()
    } finally {
      this.performanceMonitor.endTransfer()
    }
  }

  /**
   * 获取当前纹理
   */
  getCurrentTexture(): THREE.Texture {
    if (!this.currentStrategy) {
      throw new Error('No strategy initialized')
    }

    return this.currentStrategy.getCurrentTexture()
  }

  /**
   * 获取当前模式
   */
  getCurrentMode(): TransportMode {
    return this.currentStrategy?.getMode() as TransportMode || TransportMode.Canvas
  }

  /**
   * 设置分辨率
   */
  async setSize(width: number, height: number): Promise<void> {
    if (!this.currentStrategy) {
      return
    }

    await this.currentStrategy.setSize(width, height)
    this.performanceMonitor.updateResolution(width, height)
  }

  /**
   * 获取支持的传输模式列表
   */
  getSupportedModes(): TransportMode[] {
    return Array.from(this.strategies.keys())
  }

  /**
   * 清理资源
   */
  dispose(): void {
    for (const strategy of this.strategies.values()) {
      strategy.cleanup()
    }
    this.strategies.clear()
    this.currentStrategy = null
  }
}
