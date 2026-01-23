/**
 * 性能监控器 - 监控和分析性能指标
 */
import { UltimatePerformanceMetrics, UltimateTransferMode } from './types'

export class PerformanceMonitor {
  private metrics: UltimatePerformanceMetrics
  private frameTimes: number[] = []
  private transferTimes: number[] = []
  private computeTimes: number[] = []
  private lastFrameTime: number = 0
  private frameStartTime: number = 0
  private transferStartTime: number = 0
  private enabled: boolean
  private updateInterval: number
  private lastUpdateTime: number = 0
  private intervalId?: number
  private options: any // 简化选项类型

  constructor(options?: any) {
    this.enabled = options?.enabled ?? true
    this.updateInterval = options?.updateInterval ?? 1000
    this.options = options

    this.metrics = {
      mode: UltimateTransferMode.CanvasTexture, // 默认值
      fps: 60,
      avgFps: 60,
      minFps: 60,
      maxFps: 60,
      avgFrameTime: 16.67,
      avgTransferTime: 0,
      avgComputeTime: 0,
      frameTimeStdDev: 0,
      dataTransferSize: 0,
      dataThroughput: 0,
      stabilityScore: 1.0,
      frameCount: 0,
      dropFrameCount: 0,
      predictedFps: 60,
      predictedTrend: 'stable',
      currentResolution: { width: 512, height: 512 },
      lastUpdate: performance.now()
    }
  }

  startFrame(): void {
    this.frameStartTime = performance.now()
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = this.frameStartTime
    }
  }

  startTransfer(): void {
    this.transferStartTime = performance.now()
  }

  endTransfer(dataSize: number): void {
    if (!this.enabled) return

    const transferTime = performance.now() - this.transferStartTime
    this.transferTimes.push(transferTime)

    if (this.transferTimes.length > 120) {
      this.transferTimes.shift()
    }

    this.metrics.avgTransferTime = this.calculateAverage(this.transferTimes)
    this.metrics.dataTransferSize = dataSize
  }

  endFrame(): void {
    if (!this.enabled) return

    const now = performance.now()
    const frameTime = now - this.frameStartTime
    this.frameTimes.push(frameTime)

    if (this.frameTimes.length > 120) {
      this.frameTimes.shift()
    }

    // 计算实时 FPS
    const avgFrameTime = this.calculateAverage(this.frameTimes)
    const currentFps = 1000 / (now - this.lastFrameTime)

    this.metrics.fps = currentFps
    this.metrics.avgFps = 1000 / avgFrameTime
    this.metrics.avgFrameTime = avgFrameTime
    this.metrics.frameCount++

    // 更新最小/最大 FPS
    this.metrics.minFps = Math.min(this.metrics.minFps, currentFps)
    this.metrics.maxFps = Math.max(this.metrics.maxFps, currentFps)

    // 计算标准差 (稳定性)
    const variance =
      this.frameTimes.reduce((acc, val) => {
        return acc + Math.pow(val - avgFrameTime, 2)
      }, 0) / this.frameTimes.length
    this.metrics.frameTimeStdDev = Math.sqrt(variance)

    // 稳定性评分 (0-1)
    this.metrics.stabilityScore = Math.max(0, 1 - this.metrics.frameTimeStdDev / avgFrameTime)

    // 数据吞吐量
    if (this.metrics.dataTransferSize > 0) {
      this.metrics.dataThroughput =
        (this.metrics.dataTransferSize * 8) / (this.metrics.avgTransferTime / 1000) / 1_000_000
    }

    this.lastFrameTime = now

    // 定期触发回调
    if (now - this.lastUpdateTime > this.updateInterval) {
      this.metrics.lastUpdate = now
      if (this.options?.onUpdate) {
        this.options.onUpdate(this.getMetrics())
      }
      this.lastUpdateTime = now
    }
  }

  getMetrics(): UltimatePerformanceMetrics {
    return { ...this.metrics }
  }

  private calculateAverage(times: number[]): number {
    if (times.length === 0) return 0
    return times.reduce((a, b) => a + b, 0) / times.length
  }

  start(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  dispose(): void {
    this.stop()
    this.frameTimes = []
    this.transferTimes = []
    this.computeTimes = []
  }
}
