// V2 - Force reload
import * as THREE from 'three'
import { BaseStrategy } from './BaseStrategy'

/**
 * WebGL2 PBO (Pixel Buffer Object) 传输策略
 * 使用 PBO 进行异步传输,中等性能
 */
export class WebGL2PBOStrategy extends BaseStrategy {
  private gl: WebGL2RenderingContext | null = null
  private pbo: WebGLBuffer | null = null
  private webglTexture: THREE.WebGLTexture | null = null
  private tempTexture: THREE.Texture | null = null
  private dataArray: Uint8Array | null = null

  /**
   * 初始化
   */
  async initialize(engine: any, options: any): Promise<void> {
    await super.initialize(engine, options)

    // 先创建回退的 DataTexture
    this.dataArray = new Uint8Array(this.width * this.height * 4)
    this.tempTexture = new THREE.DataTexture(
      this.dataArray,
      this.width,
      this.height,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    )
    this.setupTexture(this.tempTexture)

    // 检查 WebGL2 支持
    if (!WebGL2PBOStrategy.isSupported()) {
      console.warn('WebGL2 PBO not supported, using DataTexture fallback')
      return
    }

    try {
      // 获取 WebGL2 上下文
      this.gl = options.renderer.getContext() as WebGL2RenderingContext

      if (!this.gl) {
        console.warn('WebGL2 context not available, using DataTexture fallback')
        return
      }

      // 创建 PBO
      this.pbo = this.gl.createBuffer()

      // 创建原生 WebGL 纹理
      this.webglTexture = this.gl.createTexture()
    } catch (error) {
      console.warn('WebGL2 PBO initialization failed, using DataTexture fallback:', error)
      this.gl = null
      this.pbo = null
      this.webglTexture = null
    }
  }

  /**
   * 执行传输
   */
  async transfer(): Promise<void> {
    if (!this.tempTexture || !this.dataArray) {
      throw new Error('WebGL2PBOStrategy not initialized')
    }

    // 获取像素数据
    const buffer = await this.getPixelData()

    // 使用 PBO 传输（如果可用）
    if (this.gl && this.pbo && this.webglTexture) {
      const size = this.width * this.height * 4

      // 绑定 PBO 并上传数据
      this.gl.bindBuffer(this.gl.PIXEL_UNPACK_BUFFER, this.pbo)
      this.gl.bufferData(this.gl.PIXEL_UNPACK_BUFFER, buffer, this.gl.DYNAMIC_DRAW)

      // 从 PBO 传输到纹理
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.webglTexture)
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.width,
        this.height,
        0,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        0
      )

      // 解绑
      this.gl.bindBuffer(this.gl.PIXEL_UNPACK_BUFFER, null)
      this.gl.bindTexture(this.gl.TEXTURE_2D, null)
    } else {
      // 回退到直接复制
      this.dataArray.set(new Uint8Array(buffer))
    }

    // 标记纹理需要更新
    this.tempTexture.needsUpdate = true
  }

  /**
   * 获取当前纹理
   */
  getCurrentTexture(): THREE.Texture {
    if (!this.tempTexture) {
      throw new Error('Texture not initialized')
    }
    return this.tempTexture
  }

  /**
   * 检查是否支持
   */
  static isSupported(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2')
      return !!gl && !!gl.createBuffer && !!gl.PIXEL_UNPACK_BUFFER
    } catch {
      return false
    }
  }

  isSupported(): boolean {
    return WebGL2PBOStrategy.isSupported()
  }

  /**
   * 设置尺寸
   */
  async setSize(width: number, height: number): Promise<void> {
    await super.setSize(width, height)

    // 重新创建 dataArray
    this.dataArray = new Uint8Array(width * height * 4)

    if (this.tempTexture) {
      this.tempTexture.image = {
        data: this.dataArray,
        width: width,
        height: height
      }
      this.tempTexture.needsUpdate = true
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.gl && this.pbo) {
      this.gl.deleteBuffer(this.pbo)
    }
    if (this.gl && this.webglTexture) {
      this.gl.deleteTexture(this.webglTexture)
    }
    this.tempTexture?.dispose()
    this.tempTexture = null
    this.pbo = null
    this.webglTexture = null
    this.gl = null
    this.dataArray = null
  }
}
