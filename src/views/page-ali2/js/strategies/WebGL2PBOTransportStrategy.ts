import * as THREE from 'three'
import { BaseTransportStrategy } from './TransportStrategy'
import { TaichiEngine, BridgeOptions, TransportMode } from '../types'
import { detectWebGL2Support } from '../utils/browserSupport'

export class WebGL2PBOTransportStrategy extends BaseTransportStrategy {
  private taichiEngine: TaichiEngine
  private gl?: WebGL2RenderingContext
  private pbo?: WebGLBuffer
  private gpuTexture?: WebGLTexture
  private pixelData?: Uint8Array

  constructor(options: BridgeOptions) {
    super(options)
  }

  async initialize(taichiEngine: TaichiEngine, options: BridgeOptions): Promise<void> {
    this.taichiEngine = taichiEngine

    // 获取 WebGL2 上下文
    this.gl = this.options.renderer.getContext() as WebGL2RenderingContext
    if (!this.gl || !(this.gl instanceof WebGL2RenderingContext)) {
      throw new Error('WebGL2 not available')
    }

    const width = this.options.width || 512
    const height = this.options.height || 512

    // 创建 PBO (Pixel Buffer Object)
    this.pbo = this.gl.createBuffer()
    if (!this.pbo) {
      throw new Error('Failed to create PBO')
    }

    this.gl.bindBuffer(this.gl.PIXEL_UNPACK_BUFFER, this.pbo)
    this.gl.bufferData(this.gl.PIXEL_UNPACK_BUFFER, width * height * 4, this.gl.DYNAMIC_DRAW)
    this.gl.bindBuffer(this.gl.PIXEL_UNPACK_BUFFER, null)

    // 创建纹理
    this.gpuTexture = this.gl.createTexture()
    if (!this.gpuTexture) {
      throw new Error('Failed to create texture')
    }

    this.gl.bindTexture(this.gl.TEXTURE_2D, this.gpuTexture)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      width,
      height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      null
    )

    // 创建 Three.js 纹理
    this.pixelData = new Uint8Array(width * height * 4)
    this.texture = new THREE.DataTexture(
      this.pixelData,
      width,
      height,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    )

    this.texture.needsUpdate = true
  }

  async transfer(): Promise<void> {
    if (!this.gl || !this.pbo || !this.gpuTexture || !this.pixelData) {
      return
    }

    try {
      if (typeof this.taichiEngine.getPixelData === 'function') {
        const data = await this.taichiEngine.getPixelData()

        if (data instanceof ArrayBuffer && data.byteLength === this.pixelData.byteLength) {
          // 更新 PBO
          this.gl.bindBuffer(this.gl.PIXEL_UNPACK_BUFFER, this.pbo)
          this.gl.bufferSubData(this.gl.PIXEL_UNPACK_BUFFER, 0, new Uint8Array(data))

          // 从 PBO 异步上传到纹理
          this.gl.bindTexture(this.gl.TEXTURE_2D, this.gpuTexture)
          this.gl.texSubImage2D(
            this.gl.TEXTURE_2D,
            0,
            0,
            0,
            this.options.width || 512,
            this.options.height || 512,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            0
          )

          this.gl.bindBuffer(this.gl.PIXEL_UNPACK_BUFFER, null)
          this.gl.bindTexture(this.gl.TEXTURE_2D, null)

          // 更新 Three.js 纹理
          this.pixelData.set(new Uint8Array(data))
          this.texture.needsUpdate = true
        }
      }
    } catch (error) {
      console.error('WebGL2 PBO transfer error:', error)
    }
  }

  isSupported(): boolean {
    return detectWebGL2Support(this.options.renderer)
  }

  cleanup(): void {
    if (this.gl && this.pbo) {
      this.gl.deleteBuffer(this.pbo)
    }
    if (this.gl && this.gpuTexture) {
      this.gl.deleteTexture(this.gpuTexture)
    }
    this.texture.dispose()
  }

  getMode(): string {
    return TransportMode.WebGL2PBO
  }
}
