# Taichi.js + Three.js 高级课程规划

## 📊 当前课程回顾

### 已完成课程（12课）
- **阶段一：基础入门** (L1-L3)
  - L1: Hello World - 认识 Taichi.js
  - L2: Three.js 基础场景搭建
  - L3: 第一个粒子系统

- **阶段二：数据传输** (L4-L6)
  - L4: Taichi.js 字段系统
  - L5: GPU 计算与数据传输
  - L6: Texture 数据传输优化

- **阶段三：物理模拟** (L7-L9)
  - L7: 粒子物理模拟（重力场）
  - L8: 流体粒子模拟（SPH）
  - L9: 碰撞检测与响应

- **阶段四：综合应用** (L10-L12)
  - L10: 大规模粒子系统（10万+）
  - L11: 性能分析与优化
  - L12: 综合项目：完整演示

---

## 🚀 高级课程规划（L13-L30）

### 阶段五：高级GPU计算技术（L13-L18）

#### L13: WebGPU Compute Shader 深度解析
**学习目标：**
- 理解 WebGPU Compute Pipeline 工作原理
- 学习 Compute Shader 编程基础
- 掌握 WGSL (WebGPU Shading Language)
- 了解 Taichi.js 如何生成 Compute Shader

**内容大纲：**
1. WebGPU 架构概述
   - Compute Pipeline vs Graphics Pipeline
   - Command Buffer 和 Queue
   - Workgroup 和 Thread 管理

2. WGSL 语言基础
   - 数据类型和函数
   - 内置变量和属性
   - 着色器阶段的协作

3. Taichi.js 到 Compute Shader 的转换
   - 内核编译流程
   - 字段布局优化
   - 内存访问模式

4. 实战示例
   - 矩阵乘法优化
   - 并行前缀和
   - 粒子排序（基于GPU）

**代码示例：**
```typescript
// 原生 WebGPU Compute Shader 示例
const computeShaderCode = `
@group(0) @binding(0) var<storage, read> input : array<f32>;
@group(0) @binding(1) var<storage, read_write> output : array<f32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  let index = global_id.x;
  if (index < arrayLength(&input)) {
    output[index] = input[index] * 2.0;
  }
}
`;

// 对比 Taichi.js 的简洁写法
const multiplyByTwo = ti.kernel(() => {
  for (let i of ti.range(n)) {
    output[i] = input[i] * 2.0
  }
})
```

---

#### L14: 高级物理模拟 - 柔体动力学
**学习目标：**
- 理解质点-弹簧系统
- 实现布料模拟
- 掌握约束求解方法
- 学习 Verlet 积分

**内容大纲：**
1. 质点-弹簧系统
   - 胡克定律与弹性力
   - 结构约束、剪切约束、弯曲约束
   - 隐式积分 vs 显式积分

2. 布料模拟算法
   - Position Based Dynamics (PBD)
   - 约束满足迭代
   - 自碰撞检测

3. 实战项目
   - 交互式布料模拟
   - 风力效果
   - 撕裂效果

**代码示例：**
```typescript
// 质点-弹簧系统
const mass = ti.field(ti.f32, [N])
const positions = ti.Vector.field(3, ti.f32, [N])
const velocities = ti.Vector.field(3, ti.f32, [N])
const restLengths = ti.field(ti.f32, [N_SPRINGS])

// PBD 约束求解
const solveConstraints = ti.kernel(() => {
  for (let i of ti.range(N_SPRINGS)) {
    const idx1 = springs[i].x
    const idx2 = springs[i].y
    const rest = restLengths[i]
    
    const p1 = positions[idx1]
    const p2 = positions[idx2]
    
    const delta = p2 - p1
    const dist = ti.sqrt(delta.x * delta.x + delta.y * delta.y + delta.z * delta.z)
    
    if (dist > 0.001) {
      const correction = delta * (dist - rest) / dist * 0.5
      positions[idx1] += correction
      positions[idx2] -= correction
    }
  }
})
```

---

#### L15: 流体动力学高级应用 - SPH 深度优化
**学习目标：**
- 深入理解 SPH 算法原理
- 实现空间哈希加速
- 优化邻近粒子搜索
- 添加表面张力和粘度

**内容大纲：**
1. SPH 算法深入
   - 核函数选择（Poly6, Spiky）
   - 密度计算优化
   - 压力梯度计算

2. 空间加速结构
   - 空间哈希网格
   - 统一网格 (Uniform Grid)
   - 八叉树 (Octree)

