import * as THREE from 'three'
import { BaseTransportStrategy } from './TransportStrategy'
import { TaichiEngine, BridgeOptions, TransportMode } from '../types'
import { detectTransferableSupport } from '../utils/browserSupport'

export class TransferableTransportStrategy extends BaseTransportStrategy {
  private taichiEngine: TaichiEngine
  private imageBitmap?: ImageBitmap

  constructor(options: BridgeOptions) {
    super(options)
  }

  async initialize(taichiEngine: TaichiEngine, options: BridgeOptions): Promise<void> {
    this.taichiEngine = taichiEngine

    // 创建纹理
    this.texture = new THREE.Texture()
    this.texture.needsUpdate = true
  }

  async transfer(): Promise<void> {
    if (!(this.canvas instanceof OffscreenCanvas)) {
      throw new Error('OffscreenCanvas required for Transferable strategy')
    }

    try {
      // 使用 Transferable Objects 零拷贝传输
      const bitmap = await createImageBitmap(this.canvas, {
        imageOrientation: 'none',
        premultiplyAlpha: 'none'
      })

      // 清理旧的 ImageBitmap
      if (this.imageBitmap && 'close' in this.imageBitmap) {
        this.imageBitmap.close()
      }

      this.imageBitmap = bitmap
      this.texture.image = bitmap
      this.texture.needsUpdate = true
    } catch (error) {
      console.error('Transferable transfer error:', error)
    }
  }

  isSupported(): boolean {
    return detectTransferableSupport()
  }

  cleanup(): void {
    if (this.imageBitmap && 'close' in this.imageBitmap) {
      this.imageBitmap.close()
    }
    this.texture.dispose()
  }

  getMode(): string {
    return TransportMode.Transferable
  }
}
