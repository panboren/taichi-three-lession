import * as THREE from 'three'

export enum TransportMode {
  WebGPU = 'webgpu',
  Transferable = 'transferable',
  WebGL2PBO = 'webgl2pbo',
  Canvas = 'canvas'
}

export interface PerformanceMetrics {
  mode: TransportMode
  fps: number
  avgFps: number
  minFps: number
  maxFps: number
  avgFrameTime: number
  avgTransferTime: number
  dataThroughput: number
  stabilityScore: number
  frameCount: number
  dropFrameCount: number
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
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.Camera
  planeSize?: { width: number; height: number }
  textureLinear?: boolean
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void
  onError?: (error: Error, context?: string) => void
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