3. 高级流体效果
   - 表面张力模拟
   - 粘度控制
   - 自由表面检测

**代码示例：**
```typescript
// 空间哈希优化
const GRID_SIZE = 64
const HASH_MOD = 73856093 // 质数

const gridHash = ti.kernel(() => {
  for (let i of ti.range(N)) {
    const cellX = ti.floor((positions[i].x + 1.0) * GRID_SIZE / 2)
    const cellY = ti.floor((positions[i].y + 1.0) * GRID_SIZE / 2)
    const cellZ = ti.floor((positions[i].z + 1.0) * GRID_SIZE / 2)
    
    const hash = (cellX * 73856093 ^ cellY * 19349663 ^ cellZ * 83492791) % HASH_MOD
    
    cellIndices[i] = hash
  }
})

// 并行邻近粒子搜索
const findNeighbors = ti.kernel(() => {
  for (let i of ti.range(N)) {
    const pos = positions[i]
    
    let neighborCount = 0
    for (let j of ti.range(N)) {
      const dist = (positions[j] - pos).norm()
      if (dist < h && neighborCount < MAX_NEIGHBORS) {
        neighbors[i][neighborCount] = j
        neighborCount += 1
      }
    }
  }
})
```

---

#### L16: 刚体动力学与碰撞系统
**学习目标：**
- 实现刚体物理模拟
- 碰撞检测与响应
- 接触点求解
- 摩擦和反弹

**内容大纲：**
1. 刚体基础
   - 质心与惯性张量
   - 角速度与四元数
   - 力和力矩

2. 碰撞检测
   - SAT (分离轴定理)
   - GJK 算法
   - EPA 算法

3. 碰撞响应
   - 冲量计算
   - 速度更新
   - 摩擦模型

**代码示例：**
```typescript
// 刚体碰撞检测
const bodies = ti.Struct.field({
  position: ti.types.vector(3, ti.f32),
  rotation: ti.types.matrix(3, 3, ti.f32),
  velocity: ti.types.vector(3, ti.f32),
  angularVelocity: ti.types.vector(3, ti.f32),
  mass: ti.f32,
  inverseMass: ti.f32
}, [N_BODIES])

const detectCollision = ti.kernel(() => {
  for (let i of ti.range(N_BODIES)) {
    for (let j of ti.range(i + 1, N_BODIES)) {
      const body1 = bodies[i]
      const body2 = bodies[j]
      
      // 简单的球体碰撞
      const dist = (body1.position - body2.position).norm()
      const minDist = radii[i] + radii[j]
      
      if (dist < minDist) {
        const normal = (body2.position - body1.position) / dist
        const penetration = minDist - dist
        
        // 记录碰撞
        contacts[i] = normal
        penetrations[i] = penetration
      }
    }
  }
})
```

---

#### L17: GPU 加速的空间数据结构
**学习目标：**
- 掌握 GPU 上的空间分区算法
- 实现并行构建的加速结构
- 优化大规模场景查询

**内容大纲：**
1. GPU 空间分区
   - 统一网格 (Uniform Grid)
   - 空间哈希 (Spatial Hashing)
   - 层次包围盒 (BVH)

2. 并行算法
   - 并行扫描 (Scan)
   - 并行前缀和
   - 并行归约

3. 应用场景
   - 光线追踪加速
   - 碰撞检测优化
   - 粒子相互作用

**代码示例：**
```typescript
// BVH 构建算法
const buildBVH = ti.kernel(() => {
  // Morton Code 计算
  for (let i of ti.range(N)) {
    const center = (bounds[i].min + bounds[i].max) * 0.5
    mortonCodes[i] = encodeMorton(center.x, center.y, center.z)
  }
  
  // 排序（需要并行排序算法）
  // ...
  
  // 构建 BVH 树
  for (let i of ti.range(N - 1)) {
    const left = i
    const right = i + 1
    
    // 计算包围盒
    bvhNodes[i].min = ti.min(bounds[left].min, bounds[right].min)
    bvhNodes[i].max = ti.max(bounds[left].max, bounds[right].max)
  }
})

// 光线相交测试
const rayIntersectBVH = ti.kernel(() => {
  for (let rayIdx of ti.range(N_RAYS)) {
    const ray = rays[rayIdx]
    let closest = Infinity
    
    // 遍历 BVH
    for (let i of ti.range(N_NODES)) {
      if (!intersectAABB(ray, bvhNodes[i])) {
        continue
      }
      
      // 检查叶子节点
      if (isLeaf(i)) {
        const dist = intersectPrimitive(ray, leafPrimitives[i])
        closest = ti.min(closest, dist)
      }
    }
    
    results[rayIdx] = closest
  }
})
```

