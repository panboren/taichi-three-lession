import * as THREE from 'three'

export class ResourceManager {
  private textureCache: Map<string, THREE.Texture> = new Map()
  private maxTextureCacheSize: number = 10

  getTexture(key: string): THREE.Texture | undefined {
    return this.textureCache.get(key)
  }

  setTexture(key: string, texture: THREE.Texture): void {
    if (this.textureCache.size >= this.maxTextureCacheSize) {
      // 移除最老的纹理
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
    this.textureCache.forEach(texture => {
      texture.dispose()
    })
    this.textureCache.clear()
  }

  dispose(): void {
    this.clearTextureCache()
  }
}
