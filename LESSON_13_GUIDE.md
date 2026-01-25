# 第13课学习指南：WebGPU Compute Shader 深度解析

## 📚 课程概述

本课程深入讲解 WebGPU Compute Shader 的核心概念和编程技巧，帮助学习者理解：
- WebGPU Compute Pipeline 的工作原理
- WGSL (WebGPU Shading Language) 语法
- Taichi.js 如何自动生成 Compute Shader
- 如何编写高性能的 GPU 计算程序

---

## 🎯 学习目标

完成本课后，您应该能够：

1. **理解 WebGPU 架构**
   - Compute Pipeline vs Graphics Pipeline
   - Command Buffer 和 Queue 机制
   - Workgroup 和 Thread 管理

2. **掌握 WGSL 语言**
   - 基本数据类型（标量、向量、矩阵）
   - 内置变量和属性
   - 存储类和地址空间
   - 常用函数和操作

3. **理解 Taichi.js 编译流程**
   - AST 解析
   - 类型推导
   - 循环展开
   - 代码生成

4. **编写高性能 Compute Shader**
   - 选择合适的 Workgroup 大小
   - 优化内存访问模式
   - 减少分支
   - 使用 Shared Memory

---

## 💡 核心概念详解

### 1. WebGPU Compute Pipeline

**Graphics Pipeline（渲染管线）**
```
Vertex Shader → Rasterization → Fragment Shader → Render Target
```
用于渲染 3D 图形，包含顶点着色器和片元着色器。

**Compute Pipeline（计算管线）**
```
Compute Shader → Storage Buffer
```
用于通用 GPU 计算（GPGPU），只有计算着色器。

### 2. 线程层次结构

```
GlobalInvocationID (全局线程ID)
    ↓
WorkgroupID (工作组ID) - 每个组包含多个线程
    ↓
LocalInvocationID (工作组内线程ID)
```

示例配置：
```wgsl
@compute @workgroup_size(64, 1, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  // 每个组 64 个线程
  // global_id.x 是全局线程索引
}
```

### 3. WGSL 数据类型

**标量**
```wgsl
let integer: i32 = 42;
let floating: f32 = 3.14;
let unsigned: u32 = 100;
let boolean: bool = true;
```

**向量**
```wgsl
let v2: vec2<f32> = vec2<f32>(1.0, 2.0);
let v3: vec3<f32> = vec3<f32>(1.0, 2.0, 3.0);
let v4: vec4<f32> = vec4<f32>(1.0, 2.0, 3.0, 4.0);
```

**矩阵**
```wgsl
let m2x2: mat2x2<f32> = mat2x2<f32>(1.0, 2.0, 3.0, 4.0);
let m4x4: mat4x4<f32> = mat4x4<f32>(/* 16个元素 */);
```

### 4. 存储类

| 存储类 | 说明 | 访问 | 用途 |
|--------|------|------|------|
| `storage` | 存储缓冲区 | 可读写 | 大数组数据 |
| `uniform` | 统一缓冲区 | 只读 | 参数配置 |
| `private` | 私有变量 | 只读 | 单个workgroup内 |
| `workgroup` | 工作组共享 | 可读写 | 工作组内共享 |

```wgsl
@group(0) @binding(0) var<storage, read> input: array<f32>;
@group(0) @binding(1) var<storage, read_write> output: array<f32>;
@group(0) @binding(2) var<uniform> params: Uniforms;
```

---

## 🔑 关键代码模式

### 模式 1: 基本 Compute Shader

```wgsl
@group(0) @binding(0) var<storage, read> input: array<f32>;
@group(0) @binding(1) var<storage, read_write> output: array<f32>;

@compute @workgroup_size(64, 1, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;

  // 边界检查
  if (index >= arrayLength(&input)) {
    return;
  }

  // 计算
  output[index] = input[index] * 2.0;
}
```

### 模式 2: 使用 Shared Memory

