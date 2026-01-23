// V2 - Force reload
import * as THREE from 'three'
import { BaseStrategy } from './BaseStrategy'

/**
 * DataTexture 传输策略
 * 直接使用 DataTexture,精确控制数据格式
 */
export class DataTextureStrategy extends BaseStrategy {
  private texture: THREE.DataTexture | null = null
  private dataArray: Uint8Array | Uint8ClampedArray | Float32Array

  constructor() {
    super()
    this.dataArray = new Uint8Array(0)
  }

  /**
   * 初始化
   */
  async initialize(engine: any, options: any): Promise<void> {
    await super.initialize(engine, options)

    // 创建数据数组
    this.dataArray = new Uint8Array(this.width * this.height * 4)

    // 创建纹理
    this.texture = new THREE.DataTexture(
      this.dataArray,
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
    if (!this.texture || this.dataArray.length === 0) {
      throw new Error('DataTextureStrategy not initialized')
    }

    // 获取像素数据
    const buffer = await this.getPixelData()

    // 复制数据
    this.dataArray.set(new Uint8Array(buffer))

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
    return true // DataTexture 在所有现代浏览器中都支持
  }

  isSupported(): boolean {
    return DataTextureStrategy.isSupported()
  }

  /**
   * 设置尺寸
   */
  async setSize(width: number, height: number): Promise<void> {
    await super.setSize(width, height)

    // 重新分配数组
    this.dataArray = new Uint8Array(width * height * 4)

    // 更新纹理
    if (this.texture) {
      this.texture.image = {
        data: this.dataArray,
        width: width,
        height: height
      }
      this.texture.dispose()
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.texture?.dispose()
    this.texture = null
    this.dataArray = new Uint8Array(0)
  }
}