---

#### L18: 并行算法与数值计算
**学习目标：**
- 学习经典的并行算法
- 理解 GPU 并行模式
- 实现高效数值计算

**内容大纲：**
1. 并行算法基础
   - Map/Reduce 模式
   - Scan (前缀和)
   - 排序算法

2. 数值计算
   - 矩阵运算优化
   - 快速傅里叶变换 (FFT)
   - 蒙特卡洛模拟

3. 实战应用
   - 粒子排序（按深度）
   - 碰撞对查找
   - 统计分析

**代码示例：**
```typescript
// 并行归约求和
const parallelSum = ti.kernel(() => {
  for (let groupIdx of ti.range(N / GROUP_SIZE)) {
    let sum = 0.0
    for (let i of ti.range(GROUP_SIZE)) {
      const idx = groupIdx * GROUP_SIZE + i
      sum += data[idx]
    }
    partialSums[groupIdx] = sum
  }
})

// 并行前缀和 (Blelloch 算法)
const scan = ti.kernel(() => {
  // Up-sweep phase
  for (let d of ti.range(0, STEPS)) {
    const step = 1 << d
    for (let i of ti.range(0, N, step * 2)) {
      const a = data[i + step * 2 - 1]
      const b = data[i + step * 2 - 1 - step]
      data[i + step * 2 - 1] = a + b
    }
  }
  
  // Down-sweep phase
  data[N - 1] = 0
  for (let d of ti.range(STEPS - 1, -1)) {
    const step = 1 << d
    for (let i of ti.range(0, N, step * 2)) {
      const t = data[i + step * 2 - 1 - step]
      data[i + step * 2 - 1 - step] = data[i + step * 2 - 1]
      data[i + step * 2 - 1] = t + data[i + step * 2 - 1]
    }
  }
})
```

---

### 阶段六：高级渲染技术（L19-L24）

#### L19: 自定义 Shader 材质
**学习目标：**
- 深入理解 Three.js ShaderMaterial
- 编写 Vertex 和 Fragment Shader
- 实现 GPU 驱动的粒子动画
- 掌握 Uniform 和 Attribute 传递

**内容大纲：**
1. Shader 基础
   - GLSL 语法
   - 内置变量
   - Three.js Shader 接口

2. 高级效果
   - 体积云
   - 流体着色
   - 粒子轨迹

**代码示例：**
```typescript
// 自定义 Shader 材质
const customShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    positions: { value: null }, // 从 Taichi 传入
    colors: { value: null },
    size: { value: 5.0 }
  },
  
  vertexShader: `
    uniform float time;
    uniform sampler2D positions; // 纹理存储位置数据
    attribute float size;
    varying vec3 vColor;
    
    void main() {
      vec3 pos = texture2D(positions, uv).rgb;
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = size * (300.0 / -mvPosition.z);
    }
  `,
  
  fragmentShader: `
    varying vec3 vColor;
    
    void main() {
      // 圆形粒子
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;
      
      // 软边效果
      float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      gl_FragColor = vec4(vColor, alpha);
    }
  `
})
```

---

#### L20: GPU 实例化渲染
**学习目标：**
- 理解实例化渲染原理
- 使用 InstancedMesh
- 实现百万级物体渲染
- 学习 LOD (Level of Detail) 技术

**内容大纲：**
1. 实例化渲染基础
   - 什么是实例化
   - Three.js InstancedMesh API
   - 性能对比

2. 高级技巧
   - 动态更新实例
   - 视锥体剔除
   - 距离 LOD

