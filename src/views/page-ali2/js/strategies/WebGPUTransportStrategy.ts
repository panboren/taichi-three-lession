import * as THREE from 'three'
import { BaseTransportStrategy } from './TransportStrategy'
import { TaichiEngine, BridgeOptions, TransportMode } from '../types'
import { detectWebGPUSupport } from '../utils/browserSupport'

export class WebGPUTransportStrategy extends BaseTransportStrategy {
  private taichiEngine: TaichiEngine
  private device?: GPUDevice
  private adapter?: GPUAdapter
  private gpuTexture?: GPUTexture
  private textureView?: GPUTextureView

  constructor(options: BridgeOptions) {
    super(options)
  }

  async initialize(taichiEngine: TaichiEngine, options: BridgeOptions): Promise<void> {
    this.taichiEngine = taichiEngine

    if (!detectWebGPUSupport()) {
      throw new Error('WebGPU not supported')
    }

    // 请求适配器和设备
    this.adapter = await (navigator as any).gpu.requestAdapter({
      powerPreference: 'high-performance'
    })

    if (!this.adapter) {
      throw new Error('No GPU adapter found')
    }

    this.device = await this.adapter.requestDevice()

    // 创建 GPU 纹理
    this.gpuTexture = this.device.createTexture({
      size: [this.options.width || 512, this.options.height || 512, 1],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    })

    this.textureView = this.gpuTexture.createView()

    // 创建 Three.js 纹理
    this.texture = new THREE.Texture()
    this.texture.needsUpdate = true
  }

  async transfer(): Promise<void> {
    // WebGPU 传输逻辑
    // 这里需要 Taichi.js 提供 WebGPU 共享纹理接口
    // 暂时使用占位实现
    console.warn('WebGPU transfer is not fully implemented yet')
    this.texture.needsUpdate = true
  }

  isSupported(): boolean {
    return detectWebGPUSupport()
  }

  cleanup(): void {
    if (this.gpuTexture) {
      this.gpuTexture.destroy()
    }
    this.texture.dispose()
  }

  getMode(): string {
    return TransportMode.WebGPU
  }
}
