/**
 * 自适应控制器 - 根据性能自动调整分辨率和传输模式
 */
import { UltimateBridgeOptions } from './types'
import { PerformanceMonitor } from './PerformanceMonitor'

export class AdaptiveController {
  private options: UltimateBridgeOptions
  private performanceMonitor: PerformanceMonitor
  private currentResolution: { width: number; height: number }
  private adaptiveEnabled: boolean
  private intervalId?: number

  constructor(options: UltimateBridgeOptions, performanceMonitor: PerformanceMonitor) {
    this.options = options
    this.performanceMonitor = performanceMonitor
    this.currentResolution = {
      width: options.width ?? 512,
      height: options.height ?? 512
    }
    this.adaptiveEnabled = options.enableAdaptiveResolution ?? false
  }

  start(): void {
    if (this.adaptiveEnabled && !this.intervalId) {
      this.intervalId = window.setInterval(() => {
        this.checkAndAdjust()
      }, 2000) as unknown as number
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  private checkAndAdjust(): void {
    const metrics = this.performanceMonitor.getMetrics()
    const targetFps = this.options.targetFps ?? 60
    const currentFps = metrics.avgFps

    let newWidth = this.currentResolution.width
    let newHeight = this.currentResolution.height
    const scaleFactor = 0.9 // 每次调整 10%

    if (currentFps < targetFps * 0.8) {
      // 性能不足，降低分辨率
      newWidth = Math.max(this.options.minResolution ?? 256, Math.floor(newWidth * scaleFactor))
      newHeight = Math.max(this.options.minResolution ?? 256, Math.floor(newHeight * scaleFactor))
    } else if (currentFps > targetFps * 1.2) {
      // 性能充足，提高分辨率
      newWidth = Math.min(this.options.maxResolution ?? 2048, Math.floor(newWidth / scaleFactor))
      newHeight = Math.min(this.options.maxResolution ?? 2048, Math.floor(newHeight / scaleFactor))
    }

    if (newWidth !== this.currentResolution.width || newHeight !== this.currentResolution.height) {
      const oldResolution = { ...this.currentResolution }
      this.currentResolution = { width: newWidth, height: newHeight }
      this.options.onResolutionChange?.(oldResolution, this.currentResolution)
    }
  }

  update(): Promise<void> {
    return Promise.resolve()
  }

  updateResolution(width: number, height: number): void {
    this.currentResolution = { width, height }
  }

  dispose(): void {
    this.stop()
  }
}