**代码示例：**
```typescript
// GPU 实例化渲染
const N_INSTANCES = 1000000

const geometry = new THREE.SphereGeometry(0.1, 16, 16)
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff88,
  roughness: 0.3,
  metalness: 0.7
})

const instancedMesh = new THREE.InstancedMesh(
  geometry,
  material,
  N_INSTANCES
)

const dummy = new THREE.Object3D()
const colors = new Float32Array(N_INSTANCES * 3)

// 从 Taichi 获取位置数据
const positions = await tiPositions.toArray()

for (let i = 0; i < N_INSTANCES; i++) {
  const x = positions[i * 3]
  const y = positions[i * 3 + 1]
  const z = positions[i * 3 + 2]
  
  dummy.position.set(x, y, z)
  dummy.updateMatrix()
  instancedMesh.setMatrixAt(i, dummy.matrix)
  
  // 设置颜色
  colors[i * 3] = Math.random()
  colors[i * 3 + 1] = Math.random()
  colors[i * 3 + 2] = Math.random()
}

instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3)
scene.add(instancedMesh)

// 动态更新
async function updateInstances() {
  await tiUpdate()
  const positions = await tiPositions.toArray()
  
  for (let i = 0; i < N_INSTANCES; i++) {
    dummy.position.set(
      positions[i * 3],
      positions[i * 3 + 1],
      positions[i * 3 + 2]
    )
    dummy.updateMatrix()
    instancedMesh.setMatrixAt(i, dummy.matrix)
  }
  
  instancedMesh.instanceMatrix.needsUpdate = true
}
```

---

#### L21: 后处理特效与合成
**学习目标：**
- 学习 Three.js 后处理管线
- 实现各种视觉特效
- 掌握多通道渲染

**内容大纲：**
1. 后处理基础
   - EffectComposer
   - RenderPass
   - ShaderPass

2. 常用特效
   - Bloom (辉光)
   - Depth of Field (景深)
   - Motion Blur (运动模糊)
   - SSAO (环境光遮蔽)

3. 自定义后处理
   - 编写自定义 Shader
   - 多通道合成

**代码示例：**
```typescript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

// 创建后处理管线
const composer = new EffectComposer(renderer)

// 基础渲染通道
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

// Bloom 辉光效果
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // strength
  0.4,  // radius
  0.85  // threshold
)
composer.addPass(bloomPass)

// 自定义 Shader 通道
const customPass = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    varying vec2 vUv;
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // 色差效果
      float offset = 0.002 * sin(time);
      float r = texture2D(tDiffuse, vUv + vec2(offset, 0.0)).r;
      float b = texture2D(tDiffuse, vUv - vec2(offset, 0.0)).b;
      color.r = r;
      color.b = b;
      
      gl_FragColor = color;
    }
  `
})
composer.addPass(customPass)

// 渲染循环
function animate(time) {
  requestAnimationFrame(animate)
  
  customPass.uniforms.time.value = time * 0.001
  composer.render()
}
```

---

#### L22: 体积渲染与光线行进
**学习目标：**
- 理解体积渲染原理
- 实现 Ray Marching 算法
- 创建 3D 云、烟雾效果

**内容大纲：**
1. 体积渲染基础
   - Ray Marching 原理
   - 体积密度场
   - 光散射

2. 实现效果
   - 程序化云
   - 烟雾模拟
   - 火焰效果

**代码示例：**
```typescript
// 体积渲染 Shader
const volumeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    densityTexture: { value: null } // Taichi 生成的密度场
  },
  
  vertexShader: `
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    
    void main() {
      vPosition = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  
  fragmentShader: `
    uniform float time;
    uniform sampler3D densityTexture;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    
    #define MAX_STEPS 100
    #define STEP_SIZE 0.02
    
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    
    float noise(vec3 x) {
      vec3 p = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      
      return mix(
        mix(mix(hash(p + vec3(0, 0, 0)), hash(p + vec3(1, 0, 0)), f.x),
            mix(hash(p + vec3(0, 1, 0)), hash(p + vec3(1, 1, 0)), f.x), f.y),
        mix(mix(hash(p + vec3(0, 0, 1)), hash(p + vec3(1, 0, 1)), f.x),
            mix(hash(p + vec3(0, 1, 1)), hash(p + vec3(1, 1, 1)), f.x), f.y), f.z);
    }
    
    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
    
    void main() {
      vec3 rayOrigin = cameraPosition;
      vec3 rayDirection = normalize(vWorldPosition - cameraPosition);
      
      vec4 color = vec4(0.0);
      float transmittance = 1.0;
      
      for (int i = 0; i < MAX_STEPS; i++) {
        vec3 pos = rayOrigin + rayDirection * float(i) * STEP_SIZE;
        
        // 计算密度
        float density = fbm(pos * 0.5 + time * 0.1);
        density = smoothstep(0.3, 0.7, density);
        
        if (density > 0.01) {
          float light = fbm(pos * 0.8 + time * 0.05);
          vec3 cloudColor = mix(vec3(0.5, 0.6, 0.7), vec3(1.0, 0.9, 0.8), light);
          
          float absorb = density * 0.1;
          transmittance *= (1.0 - absorb);
          color.rgb += cloudColor * density * transmittance;
          color.a += absorb * transmittance;
        }
        
        if (transmittance < 0.01) break;
      }
      
      gl_FragColor = color;
    }
  `
})
```

