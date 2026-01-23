import type { PerformanceMetrics } from './types'
import { TransportMode } from './types'

/**
 * 增强型性能监控器
 */
export class PerformanceMonitor {
  private frameTimes: number[] = []
  private transferTimes: number[] = []
  private computeTimes: number[] = []
  private metrics: PerformanceMetrics
  private lastFrameTime: number = 0
  private frameStartTime: number = 0
  private transferStartTime: number = 0
  private enabled: boolean = true
  private fpsHistory: number[] = []
  private updateInterval: number
  private lastUpdateTime: number = 0

  constructor(
    initialMode: TransportMode,
    config?: {
      enabled?: boolean
      updateInterval?: number
      enablePrediction?: boolean
      historySize?: number
    }
  ) {
    this.updateInterval = config?.updateInterval || 500
    this.enabled = config?.enabled ?? true

    this.metrics = {
      mode: initialMode,
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

  endTransfer(): void {
    if (!this.enabled) return

    const transferTime = performance.now() - this.transferStartTime
    this.transferTimes.push(transferTime)

    if (this.transferTimes.length > 120) {
      this.transferTimes.shift()
    }
  }

  endFrame(): void {
    if (!this.enabled) return

    const now = performance.now()
    const frameTime = now - this.frameStartTime
    this.frameTimes.push(frameTime)

    if (this.frameTimes.length > 120) {
      this.frameTimes.shift()
    }

    // 计算 FPS
    const avgFrameTime = this.calculateAverage(this.frameTimes)
    const currentFps = 1000 / (now - this.lastFrameTime)

    this.metrics.fps = currentFps
    this.metrics.avgFps = 1000 / avgFrameTime
    this.metrics.avgFrameTime = avgFrameTime
    this.metrics.frameCount++

    // 更新最小/最大 FPS
    this.metrics.minFps = Math.min(this.metrics.minFps, currentFps)
    this.metrics.maxFps = Math.max(this.metrics.maxFps, currentFps)

    // 计算标准差(稳定性)
    const stdDev = this.calculateStandardDeviation(this.frameTimes)
    this.metrics.frameTimeStdDev = stdDev
    this.metrics.stabilityScore = Math.max(0, 1 - stdDev / avgFrameTime)

    // 计算传输时间
    if (this.transferTimes.length > 0) {
      this.metrics.avgTransferTime = this.calculateAverage(this.transferTimes)
    }

    // 预测性能
    this.fpsHistory.push(currentFps)
    if (this.fpsHistory.length > 120) {
      this.fpsHistory.shift()
    }

    if (this.fpsHistory.length >= 10) {
      this.metrics.predictedFps = this.predictNextFps()
      this.metrics.predictedTrend = this.predictTrend()
    }

    // 计算吞吐量
    if (this.metrics.dataTransferSize > 0) {
      this.metrics.dataThroughput =
        (this.metrics.dataTransferSize * 8) / (this.metrics.avgTransferTime / 1000) / 1_000_000
    }

    this.lastFrameTime = now
    this.metrics.lastUpdate = now
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  updateMode(mode: TransportMode): void {
    this.metrics.mode = mode
  }

  updateResolution(width: number, height: number): void {
    this.metrics.currentResolution = { width, height }
  }

  setDataTransferSize(size: number): void {
    this.metrics.dataTransferSize = size
  }

  predictNextFps(): number {
    if (this.fpsHistory.length < 10) {
      return this.fpsHistory[this.fpsHistory.length - 1] || 60
    }

    // 移动平均
    const recent = this.fpsHistory.slice(-20)
    const movingAvg = recent.reduce((a, b) => a + b, 0) / recent.length

    // 简单线性回归
    if (recent.length >= 10) {
      const n = recent.length
      const x = Array.from({ length: n }, (_, i) => i)
      const sumX = x.reduce((a, b) => a + b, 0)
      const sumY = recent.reduce((a, b) => a + b, 0)
      const sumXY = x.reduce((sum, xi, i) => sum + xi * recent[i], 0)
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n
      const trend = slope * n + intercept

      return movingAvg * 0.7 + trend * 0.3
    }

    return movingAvg
  }

  predictTrend(): 'improving' | 'stable' | 'degrading' {
    if (this.fpsHistory.length < 20) return 'stable'

    const recent = this.fpsHistory.slice(-10)
    const older = this.fpsHistory.slice(-20, -10)

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
    const diff = recentAvg - olderAvg
    const variance = this.calculateStandardDeviation(this.fpsHistory.slice(-20))

    if (diff > 2 && diff > variance) return 'improving'
    if (diff < -2 && Math.abs(diff) > variance) return 'degrading'
    return 'stable'
  }

  start(): void {
    this.enabled = true
  }

  stop(): void {
    this.enabled = false
  }

  reset(): void {
    this.frameTimes = []
    this.transferTimes = []
    this.computeTimes = []
    this.fpsHistory = []
    this.metrics.frameCount = 0
    this.metrics.dropFrameCount = 0
    this.metrics.minFps = 60
    this.metrics.maxFps = 60
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length <= 1) return 0

    const avg = this.calculateAverage(values)
    const squareDiffs = values.map(value => {
      const diff = value - avg
      return diff * diff
    })

    const avgSquareDiff = this.calculateAverage(squareDiffs)
    return Math.sqrt(avgSquareDiff)
  }
}
