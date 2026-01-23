# Taichi.js + Three.js 性能协作架构指南

## 核心设计理念

### 职责分离

```
┌─────────────────────────────────────────────────────────────────┐
│                     应用层                                  │
├──────────────────────┬───────────────────────────────────────┤
│   Taichi.js (GPU)   │        Three.js (渲染)               │
│                      │                                      │
│   • 物理模拟         │   • 3D 场景管理                     │
│   • 粒子系统         │   • 相机控制                         │
│   • 碰撞检测         │   • 灯光和材质                       │
│   • 流体动力学       │   • 阴影和特效                       │
│   • SPH 算法        │   • 后处理效果                       │
│                      │                                      │
│   并行计算           │   串行/并行渲染                      │
│   计算密集型         │   I/O 密集型                         │
└──────────────────────┴───────────────────────────────────────┘
           │                        │
           └───────────┬────────────┘
                       │
              数据传输层
    (Canvas / ArrayBuffer / Texture)
```

## 性能优势

### 为什么这样设计？

| 方面 | Taichi.js | Three.js | 协作优势 |
|------|------------|-----------|---------|
| **计算能力** | GPU 并行计算 | WebGL 渲染 | 各司其职，互不干扰 |
| **物理模拟** | 速度快 (10-100x) | JavaScript 较慢 | GPU 加速物理计算 |
| **粒子系统** | 支持 100K+ | 10K 左右 | 大规模粒子 |
| **开发效率** | 简洁的 Python/JS 语法 | 丰富的 3D 生态 | 快速原型开发 |

## 数据传输策略

### 1. Canvas 模式 (最通用)

```typescript
// Taichi 渲染到离屏 Canvas
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.createImageData(width, height)

// 填充数据（从 Taichi）
for (let i = 0; i < particleCount; i++) {
  imageData.data[i * 4] = positions[i * 3]     // R
  imageData.data[i * 4 + 1] = positions[i * 3 + 1] // G
  imageData.data[i * 4 + 2] = positions[i * 3 + 2] // B
  imageData.data[i * 4 + 3] = 255 // A
}
ctx.putImageData(imageData, 0, 0)

// Three.js 读取为纹理
const texture = new THREE.CanvasTexture(canvas)
material.map = texture
```

**优点：** 兼容性好，调试方便
**缺点：** CPU 传输开销大
**适用场景：** 中小规模粒子系统（<50K）

---

### 2. ArrayBuffer 模式 (零拷贝)

```typescript
// Taichi 计算（GPU）
const gpuData = new Float32Array(particleCount * 3)
// ... GPU 计算 ...

// 直接传输（零拷贝）
const positions = particles.geometry.attributes.position.array
positions.set(gpuData)  // 内存复制，但很快
particles.geometry.attributes.position.needsUpdate = true

// 使用 Transferable Objects (Web Worker)
worker.postMessage(
  { buffer: gpuData.buffer },
  [gpuData.buffer]  // 零拷贝传输
)
```

**优点：** 传输速度快，无中间格式
**缺点：** 需要 GPU → CPU → GPU
**适用场景：** 大规模粒子系统（50K-200K）

---

### 3. Texture 模式 (GPU-GPU)

```typescript
// Taichi 写入纹理数据
const data = new Uint8Array(particleCount * 4)
for (let i = 0; i < particleCount; i++) {
  data[i * 4] = positions[i * 3] * 255
  data[i * 4 + 1] = positions[i * 3 + 1] * 255
  data[i * 4 + 2] = positions[i * 3 + 2] * 255
  data[i * 4 + 3] = 255
}

// 创建纹理
const texture = new THREE.DataTexture(
  data,
  width, height,
  THREE.RGBAFormat
)
texture.needsUpdate = true

// 在着色器中使用
// GLSL 纹理采样
```

**优点：** GPU-GPU 传输，最快
**缺点：** 需要自定义着色器
**适用场景：** 超大规模粒子系统（>200K）

---

### 4. WebGPU 模式 (最佳性能)

```typescript
// 零拷贝共享纹理
import '@webgpu/types'

// 创建共享缓冲区
const device = await navigator.gpu.requestDevice()
const buffer = device.createBuffer({
  size: particleCount * 3 * 4,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
})

// Taichi 写入
// Three.js 读取
// 无需 CPU 参与！
```