---

#### L23: 计算摄影与可视化
**学习目标：**
- 实现科学可视化
- 粒子轨迹可视化
- 流场可视化
- 向量场可视化

**内容大纲：**
1. 可视化技术
   - 粒子追踪
   - 流线生成
   - 等值面提取

2. 应用场景
   - 气象数据可视化
   - 流体力学可视化
   - 数据分析可视化

**代码示例：**
```typescript
// 流场可视化
const flowFieldMaterial = new THREE.ShaderMaterial({
  uniforms: {
    velocityField: { value: null },
    time: { value: 0 },
    particleCount: { value: 10000 }
  },
  
  vertexShader: `
    uniform sampler2D velocityField;
    uniform float time;
    
    attribute vec3 initialPosition;
    
    varying vec3 vPosition;
    
    void main() {
      vec3 pos = initialPosition;
      
      // 沿着流场移动粒子
      float dt = 0.01;
      for (int i = 0; i < 50; i++) {
        vec2 uv = pos.xy * 0.5 + 0.5;
        vec3 velocity = texture2D(velocityField, uv).rgb;
        pos += velocity * dt;
      }
      
      vPosition = pos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = 3.0;
    }
  `,
  
  fragmentShader: `
    varying vec3 vPosition;
    
    void main() {
      // 根据位置着色
      float speed = length(vPosition);
      vec3 color = mix(vec3(0.0, 0.5, 1.0), vec3(1.0, 0.0, 0.5), speed);
      
      // 圆形粒子
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;
      
      gl_FragColor = vec4(color, 0.8);
    }
  `
})
```

---

#### L24: WebGPU 渲染管线
**学习目标：**
- 理解 WebGPU 渲染管线
- 实现自定义渲染管线
- 优化渲染性能

**内容大纲：**
1. WebGPU 渲染管线
   - Render Pipeline 配置
   - Shader 模块
   - 资源绑定

2. 高级技术
   - Compute-driven rendering
   - 间接绘制
   - Multi-pass 渲染

**代码示例：**
```typescript
// WebGPU 渲染管线
class WebGPURenderer {
  private device: GPUDevice
  private pipeline: GPURenderPipeline
  private vertexBuffer: GPUBuffer
  
  async init() {
    const adapter = await navigator.gpu.requestAdapter()
    this.device = await adapter.requestDevice()
    
    // 创建渲染管线
    this.pipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: this.device.createShaderModule({
          code: `
            struct Uniforms {
              mvp: mat4x4<f32>,
            }
            @group(0) @binding(0) var<uniform> uniforms: Uniforms;
            
            struct VertexInput {
              @location(0) position: vec3<f32>,
            }
            
            struct VertexOutput {
              @builtin(position) position: vec4<f32>,
            }
            
            @vertex
            fn main(input: VertexInput) -> VertexOutput {
              var output: VertexOutput;
              output.position = uniforms.mvp * vec4<f32>(input.position, 1.0);
              return output;
            }
          `
        }),
        entryPoint: 'main'
      },
      fragment: {
        module: this.device.createShaderModule({
          code: `
            @fragment
            fn main() -> @location(0) vec4<f32> {
              return vec4<f32>(1.0, 0.5, 0.0, 1.0);
            }
          `
        }),
        entryPoint: 'main',
        targets: [{
          format: navigator.gpu.getPreferredCanvasFormat()
        }]
      },
      primitive: {
        topology: 'triangle-list',
        cullMode: 'back'
      }
    })
  }
  
  render() {
    const commandEncoder = this.device.createCommandEncoder()
    const textureView = context.getCurrentTexture().createView()
    
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: textureView,
        clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store'
      }]
    })
    
    renderPass.setPipeline(this.pipeline)
    renderPass.setVertexBuffer(0, this.vertexBuffer)
    renderPass.draw(36)
    renderPass.end()
    
    this.device.queue.submit([commandEncoder.finish()])
  }
}
```

---

### 阶段七：性能优化与工程实践（L25-L30）

#### L25: 高级性能分析
**学习目标：**
- 使用 Chrome DevTools 性能分析
- GPU 性能分析工具
- 识别性能瓶颈
- 优化策略

