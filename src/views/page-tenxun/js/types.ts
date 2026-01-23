import * as THREE from 'three'

// Taichi-Three Bridge Type Definitions
export enum TransportMode {
  WebGPU = 'webgpu',
  Transferable = 'transferable',
  WebGL2PBO = 'webgl2pbo',
  Canvas = 'canvas',
  DataTexture = 'datatexture'
}

export interface PerformanceMetrics {
  mode: TransportMode
  fps: number
  avgFps: number
  minFps: number
  maxFps: number
  avgFrameTime: number
  avgTransferTime: number
  avgComputeTime: number
  frameTimeStdDev: number
  dataTransferSize: number
  dataThroughput: number
  stabilityScore: number
  frameCount: number
  dropFrameCount: number
  predictedFps: number
  predictedTrend: 'improving' | 'stable' | 'degrading'
  currentResolution: { width: number; height: number }
  lastUpdate: number
}

export interface BridgeOptions {
  width?: number
  height?: number
  maxResolution?: number
  minResolution?: number
  preferredMode?: TransportMode
  enableAdaptiveResolution?: boolean
  targetFps?: number
  resolutionScaleFactor?: number
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.Camera
  planeSize?: { width: number; height: number }
  textureLinear?: boolean
  textureWrapS?: THREE.Wrapping
  textureWrapT?: THREE.Wrapping
  generateMipmaps?: boolean
  autoDetectMode?: boolean
  enableModeFallback?: boolean
  fallbackThreshold?: number
  upgradeThreshold?: number
  enableWebGL2PBO?: boolean
  pboBufferSize?: number
  enableAutoOptimization?: boolean
  performance?: {
    enabled?: boolean
    updateInterval?: number
    enablePrediction?: boolean
    historySize?: number
  }
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void
  onModeChange?: (from: TransportMode, to: TransportMode) => void
  onResolutionChange?: (from: { width: number; height: number }, to: { width: number; height: number }) => void
  onError?: (error: Error, context?: string) => void
  onWarning?: (warning: string) => void
}

export interface TaichiEngine {
  init?(): Promise<void>
  dispose?(): void
  runKernel?(name: string, ...args: any[]): Promise<any>
  update?(time?: number): void
  render?(time?: number): void
  start?(): void
  stop?(): void
  getPixelData?(): Promise<ArrayBuffer>
}

export interface TransportStrategy {
  initialize(engine: TaichiEngine, options: BridgeOptions): Promise<void>
  transfer(): Promise<void>
  getCurrentTexture(): THREE.Texture
  isSupported(): boolean
  cleanup(): void
  getMode(): string
  getSize(): { width: number; height: number }
  setSize(width: number, height: number): Promise<void>
}