**优点：** 零拷贝，GPU-GPU 直连
**缺点：** WebGPU 支持有限
**适用场景：** 专业级应用

---

## Taichi.js GPU 计算内核示例

### 基础粒子更新

```python
# Taichi 伪代码
import taichi as ti

ti.init(arch=ti.gpu)  # 使用 GPU

# 定义 GPU 字段（Fields）
n = 10000
pos = ti.Vector.field(3, dtype=float, shape=n)
vel = ti.Vector.field(3, dtype=float, shape=n)

# GPU 计算内核
@ti.kernel
def update_particles(dt: float):
    for i in range(n):
        # 并行计算每个粒子
        pos[i] += vel[i] * dt
        vel[i].y -= 9.8 * dt  # 重力
```

### SPH 流体模拟

```python
@ti.kernel
def compute_density(n: int, h: float):
    for i in range(n):
        density = 0.0
        for j in range(n):
            dist = (pos[i] - pos[j]).norm()
            if dist < h:
                density += (1 - dist/h)**3
        rho[i] = density

@ti.kernel
def compute_forces(n: int, h: float):
    for i in range(n):
        force = ti.Vector([0.0, 0.0, 0.0])
        for j in range(n):
            if i == j: continue
            dist = (pos[i] - pos[j]).norm()
            if dist < h and dist > 0.001:
                direction = (pos[i] - pos[j]) / dist
                pressure = (pressure[i] + pressure[j]) / 2
                gradient = -45 * (1 - dist/h)**2 / (ti.pi * h**6)
                force -= pressure * gradient * direction
        vel[i] += force * dt / rho[i]
```

---

## Three.js 渲染优化

### 使用 InstancedMesh

```typescript
// 实例化渲染 - 支持 100K+ 对象
const geometry = new THREE.SphereGeometry(0.1, 8, 8)
const material = new THREE.MeshStandardMaterial()
const instancedMesh = new THREE.InstancedMesh(
  geometry,
  material,
  particleCount  // 100K 实例
)

// 更新实例矩阵
for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3
  dummy.position.set(
    positions[i3],
    positions[i3 + 1],
    positions[i3 + 2]
  )
  dummy.updateMatrix()
  instancedMesh.setMatrixAt(i, dummy.matrix)
}
instancedMesh.instanceMatrix.needsUpdate = true
```

### 自定义着色器

```glsl
// 顶点着色器 - GPU 粒子更新
attribute vec3 position;
attribute vec3 velocity;
uniform float time;

void main() {
  vec3 newPos = position + velocity * time;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  gl_PointSize = 10.0;
}
```

### 后处理效果

```typescript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const composer = new EffectComposer(renderer)
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, 0.4, 0.85
)
composer.addPass(bloomPass)

// 每帧渲染
composer.render()
```

---

## 性能优化最佳实践

### 1. 减少 GPU-CPU 传输

```typescript
// ❌ 不好 - 每帧传输大量数据
for (let frame = 0; frame < 1000; frame++) {
  const data = ti.read_from_gpu()  // GPU→CPU 慢！
  renderer.render(data)
}

// ✅ 好 - 使用纹理或共享内存
const texture = ti.render_to_texture()  // GPU 传输
material.map = texture
renderer.render()
```

### 2. 批量更新

```typescript
// ❌ 不好 - 频繁更新
for (let i = 0; i < count; i++) {
  particle.update()
  geometry.attributes.position.needsUpdate = true  // 太多更新
}

// ✅ 好 - 批量更新
for (let i = 0; i < count; i++) {
  particle.update()
}
geometry.attributes.position.needsUpdate = true  // 一次更新
```

### 3. 使用缓冲区对象

```typescript
// ✅ 使用 TypedArray
const positions = new Float32Array(count * 3)
const colors = new Uint8Array(count * 3)

// ✅ 预分配内存
const MAX_PARTICLES = 100000
const buffer = new Float32Array(MAX_PARTICLES * 3)
```

### 4. LOD (细节层次)

```typescript
// 根据距离调整粒子数
const distance = camera.position.distanceTo(particle.position)
const quality = distance < 20 ? 1 : distance < 50 ? 0.5 : 0.25
renderParticles(Math.floor(particleCount * quality))
```

