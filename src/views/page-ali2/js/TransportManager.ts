import * as THREE from 'three'
import { TransportStrategy } from './strategies/TransportStrategy'
import { WebGPUTransportStrategy } from './strategies/WebGPUTransportStrategy'
import { TransferableTransportStrategy } from './strategies/TransferableTransportStrategy'
import { WebGL2PBOTransportStrategy } from './strategies/WebGL2PBOTransportStrategy'
import { CanvasTransportStrategy } from './strategies/CanvasTransportStrategy'
import { BridgeOptions, TaichiEngine, TransportMode } from './types'
import { PerformanceMonitor } from './PerformanceMonitor'
import { ResourceManager } from './ResourceManager'

export class TransportManager {
  private strategies: Map<TransportMode, TransportStrategy> = new Map()
  private currentStrategy: TransportStrategy
  private performanceMonitor: PerformanceMonitor

  constructor(
    private options: BridgeOptions,
    performanceMonitor: PerformanceMonitor,
    private resourceManager: ResourceManager
  ) {
    this.performanceMonitor = performanceMonitor

    // 初始化所有策略
    this.strategies.set(TransportMode.WebGPU, new WebGPUTransportStrategy(options))
    this.strategies.set(TransportMode.Transferable, new TransferableTransportStrategy(options))
    this.strategies.set(TransportMode.WebGL2PBO, new WebGL2PBOTransportStrategy(options))
    this.strategies.set(TransportMode.Canvas, new CanvasTransportStrategy(options))

    // 选择初始策略
    this.currentStrategy = this.selectBestStrategy()
  }

  private selectBestStrategy(): TransportStrategy {
    // 如果指定了首选模式，且该模式受支持，则使用它
    if (this.options.preferredMode) {
      const strategy = this.strategies.get(this.options.preferredMode)
      if (strategy && strategy.isSupported()) {
        return strategy
      }
    }

    // 按优先级自动选择
    const priorityOrder = [
      TransportMode.WebGPU,
      TransportMode.Transferable,
      TransportMode.WebGL2PBO,
      TransportMode.Canvas
    ]

    for (const mode of priorityOrder) {
      const strategy = this.strategies.get(mode)
      if (strategy && strategy.isSupported()) {
        return strategy
      }
    }

    // 默认使用 Canvas 策略
    return this.strategies.get(TransportMode.Canvas)!
  }

  async initialize(taichiEngine: TaichiEngine): Promise<void> {
    await this.currentStrategy.initialize(taichiEngine, this.options)
    this.performanceMonitor.updateMode(this.currentStrategy.getMode() as TransportMode)
  }

  async transfer(): Promise<void> {
    this.performanceMonitor.startTransfer()
    await this.currentStrategy.transfer()
    this.performanceMonitor.endTransfer()
  }

  getCurrentTexture(): THREE.Texture {
    return this.currentStrategy.getCurrentTexture()
  }

  async switchStrategy(mode: TransportMode): Promise<boolean> {
    const newStrategy = this.strategies.get(mode)
    if (!newStrategy || !newStrategy.isSupported()) {
      return false
    }

    try {
      // 清理当前策略
      this.currentStrategy.cleanup()

      // 切换到新策略
      this.currentStrategy = newStrategy

      // 重新初始化
      await this.currentStrategy.initialize(
        // 获取当前 Taichi 引擎 (这里需要传递引擎，简化实现)
        {} as TaichiEngine,
        this.options
      )

      // 更新性能监控器
      this.performanceMonitor.updateMode(mode)

      return true
    } catch (error) {
      console.error(`Failed to switch to strategy ${mode}:`, error)
      return false
    }
  }

  async setSize(width: number, height: number): Promise<void> {
    await this.currentStrategy.setSize(width, height)
    this.performanceMonitor.updateResolution(width, height)
  }

  getCurrentMode(): TransportMode {
    return this.currentStrategy.getMode() as TransportMode
  }

  getSize(): { width: number; height: number } {
    return this.currentStrategy.getSize()
  }

  dispose(): void {
    this.currentStrategy.cleanup()
    this.strategies.forEach(strategy => strategy.cleanup())
  }
}