**内容大纲：**
1. 性能分析工具
   - Chrome DevTools
   - WebGL Inspector
   - WebGPU Inspector

2. 瓶颈识别
   - CPU vs GPU 瓶颈
   - 内存带宽限制
   - 计算密集型 vs 带宽密集型

3. 优化技术
   - 算法优化
   - 内存访问优化
   - 批处理优化

---

#### L26: 内存管理与优化
**学习目标：**
- 理解 GPU 内存模型
- 优化内存访问模式
- 减少内存碎片
- 缓存策略

**内容大纲：**
1. GPU 内存架构
   - 显存层次
   - 缓存机制
   - Coalesced Access

2. 内存优化
   - 紧凑数据结构
   - 对齐与填充
   - 内存池技术

**代码示例：**
```typescript
// 结构体数组 vs 数组结构体
// 差的方式：结构体数组（缓存不友好）
const badData = ti.Struct.field({
  position: ti.types.vector(3, ti.f32),
  velocity: ti.types.vector(3, ti.f32),
  force: ti.types.vector(3, ti.f32),
}, [N])

// 好的方式：数组结构体（缓存友好）
const goodData = {
  positions: ti.Vector.field(3, ti.f32, [N]),
  velocities: ti.Vector.field(3, ti.f32, [N]),
  forces: ti.Vector.field(3, ti.f32, [N])
}

// SoA 优化 - 连续内存访问
const updateForces = ti.kernel(() => {
  for (let i of ti.range(N)) {
    // 所有粒子依次访问位置，缓存友好
    goodData.forces[i] = goodData.positions[i] * 2.0
  }
})

// AoS 优化 - 单次读取所有数据
const updateParticle = ti.kernel(() => {
  for (let i of ti.range(N)) {
    // 单次读取整个粒子数据
    const pos = goodData.positions[i]
    const vel = goodData.velocities[i]
    const force = goodData.forces[i]
    
    // 计算...
    goodData.positions[i] = pos + vel * 0.01
  }
})
```

---

#### L27: 多线程与 Worker 优化
**学习目标：**
- 使用 Web Worker 进行计算
- OffscreenCanvas 渲染
- SharedArrayBuffer 共享内存
- Worker 池管理

**内容大纲：**
1. Web Worker 基础
   - Worker 创建与通信
   - Transferable 对象
   - SharedArrayBuffer

2. 高级应用
   - Worker 池
   - 任务调度
   - 负载均衡

**代码示例：**
```typescript
// Worker 池实现
class WorkerPool {
  private workers: Worker[] = []
  private taskQueue: Promise<any>[] = []
  private activeWorkers = 0
  private maxWorkers: number
  
  constructor(maxWorkers: number = navigator.hardwareConcurrency || 4) {
    this.maxWorkers = maxWorkers
  }
  
  async init(workerScript: string) {
    const blob = new Blob([workerScript], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(url)
      this.workers.push(worker)
    }
  }
  
  async execute(taskData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = this.workers.find(w => !this.active) || this.workers[this.taskQueue.length % this.maxWorkers]
      
      worker.onmessage = (e) => {
        this.activeWorkers--
        resolve(e.data)
      }
      
      worker.onerror = reject
      
      worker.postMessage(taskData)
      this.activeWorkers++
    })
  }
  
  dispose() {
    this.workers.forEach(w => w.terminate())
  }
}

// 使用 Worker 池进行并行计算
const workerPool = new WorkerPool()
await workerPool.init(`
  self.onmessage = function(e) {
    const { data, start, end } = e.data
    const result = data.slice(start, end).map(x => x * x)
    self.postMessage({ result, start, end })
  }
`)

// 分配任务给多个 Worker
const data = new Float32Array(1000000)
const chunkSize = Math.ceil(data.length / workerPool.maxWorkers)

const promises = []
for (let i = 0; i < workerPool.maxWorkers; i++) {
  const start = i * chunkSize
  const end = Math.min((i + 1) * chunkSize, data.length)
  
  promises.push(workerPool.execute({
    data: Array.from(data),
    start,
    end
  }))
}

const results = await Promise.all(promises)
```

---

#### L28: WebGL/WebGPU 兼容性处理
**学习目标：**
- 实现降级策略
- 功能检测与兼容
- Polyfill 与 Fallback

**内容大纲：**
1. 兼容性检测
   - WebGPU 检测
   - WebGL 版本检测
   - 功能扩展检测

2. 降级策略
   - 自动降级
   - 用户选择
   - 渐进式增强