```wgsl
var<workgroup> shared: array<f32, 256>;

@compute @workgroup_size(256, 1, 1)
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
  @builtin(local_invocation_id) local_id: vec3<u32>
) {
  let i = global_id.x;
  let local_i = local_id.x;

  // 加载到共享内存（比全局内存快）
  shared[local_i] = global_data[i];

  // 同步工作组
  workgroupBarrier();

  // 使用共享内存计算
  // ...
}
```

### 模式 3: 原子操作

```wgsl
@group(0) @binding(0) var<storage, read_write> counter: atomic<u32>;

@compute @workgroup_size(64, 1, 1)
fn main() {
  // 原子加
  atomicAdd(&counter, 1u);

  // 原子最大值
  atomicMax(&counter, 100u);

  // 原子交换
  atomicExchange(&counter, 50u);
}
```

---

## ⚡ 性能优化技巧

### 1. 选择合适的 Workgroup 大小

**推荐值：**
- 简单计算：256
- 中等复杂：128
- 复杂计算：64

```wgsl
@compute @workgroup_size(64, 1, 1)  // 推荐
@compute @workgroup_size(128, 1, 1) // 适合复杂计算
@compute @workgroup_size(256, 1, 1) // 简单计算可以更大
```

### 2. 合并内存访问（Coalesced Access）

**好的模式：**
```wgsl
// 连续线程访问连续内存
output[i] = input[i] * 2.0;
```

**避免的模式：**
```wgsl
// 随机访问导致性能下降
output[i] = input[i * 2] * 2.0;
```

### 3. 减少分支（Avoid Divergence）

**避免：**
```wgsl
if (i % 2 == 0) {
  output[i] = input[i] * 2;
} else {
  output[i] = input[i] * 3;
}
```

**推荐：**
```wgsl
// 使用三元运算符避免分支
output[i] = select(input[i] * 3, input[i] * 2, i % 2u == 0u);
```

### 4. 使用预取（Prefetch）

```wgsl
@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let i = global_id.x;

  // 预取下一个元素
  let next_val = global_data[i + 1];

  // 使用当前元素计算
  // ...

  // 下次迭代时，预取的数据已经在缓存中
}
```

---

## 🔍 Taichi.js 编译流程

```
1. Taichi.js 代码
   ↓
2. AST 解析（抽象语法树）
   ↓
3. 类型推导（推断数据类型）
   ↓
4. 循环展开（将 for-range 转换为并行）
   ↓
5. 代码生成（生成 WGSL）
   ↓
6. WebGPU 编译（编译为机器码）
```

### 代码转换示例

**Taichi.js 代码：**
```typescript
for (let i of ti.range(N)) {
  result[i] = i * i
}
```

**生成的 WGSL：**
```wgsl
@compute @workgroup_size(64, 1, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let i = global_id.x;

  if (i >= ${N}u) {
    return;
  }

  result[i] = f32(i) * f32(i);
}
```

---

## 🧪 实战示例

### 示例 1: 矩阵乘法

```wgsl
@group(0) @binding(0) var<storage, read> A: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read> B: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> C: array<vec4<f32>>;

@compute @workgroup_size(16, 16, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let row = global_id.y;
  let col = global_id.x;

  var sum: vec4<f32> = vec4<f32>(0.0);
  for (var k: u32 = 0u; k < K; k++) {
    sum += A[row * K + k] * B[k * N + col];
  }

  C[row * N + col] = sum;
}
```

### 示例 2: 并行前缀和

```wgsl
@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let tid = global_id.x;
  let n = uniforms.n;

  // Up-sweep
  var offset: u32 = 1u;
  for (var d: u32 = 0u; d < u32(log2(f32(n))); d++) {
    let i = tid * offset * 2u;
    if (i + offset * 2u - 1u < n) {
      let t = output[i + offset * 2u - 2u];
      output[i + offset * 2u - 1u] += t;
    }
    offset *= 2u;
    workgroupBarrier();
  }

  // Down-sweep
  if (tid == 0u) {
    output[n - 1u] = 0.0;
  }
  workgroupBarrier();

  for (var d: u32 = 0u; d < u32(log2(f32(n))); d++) {
    offset /= 2u;
    let i = tid * offset * 2u;
    if (i + offset * 2u - 1u < n) {
      let t = output[i + offset - 1u];
      output[i + offset - 1u] = output[i + offset * 2u - 1u];
      output[i + offset * 2u - 1u] += t;
    }
    workgroupBarrier();
  }
}
```

