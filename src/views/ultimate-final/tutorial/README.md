# Taichi.js + Three.js 集成桥接器 - 完整教程

## 目录

本教程系列从基础到高级,全面讲解如何使用 Taichi.js + Three.js 集成桥接器。

### 教程列表

1. **[01-基础用法](./01-基础用法.md)**
   - 最简单的集成方式
   - 创建第一个应用
   - 理解基本工作流程

2. **[02-传输模式选择](./02-传输模式选择.md)**
   - 7种传输模式详解
   - 性能对比分析
   - 自动模式检测

3. **[03-自适应分辨率](./03-自适应分辨率.md)**
   - 动态性能优化
   - 分辨率调整策略
   - 性能预测与预调整

4. **[04-自定义Mesh和材质](./04-自定义Mesh和材质.md)**
   - 替换默认几何体
   - 使用 Shader 材质
   - 多纹理效果

5. **[05-性能监控与优化](./05-性能监控与优化.md)**
   - 性能指标详解
   - 可视化监控面板
   - 自动优化策略

6. **[06-高级应用场景](./06-高级应用场景.md)**
   - 实时流体模拟
   - 地形生成
   - 粒子系统
   - 热力图
   - 多层渲染

## 快速开始

### 环境要求

- Node.js 18+
- Three.js 0.160+
- 现代浏览器 (Chrome 90+, Firefox 88+, Safari 15+)

### 安装

```bash
npm install three stats.js
```

### 基础示例

```typescript
import * as THREE from 'three'
import { UltimateTaichiThreeBridge } from './js/UltimateTaichiThreeBridge'

// 创建 Three.js 场景
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// 创建 Taichi 引擎
const taichiEngine = {
  async getPixelData() {
    const width = 512
    const height = 512
    const data = new Uint8Array(width * height * 4)

    // 生成像素数据
    for (let i = 0; i < width * height; i++) {
      const i4 = i * 4
      data[i4] = Math.floor(Math.random() * 255)
      data[i4 + 1] = Math.floor(Math.random() * 255)
      data[i4 + 2] = Math.floor(Math.random() * 255)
      data[i4 + 3] = 255
    }

    return data.buffer
  }
}

// 创建桥接器
const bridge = new UltimateTaichiThreeBridge({
  renderer,
  scene,
  camera,
  width: 512,
  height: 512,
  mode: 'canvas-texture'
})

await bridge.init(taichiEngine)

// 渲染循环
function animate(time: number) {
  requestAnimationFrame(animate)
  bridge.step(time)
  renderer.render(scene, camera)
}

animate(0)
```

## 核心概念

### 桥接器 (Bridge)

桥接器是 Taichi.js 和 Three.js 之间的中间层,负责:

1. **数据传输**: 将 Taichi 计算的像素数据传输到 Three.js 纹理
2. **性能优化**: 自动选择最优传输模式
3. **自适应调整**: 根据性能动态调整参数
4. **监控分析**: 实时监控性能指标

### 传输模式

| 模式 | 性能 | 兼容性 | 说明 |
|------|------|--------|------|
| `webgpu-shared-texture` | ⭐⭐⭐⭐⭐ | ⭐ | WebGPU 零拷贝 |
| `transferable-imagebitmap` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 零拷贝线程传输 |
| `offscreen-worker` | ⭐⭐⭐⭐ | ⭐⭐⭐ | 后台渲染 |
| `webgl2-pbo` | ⭐⭐⭐ | ⭐⭐⭐⭐ | 异步上传 |
| `offscreen-imagebitmap` | ⭐⭐⭐ | ⭐⭐⭐⭐ | 标准传输 |
| `canvas-texture` | ⭐⭐ | ⭐⭐⭐⭐⭐ | 最兼容 |
| `pixel-buffer` | ⭐ | ⭐⭐⭐⭐⭐ | 精确控制 |

### 性能指标

- **FPS**: 帧率
- **avgFrameTime**: 平均帧时间
- **avgTransferTime**: 平均传输时间
- **stabilityScore**: 稳定性评分 (0-1)
- **dataThroughput**: 数据吞吐量
- **predictedFps**: 预测帧率
- **predictedTrend**: 性能趋势

## 学习路径建议

### 初学者

