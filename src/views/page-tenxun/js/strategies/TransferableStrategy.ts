// V2 - Force reload
import * as THREE from 'three'
import { BaseStrategy } from './BaseStrategy'

/**
 * Transferable Objects 传输策略
 * 使用 Transferable Objects 进行零拷贝传输
 */
export class TransferableStrategy extends BaseStrategy {
  private texture: THREE.DataTexture | null = null
  private imageBitmap: ImageBitmap | null = null

  /**
   * 初始化
   */
  async initialize(engine: any, options: any): Promise<void> {
    await super.initialize(engine, options)

    // 创建纹理 - 使用 DataTexture 作为基础
    const dataArray = new Uint8Array(this.width * this.height * 4)
    this.texture = new THREE.DataTexture(
      dataArray,
      this.width,
      this.height,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    )
    this.setupTexture(this.texture)
  }

  /**
   * 执行传输
   */
  async transfer(): Promise<void> {
    if (!this.texture) {
      throw new Error('TransferableStrategy not initialized')
    }

    // 获取像素数据
    const buffer = await this.getPixelData()

    // 使用 ImageBitmap
    if (this.imageBitmap) {
      this.imageBitmap.close()
    }

    this.imageBitmap = await createImageBitmap(new Uint8ClampedArray(buffer), {
      width: this.width,
      height: this.height
    })

    // 更新纹理数据
    const dataArray = this.texture.image.data as Uint8Array
    const sourceArray = new Uint8Array(buffer)
    dataArray.set(sourceArray)

    // 标记纹理需要更新
    this.texture.needsUpdate = true
  }

  /**
   * 获取当前纹理
   */
  getCurrentTexture(): THREE.Texture {
    if (!this.texture) {
      throw new Error('Texture not initialized')
    }
    return this.texture
  }

  /**
   * 检查是否支持
   */
  static isSupported(): boolean {
    return typeof createImageBitmap === 'function'
  }

  isSupported(): boolean {
    return TransferableStrategy.isSupported()
  }

  /**
   * 设置尺寸
   */
  async setSize(width: number, height: number): Promise<void> {
    await super.setSize(width, height)

    this.imageBitmap?.close()
    this.imageBitmap = null

    // 重新创建纹理
    if (this.texture) {
      const dataArray = new Uint8Array(width * height * 4)
      this.texture.image = {
        data: dataArray,
        width: width,
        height: height
      }
      this.texture.needsUpdate = true
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.imageBitmap?.close()
    this.imageBitmap = null
    this.texture?.dispose()
    this.texture = null
  }
}