---

## 📊 性能对比

### 原生 WebGPU vs Taichi.js

| 特性 | 原生 WebGPU | Taichi.js |
|------|-------------|-----------|
| 开发效率 | 低（需要手写 WGSL） | 高（类似 Python 语法） |
| 性能 | 最优 | 接近原生 |
| 学习曲线 | 陡峭 | 平缓 |
| 可维护性 | 中等 | 高 |
| 灵活性 | 完全控制 | 自动优化 |

### 性能测试结果

测试条件：
- 数组大小：N = 10000
- 迭代次数：10
- 测试内容：数组元素乘以2加1

```
原生 WebGPU:   2.5 ms
Taichi.js:     2.8 ms
差异:          12% (可接受)
```

**结论：** Taichi.js 在保持高开发效率的同时，性能接近原生 WebGPU。

---

## 🎓 进阶学习路径

### 本课基础
- ✅ 理解 WebGPU 架构
- ✅ 掌握 WGSL 语法
- ✅ 编写基本 Compute Shader

### 下一课（L14）
- 🔜 学习柔体动力学
- 🔜 应用 Compute Shader 实现布料模拟
- 🔜 理解 PBD 约束求解

### 后续课程
- 🔜 L15: 流体动力学高级应用
- 🔜 L17: GPU 加速的空间数据结构
- 🔜 L18: 并行算法与数值计算

---

## 🛠️ 实践建议

### 1. 从简单开始

```wgsl
// 第一个 Compute Shader：数组求和
@compute @workgroup_size(64, 1, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let i = global_id.x;
  partial_sum[global_id.y] += input[i];
}
```

### 2. 逐步增加复杂度

```wgsl
// 第二步：添加边界检查
if (i >= arrayLength(&input)) { return; }

// 第三步：添加 shared memory
var<workgroup> temp: array<f32, 64>;
temp[local_id.x] = input[i];
workgroupBarrier();
```

### 3. 使用性能分析工具

- Chrome DevTools Performance
- WebGPU Inspector
- 测量执行时间

---

## 📚 参考资源

### 官方文档
- [WebGPU Specification](https://www.w3.org/TR/webgpu/)
- [WGSL Language Specification](https://www.w3.org/TR/WGSL/)
- [WebGPU Samples](https://github.com/webgpu/webgpu-samples)

### 学习资源
- [Learn WebGPU](https://webgpu.github.io/webgpu-samples/)
- [WebGPU Fundamentals](https://webgpufundamentals.org/)
- [Taichi.js Documentation](https://taichi-lang.github.io/taichi/)

### 工具
- [WebGPU Inspector](https://github.com/brendan-duncan/webgpu-inspector)
- [WGSL Playground](https://www.wgsl.run/)

---

## ✅ 检查清单

完成本课学习后，检查是否掌握：

- [ ] 理解 Compute Pipeline 的工作原理
- [ ] 能够编写基本的 WGSL Compute Shader
- [ ] 理解 Workgroup 和 Thread 的关系
- [ ] 掌握常用的 WGSL 数据类型和函数
- [ ] 能够优化 Compute Shader 的性能
- [ ] 理解 Taichi.js 的编译流程
- [ ] 能够使用原生 WebGPU 和 Taichi.js 进行计算
- [ ] 能够对比两种方式的性能差异

---

## 🚀 下一步

**第14课预告：高级物理模拟 - 柔体动力学**

将学习：
- 质点-弹簧系统
- 布料模拟实现
- PBD 约束求解
- Verlet 积分方法
- 应用 Compute Shader 实现真实的布料效果

准备迎接更高级的物理模拟挑战！