**代码示例：**
```typescript
// 兼容性检测与降级
class RendererDetector {
  static detectCapabilities() {
    const capabilities = {
      webgpu: !!navigator.gpu,
      webgl2: !!document.createElement('canvas').getContext('webgl2'),
      webgl: !!document.createElement('canvas').getContext('webgl'),
      features: {}
    }
    
    if (capabilities.webgpu) {
      capabilities.features.webgpuSharedTexture = true
      capabilities.features.computeShader = true
    }
    
    if (capabilities.webgl2) {
      capabilities.features.transformFeedback = true
      capabilities.features.vertexArrayObject = true
    }
    
    return capabilities
  }
  
  static selectMode(capabilities: any, preferredMode: string) {
    const modeOrder = [
      'webgpu-shared-texture',
      'transferable-imagebitmap',
      'webgl2-pbo',
      'offscreen-imagebitmap',
      'canvas-texture',
      'pixel-buffer'
    ]
    
    // 尝试使用首选模式
    if (this.isModeSupported(preferredMode, capabilities)) {
      return preferredMode
    }
    
    // 降级到支持的第一个模式
    for (const mode of modeOrder) {
      if (this.isModeSupported(mode, capabilities)) {
        return mode
      }
    }
    
    return 'canvas-texture' // 最终降级
  }
  
  static isModeSupported(mode: string, capabilities: any): boolean {
    switch (mode) {
      case 'webgpu-shared-texture':
        return capabilities.webgpu
      case 'transferable-imagebitmap':
        return typeof ImageBitmap !== 'undefined'
      case 'webgl2-pbo':
        return capabilities.webgl2
      case 'offscreen-imagebitmap':
        return typeof OffscreenCanvas !== 'undefined'
      case 'canvas-texture':
      case 'pixel-buffer':
        return true
      default:
        return false
    }
  }
}
```

---

#### L29: 实时协作与交互
**学习目标：**
- 实现实时交互
- 事件处理优化
- 物理交互反馈
- 用户界面集成

**内容大纲：**
1. 交互技术
   - 射线检测
   - 拖拽与旋转
   - 物理交互

2. 性能优化
   - 事件节流
   - 批量更新
   - 预测插值

**代码示例：**
```typescript
// 高性能射线检测
class RaycastManager {
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private hoveredObjects: Set<THREE.Object3D>
  private lastUpdate = 0
  
  constructor() {
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.hoveredObjects = new Set()
  }
  
  update(event: MouseEvent, camera: THREE.Camera, scene: THREE.Scene) {
    // 节流更新（最多每帧一次）
    const now = performance.now()
    if (now - this.lastUpdate < 16) return
    this.lastUpdate = now
    
    // 更新鼠标位置
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    // 射线检测
    this.raycaster.setFromCamera(this.mouse, camera)
    const intersects = this.raycaster.intersectObjects(scene.children, true)
    
    // 处理 hover 事件
    const currentHover = new Set<THREE.Object3D>()
    intersects.forEach(intersect => {
      currentHover.add(intersect.object)
      
      // 进入事件
      if (!this.hoveredObjects.has(intersect.object)) {
        intersect.object.dispatchEvent({ type: 'mouseenter' })
      }
    })
    
    // 离开事件
    this.hoveredObjects.forEach(obj => {
      if (!currentHover.has(obj)) {
        obj.dispatchEvent({ type: 'mouseleave' })
      }
    })
    
    this.hoveredObjects = currentHover
    
    return intersects[0]
  }
  
  // 物理交互 - 添加外力
  applyForceAtPoint(point: THREE.Vector3, force: THREE.Vector3) {
    const particles = this.getNearbyParticles(point, 0.5)
    
    particles.forEach(particle => {
      const distance = particle.position.distanceTo(point)
      const falloff = Math.exp(-distance * 2)
      particle.velocity.add(force.clone().multiplyScalar(falloff))
    })
  }
}
```

---

#### L30: 综合项目 - 高级物理引擎
**学习目标：**
- 整合所有高级技术
- 构建完整的物理引擎
- 实现多物理系统模拟
- 性能优化与调试

**内容大纲：**
1. 项目架构
   - 物理系统分层
   - 渲染系统集成
   - 交互系统设计

2. 核心功能
   - 刚体、柔体、流体统一框架
   - 碰撞检测与响应
   - 约束求解

3. 高级特性
   - 并行计算优化
   - 多线程渲染
   - 可视化调试

