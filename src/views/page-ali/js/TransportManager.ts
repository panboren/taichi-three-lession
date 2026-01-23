/**
 * 传输管理器 - 管理不同传输模式的切换和执行
 */
import * as THREE from 'three'
import { UltimateTransferMode, UltimateBridgeOptions, TaichiEngine } from './types'
import { PerformanceMonitor } from './PerformanceMonitor'
import { ResourceManager } from './ResourceManager'
import { WebGL2PBOOptimizer } from './WebGL2PBOOptimizer'

export class TransportManager {
  private currentMode: UltimateTransferMode
  private options: UltimateBridgeOptions
  private performanceMonitor: PerformanceMonitor
  private resourceManager: ResourceManager
  private taichiEngine: TaichiEngine
  private canvas: HTMLCanvasElement | OffscreenCanvas
  private texture: THREE.Texture
  private webgl2PBO?: WebGL2PBOOptimizer

  constructor(
    options: UltimateBridgeOptions,
    performanceMonitor: PerformanceMonitor,
    resourceManager: ResourceManager
  ) {
    this.options = options
    this.performanceMonitor = performanceMonitor
    this.resourceManager = resourceManager
    this.currentMode = this.detectOptimalMode()
    this.canvas = this.createCanvas()
    this.texture = this.createInitialTexture()
  }

  private detectOptimalMode(): UltimateTransferMode {
    // 根据浏览器支持检测最优模式
    if (this.hasWebGPUSupport() && this.options.webgpu?.enabled !== false) {
      return UltimateTransferMode.WebGPUSharedTexture
    }
    if (this.hasTransferableSupport() && this.options.offscreen?.enabled !== false) {
      return UltimateTransferMode.TransferableImageBitmap
    }
    if (this.hasOffscreenCanvasSupport() && this.options.offscreen?.enableWorker) {
      return UltimateTransferMode.OffscreenWorker
    }
    if (this.hasWebGL2PBO() && this.options.enableWebGL2PBO !== false) {
      return UltimateTransferMode.WebGL2PBO
    }
    if (this.hasOffscreenCanvasSupport() && this.options.offscreen?.enabled !== false) {
      return UltimateTransferMode.OffscreenImageBitmap
    }
    return UltimateTransferMode.CanvasTexture
  }

  private hasWebGPUSupport(): boolean {
    return typeof (navigator as any).gpu !== 'undefined'
  }

  private hasTransferableSupport(): boolean {
    return typeof OffscreenCanvas !== 'undefined' && typeof createImageBitmap === 'function'
  }

  private hasWebGL2PBO(): boolean {
    const gl = this.options.renderer.getContext()
    return gl && gl instanceof WebGL2RenderingContext
  }

  private hasOffscreenCanvasSupport(): boolean {
    return typeof OffscreenCanvas !== 'undefined'
  }

