import * as THREE from 'three'
import { BaseTransportStrategy } from './TransportStrategy'
import { TaichiEngine, BridgeOptions, TransportMode } from '../types'
import { detectCanvasSupport } from '../utils/browserSupport'

export class CanvasTransportStrategy extends BaseTransportStrategy {
  private taichiEngine: TaichiEngine

  constructor(options: BridgeOptions) {
    super(options)
  }

  async initialize(taichiEngine: TaichiEngine, options: BridgeOptions): Promise<void> {
    this.taichiEngine = taichiEngine

    // 创建 CanvasTexture
    this.texture = new THREE.CanvasTexture(this.canvas as HTMLCanvasElement)
    this.texture.needsUpdate = true
  }

  async transfer(): Promise<void> {
    // 通过 Canvas 传输数据
    if (typeof this.taichiEngine.getPixelData === 'function') {
      try {
        const pixelData = await this.taichiEngine.getPixelData()
        if (pixelData) {
          // 更新纹理
          this.texture.needsUpdate = true
        }
      } catch (error) {
        console.error('Canvas transfer error:', error)
      }
    }
  }

  isSupported(): boolean {
    return detectCanvasSupport()
  }

  cleanup(): void {
    this.texture.dispose()
  }

  getMode(): string {
    return TransportMode.Canvas
  }
}
