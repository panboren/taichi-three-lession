/**
 * WebGPU处理器 - 处理WebGPU相关操作
 */
import { UltimateBridgeOptions } from './types'

export class WebGPUHandler {
  private device?: GPUDevice
  private adapter?: GPUAdapter
  private enabled: boolean
  private options: any // 简化选项类型

  constructor(options?: any) {
    this.enabled = options?.enabled ?? false
    this.options = options
  }

  async initialize(): Promise<void> {
    if (!this.enabled || !this.isSupported()) {
      return
    }

    try {
      this.adapter = await (navigator as any).gpu.requestAdapter({
        powerPreference: this.options.powerPreference ?? 'high-performance'
      })

      if (!this.adapter) {
        throw new Error('No GPU adapter found')
      }

      this.device = await this.adapter.requestDevice()
    } catch (error) {
      console.warn('WebGPU initialization failed:', error)
    }
  }

  private isSupported(): boolean {
    return typeof (navigator as any).gpu !== 'undefined'
  }

  getDevice(): GPUDevice | undefined {
    return this.device
  }

  getAdapter(): GPUAdapter | undefined {
    return this.adapter
  }

  isEnabled(): boolean {
    return this.enabled
  }
}
