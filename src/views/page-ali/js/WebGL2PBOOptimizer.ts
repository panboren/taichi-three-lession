/**
 * WebGL2 PBO 优化器 - 使用像素缓冲对象优化纹理上传
 */

export class WebGL2PBOOptimizer {
  private gl: WebGL2RenderingContext
  private pbo: WebGLBuffer
  private texture: WebGLTexture
  private data: Uint8Array
  private width: number
  private height: number

  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    this.gl = gl
    this.width = width
    this.height = height

    // 创建纹理
    this.texture = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, this.texture)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    // 分配纹理存储
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    // 创建 PBO
    this.pbo = gl.createBuffer()!
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, this.pbo)
    gl.bufferData(gl.PIXEL_UNPACK_BUFFER, width * height * 4, gl.DYNAMIC_DRAW)
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null)

    // 预分配数据缓冲区
    this.data = new Uint8Array(width * height * 4)

    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  async update(data: Uint8Array): Promise<void> {
    const gl = this.gl

    // 更新 PBO
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, this.pbo)
    gl.bufferSubData(gl.PIXEL_UNPACK_BUFFER, 0, data)

    // 从 PBO 上传到纹理 (异步)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, 0)

    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null)
    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  getWebGLTexture(): WebGLTexture {
    return this.texture
  }

  /**
   * 创建 Three.js 纹理
   */
  getThreeTexture(textureLinear: boolean): any {
    // 简化类型
    // 这里返回一个代表 Three.js 纹理的对象
    // 在实际实现中，需要正确集成 Three.js
    return {
      needsUpdate: true,
      image: this.data
    }
  }

  resize(width: number, height: number): void {
    this.width = width
    this.height = height

    const gl = this.gl

    // 重新分配纹理存储
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    // 重新分配 PBO
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, this.pbo)
    gl.bufferData(gl.PIXEL_UNPACK_BUFFER, width * height * 4, gl.DYNAMIC_DRAW)
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null)

    // 重新分配数据缓冲区
    this.data = new Uint8Array(width * height * 4)

    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  dispose(): void {
    const gl = this.gl
    gl.deleteBuffer(this.pbo)
    gl.deleteTexture(this.texture)
  }
}
