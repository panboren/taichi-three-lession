import { PerformanceMetrics, TransportMode } from './types'
import { calculateAverage, calculateStandardDeviation } from './utils/performanceUtils'

export class PerformanceMonitor {
  private frameTimes: number[] = []
  private transferTimes: number[] = []
  private metrics: PerformanceMetrics
  private lastFrameTime: number = 0
  private frameStartTime: number = 0
  private transferStartTime: number = 0
  private frameCount: number = 0
  private dropFrameCount: number = 0
  private enabled: boolean = true

  constructor(initialMode: TransportMode) {
    this.metrics = {
      mode: initialMode,
      fps: 60,
      avgFps: 60,
      minFps: 60,
      maxFps: 60,
      avgFrameTime: 16.67,
      avgTransferTime: 0,
      dataThroughput: 0,
      stabilityScore: 1.0,
      frameCount: 0,
      dropFrameCount: 0,
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

    // 计算标准差（稳定性）
    const stdDev = this.calculateStandardDeviation(this.frameTimes)
    this.metrics.frameTimeStdDev = stdDev
    this.metrics.stabilityScore = Math.max(0, 1 - stdDev / avgFrameTime)

    // 计算传输时间
    if (this.transferTimes.length > 0) {
      this.metrics.avgTransferTime = this.calculateAverage(this.transferTimes)
    }

    this.lastFrameTime = now
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

  start(): void {
    this.enabled = true
  }

  stop(): void {
    this.enabled = false
  }

  reset(): void {
    this.frameTimes = []
    this.transferTimes = []
    this.frameCount = 0
    this.dropFrameCount = 0
    this.metrics.frameCount = 0
    this.metrics.dropFrameCount = 0
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
