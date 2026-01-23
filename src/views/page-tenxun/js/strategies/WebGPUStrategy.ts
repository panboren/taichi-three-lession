// V2 - Force reload
import * as THREE from 'three'
import { BaseStrategy } from './BaseStrategy'

/**
 * WebGPU 传输策略
 * 使用 WebGPU 进行零拷贝传输,最高性能
 */
export class WebGPUStrategy extends BaseStrategy {
  private device: GPUDevice | null = null
  private texture: THREE.DataTexture = null as any
  private dataArray: Uint8Array = null as any

  /**
   * 初始化
   */
  async initialize(engine: any, options: any): Promise<void> {
    console.log('[WebGPUStrategy] Initializing...')
    await super.initialize(engine, options)

    console.log('[WebGPUStrategy] Creating DataTexture...')
    // 先创建默认的 DataTexture 作为回退（确保一定有纹理）
    this.dataArray = new Uint8Array(this.width * this.height * 4)
    this.texture = new THREE.DataTexture(
      this.dataArray,
      this.width,
      this.height,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    )
    this.setupTexture(this.texture)
    console.log('[WebGPUStrategy] DataTexture created:', this.texture)

    // 检查 WebGPU 支持
    if (!WebGPUStrategy.isSupported()) {
      console.warn('[WebGPUStrategy] WebGPU not supported, using DataTexture fallback')
      return
    }

    try {
      // 获取 WebGPU 设备
      if (!navigator.gpu) {
        console.warn('[WebGPUStrategy] WebGPU is not available, using DataTexture fallback')
        return
      }

      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter) {
        console.warn('[WebGPUStrategy] Failed to get GPU adapter, using DataTexture fallback')
        return
      }

      this.device = await adapter.requestDevice()
      console.log('[WebGPUStrategy] WebGPU device initialized successfully')
    } catch (error) {
      console.warn('[WebGPUStrategy] WebGPU initialization failed, using DataTexture fallback:', error)
      this.device = null
    }
  }

  /**
   * 执行传输
   */
  async transfer(): Promise<void> {
    if (!this.texture || !this.dataArray) {
      console.error('[WebGPUStrategy] Texture or dataArray is null!')
      throw new Error('WebGPUStrategy not initialized')
    }

    // 获取像素数据
    const buffer = await this.getPixelData()

    // 复制数据到 dataArray
    this.dataArray.set(new Uint8Array(buffer))

    // 标记纹理需要更新
    this.texture.needsUpdate = true
  }

  /**
   * 获取当前纹理
   */
  getCurrentTexture(): THREE.Texture {
    if (!this.texture) {
      console.error('[WebGPUStrategy] getCurrentTexture: texture is null!')
      // 创建一个临时的 DataTexture 作为最后保障
      this.texture = new THREE.DataTexture(
        new Uint8Array(this.width * this.height * 4),
        this.width,
        this.height,
        THREE.RGBAFormat,
        THREE.UnsignedByteType
      )
      this.setupTexture(this.texture)
    }
    return this.texture
  }

  /**
   * 检查是否支持
   */
  static isSupported(): boolean {
    return typeof navigator !== 'undefined' &&
           typeof navigator.gpu !== 'undefined'
  }

  isSupported(): boolean {
    return WebGPUStrategy.isSupported()
  }

  /**
   * 设置尺寸
   */
  async setSize(width: number, height: number): Promise<void> {
    await super.setSize(width, height)

    // 重新创建 dataArray 和 texture
    this.dataArray = new Uint8Array(width * height * 4)
    if (this.texture) {
      this.texture.image = {
        data: this.dataArray,
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
    this.texture?.dispose()
    this.texture = null
    this.dataArray = null
    this.device = null
  }
}
