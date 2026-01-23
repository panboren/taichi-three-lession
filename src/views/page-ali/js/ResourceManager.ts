/**
 * 资源管理器 - 管理纹理、缓冲区和其他资源的生命周期
 */
import * as THREE from 'three'

export class ResourceManager {
  private textureCache: Map<string, THREE.Texture> = new Map()
  private maxTextureCacheSize: number = 10

  getTexture(key: string): THREE.Texture | undefined {
    return this.textureCache.get(key)
  }

  setTexture(key: string, texture: THREE.Texture): void {
    if (this.textureCache.size >= this.maxTextureCacheSize) {
      const firstKey = this.textureCache.keys().next().value
      if (firstKey) {
        const oldTexture = this.textureCache.get(firstKey)
        if (oldTexture) {
          oldTexture.dispose()
        }
        this.textureCache.delete(firstKey)
      }
    }
    this.textureCache.set(key, texture)
  }

  clearTextureCache(): void {
    this.textureCache.forEach(texture => texture.dispose())
    this.textureCache.clear()
  }

  dispose(): void {
    this.clearTextureCache()
  }
}
