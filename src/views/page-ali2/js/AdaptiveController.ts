import { BridgeOptions } from './types'
import { PerformanceMonitor } from './PerformanceMonitor'

export class AdaptiveController {
  private currentResolution: { width: number; height: number }
  private enabled: boolean
  private targetFps: number
  private maxResolution: number
  private minResolution: number
  private intervalId?: number

  constructor(
    private options: BridgeOptions,
    private performanceMonitor: PerformanceMonitor
  ) {
    this.enabled = options.enableAdaptiveResolution || false
    this.targetFps = options.targetFps || 60
    this.maxResolution = options.maxResolution || 2048
    this.minResolution = options.minResolution || 256
    this.currentResolution = {
      width: options.width || 512,
      height: options.height || 512
    }
  }

  start(): void {
    if (this.enabled && !this.intervalId) {
      this.intervalId = window.setInterval(() => {
        this.adjustResolution()
      }, 2000) as unknown as number
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  private adjustResolution(): void {
    const metrics = this.performanceMonitor.getMetrics()
    const currentFps = metrics.avgFps

    let newWidth = this.currentResolution.width
    let newHeight = this.currentResolution.height

    // 如果 FPS 低于目标的 80%，降低分辨率
    if (currentFps < this.targetFps * 0.8) {
      newWidth = Math.max(this.minResolution, Math.floor(newWidth * 0.9))
      newHeight = Math.max(this.minResolution, Math.floor(newHeight * 0.9))
    }
    // 如果 FPS 高于目标的 120%，提高分辨率
    else if (currentFps > this.targetFps * 1.2) {
      newWidth = Math.min(this.maxResolution, Math.ceil(newWidth / 0.9))
      newHeight = Math.min(this.maxResolution, Math.ceil(newHeight / 0.9))
    }

    if (newWidth !== this.currentResolution.width || newHeight !== this.currentResolution.height) {
      this.currentResolution = { width: newWidth, height: newHeight }
      this.performanceMonitor.updateResolution(newWidth, newHeight)
    }
  }

  update(): Promise<void> {
    return Promise.resolve()
  }

  updateResolution(width: number, height: number): void {
    this.currentResolution = { width, height }
    this.performanceMonitor.updateResolution(width, height)
  }

  dispose(): void {
    this.stop()
  }
}