### 5. 视锥体剔除

```typescript
// 只渲染可见粒子
const frustum = new THREE.Frustum()
const projScreenMatrix = new THREE.Matrix4()
projScreenMatrix.multiplyMatrices(
  camera.projectionMatrix,
  camera.matrixWorldInverse
)
frustum.setFromProjectionMatrix(projScreenMatrix)

for (let i = 0; i < particleCount; i++) {
  const particlePos = new THREE.Vector3(...)
  if (frustum.containsPoint(particlePos)) {
    renderParticle(i)  // 渲染
  }
}
```

---

## 调试和性能分析

### 性能监控

```typescript
class PerformanceMonitor {
  private fps = 0
  private frameCount = 0
  private lastTime = performance.now()
  private transferTimes: number[] = []
  private computeTimes: number[] = []

  update(fps: number, transferTime: number, computeTime: number) {
    this.fps = fps
    this.transferTimes.push(transferTime)
    this.computeTimes.push(computeTime)

    // 保持最近 60 帧
    if (this.transferTimes.length > 60) {
      this.transferTimes.shift()
      this.computeTimes.shift()
    }
  }

  getAverageTransferTime(): number {
    return this.transferTimes.reduce((a, b) => a + b, 0) / this.transferTimes.length
  }

  getAverageComputeTime(): number {
    return this.computeTimes.reduce((a, b) => a + b, 0) / this.computeTimes.length
  }

  getDataThroughput(): number {
    const dataSize = particleCount * 3 * 4 // bytes
    const avgTime = this.getAverageTransferTime() / 1000 // seconds
    return (dataSize / 1024 / 1024) / avgTime // MB/s
  }
}
```

### Taichi 性能分析

```python
# 启用性能分析
import taichi as ti
ti.init(arch=ti.gpu, print_ir=True)

# 使用 ti.profiler
with ti.profiler():
    for _ in range(100):
        update_particles()

# 输出性能报告
ti.profiler.print()
```

---

## 学习路径建议

### 初级 (1-3课)
- ✅ 基础粒子系统创建
- ✅ 简单物理效果（重力、碰撞）
- ✅ 数据传输基础（Canvas 模式）

### 中级 (4-6课)
- ✅ 多种传输模式对比
- ✅ SPH 流体模拟
- ✅ 碰撞检测优化
- ✅ 空间分区算法

### 高级 (7-10课)
- ✅ GPU 实例化渲染
- ✅ 自适应质量控制
- ✅ 后处理特效
- ✅ 性能监控和优化

### 专家级 (11课+)
- ✅ Taichi GPU 内核编写
- ✅ WebGPU 零拷贝传输
- ✅ 自定义着色器集成
- ✅ 大规模系统架构设计

---

## 常见问题

### Q: 为什么不用纯 JavaScript?
**A:** JavaScript 单线程性能有限，GPU 可以提供 10-100x 加速。

### Q: 什么时候用 Canvas/ArrayBuffer/Texture?
**A:**
- Canvas: <50K 粒子，调试方便
- ArrayBuffer: 50K-200K 粒子，性能平衡
- Texture/WebGPU: >200K 粒子，追求极致性能

### Q: 如何选择传输模式?
**A:** 在课程 11 中测试不同模式，查看 FPS 和传输时间。

### Q: Taichi.js 学习曲线如何?
**A:** 类似 Python/NumPy，简洁直观。1-2 天可掌握基础。

---

## 相关资源

- [Taichi.js 官方文档](https://docs.taichi-lang.org/)
- [Three.js 官方文档](https://threejs.org/docs/)
- [WebGPU 规范](https://www.w3.org/TR/webgpu/)
- [GPU Gems 系列](https://developer.nvidia.com/gpugems/)

---

## 总结

Taichi.js + Three.js 的协作架构实现了：

1. **性能分离**: 计算 vs 渲染，各司其职
2. **可扩展性**: 支持 1K 到 1M+ 粒子
3. **灵活性**: 多种传输模式适应不同场景
4. **开发效率**: Taichi 简洁语法 + Three.js 丰富生态

这种架构特别适合：
- 流体模拟
- 粒子系统
- 物理引擎
- 视觉特效
- 科学可视化
