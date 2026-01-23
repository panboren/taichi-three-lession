import * as THREE from 'three'

/**
 * 资源管理器
 * 负责管理纹理、几何体等资源的生命周期
 */
export class ResourceManager {
  private textures: Set<THREE.Texture> = new Set()
  private geometries: Set<THREE.BufferGeometry> = new Set()
  private materials: Set<THREE.Material> = new Set()
  private buffers: Map<string, ArrayBuffer> = new Map()

  /**
   * 创建纹理
   */
  createTexture(options?: THREE.TextureOptions): THREE.Texture {
    const texture = new THREE.Texture()
    if (options) {
      Object.assign(texture, options)
    }
    this.textures.add(texture)
    return texture
  }

  /**
   * 创建 CanvasTexture
   */
  createCanvasTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
    const texture = new THREE.CanvasTexture(canvas)
    this.textures.add(texture)
    return texture
  }

  /**
   * 创建 DataTexture
   */
  createDataTexture(
    data: Uint8Array | Uint8ClampedArray | Float32Array,
    width: number,
    height: number,
    format: THREE.PixelFormat = THREE.RGBAFormat,
    type: THREE.TextureDataType = THREE.UnsignedByteType
  ): THREE.DataTexture {
    const texture = new THREE.DataTexture(data, width, height, format, type)
    texture.needsUpdate = true
    this.textures.add(texture)
    return texture
  }

  /**
   * 创建几何体
   */
  createGeometry<T extends THREE.BufferGeometry>(geometry: T): T {
    this.geometries.add(geometry)
    return geometry
  }

  /**
   * 创建材质
   */
  createMaterial<T extends THREE.Material>(material: T): T {
    this.materials.add(material)
    return material
  }

  /**
   * 缓存 Buffer
   */
  setBuffer(key: string, buffer: ArrayBuffer): void {
    const oldBuffer = this.buffers.get(key)
    if (oldBuffer && oldBuffer !== buffer) {
      // 清理旧的 buffer
    }
    this.buffers.set(key, buffer)
  }

  /**
   * 获取缓存的 Buffer
   */
  getBuffer(key: string): ArrayBuffer | undefined {
    return this.buffers.get(key)
  }

  /**
   * 删除 Buffer
   */
  deleteBuffer(key: string): void {
    this.buffers.delete(key)
  }

  /**
   * 释放纹理
   */
  releaseTexture(texture: THREE.Texture): void {
    if (this.textures.has(texture)) {
      texture.dispose()
      this.textures.delete(texture)
    }
  }

  /**
   * 释放几何体
   */
  releaseGeometry(geometry: THREE.BufferGeometry): void {
    if (this.geometries.has(geometry)) {
      geometry.dispose()
      this.geometries.delete(geometry)
    }
  }

  /**
   * 释放材质
   */
  releaseMaterial(material: THREE.Material): void {
    if (this.materials.has(material)) {
      material.dispose()
      this.materials.delete(material)
    }
  }

  /**
   * 清理所有资源
   */
  dispose(): void {
    // 清理纹理
    for (const texture of this.textures) {
      texture.dispose()
    }
    this.textures.clear()

    // 清理几何体
    for (const geometry of this.geometries) {
      geometry.dispose()
    }
    this.geometries.clear()

    // 清理材质
    for (const material of this.materials) {
      material.dispose()
    }
    this.materials.clear()

    // 清理 buffers
    this.buffers.clear()
  }

  /**
   * 获取资源统计信息
   */
  getStats(): {
    textureCount: number
    geometryCount: number
    materialCount: number
    bufferCount: number
  } {
    return {
      textureCount: this.textures.size,
      geometryCount: this.geometries.size,
      materialCount: this.materials.size,
      bufferCount: this.buffers.size
    }
  }
}
