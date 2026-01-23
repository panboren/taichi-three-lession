import * as THREE from 'three'
import { TaichiEngine, BridgeOptions } from '../types'
import { PerformanceMonitor } from '../PerformanceMonitor'

export interface TransportStrategy {
  initialize(taichiEngine: TaichiEngine, options: BridgeOptions): Promise<void>
  transfer(): Promise<void>
  getCurrentTexture(): THREE.Texture
  isSupported(): boolean
  cleanup(): void
  getMode(): string
  getSize(): { width: number; height: number }
  setSize(width: number, height: number): Promise<void>
}

export abstract class BaseTransportStrategy implements TransportStrategy {
  protected texture: THREE.Texture
  protected canvas: HTMLCanvasElement | OffscreenCanvas
  protected options: BridgeOptions

  constructor(options: BridgeOptions) {
    this.options = options
    this.texture = new THREE.Texture()
    this.canvas = this.createCanvas()
  }

  protected createCanvas(): HTMLCanvasElement | OffscreenCanvas {
    const width = this.options.width || 512
    const height = this.options.height || 512

    if (typeof OffscreenCanvas !== 'undefined') {
      return new OffscreenCanvas(width, height)
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
  }

  abstract initialize(taichiEngine: TaichiEngine, options: BridgeOptions): Promise<void>
  abstract transfer(): Promise<void>
  abstract isSupported(): boolean
  abstract cleanup(): void
  abstract getMode(): string

  getCurrentTexture(): THREE.Texture {
    return this.texture
  }

  getSize(): { width: number; height: number } {
    return {
      width: this.options.width || 512,
      height: this.options.height || 512
    }
  }

  async setSize(width: number, height: number): Promise<void> {
    this.options.width = width
    this.options.height = height

    if (this.canvas instanceof HTMLCanvasElement) {
      this.canvas.width = width
      this.canvas.height = height
    } else if (this.canvas instanceof OffscreenCanvas) {
      this.canvas.width = width
      this.canvas.height = height
    }

    // 重新初始化纹理
    this.texture.dispose()
    this.texture = new THREE.Texture()
  }
}