**代码架构：**
```typescript
// 高级物理引擎架构
class AdvancedPhysicsEngine {
  private systems: Map<string, PhysicsSystem>
  private solver: ConstraintSolver
  private broadPhase: BroadPhaseDetection
  private narrowPhase: NarrowPhaseDetection
  private collisionResolver: CollisionResolver
  
  constructor() {
    this.systems = new Map()
    this.solver = new PBDConstraintSolver()
    this.broadPhase = new SpatialHashBroadPhase()
    this.narrowPhase = new GJKNarrowPhase()
    this.collisionResolver = new ImpulseResolver()
  }
  
  addSystem(name: string, system: PhysicsSystem) {
    this.systems.set(name, system)
  }
  
  async step(dt: number) {
    // 1. 更新所有物理系统
    for (const system of this.systems.values()) {
      await system.integrate(dt)
    }
    
    // 2. 广相碰撞检测
    const pairs = await this.broadPhase.detect(this.getAllBodies())
    
    // 3. 窄相碰撞检测
    const contacts = await this.narrowPhase.detect(pairs)
    
    // 4. 碰撞响应
    await this.collisionResolver.resolve(contacts)
    
    // 5. 约束求解
    await this.solver.solve(this.getAllConstraints())
  }
  
  async render() {
    // 渲染所有物理对象
    for (const system of this.systems.values()) {
      await system.render()
    }
  }
}

// 物理系统基类
abstract class PhysicsSystem {
  abstract integrate(dt: number): Promise<void>
  abstract render(): Promise<void>
  abstract getBodies(): PhysicsBody[]
  abstract getConstraints(): Constraint[]
}

// 实现示例：流体系统
class FluidSystem extends PhysicsSystem {
  private particles: FluidParticle[]
  private solver: SPHSolver
  
  async integrate(dt: number) {
    // SPH 求解
    await this.solver.solve(this.particles, dt)
  }
  
  async render() {
    // 使用实例化渲染或粒子着色器
    const positions = this.particles.map(p => p.position)
    await this.updateGeometry(positions)
  }
  
  getBodies() {
    return this.particles
  }
  
  getConstraints() {
    return []
  }
}
```

---

## 📚 课程特色

### 实战导向
- 每课都包含完整可运行的示例
- 从简单到复杂的渐进式学习
- 真实项目案例

### 性能优先
- 重点关注性能优化
- 多种优化策略对比
- 实际性能数据

### 深度技术
- WebGPU 深入解析
- GPU 并行计算
- 高级渲染技术

### 工程实践
- 代码架构设计
- 模块化开发
- 可维护性考虑

---

## 🎯 学习建议

### 前置知识
1. 熟练掌握 JavaScript/TypeScript
2. 了解 Three.js 基础
3. 理解线性代数和物理基础
4. 具备一定的图形学知识

### 学习路径
1. **初学者**: L13-L18 → L19-L22 → L25-L27
2. **进阶开发者**: L13-L24 → L25-L30
3. **专家**: L13-L30 全部课程

### 实践项目建议
- L13-L18 后: 实现一个简单的物理引擎
- L19-L24 后: 创建一个高质量的渲染系统
- L25-L30 后: 构建完整的模拟应用

---

## 📖 推荐资源

### 图形学
- *Real-Time Rendering* (实时渲染)
- *Physically Based Rendering* (基于物理的渲染)
- *GPU Gems* 系列

### 物理模拟
- *Game Physics Engine Development*
- *Fluid Simulation for Computer Graphics*
- *Position Based Dynamics*

### WebGPU
- [WebGPU Specification](https://www.w3.org/TR/webgpu/)
- [WebGPU Samples](https://github.com/webgpu/webgpu-samples)
- [Learn WebGPU](https://webgpu.github.io/webgpu-samples/)

---

## 🚀 完成后的能力

完成 L13-L30 课程后，您将能够：

1. **GPU 计算专家**
   - 熟练使用 WebGPU 进行高性能计算
   - 理解并优化 GPU 算法
   - 实现复杂的物理模拟

2. **高级渲染工程师**
   - 编写自定义 Shader
   - 实现各种渲染特效
   - 优化渲染管线

3. **全栈开发者**
   - 设计和实现大型项目
   - 进行性能分析和优化
   - 处理各种兼容性问题

4. **技术创新者**
   - 探索前沿技术
   - 开创新的应用场景
   - 贡献开源项目

---

**祝您学习愉快！** 🎉
