import type { BridgeOptions } from './types'
import type { PerformanceMetrics } from './types'
import { PerformanceMonitor } from './PerformanceMonitor'

/**
 * 自适应控制器
 * 根据性能自动调整分辨率
 */
export class AdaptiveController {
  private options: Required<BridgeOptions>
  private performanceMonitor: PerformanceMonitor
  private running: boolean = false
  private checkInterval: number | null = null
  private currentWidth: number
  private currentHeight: number

  constructor(
    options: Required<BridgeOptions>,
    performanceMonitor: PerformanceMonitor
  ) {
    this.options = options
    this.performanceMonitor = performanceMonitor
    this.currentWidth = options.width
    this.currentHeight = options.height
  }

  /**
   * 启动自适应控制
   */
  start(): void {
    if (!this.options.enableAdaptiveResolution || this.running) {
      return
    }

    this.running = true

    // 定期检查性能并调整分辨率
    this.checkInterval = window.setInterval(() => {
      this.checkAndAdjust()
    }, this.options.performance.updateInterval)
  }

  /**
   * 停止自适应控制
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.running = false
  }

  /**
   * 检查并调整分辨率
   */
  private checkAndAdjust(): void {
    const metrics = this.performanceMonitor.getMetrics()

    // 检查是否需要降低分辨率
    if (metrics.avgFps < this.options.fallbackThreshold * 0.9) {
      this.scaleDownResolution()
    }
    // 检查是否可以提高分辨率
    else if (metrics.avgFps > this.options.upgradeThreshold && metrics.stabilityScore > 0.8) {
      this.scaleUpResolution()
    }
  }

  /**
   * 降低分辨率
   */
  private scaleDownResolution(): void {
    const newWidth = Math.max(
      Math.floor(this.currentWidth * this.options.resolutionScaleFactor),
      this.options.minResolution
    )
    const newHeight = Math.max(
      Math.floor(this.currentHeight * this.options.resolutionScaleFactor),
      this.options.minResolution
    )

    if (newWidth !== this.currentWidth || newHeight !== this.currentHeight) {
      this.updateResolution(newWidth, newHeight)
      this.options.onWarning(
        `Resolution reduced to ${newWidth}x${newHeight} due to low FPS`
      )
    }
  }

  /**
   * 提高分辨率
   */
  private scaleUpResolution(): void {
    const newWidth = Math.min(
      Math.floor(this.currentWidth / this.options.resolutionScaleFactor),
      this.options.maxResolution
    )
    const newHeight = Math.min(
      Math.floor(this.currentHeight / this.options.resolutionScaleFactor),
      this.options.maxResolution
    )

    if (newWidth !== this.currentWidth || newHeight !== this.currentHeight) {
      this.updateResolution(newWidth, newHeight)
    }
  }

  /**
   * 更新分辨率
   */
  updateResolution(width: number, height: number): void {
    this.currentWidth = width
    this.currentHeight = height
    this.performanceMonitor.updateResolution(width, height)
    this.options.onResolutionChange(
      { width: this.currentWidth, height: this.currentHeight },
      { width, height }
    )
  }

  /**
   * 获取当前分辨率
   */
  getCurrentResolution(): { width: number; height: number } {
    return { width: this.currentWidth, height: this.currentHeight }
  }

  /**
   * 手动触发调整
   */
  async update(): Promise<void> {
    if (this.running) {
      this.checkAndAdjust()
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.stop()
  }
}
