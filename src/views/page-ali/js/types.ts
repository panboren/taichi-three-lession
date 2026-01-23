/**
 * 类型定义文件
 */
import * as THREE from 'three'

export enum UltimateTransferMode {
  WebGPUSharedTexture = 'webgpu-shared-texture',
  TransferableImageBitmap = 'transferable-imagebitmap',
  OffscreenWorker = 'offscreen-worker',
  WebGL2PBO = 'webgl2-pbo',
  OffscreenImageBitmap = 'offscreen-imagebitmap',
  CanvasTexture = 'canvas-texture',
  PixelBuffer = 'pixel-buffer',
  FieldSync = 'field-sync'
}

export interface UltimatePerformanceMetrics {
  mode: UltimateTransferMode
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

export interface UltimateBridgeOptions {
  width?: number
  height?: number
  maxResolution?: number
  minResolution?: number
  enableAdaptiveResolution?: boolean
  targetFps?: number
  resolutionScaleFactor?: number
  mode?: UltimateTransferMode
  autoDetectMode?: boolean
  enableModeFallback?: boolean
  fallbackThreshold?: number
  upgradeThreshold?: number
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.Camera
  planeSize?: { width: number; height: number }
  textureLinear?: boolean
  textureWrapS?: THREE.Wrapping
  textureWrapT?: THREE.Wrapping
  generateMipmaps?: boolean
  textureFormat?: THREE.PixelFormat
  textureType?: THREE.TextureDataType
  enableWebGL2PBO?: boolean
  pboBufferSize?: number
  enableMultisample?: boolean
  webgpu?: {
    enabled?: boolean
    device?: GPUDevice
    adapter?: GPUAdapter
    preferredFormat?: GPUTextureFormat
    alphaMode?: GPUCanvasAlphaMode
    enableSharedTexture?: boolean
    sharedTextureUsage?: GPUTextureUsageFlags
    powerPreference?: 'default' | 'low-power' | 'high-performance'
  }
  offscreen?: {
    enabled?: boolean
    enableTransferable?: boolean
    enableWorker?: boolean
    worker?: Worker
    workerScript?: string
    canvas?: HTMLCanvasElement | OffscreenCanvas
  }
  pixelBuffer?: {
    width?: number
    height?: number
    texture?: THREE.DataTexture
    data?: Uint8Array | Uint16Array | Float32Array
    dataType?: 'uint8' | 'uint16' | 'float32'
  }
  fieldSync?: {
    positionField?: any
    colorField?: any
    normalField?: any
    updateFrequency?: number
    enableBatchUpdate?: boolean
    interpolationFactor?: number
    enablePrediction?: boolean
  }
  caching?: {
    enabled?: boolean
    textureCacheSize?: number
    bufferPoolSize?: number
    enableLRUCache?: boolean
    enableObjectPool?: boolean
  }
  performance?: {
    enabled?: boolean
    updateInterval?: number
    enableDetailedLogging?: boolean
    enablePrediction?: boolean
    historySize?: number
    enableProfiling?: boolean
  }
  onBeforeStep?: (time: number) => void
  onAfterStep?: (time: number) => void
  onTransferComplete?: (metrics: UltimatePerformanceMetrics) => void
  onPerformanceUpdate?: (metrics: UltimatePerformanceMetrics) => void
  onModeChange?: (from: UltimateTransferMode, to: UltimateTransferMode) => void
  onResolutionChange?: (
    from: { width: number; height: number },
    to: { width: number; height: number }
  ) => void
  onError?: (error: Error, context?: string) => void
  onWarning?: (warning: string) => void
  autoStart?: boolean
}

export interface TaichiEngine {
  init?(): Promise<void>
  dispose?(): void
  attachCanvas?(canvas: HTMLCanvasElement | OffscreenCanvas): void
  setCanvas?(canvas: HTMLCanvasElement | OffscreenCanvas): void
  getRuntime?(): { device: GPUDevice; adapter: GPUAdapter }
  getDevice?(): GPUDevice
  fields?: Map<string, TaichiField>
  runKernel?(name: string, ...args: any[]): Promise<any>
  sync?(): Promise<void>
  getPixelData?(): Promise<ArrayBuffer>
  update?(time?: number): void
  render?(time?: number): void
  start?(): void
  stop?(): void
}

export interface TaichiField {
  dimensions: number[]
  dtype: string
  shape: number[]
  toArray(): Promise<any[]>
  toFloat32Array(): Promise<Float32Array>
  fromArray(data: any[]): Promise<void>
}
