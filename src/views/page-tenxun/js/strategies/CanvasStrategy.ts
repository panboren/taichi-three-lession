// V2 - Force reload
import * as THREE from 'three'
import { BaseStrategy } from './BaseStrategy'

/**
 * Canvas 传输策略
 * 使用 Canvas 2D 作为中间缓冲,兼容性最好
 */
export class CanvasStrategy extends BaseStrategy {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private texture: THREE.CanvasTexture | null = null
  private imageData: ImageData | null = null

  /**
   * 初始化
   */
  async initialize(engine: any, options: any): Promise<void> {
    await super.initialize(engine, options)

    // 创建 canvas
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx = this.canvas.getContext('2d', {
      willReadFrequently: true,
      alpha: true
    })

    if (!this.ctx) {
      throw new Error('Failed to create Canvas 2D context')
    }

    // 创建 imageData
    this.imageData = this.ctx.createImageData(this.width, this.height)

    // 创建纹理
    this.texture = new THREE.CanvasTexture(this.canvas)
    this.setupTexture(this.texture)
  }

  /**
   * 执行传输
   */
  async transfer(): Promise<void> {
    if (!this.ctx || !this.canvas || !this.imageData) {
      throw new Error('CanvasStrategy not initialized')
    }

    // 获取像素数据
    const buffer = await this.getPixelData()

    // 将数据复制到 imageData
    const uint8Array = new Uint8Array(buffer)
    this.imageData.data.set(uint8Array)

    // 绘制到 canvas
    this.ctx.putImageData(this.imageData, 0, 0)

    // 标记纹理需要更新
    if (this.texture) {
      this.texture.needsUpdate = true
    }
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
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      return !!ctx
    } catch {
      return false
    }
  }

  isSupported(): boolean {
    return CanvasStrategy.isSupported()
  }

  /**
   * 设置尺寸
   */
  async setSize(width: number, height: number): Promise<void> {
    await super.setSize(width, height)

    if (this.canvas) {
      this.canvas.width = width
      this.canvas.height = height
    }

    if (this.ctx) {
      this.imageData = this.ctx.createImageData(width, height)
    }

    if (this.texture) {
      this.texture.image = this.canvas
      this.texture.needsUpdate = true
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.canvas = null
    this.ctx = null
    this.texture?.dispose()
    this.texture = null
    this.imageData = null
  }
}
