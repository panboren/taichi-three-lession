import type { BridgeOptions } from '../types'
import type { PerformanceMetrics } from '../types'
import { TransportMode } from '../types'
import { PerformanceMonitor } from '../PerformanceMonitor'
import { EnhancedTaichiThreeBridge } from '../EnhancedTaichiThreeBridge'

/**
 * 自动优化器
 * 根据性能自动优化配置
 */
export class AutoOptimizer {
  private bridge: EnhancedTaichiThreeBridge
  private options: Required<BridgeOptions>
  private performanceMonitor: PerformanceMonitor
  private running: boolean = false
  private optimizeInterval: number | null = null
  private consecutiveLowFps: number = 0
  private consecutiveHighFps: number = 0

  constructor(
    bridge: EnhancedTaichiThreeBridge,
    options: Required<BridgeOptions>,
    performanceMonitor: PerformanceMonitor
  ) {
    this.bridge = bridge
    this.options = options
    this.performanceMonitor = performanceMonitor
  }

  /**
   * 启动自动优化
   */
  start(): void {
    if (this.running) return

    this.running = true

    // 每秒检查一次性能
    this.optimizeInterval = window.setInterval(() => {
      this.optimize()
    }, 1000)
  }

  /**
   * 停止自动优化
   */
  stop(): void {
    if (this.optimizeInterval) {
      clearInterval(this.optimizeInterval)
      this.optimizeInterval = null
    }
    this.running = false
  }

  /**
   * 执行优化
   */
  async optimize(): Promise<void> {
    const metrics = this.performanceMonitor.getMetrics()
    const currentMode = this.bridge.getCurrentMode()

    // 检查是否需要降低性能
    if (metrics.avgFps < this.options.fallbackThreshold) {
      this.consecutiveLowFps++
      this.consecutiveHighFps = 0

      // 连续 3 帧低性能,尝试回退
      if (this.consecutiveLowFps >= 3) {
        await this.tryFallback(currentMode)
        this.consecutiveLowFps = 0
      }
    }
    // 检查是否可以提高性能
    else if (metrics.avgFps > this.options.upgradeThreshold && metrics.stabilityScore > 0.8) {
      this.consecutiveHighFps++
      this.consecutiveLowFps = 0

      // 连续 5 帧高性能,尝试升级
      if (this.consecutiveHighFps >= 5) {
        await this.tryUpgrade(currentMode)
        this.consecutiveHighFps = 0
      }
    } else {
      this.consecutiveLowFps = 0
      this.consecutiveHighFps = 0
    }
  }

  /**
   * 尝试回退到低性能模式
   */
  private async tryFallback(currentMode: TransportMode): Promise<boolean> {
    if (!this.options.enableModeFallback) {
      return false
    }

    const fallbackMode = this.getFallbackMode(currentMode)
    if (fallbackMode && fallbackMode !== currentMode) {
      const success = await this.bridge.switchMode(fallbackMode)
      if (success) {
        this.options.onWarning(
          `Fallback from ${currentMode} to ${fallbackMode} due to low performance`
        )
        return true
      }
    }

    // 如果无法切换模式,尝试降低分辨率
    const metrics = this.performanceMonitor.getMetrics()
    const { width, height } = metrics.currentResolution
    const newWidth = Math.max(
      Math.floor(width * this.options.resolutionScaleFactor),
      this.options.minResolution
    )
    const newHeight = Math.max(
      Math.floor(height * this.options.resolutionScaleFactor),
      this.options.minResolution
    )

    if (newWidth !== width || newHeight !== height) {
      await this.bridge.setSize(newWidth, newHeight)
      this.options.onWarning(
        `Resolution reduced to ${newWidth}x${newHeight} due to low performance`
      )
      return true
    }

    return false
  }

  /**
   * 尝试升级到高性能模式
   */
  private async tryUpgrade(currentMode: TransportMode): Promise<boolean> {
    const upgradeMode = this.getUpgradeMode(currentMode)
    if (upgradeMode && upgradeMode !== currentMode) {
      const success = await this.bridge.switchMode(upgradeMode)
      if (success) {
        const metrics = this.performanceMonitor.getMetrics()
        this.options.onModeChange(currentMode, upgradeMode)
        return true
      }
    }

    // 尝试提高分辨率
    const metrics = this.performanceMonitor.getMetrics()
    const { width, height } = metrics.currentResolution
    const newWidth = Math.min(
      Math.floor(width / this.options.resolutionScaleFactor),
      this.options.maxResolution
    )
    const newHeight = Math.min(
      Math.floor(height / this.options.resolutionScaleFactor),
      this.options.maxResolution
    )

    if (newWidth !== width && newHeight !== height) {
      await this.bridge.setSize(newWidth, newHeight)
      return true
    }

    return false
  }

  /**
   * 获取回退模式
   */
  private getFallbackMode(currentMode: TransportMode): TransportMode | null {
    const modeOrder: TransportMode[] = [
      TransportMode.WebGPU,
      TransportMode.Transferable,
      TransportMode.WebGL2PBO,
      TransportMode.DataTexture,
      TransportMode.Canvas
    ]

    const currentIndex = modeOrder.indexOf(currentMode)
    if (currentIndex < modeOrder.length - 1) {
      return modeOrder[currentIndex + 1]
    }

    return null
  }

  /**
   * 获取升级模式
   */
  private getUpgradeMode(currentMode: TransportMode): TransportMode | null {
    const modeOrder: TransportMode[] = [
      TransportMode.WebGPU,
      TransportMode.Transferable,
      TransportMode.WebGL2PBO,
      TransportMode.DataTexture,
      TransportMode.Canvas
    ]

    const currentIndex = modeOrder.indexOf(currentMode)
    if (currentIndex > 0) {
      return modeOrder[currentIndex - 1]
    }

    return null
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.stop()
  }
}