  private createCanvas(): HTMLCanvasElement | OffscreenCanvas {
    const { width = 512, height = 512, offscreen } = this.options

    if (offscreen?.canvas) {
      return offscreen.canvas
    }

    if (offscreen?.enabled && typeof OffscreenCanvas !== 'undefined') {
      return new OffscreenCanvas(width, height)
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.style.display = 'none'
    document.body.appendChild(canvas)
    return canvas
  }

  private createInitialTexture(): THREE.Texture {
    const filter = this.options.textureLinear ? THREE.LinearFilter : THREE.NearestFilter
    const wrapS = this.options.textureWrapS ?? THREE.ClampToEdgeWrapping
    const wrapT = this.options.textureWrapT ?? THREE.ClampToEdgeWrapping

    switch (this.currentMode) {
      case UltimateTransferMode.WebGPUSharedTexture:
        return new THREE.Texture()
      case UltimateTransferMode.TransferableImageBitmap:
      case UltimateTransferMode.OffscreenImageBitmap:
        return new THREE.Texture()
      case UltimateTransferMode.OffscreenWorker:
        return new THREE.CanvasTexture(this.canvas as HTMLCanvasElement)
      case UltimateTransferMode.WebGL2PBO:
        if (this.webgl2PBO) {
          return this.webgl2PBO.getThreeTexture(this.options.textureLinear ?? true)
        } else {
          return new THREE.DataTexture(
            new Uint8Array((this.options.width ?? 512) * (this.options.height ?? 512) * 4),
            this.options.width ?? 512,
            this.options.height ?? 512,
            this.options.textureFormat ?? THREE.RGBAFormat,
            this.options.textureType ?? THREE.UnsignedByteType
          )
        }
      case UltimateTransferMode.CanvasTexture:
        return new THREE.CanvasTexture(this.canvas as HTMLCanvasElement)
      case UltimateTransferMode.PixelBuffer:
        const data =
          this.options.pixelBuffer?.data ||
          new Uint8Array((this.options.width ?? 512) * (this.options.height ?? 512) * 4)
        return new THREE.DataTexture(
          data,
          this.options.width ?? 512,
          this.options.height ?? 512,
          this.options.textureFormat ?? THREE.RGBAFormat,
          this.options.textureType ?? THREE.UnsignedByteType
        )
      case UltimateTransferMode.FieldSync:
        return new THREE.Texture()
    }
  }

  async initialize(taichiEngine: TaichiEngine): Promise<void> {
    this.taichiEngine = taichiEngine

    // 初始化 WebGL2 PBO (如果启用)
    if (this.options.enableWebGL2PBO && this.hasWebGL2PBO()) {
      const gl = this.options.renderer.getContext() as WebGL2RenderingContext
      if (gl) {
        this.webgl2PBO = new WebGL2PBOOptimizer(
          gl,
          this.options.width ?? 512,
          this.options.height ?? 512
        )
      }
    }
  }

  async transfer(time: number): Promise<void> {
    this.performanceMonitor.startTransfer()

    switch (this.currentMode) {
      case UltimateTransferMode.WebGPUSharedTexture:
        await this.transferViaWebGPU()
        break
      case UltimateTransferMode.TransferableImageBitmap:
        await this.transferViaTransferableImageBitmap()
        break
      case UltimateTransferMode.OffscreenWorker:
        await this.transferViaWorker()
        break
      case UltimateTransferMode.WebGL2PBO:
        await this.transferViaWebGL2PBO()
        break
      case UltimateTransferMode.OffscreenImageBitmap:
        await this.transferViaImageBitmap()
        break
      case UltimateTransferMode.CanvasTexture:
        this.transferViaCanvasTexture()
        break
      case UltimateTransferMode.PixelBuffer:
        await this.transferViaPixelBuffer()
        break
      case UltimateTransferMode.FieldSync:
        await this.transferViaFieldSync(time)
        break
    }

    this.performanceMonitor.endTransfer(
      (this.options.width ?? 512) * (this.options.height ?? 512) * 4
    )
  }

  private async transferViaWebGPU(): Promise<void> {
    // TODO: 实现 WebGPU 共享纹理传输
    console.warn('WebGPU shared texture transfer not yet implemented')
  }

  private async transferViaTransferableImageBitmap(): Promise<void> {
    if (!(this.canvas instanceof OffscreenCanvas)) return

    try {
      const bitmap = await createImageBitmap(this.canvas, {
        imageOrientation: 'none',
        premultiplyAlpha: 'none'
      })

      this.texture.image = bitmap
      this.texture.needsUpdate = true
    } catch (error) {
      console.error('Transferable ImageBitmap transfer failed:', error)
    }
  }

  private async transferViaWorker(): Promise<void> {
    // Worker 传输逻辑
    console.warn('Worker-based transfer not yet implemented')
  }

  private async transferViaWebGL2PBO(): Promise<void> {
    if (!this.webgl2PBO) return

    try {
      if (typeof (this.taichiEngine as any).getPixelData === 'function') {
        const data = await (this.taichiEngine as any).getPixelData()
        const width = this.options.width ?? 512
        const height = this.options.height ?? 512

        if (data.byteLength === width * height * 4) {
          await this.webgl2PBO.update(new Uint8Array(data))
          this.texture.needsUpdate = true
        }
      }
    } catch (error) {
      console.error('WebGL2 PBO transfer failed:', error)
    }
  }

  private async transferViaImageBitmap(): Promise<void> {
    if (!(this.canvas instanceof OffscreenCanvas)) return

    try {
      const bitmap = await createImageBitmap(this.canvas)
      this.texture.image = bitmap
      this.texture.needsUpdate = true
    } catch (error) {
      console.error('ImageBitmap transfer failed:', error)
    }
  }

  private transferViaCanvasTexture(): void {
    if (this.texture instanceof THREE.CanvasTexture) {
      this.texture.needsUpdate = true
    } else {
      this.texture.image = this.canvas
      this.texture.needsUpdate = true
    }
  }

  private async transferViaPixelBuffer(): Promise<void> {
    if (typeof (this.taichiEngine as any).getPixelData === 'function') {
      const data = await (this.taichiEngine as any).getPixelData()
      if (this.texture instanceof THREE.DataTexture) {
        this.texture.image.data.set(new Uint8Array(data))
        this.texture.needsUpdate = true
      }
    }
  }

  private async transferViaFieldSync(time: number): Promise<void> {
    // 字段同步传输逻辑
    console.warn('Field sync transfer not yet implemented')
  }

  getCurrentTexture(): THREE.Texture {
    return this.texture
  }

  getCurrentMode(): UltimateTransferMode {
    return this.currentMode
  }

  async switchMode(newMode: UltimateTransferMode): Promise<void> {
    if (newMode === this.currentMode) return

    const oldMode = this.currentMode
    this.currentMode = newMode

    // 重新创建纹理
    this.texture = this.createInitialTexture()

    // 执行回调
    this.options.onModeChange?.(oldMode, newMode)
  }

  async setSize(width: number, height: number): Promise<void> {
    // 更新选项
    this.options.width = width
    this.options.height = height

    // 更新画布
    if (this.canvas instanceof HTMLCanvasElement) {
      this.canvas.width = width
      this.canvas.height = height
    } else if (this.canvas instanceof OffscreenCanvas) {
      this.canvas.width = width
      this.canvas.height = height
    }

    // 更新 WebGL2 PBO
    if (this.webgl2PBO) {
      this.webgl2PBO.resize(width, height)
    }

    // 重新创建纹理
    this.texture = this.createInitialTexture()
  }

  dispose(): void {
    // 清理资源
    if (this.texture && !(this.texture as any).disposed) {
      this.texture.dispose()
    }

    if (this.webgl2PBO) {
      this.webgl2PBO.dispose()
    }

    if (this.canvas instanceof HTMLCanvasElement && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas)
    }
  }
}
