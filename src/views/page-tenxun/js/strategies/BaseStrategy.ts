import * as THREE from 'three'
import type { BridgeOptions, TaichiEngine, TransportStrategy } from '../types'

/**
 * 基础传输策略
 * 所有传输策略的基类
 */
export abstract class BaseStrategy implements TransportStrategy {
  protected engine: TaichiEngine | null = null
  protected options: Required<BridgeOptions>
  protected width: number = 512
  protected height: number = 512

  constructor() {
    this.options = {
      width: 512,
      height: 512,
      maxResolution: 2048,
      minResolution: 256,
      preferredMode: 'canvas' as any,
      enableAdaptiveResolution: false,
      targetFps: 60,
      resolutionScaleFactor: 0.9,
      renderer: {} as any,
      scene: {} as any,
      camera: {} as any,
      planeSize: { width: 2, height: 2 },
      textureLinear: true,
      textureWrapS: THREE.ClampToEdgeWrapping,
      textureWrapT: THREE.ClampToEdgeWrapping,
      generateMipmaps: false,
      autoDetectMode: true,
      enableModeFallback: true,
      fallbackThreshold: 45,
      upgradeThreshold: 55,
      enableWebGL2PBO: true,
      pboBufferSize: 16,
      enableAutoOptimization: true,
      performance: {
        enabled: true,
        updateInterval: 500,
        enablePrediction: true,
        historySize: 120
      },
      onPerformanceUpdate: () => {},
      onModeChange: () => {},
      onResolutionChange: () => {},
      onError: console.error,
      onWarning: console.warn
    }
    this.width = this.options.width
    this.height = this.options.height
  }

  /**
   * 初始化策略
   */
  async initialize(engine: TaichiEngine, options: Required<BridgeOptions>): Promise<void> {
    this.engine = engine
    this.options = options
    this.width = options.width
    this.height = options.height
  }

  /**
   * 获取像素数据
   */
  protected async getPixelData(): Promise<ArrayBuffer> {
    if (typeof this.engine?.getPixelData === 'function') {
      return await this.engine.getPixelData()
    }

    // 如果引擎没有 getPixelData 方法,返回空 buffer
    return new ArrayBuffer(this.width * this.height * 4)
  }

  /**
   * 设置纹理属性
   */
  protected setupTexture(texture: THREE.Texture): void {
    texture.minFilter = this.options.textureLinear
      ? THREE.LinearFilter
      : THREE.NearestFilter
    texture.magFilter = this.options.textureLinear
      ? THREE.LinearFilter
      : THREE.NearestFilter
    texture.wrapS = this.options.textureWrapS
    texture.wrapT = this.options.textureWrapT
    texture.generateMipmaps = this.options.generateMipmaps
    texture.needsUpdate = true
  }

  /**
   * 获取尺寸
   */
  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height }
  }

  /**
   * 设置尺寸
   */
  async setSize(width: number, height: number): Promise<void> {
    this.width = width
    this.height = height
    // 子类可以覆盖此方法以处理尺寸变化
  }

  /**
   * 获取模式
   */
  getMode(): string {
    return this.constructor.name
  }

  /**
   * 抽象方法,子类必须实现
   */
  abstract transfer(): Promise<void>
  abstract getCurrentTexture(): THREE.Texture
  abstract isSupported(): boolean
  abstract cleanup(): void
}