1. 教程1: 基础用法
2. 教程2: 传输模式选择 (前半部分)
3. 教程4: 自定义 Mesh 和材质 (基础部分)

### 进阶用户

1. 教程2: 传输模式选择 (完整)
2. 教程3: 自适应分辨率
3. 教程5: 性能监控与优化

### 高级用户

1. 教程5: 性能监控与优化 (完整)
2. 教程6: 高级应用场景
3. 源码分析: UltimateTaichiThreeBridge.ts

## 常见问题

### Q: 如何选择传输模式?

A:
- **最佳性能**: `transferable-imagebitmap` (现代浏览器)
- **最佳兼容**: `canvas-texture`
- **自动选择**: 设置 `autoDetectMode: true`

### Q: 性能不够怎么办?

A:
1. 降低分辨率
2. 切换到更快的传输模式
3. 启用自适应分辨率
4. 减少 Taichi 计算复杂度

### Q: 如何调试性能问题?

A:
1. 启用性能监控
2. 查看传输时间
3. 检查稳定性评分
4. 使用性能基准测试

### Q: 支持哪些浏览器?

A:
- Chrome 90+ (完整功能)
- Firefox 88+ (大部分功能)
- Safari 15+ (基础功能)
- Edge 90+ (完整功能)

### Q: 如何提高稳定性?

A:
1. 启用自适应分辨率
2. 降低目标 FPS
3. 使用更稳定的传输模式
4. 增加分辨率调整幅度

## API 参考

### UltimateTaichiThreeBridge

#### 构造函数

```typescript
new UltimateTaichiThreeBridge(options: UltimateBridgeOptions)
```

#### 主要方法

- `init(taichiEngine: TaichiEngine)`: 初始化桥接器
- `step(time?: number)`: 执行单帧更新
- `start()`: 启动循环
- `stop()`: 停止循环
- `dispose()`: 销毁桥接器
- `switchMode(mode: UltimateTransferMode)`: 切换传输模式
- `setSize(width: number, height: number)`: 设置分辨率
- `setMesh(mesh: THREE.Mesh)`: 设置自定义 Mesh
- `getMetrics()`: 获取性能指标
- `predictPerformance()`: 预测性能

#### 配置选项

```typescript
interface UltimateBridgeOptions {
  // 基础设置
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.Camera
  width: number
  height: number

  // 传输模式
  mode?: UltimateTransferMode
  autoDetectMode?: boolean

  // 自适应
  enableAdaptiveResolution?: boolean
  targetFps?: number
  maxResolution?: number
  minResolution?: number

  // 性能监控
  performance?: {
    enabled?: boolean
    updateInterval?: number
    enablePrediction?: boolean
  }

  // 回调
  onPerformanceUpdate?: (metrics: UltimatePerformanceMetrics) => void
  onModeChange?: (from: UltimateTransferMode, to: UltimateTransferMode) => void
  onResolutionChange?: (from, to) => void
}
```

## 性能优化技巧

### 1. 传输模式选择

```typescript
// 自动选择最优模式
const bridge = new UltimateTaichiThreeBridge({
  autoDetectMode: true
})
```

### 2. 自适应分辨率

```typescript
const bridge = new UltimateTaichiThreeBridge({
  enableAdaptiveResolution: true,
  targetFps: 60,
  maxResolution: 2048,
  minResolution: 256
})
```

### 3. 纹理优化

```typescript
const bridge = new UltimateTaichiThreeBridge({
  textureLinear: false,        // 临近采样
  generateMipmaps: false        // 禁用 Mipmap
})
```

### 4. 渲染器优化

```typescript
const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: 'high-performance'
})
```

## 示例项目

### 实时流体模拟

```typescript
// 见教程6: 场景1
```

### 地形生成

```typescript
// 见教程6: 场景2
```

### 粒子系统

```typescript
// 见教程6: 场景3
```

## 贡献

欢迎提交 Issue 和 Pull Request!

## 许可证

MIT License

## 相关资源

- [Three.js 官方文档](https://threejs.org/docs/)
- [WebGPU 规范](https://www.w3.org/TR/webgpu/)
- [OffscreenCanvas MDN](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)

---

**祝学习愉快! 🚀**

如有问题,请查看具体教程章节或提出 Issue。
