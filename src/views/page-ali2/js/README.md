# Taichi.js + Three.js 集成桥接器使用指南

## 1. 安装和导入

```typescript
// 安装依赖
import { 
  TaichiThreeBridge, 
  createBridge, 
  createPerformanceBridge, 
  createCompatibilityBridge, 
  createBalancedBridge,
  TransportMode,
  BridgeOptions
} from './path/to/taichi-three-bridge';
```


## 2. 基础使用方法

### 2.1 创建基础桥接器

```typescript
import * as THREE from 'three';

// 初始化 Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建桥接器
const bridge = createBridge(renderer, scene, camera, {
  width: 1024,
  height: 1024
});

// 初始化 Taichi 引擎并启动
await bridge.init(taichiEngine);
bridge.start();
```


### 2.2 使用预设配置

```typescript
// 高性能模式 (优先使用 WebGPU)
const performanceBridge = createPerformanceBridge(renderer, scene, camera);

// 兼容性模式 (优先使用 Canvas，适用于旧浏览器)
const compatibilityBridge = createCompatibilityBridge(renderer, scene, camera);

// 平衡模式 (在性能和兼容性之间平衡)
const balancedBridge = createBalancedBridge(renderer, scene, camera);
```


## 3. 配置选项

### 3.1 [BridgeOptions](file:///D:/work20240226/rcs-20250311/taichi-three/demo/src/views/ultimate-final/js/types.ts#L38-L77) 接口

```typescript
interface BridgeOptions {
  width?: number;                    // 渲染宽度，默认 512
  height?: number;                   // 渲染高度，默认 512
  maxResolution?: number;            // 最大分辨率限制
  minResolution?: number;            // 最小分辨率限制
  preferredMode?: TransportMode;     // 首选传输模式
  enableAdaptiveResolution?: boolean; // 是否启用自适应分辨率
  targetFps?: number;                // 目标 FPS
  renderer: THREE.WebGLRenderer;     // Three.js 渲染器
  scene: THREE.Scene;                // Three.js 场景
  camera: THREE.Camera;              // Three.js 相机
  planeSize?: { width: number; height: number }; // 平面尺寸
  textureLinear?: boolean;           // 纹理线性过滤
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void; // 性能更新回调
  onError?: (error: Error, context?: string) => void; // 错误回调
}
```


### 3.2 传输模式

```typescript
enum TransportMode {
  WebGPU = 'webgpu',        // WebGPU 共享纹理 (最高性能)
  Transferable = 'transferable', // Transferable Objects (高性能)
  WebGL2PBO = 'webgl2pbo',  // WebGL2 PBO (中等性能)
  Canvas = 'canvas'         // Canvas (兼容性最好)
}
```


## 4. 完整使用示例

```typescript
import * as THREE from 'three';
import { createBridge, TransportMode } from './taichi-three-bridge';

async function setupTaichiThreeIntegration() {
  // 1. 初始化 Three.js
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 2. 创建桥接器
  const bridge = createBridge(renderer, scene, camera, {
    width: 1024,
    height: 1024,
    preferredMode: TransportMode.Transferable, // 优先使用高性能传输模式
    enableAdaptiveResolution: true,           // 启用自适应分辨率
    targetFps: 60,                          // 目标 60 FPS
    onPerformanceUpdate: (metrics) => {
      console.log(`Current FPS: ${metrics.fps.toFixed(1)}, Mode: ${metrics.mode}`);
    },
    onError: (error, context) => {
      console.error(`Bridge error in ${context}:`, error);
    }
  });

  // 3. 初始化 Taichi 引擎
  await bridge.init(taichiEngine);

  // 4. 启动渲染循环
  bridge.start();

  // 5. 动画循环
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  return bridge;
}
```


## 5. 高级功能

### 5.1 动态切换传输模式

```typescript
// 检查当前模式
console.log('Current mode:', bridge.getCurrentMode());

// 切换到特定模式
const success = await bridge.switchMode(TransportMode.WebGPU);
if (!success) {
  console.log('WebGPU not supported, using fallback mode');
}
```


### 5.2 动态调整分辨率

```typescript
// 调整渲染分辨率
await bridge.setSize(2048, 2048); // 高分辨率
await bridge.setSize(512, 512);   // 低分辨率以提高性能
```


### 5.3 性能监控

```typescript
// 获取性能指标
const metrics = bridge.getMetrics();
console.log(`
  FPS: ${metrics.fps.toFixed(1)}
  Average FPS: ${metrics.avgFps.toFixed(1)}
  Frame Time: ${metrics.avgFrameTime.toFixed(2)}ms
  Stability: ${(metrics.stabilityScore * 100).toFixed(1)}%
  Current Mode: ${metrics.mode}
`);
```


### 5.4 自定义材质应用

```typescript
// 将纹理应用到自定义材质
const customMaterial = new THREE.MeshBasicMaterial();
bridge.applyToMaterial(customMaterial);

// 设置自定义网格
const customGeometry = new THREE.SphereGeometry(1, 32, 32);
const customMesh = new THREE.Mesh(customGeometry, customMaterial);
bridge.setMesh(customMesh);
```


## 6. 生命周期管理

```typescript
// 完整的使用周期
const bridge = createBridge(renderer, scene, camera);

try {
  await bridge.init(taichiEngine);
  bridge.start();
  
  // 使用过程中...
  
} finally {
  // 清理资源
  bridge.dispose();
}
```


## 7. 错误处理

```typescript
const bridge = createBridge(renderer, scene, camera, {
  onError: (error, context) => {
    console.error(`Bridge error in ${context}:`, error);
    
    // 根据错误类型采取相应措施
    if (error.message.includes('WebGPU')) {
      // WebGPU 不可用时降级
      bridge.switchMode(TransportMode.Transferable);
    }
  }
});
```


## 8. 性能优化建议

1. **选择合适的传输模式**：根据目标浏览器选择最优的 [TransportMode](file:///D:/work20240226/rcs-20250311/taichi-three/demo/src/views/ultimate-final/js/types.ts#L25-L32)
2. **启用自适应分辨率**：在性能不足时自动降低分辨率
3. **监控性能指标**：定期检查 [PerformanceMetrics](file:///D:/work20240226/rcs-20250311/taichi-three/demo/src/views/ultimate-final/js/types.ts#L11-L24)
4. **合理设置渲染尺寸**：在质量和性能间找到平衡点

这个桥接器设计简洁易用，同时提供了丰富的配置选项和高级功能，满足不同场景的需求。
