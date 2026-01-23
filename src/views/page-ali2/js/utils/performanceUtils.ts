export function calculateFps(frameTimes: number[]): number {
  if (frameTimes.length === 0) return 0
  const totalTime = frameTimes.reduce((sum, time) => sum + time, 0)
  return frameTimes.length / (totalTime / 1000)
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  const sum = values.reduce((a, b) => a + b, 0)
  return sum / values.length
}

export function calculateStandardDeviation(values: number[]): number {
  if (values.length <= 1) return 0

  const avg = calculateAverage(values)
  const squareDiffs = values.map(value => {
    const diff = value - avg
    return diff * diff
  })

  const avgSquareDiff = calculateAverage(squareDiffs)
  return Math.sqrt(avgSquareDiff)
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
