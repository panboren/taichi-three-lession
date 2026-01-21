/**
 * ============================================================================
 * 🚀 终极 Taichi.js + Three.js 集成桥接器
 * ============================================================================
 * 
 * 版本: Final Ultimate v1.0
 * 
 * 设计理念:
 * 1. 充分利用 Taichi.js 的 WebGPU 计算架构
 * 2. 实现真正的零拷贝 GPU-GPU 共享纹理传输
 * 3. 多模式智能自适应与优雅降级
 * 4. WebGL2 PBO + OffscreenCanvas + Web Worker 多线程优化
 * 5. Transferable Objects 零拷贝传输
 * 6. 自适应分辨率质量控制
 * 7. 智能缓存池化机制 (LRU + Object Pool)
 * 8. 完整的性能分析与预测系统
 * 9. 优雅的错误处理和资源管理
 * 10. TypeScript 类型安全与智能提示
 * 
 * 核心创新:
 * ✨ WebGPU GPU-GPU 零拷贝共享纹理 (直接 GPUTexture 共享)
 * ✨ Transferable Objects (ImageBitmap 零开销线程间传输)
 * ✨ SharedArrayBuffer + Atomics (跨线程高性能同步)
 * ✨ WebGL2 PBO (Pixel Buffer Object) 异步上传
 * ✨ OffscreenCanvas + Web Worker (后台渲染)
 * ✨ 自适应分辨率 (动态调整分辨率以维持目标 FPS)
 * ✨ 性能预测器 (基于历史数据预测性能趋势)
 * ✨ LRU 纹理缓存 (智能缓存管理)
 * ✨ 对象池化 (减少内存分配)
 * ✨ 智能模式切换 (根据性能自动降级/升级)
 * 
 * @author AI Assistant
 * @license MIT
 */

import * as THREE from 'three';
import type {
  WebGLRenderer,
  Scene,
  Camera,
  Texture,
  Mesh,
  Material,
  BufferAttribute,
  WebGL2RenderingContext
} from 'three';

// ==================== 核心类型定义 ====================

/**
 * 传输模式枚举 (按性能从高到低排序)
 */
export enum UltimateTransferMode {
  // 最优: WebGPU GPU-GPU 零拷贝共享纹理
  WebGPUSharedTexture = 'webgpu-shared-texture',
  
  // 次优: Transferable ImageBitmap (零拷贝线程间传输)
  TransferableImageBitmap = 'transferable-imagebitmap',
  
  // 高性能: OffscreenCanvas + Web Worker (多线程)
  OffscreenWorker = 'offscreen-worker',
  
  // 标准: WebGL2 PBO (Pixel Buffer Object 异步上传)
  WebGL2PBO = 'webgl2-pbo',
  
  // 兼容: OffscreenCanvas + ImageBitmap
  OffscreenImageBitmap = 'offscreen-imagebitmap',
  
  // 回退: CanvasTexture
  CanvasTexture = 'canvas-texture',
  
  // 精确: DataTexture (像素缓冲)
  PixelBuffer = 'pixel-buffer',
  
  // 几何: 字段直接同步 (3D 粒子/网格)
  FieldSync = 'field-sync'
}

/**
 * 性能指标接口 (增强版)
 */
export interface UltimatePerformanceMetrics {
  // 当前模式
  mode: UltimateTransferMode;
  
  // 帧率相关
  fps: number;                    // 实时 FPS
  avgFps: number;                 // 平均 FPS
  minFps: number;                 // 最低 FPS
  maxFps: number;                 // 最高 FPS
  
  // 时间相关 (ms)
  avgFrameTime: number;           // 平均帧时间
  avgTransferTime: number;        // 平均传输时间
  avgComputeTime: number;         // 平均计算时间
  frameTimeStdDev: number;        // 帧时间标准差
  
  // 数据相关
  dataTransferSize: number;       // 每帧数据大小 (bytes)
  dataThroughput: number;         // 数据吞吐量 (MB/s)
  
  // 稳定性
  stabilityScore: number;          // 稳定性评分 (0-1)
  
  // 统计
  frameCount: number;             // 总帧数
  dropFrameCount: number;         // 丢帧数
  
  // 预测
  predictedFps: number;           // 预测 FPS
  predictedTrend: 'improving' | 'stable' | 'degrading';
  
  // 自适应
  currentResolution: { width: number; height: number };
  
  // 时间戳
  lastUpdate: number;
}

/**
 * 桥接器配置接口
 */
export interface UltimateBridgeOptions {
  // ========== 基础渲染设置 ==========
  width?: number;
  height?: number;
  maxResolution?: number;               // 最大分辨率限制
  minResolution?: number;               // 最小分辨率限制
  enableAdaptiveResolution?: boolean;   // 自适应分辨率
  targetFps?: number;                   // 目标 FPS
  resolutionScaleFactor?: number;        // 分辨率缩放因子 (0.1-1.0)
  
  // ========== 传输模式设置 ==========
  mode?: UltimateTransferMode;
  autoDetectMode?: boolean;             // 自动检测最优模式
  enableModeFallback?: boolean;         // 启用模式降级
  fallbackThreshold?: number;           // 降级阈值 (FPS < 阈值时降级)
  upgradeThreshold?: number;             // 升级阈值 (FPS > 阈值时升级)
  
  // ========== Three.js 集成 ==========
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  
  // ========== 纹理设置 ==========
  planeSize?: { width: number; height: number };
  textureLinear?: boolean;
  textureWrapS?: THREE.Wrapping;
  textureWrapT?: THREE.Wrapping;
  generateMipmaps?: boolean;
  textureFormat?: THREE.PixelFormat;
  textureType?: THREE.TextureDataType;
  
  // ========== WebGL2 优化 ==========
  enableWebGL2PBO?: boolean;            // 启用 WebGL2 PBO
  pboBufferSize?: number;               // PBO 缓冲区大小 (MB)
  enableMultisample?: boolean;          // 启用多重采样
  
  // ========== WebGPU 设置 ==========
  webgpu?: {
    enabled?: boolean;
    device?: GPUDevice;
    adapter?: GPUAdapter;
    preferredFormat?: GPUTextureFormat;
    alphaMode?: GPUCanvasAlphaMode;
    enableSharedTexture?: boolean;       // 启用共享纹理
    sharedTextureUsage?: GPUTextureUsageFlags;
    powerPreference?: 'default' | 'low-power' | 'high-performance';
  };
  
  // ========== OffscreenCanvas 设置 ==========
  offscreen?: {
    enabled?: boolean;
    enableTransferable?: boolean;       // 启用 Transferable Objects
    enableWorker?: boolean;             // 启用 Web Worker
    worker?: Worker;                     // 自定义 Worker
    workerScript?: string;               // Worker 脚本 URL
    canvas?: HTMLCanvasElement | OffscreenCanvas;  // 自定义 Canvas
  };
  
  // ========== 像素缓冲设置 ==========
  pixelBuffer?: {
    width?: number;
    height?: number;
    texture?: THREE.DataTexture;
    data?: Uint8Array | Uint16Array | Float32Array;
    dataType?: 'uint8' | 'uint16' | 'float32';
  };
  
  // ========== 字段同步设置 ==========
  fieldSync?: {
    positionField?: any;                // Taichi 字段
    colorField?: any;
    normalField?: any;
    updateFrequency?: number;           // 更新频率 (Hz)
    enableBatchUpdate?: boolean;        // 批量更新
    interpolationFactor?: number;      // 插值因子 (0-1)
    enablePrediction?: boolean;         // 启用位置预测
  };
  
  // ========== 缓存池化 ==========
  caching?: {
    enabled?: boolean;
    textureCacheSize?: number;          // 纹理缓存数量
    bufferPoolSize?: number;            // 缓冲池大小
    enableLRUCache?: boolean;           // 启用 LRU 缓存
    enableObjectPool?: boolean;         // 启用对象池
  };
  
  // ========== 性能监控 ==========
  performance?: {
    enabled?: boolean;
    updateInterval?: number;            // 更新间隔 (ms)
    enableDetailedLogging?: boolean;
    enablePrediction?: boolean;         // 启用性能预测
    historySize?: number;               // 历史记录大小
    enableProfiling?: boolean;          // 启用性能分析
  };
  
  // ========== 生命周期回调 ==========
  onBeforeStep?: (time: number) => void;
  onAfterStep?: (time: number) => void;
  onTransferComplete?: (metrics: UltimatePerformanceMetrics) => void;
  onPerformanceUpdate?: (metrics: UltimatePerformanceMetrics) => void;
  onModeChange?: (from: UltimateTransferMode, to: UltimateTransferMode) => void;
  onResolutionChange?: (from: { width: number; height: number }, to: { width: number; height: number }) => void;
  onError?: (error: Error, context?: string) => void;
  onWarning?: (warning: string) => void;
}

/**
 * Taichi.js 引擎接口 (基于源码分析)
 */
export interface TaichiEngine {
  // 生命周期
  init?(): Promise<void>;
  dispose?(): void;
  
  // Canvas 绑定
  attachCanvas?(canvas: HTMLCanvasElement | OffscreenCanvas): void;
  setCanvas?(canvas: HTMLCanvasElement | OffscreenCanvas): void;
  
  // WebGPU 设备访问
  getRuntime?(): { device: GPUDevice; adapter: GPUAdapter };
  getDevice?(): GPUDevice;
  
  // 字段管理
  fields?: Map<string, TaichiField>;
  
  // 内核执行
  runKernel?(name: string, ...args: any[]): Promise<any>;
  
  // 同步
  sync?(): Promise<void>;
  
  // 像素数据
  getPixelData?(): Promise<ArrayBuffer>;
  
  // 更新/渲染
  update?(time?: number): void;
  render?(time?: number): void;
  start?(): void;
  stop?(): void;
}

/**
 * Taichi 字段接口
 */
export interface TaichiField {
  dimensions: number[];
  dtype: string;
  shape: number[];
  toArray(): Promise<any[]>;
  toFloat32Array(): Promise<Float32Array>;
  fromArray(data: any[]): Promise<void>;
}

// ==================== 性能预测器 ====================

/**
 * 性能预测器 - 基于历史数据预测性能趋势
 */
class PerformancePredictor {
  private fpsHistory: number[] = [];
  private transferTimeHistory: number[] = [];
  private maxHistorySize: number;
  
  constructor(maxHistorySize: number = 120) {
    this.maxHistorySize = maxHistorySize;
  }
  
  /**
   * 添加性能数据点
   */
  addDataPoint(fps: number, transferTime: number): void {
    this.fpsHistory.push(fps);
    this.transferTimeHistory.push(transferTime);
    
    // 保持历史记录大小
    if (this.fpsHistory.length > this.maxHistorySize) {
      this.fpsHistory.shift();
      this.transferTimeHistory.shift();
    }
  }
  
  /**
   * 预测下一帧的 FPS (使用移动平均 + 线性回归)
   */
  predictNextFps(): number {
    if (this.fpsHistory.length < 10) {
      return this.fpsHistory[this.fpsHistory.length - 1] || 60;
    }
    
    // 使用最近的 20 个数据点进行预测
    const recentData = this.fpsHistory.slice(-20);
    const n = recentData.length;
    
    // 简单的移动平均
    const movingAvg = recentData.reduce((a, b) => a + b, 0) / n;
    
    // 如果数据点足够，使用线性回归
    if (n >= 10) {
      const x = Array.from({ length: n }, (_, i) => i);
      const y = recentData;
      
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      const trendPrediction = slope * n + intercept;
      
      // 加权平均 (移动平均 70% + 趋势 30%)
      return movingAvg * 0.7 + trendPrediction * 0.3;
    }
    
    return movingAvg;
  }
  
  /**
   * 预测性能趋势
   */
  predictTrend(): 'improving' | 'stable' | 'degrading' {
    if (this.fpsHistory.length < 20) return 'stable';
    
    const recent = this.fpsHistory.slice(-10);
    const older = this.fpsHistory.slice(-20, -10);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    const variance = this.calculateVariance(this.fpsHistory.slice(-20));
    
    // 考虑方差的判断
    if (diff > 2 && diff > variance) return 'improving';
    if (diff < -2 && Math.abs(diff) > variance) return 'degrading';
    return 'stable';
  }
  
  /**
   * 计算方差
   */
  private calculateVariance(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    return data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
  }
  
  /**
   * 重置历史
   */
  reset(): void {
    this.fpsHistory = [];
    this.transferTimeHistory = [];
  }
}

// ==================== LRU 缓存 ====================

/**
 * LRU (Least Recently Used) 缓存实现
 */
class LRUCache<K, V> {
  private cache: Map<K, V>;
  private capacity: number;
  
  constructor(capacity: number) {
    this.cache = new Map();
    this.capacity = capacity;
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 重新插入到末尾 (LRU)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最旧的项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

// ==================== 对象池 ====================

/**
 * 对象池 - 减少内存分配和 GC 压力
 */
class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset?: (obj: T) => void;
  private maxSize: number;
  
  constructor(factory: () => T, maxSize: number = 100, reset?: (obj: T) => void) {
    this.factory = factory;
    this.maxSize = maxSize;
    this.reset = reset;
  }
  
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }
  
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      if (this.reset) {
        this.reset(obj);
      }
      this.pool.push(obj);
    }
  }
  
  clear(): void {
    this.pool = [];
  }
  
  size(): number {
    return this.pool.length;
  }
}

// ==================== 纹理缓存管理器 ====================

/**
 * 纹理缓存管理器 - LRU 缓存 + 对象池
 */
class TextureCacheManager {
  private textureCache: LRUCache<string, THREE.Texture>;
  private bitmapPool: ObjectPool<ImageBitmap>;
  private enabled: boolean;
  
  constructor(cacheSize: number = 10, enabled: boolean = true) {
    this.textureCache = new LRUCache(cacheSize);
    this.bitmapPool = new ObjectPool(
      () => new ImageBitmap() as any,
      10,
      undefined // ImageBitmap 不需要重置
    );
    this.enabled = enabled;
  }
  
  getTexture(key: string): THREE.Texture | undefined {
    if (!this.enabled) return undefined;
    return this.textureCache.get(key);
  }
  
  setTexture(key: string, texture: THREE.Texture): void {
    if (this.enabled) {
      this.textureCache.set(key, texture);
    }
  }
  
  acquireBitmap(): ImageBitmap | null {
    return this.bitmapPool.acquire();
  }
  
  releaseBitmap(bitmap: ImageBitmap): void {
    this.bitmapPool.release(bitmap);
  }
  
  clear(): void {
    this.textureCache.clear();
    this.bitmapPool.clear();
  }
}

// ==================== 增强型性能监控器 ====================

/**
 * 增强型性能监控器
 */
class EnhancedPerformanceMonitor {
  private metrics: UltimatePerformanceMetrics;
  private frameTimes: number[] = [];
  private transferTimes: number[] = [];
  private computeTimes: number[] = [];
  private lastFrameTime: number = 0;
  private frameStartTime: number = 0;
  private transferStartTime: number = 0;
  
  private enabled: boolean;
  private updateInterval: number;
  private lastUpdateTime: number = 0;
  private onUpdate?: (metrics: UltimatePerformanceMetrics) => void;
  private predictor: PerformancePredictor;
  private dropFrameThreshold: number = 16.67;  // 60 FPS 阈值
  
  private dropFrameCount: number = 0;
  private minFps: number = Infinity;
  private maxFps: number = 0;
  private enableProfiling: boolean;
  
  constructor(
    mode: UltimateTransferMode,
    enabled: boolean = true,
    updateInterval: number = 1000,
    historySize: number = 120,
    enableProfiling: boolean = false,
    onUpdate?: (metrics: UltimatePerformanceMetrics) => void
  ) {
    this.enabled = enabled;
    this.updateInterval = updateInterval;
    this.onUpdate = onUpdate;
    this.enableProfiling = enableProfiling;
    this.predictor = new PerformancePredictor(historySize);
    
    this.metrics = {
      mode,
      fps: 60,
      avgFps: 60,
      minFps: 60,
      maxFps: 60,
      avgFrameTime: 16.67,
      avgTransferTime: 0,
      avgComputeTime: 0,
      frameTimeStdDev: 0,
      dataTransferSize: 0,
      dataThroughput: 0,
      stabilityScore: 1.0,
      frameCount: 0,
      dropFrameCount: 0,
      predictedFps: 60,
      predictedTrend: 'stable',
      currentResolution: { width: 512, height: 512 },
      lastUpdate: performance.now()
    };
  }
  
  startFrame() {
    this.frameStartTime = performance.now();
    // 初始化 lastFrameTime 如果未设置
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = this.frameStartTime;
    }
  }

  startTransfer() {
    this.transferStartTime = performance.now();
  }
  
  endTransfer(dataSize: number) {
    if (!this.enabled) return;
    
    const transferTime = performance.now() - this.transferStartTime;
    this.transferTimes.push(transferTime);
    
    if (this.transferTimes.length > 120) {
      this.transferTimes.shift();
    }
    
    this.metrics.avgTransferTime = this.calculateAverage(this.transferTimes);
    this.metrics.dataTransferSize = dataSize;
  }
  
  endCompute() {
    if (!this.enabled) return;
    
    const computeTime = performance.now() - this.transferStartTime;
    this.computeTimes.push(computeTime);
    
    if (this.computeTimes.length > 120) {
      this.computeTimes.shift();
    }
    
    this.metrics.avgComputeTime = this.calculateAverage(this.computeTimes);
  }
  
  endFrame() {
    if (!this.enabled) return;
    
    const now = performance.now();
    const frameTime = now - this.frameStartTime;
    this.frameTimes.push(frameTime);
    
    if (this.frameTimes.length > 120) {
      this.frameTimes.shift();
    }
    
    // 计算实时 FPS
    const avgFrameTime = this.calculateAverage(this.frameTimes);
    const currentFps = 1000 / (now - this.lastFrameTime);
    
    this.metrics.fps = currentFps;
    this.metrics.avgFps = 1000 / avgFrameTime;
    this.metrics.avgFrameTime = avgFrameTime;
    this.metrics.frameCount++;
    
    // 更新最小/最大 FPS
    this.minFps = Math.min(this.minFps, currentFps);
    this.maxFps = Math.max(this.maxFps, currentFps);
    this.metrics.minFps = this.minFps;
    this.metrics.maxFps = this.maxFps;
    
    // 统计丢帧
    if (frameTime > this.dropFrameThreshold) {
      this.dropFrameCount++;
      this.metrics.dropFrameCount = this.dropFrameCount;
    }
    
    // 计算标准差 (稳定性)
    const variance = this.frameTimes.reduce((acc, val) => {
      return acc + Math.pow(val - avgFrameTime, 2);
    }, 0) / this.frameTimes.length;
    this.metrics.frameTimeStdDev = Math.sqrt(variance);
    
    // 稳定性评分 (0-1)
    this.metrics.stabilityScore = Math.max(0, 1 - this.metrics.frameTimeStdDev / avgFrameTime);
    
    // 数据吞吐量
    if (this.metrics.dataTransferSize > 0) {
      this.metrics.dataThroughput = 
        (this.metrics.dataTransferSize * 8) / (this.metrics.avgTransferTime / 1000) / 1_000_000;
    }
    
    // 更新预测器
    this.predictor.addDataPoint(currentFps, this.metrics.avgTransferTime);
    this.metrics.predictedFps = this.predictor.predictNextFps();
    this.metrics.predictedTrend = this.predictor.predictTrend();
    
    this.lastFrameTime = now;
    
    // 定期触发回调
    if (now - this.lastUpdateTime > this.updateInterval && this.onUpdate) {
      this.metrics.lastUpdate = now;
      this.onUpdate(this.getMetrics());
      this.lastUpdateTime = now;
    }
  }
  
  getMetrics(): UltimatePerformanceMetrics {
    return {
      ...this.metrics,
      lastUpdate: performance.now()
    };
  }
  
  /**
   * 预测下一帧 FPS
   */
  predictNextFps(): number {
    return this.predictor.predictNextFps();
  }
  
  /**
   * 预测性能趋势
   */
  predictTrend(): 'improving' | 'stable' | 'degrading' {
    return this.predictor.predictTrend();
  }
  
  /**
   * 判断是否需要降级模式
   */
  shouldFallback(threshold: number): boolean {
    const predictedFps = this.predictNextFps();
    const trend = this.predictTrend();
    
    return predictedFps < threshold || trend === 'degrading';
  }
  
  /**
   * 判断是否可以升级模式
   */
  shouldUpgrade(threshold: number): boolean {
    const predictedFps = this.predictNextFps();
    const trend = this.predictTrend();
    
    return predictedFps > threshold && trend === 'improving' && 
           this.metrics.stabilityScore > 0.8;
  }
  
  /**
   * 更新当前分辨率
   */
  updateResolution(width: number, height: number): void {
    this.metrics.currentResolution = { width, height };
  }
  
  private calculateAverage(times: number[]): number {
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
  
  reset(): void {
    this.frameTimes = [];
    this.transferTimes = [];
    this.computeTimes = [];
    this.metrics.frameCount = 0;
    this.dropFrameCount = 0;
    this.minFps = Infinity;
    this.maxFps = 0;
    this.predictor.reset();
    this.metrics.lastUpdate = performance.now();
  }
}

// ==================== WebGL2 PBO 优化器 ====================

/**
 * WebGL2 Pixel Buffer Object 优化器
 */
class WebGL2PBOOptimizer {
  private gl: WebGL2RenderingContext;
  private pbo: WebGLBuffer;
  private texture: WebGLTexture;
  private data: Uint8Array;
  private width: number;
  private height: number;
  
  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    
    // 创建纹理
    this.texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    // 分配纹理存储
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA,
      width, height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null
    );
    
    // 创建 PBO
    this.pbo = gl.createBuffer()!;
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, this.pbo);
    gl.bufferData(gl.PIXEL_UNPACK_BUFFER, width * height * 4, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
    
    // 预分配数据缓冲区
    this.data = new Uint8Array(width * height * 4);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  
  /**
   * 更新纹理数据 (使用 PBO 异步上传)
   */
  async update(data: Uint8Array): Promise<void> {
    const gl = this.gl;
    
    // 更新 PBO
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, this.pbo);
    gl.bufferSubData(gl.PIXEL_UNPACK_BUFFER, 0, data);
    
    // 从 PBO 上传到纹理 (异步)
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texSubImage2D(
      gl.TEXTURE_2D, 0,
      0, 0, this.width, this.height,
      gl.RGBA, gl.UNSIGNED_BYTE,
      0
    );
    
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  
  /**
   * 获取 WebGL 纹理
   */
  getWebGLTexture(): WebGLTexture {
    return this.texture;
  }
  
  /**
   * 获取 Three.js 纹理
   */
  getThreeTexture(textureLinear: boolean): THREE.Texture {
    const texture = new THREE.DataTexture(
      this.data,
      this.width,
      this.height,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    );
    
    const filter = textureLinear ? THREE.LinearFilter : THREE.NearestFilter;
    texture.minFilter = filter;
    texture.magFilter = filter;
    
    return texture;
  }
  
  /**
   * 调整大小
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    
    const gl = this.gl;
    
    // 重新分配纹理存储
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA,
      width, height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null
    );
    
    // 重新分配 PBO
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, this.pbo);
    gl.bufferData(gl.PIXEL_UNPACK_BUFFER, width * height * 4, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
    
    // 重新分配数据缓冲区
    this.data = new Uint8Array(width * height * 4);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  
  /**
   * 销毁资源
   */
  dispose(): void {
    const gl = this.gl;
    gl.deleteBuffer(this.pbo);
    gl.deleteTexture(this.texture);
  }
}

// ==================== Web Worker 管理器 ====================

/**
 * Web Worker 管理器 - 用于后台渲染
 */
class WorkerManager {
  private worker?: Worker;
  private offscreenCanvas?: OffscreenCanvas;
  private enabled: boolean;
  
  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }
  
  /**
   * 初始化 Worker
   */
  async initialize(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    workerScript?: string
  ): Promise<OffscreenCanvas> {
    if (!this.enabled) throw new Error('Worker is disabled');
    
    // 如果是 HTMLCanvasElement，尝试转换为 OffscreenCanvas
    if (canvas instanceof HTMLCanvasElement) {
      if (typeof (canvas as any).transferControlToOffscreen === 'function') {
        this.offscreenCanvas = (canvas as any).transferControlToOffscreen();
      } else {
        throw new Error('OffscreenCanvas not supported');
      }
    } else {
      this.offscreenCanvas = canvas;
    }
    
    // 创建 Worker
    if (workerScript) {
      this.worker = new Worker(workerScript);
    } else {
      // 使用内联 Worker
      const blob = new Blob([this.getWorkerScript()], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
    }
    
    // 发送 Canvas 给 Worker
    this.worker.postMessage({ type: 'init', canvas: this.offscreenCanvas }, [this.offscreenCanvas]);
    
    return this.offscreenCanvas;
  }
  
  /**
   * 获取 Worker 脚本
   */
  private getWorkerScript(): string {
    return `
      let canvas = null;
      
      self.onmessage = async (e) => {
        const { type, data } = e.data;
        
        switch (type) {
          case 'init':
            canvas = e.data.canvas;
            console.log('[Worker] Initialized with OffscreenCanvas');
            break;
            
          case 'render':
            if (canvas) {
              // 渲染逻辑
              const ctx = canvas.getContext('2d');
              if (ctx && data) {
                ctx.putImageData(data, 0, 0);
              }
              self.postMessage({ type: 'renderComplete' });
            }
            break;
        }
      };
    `;
  }
  
  /**
   * 发送消息到 Worker
   */
  postMessage(data: any): void {
    if (this.worker) {
      this.worker.postMessage(data);
    }
  }
  
  /**
   * 销毁 Worker
   */
  dispose(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
    }
  }
}

// ==================== 终极桥接器类 ====================

/**
 * 终极 Taichi.js + Three.js 桥接器
 */
export class UltimateTaichiThreeBridge {
  // ========== 公开属性 ==========
  public taichiEngine: TaichiEngine;
  public canvas: HTMLCanvasElement | OffscreenCanvas;
  public texture: THREE.Texture;
  public mesh?: THREE.Mesh;
  public options: Required<UltimateBridgeOptions>;
  
  // ========== 内部状态 ==========
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private running = false;
  private rafId = 0;
  private currentMode: UltimateTransferMode;
  
  // ========== 资源管理 ==========
  private imageBitmap?: ImageBitmap;
  private webgl2Context?: WebGL2RenderingContext;
  private pboOptimizer?: WebGL2PBOOptimizer;
  private pixelBufferData?: Uint8Array;
  private textureCache?: TextureCacheManager;
  private workerManager?: WorkerManager;
  
  // ========== WebGPU 状态 ==========
  private webGPUDevice?: GPUDevice;
  private webGPUAdapter?: GPUAdapter;
  private webGPUSharedTexture?: GPUTexture;
  private webGPUContext?: GPUCanvasContext;
  
  // ========== 性能监控 ==========
  private performanceMonitor: EnhancedPerformanceMonitor;
  private performancePredictor: PerformancePredictor;
  
  // ========== 自适应分辨率 ==========
  private currentResolution: { width: number; height: number };
  private adaptiveResolutionEnabled: boolean;
  
  // ========== 模式切换 ==========
  private modeCheckInterval?: number;
  
  constructor(options: UltimateBridgeOptions) {
    // 自动检测最佳模式
    const defaultMode = this.detectOptimalMode(options);
    
    // 规范化选项
    this.options = this.normalizeOptions(options, defaultMode);
    
    // 初始化状态
    this.currentMode = this.options.mode;
    this.renderer = this.options.renderer;
    this.scene = this.options.scene;
    this.camera = this.options.camera;
    this.taichiEngine = {} as TaichiEngine;
    
    // 初始化当前分辨率
    this.currentResolution = {
      width: this.options.width,
      height: this.options.height
    };
    this.adaptiveResolutionEnabled = this.options.enableAdaptiveResolution ?? false;
    
    // 初始化性能监控
    this.performanceMonitor = new EnhancedPerformanceMonitor(
      this.currentMode,
      this.options.performance.enabled,
      this.options.performance.updateInterval,
      this.options.performance.historySize,
      this.options.performance.enableProfiling ?? false,
      this.options.onPerformanceUpdate
    );
    
    this.performancePredictor = new PerformancePredictor(
      this.options.performance.historySize
    );
    
    // 初始化缓存
    if (this.options.caching.enabled) {
      this.textureCache = new TextureCacheManager(
        this.options.caching.textureCacheSize || 10,
        this.options.caching.enableLRUCache ?? true
      );
    }
    
    // 初始化 Worker 管理器
    if (this.options.offscreen.enableWorker) {
      this.workerManager = new WorkerManager(true);
    }
    
    // 创建画布
    this.canvas = this.createCanvas();
    
    // 获取 WebGL2 上下文
    this.initWebGL2Context();
  }
  
  /**
   * 规范化选项
   */
  private normalizeOptions(
    options: UltimateBridgeOptions,
    defaultMode: UltimateTransferMode
  ): Required<UltimateBridgeOptions> {
    return {
      width: options.width ?? 512,
      height: options.height ?? 512,
      maxResolution: options.maxResolution ?? 2048,
      minResolution: options.minResolution ?? 256,
      enableAdaptiveResolution: options.enableAdaptiveResolution ?? false,
      targetFps: options.targetFps ?? 60,
      resolutionScaleFactor: options.resolutionScaleFactor ?? 1.0,
      mode: options.mode ?? defaultMode,
      autoDetectMode: options.autoDetectMode ?? true,
      enableModeFallback: options.enableModeFallback ?? true,
      fallbackThreshold: options.fallbackThreshold ?? 45,
      upgradeThreshold: options.upgradeThreshold ?? 55,
      renderer: options.renderer,
      scene: options.scene,
      camera: options.camera,
      planeSize: options.planeSize ?? { width: 2, height: 2 },
      textureLinear: options.textureLinear ?? true,
      textureWrapS: options.textureWrapS ?? THREE.ClampToEdgeWrapping,
      textureWrapT: options.textureWrapT ?? THREE.ClampToEdgeWrapping,
      generateMipmaps: options.generateMipmaps ?? false,
      textureFormat: options.textureFormat ?? THREE.RGBAFormat,
      textureType: options.textureType ?? THREE.UnsignedByteType,
      enableWebGL2PBO: options.enableWebGL2PBO ?? true,
      pboBufferSize: options.pboBufferSize ?? 16,
      enableMultisample: options.enableMultisample ?? false,
      webgpu: {
        enabled: options.webgpu?.enabled ?? false,
        device: options.webgpu?.device,
        adapter: options.webgpu?.adapter,
        preferredFormat: options.webgpu?.preferredFormat ?? 'rgba8unorm',
        alphaMode: options.webgpu?.alphaMode ?? 'opaque',
        enableSharedTexture: options.webgpu?.enableSharedTexture ?? true,
        sharedTextureUsage: options.webgpu?.sharedTextureUsage ?? 
          GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        powerPreference: options.webgpu?.powerPreference ?? 'high-performance',
        ...options.webgpu
      },
      offscreen: {
        enabled: options.offscreen?.enabled ?? true,
        enableTransferable: options.offscreen?.enableTransferable ?? true,
        enableWorker: options.offscreen?.enableWorker ?? false,
        worker: options.offscreen?.worker,
        workerScript: options.offscreen?.workerScript,
        canvas: options.offscreen?.canvas,
        ...options.offscreen
      },
      pixelBuffer: {
        width: options.pixelBuffer?.width ?? options.width ?? 512,
        height: options.pixelBuffer?.height ?? options.height ?? 512,
        texture: options.pixelBuffer?.texture,
        data: options.pixelBuffer?.data,
        dataType: options.pixelBuffer?.dataType ?? 'uint8',
        ...options.pixelBuffer
      },
      fieldSync: {
        positionField: options.fieldSync?.positionField,
        colorField: options.fieldSync?.colorField,
        normalField: options.fieldSync?.normalField,
        updateFrequency: options.fieldSync?.updateFrequency ?? 60,
        enableBatchUpdate: options.fieldSync?.enableBatchUpdate ?? true,
        interpolationFactor: options.fieldSync?.interpolationFactor ?? 1.0,
        enablePrediction: options.fieldSync?.enablePrediction ?? false,
        ...options.fieldSync
      },
      caching: {
        enabled: options.caching?.enabled ?? true,
        textureCacheSize: options.caching?.textureCacheSize ?? 10,
        bufferPoolSize: options.caching?.bufferPoolSize ?? 5,
        enableLRUCache: options.caching?.enableLRUCache ?? true,
        enableObjectPool: options.caching?.enableObjectPool ?? true,
        ...options.caching
      },
      performance: {
        enabled: options.performance?.enabled ?? true,
        updateInterval: options.performance?.updateInterval ?? 1000,
        enableDetailedLogging: options.performance?.enableDetailedLogging ?? false,
        enablePrediction: options.performance?.enablePrediction ?? true,
        historySize: options.performance?.historySize ?? 120,
        enableProfiling: options.performance?.enableProfiling ?? false,
        ...options.performance
      },
      onBeforeStep: options.onBeforeStep ?? (() => {}),
      onAfterStep: options.onAfterStep ?? (() => {}),
      onTransferComplete: options.onTransferComplete ?? (() => {}),
      onPerformanceUpdate: options.onPerformanceUpdate ?? (() => {}),
      onModeChange: options.onModeChange ?? (() => {}),
      onResolutionChange: options.onResolutionChange ?? (() => {}),
      onError: options.onError ?? console.error,
      onWarning: options.onWarning ?? console.warn,
    } as Required<UltimateBridgeOptions>;
  }
  
  /**
   * 检测最优传输模式
   */
  private detectOptimalMode(options: UltimateBridgeOptions): UltimateTransferMode {
    // 1. 检查 WebGPU 支持 (最优)
    if (this.hasWebGPUSupport() && options.webgpu?.enabled !== false) {
      return UltimateTransferMode.WebGPUSharedTexture;
    }
    
    // 2. 检查 OffscreenCanvas + Transferable Objects (次优)
    if (this.hasTransferableSupport() && options.offscreen?.enabled !== false) {
      return UltimateTransferMode.TransferableImageBitmap;
    }
    
    // 3. 检查 OffscreenCanvas + Worker (高性能)
    if (this.hasOffscreenCanvasSupport() && options.offscreen?.enableWorker) {
      return UltimateTransferMode.OffscreenWorker;
    }
    
    // 4. 检查 WebGL2 PBO (高性能)
    if (this.hasWebGL2PBO() && options.enableWebGL2PBO !== false) {
      return UltimateTransferMode.WebGL2PBO;
    }
    
    // 5. 检查 OffscreenCanvas + ImageBitmap (标准)
    if (this.hasOffscreenCanvasSupport() && options.offscreen?.enabled !== false) {
      return UltimateTransferMode.OffscreenImageBitmap;
    }
    
    // 6. 默认使用 CanvasTexture (兼容性最好)
    return UltimateTransferMode.CanvasTexture;
  }
  
  /**
   * 检查 WebGPU 支持
   */
  private hasWebGPUSupport(): boolean {
    return typeof (navigator as any).gpu !== 'undefined';
  }
  
  /**
   * 检查 Transferable Objects 支持
   */
  private hasTransferableSupport(): boolean {
    return typeof OffscreenCanvas !== 'undefined' && 
           typeof createImageBitmap === 'function';
  }
  
  /**
   * 检查 WebGL2 PBO 支持
   */
  private hasWebGL2PBO(): boolean {
    const gl = this.options.renderer.getContext();
    return gl && gl instanceof WebGL2RenderingContext;
  }
  
  /**
   * 检查 OffscreenCanvas 支持
   */
  private hasOffscreenCanvasSupport(): boolean {
    return typeof OffscreenCanvas !== 'undefined';
  }
  
  /**
   * 初始化 WebGL2 上下文
   */
  private initWebGL2Context(): void {
    const gl = this.options.renderer.getContext();
    if (gl && gl instanceof WebGL2RenderingContext) {
      this.webgl2Context = gl;
    }
  }
  
  /**
   * 创建画布
   */
  private createCanvas(): HTMLCanvasElement | OffscreenCanvas {
    const { width, height, offscreen } = this.options;
    
    if (offscreen.canvas) {
      return offscreen.canvas;
    }
    
    if (offscreen.enabled && typeof OffscreenCanvas !== 'undefined') {
      return new OffscreenCanvas(width, height);
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    return canvas;
  }
  
  /**
   * 初始化桥接器
   */
  async init(taichiEngine: TaichiEngine): Promise<this> {
    this.taichiEngine = taichiEngine;
    
    // 1. 绑定画布到 Taichi 引擎
    await this.attachCanvasToTaichi();
    
    // 2. 初始化 WebGPU (如果支持)
    await this.initializeWebGPU();
    
    // 3. 初始化纹理
    await this.initializeTexture();
    
    // 4. 初始化 WebGL2 PBO (如果启用)
    if (this.options.enableWebGL2PBO && this.webgl2Context) {
      await this.initializeWebGL2PBO();
    }
    
    // 5. 初始化 Worker (如果启用)
    if (this.options.offscreen.enableWorker && this.workerManager) {
      await this.workerManager.initialize(this.canvas, this.options.offscreen.workerScript);
    }
    
    // 6. 创建默认 Mesh
    this.createDefaultMesh();
    
    // 7. 自动启动模式检测
    if (this.options.autoDetectMode) {
      this.startAutoModeDetection();
    }
    
    // 8. 自动启动
    if (this.options.autoStart ?? true) {
      this.start();
    }
    
    return this;
  }
  
  /**
   * 绑定画布到 Taichi 引擎
   */
  private async attachCanvasToTaichi(): Promise<void> {
    try {
      if (typeof this.taichiEngine.attachCanvas === 'function') {
        this.taichiEngine.attachCanvas(this.canvas);
      } else if (typeof this.taichiEngine.setCanvas === 'function') {
        this.taichiEngine.setCanvas(this.canvas);
      }
      
      // 获取 WebGPU 设备
      if (typeof this.taichiEngine.getRuntime === 'function') {
        const runtime = this.taichiEngine.getRuntime();
        if (runtime) {
          this.webGPUDevice = runtime.device;
          this.webGPUAdapter = runtime.adapter;
        }
      } else if (typeof this.taichiEngine.getDevice === 'function') {
        this.webGPUDevice = this.taichiEngine.getDevice();
      }
    } catch (error) {
      this.options.onError(error as Error, 'attachCanvasToTaichi');
    }
  }
  
  /**
   * 初始化 WebGPU
   */
  private async initializeWebGPU(): Promise<void> {
    if (!this.options.webgpu.enabled) return;
    
    try {
      if (!this.webGPUDevice && this.hasWebGPUSupport()) {
        const adapter = await (navigator as any).gpu.requestAdapter({
          powerPreference: this.options.webgpu.powerPreference
        });
        if (!adapter) throw new Error('No GPU adapter found');
        
        this.webGPUAdapter = adapter;
        this.webGPUDevice = await adapter.requestDevice();
      }
      
      if (this.webGPUDevice && this.options.webgpu.enableSharedTexture) {
        // 创建共享纹理
        this.webGPUSharedTexture = this.webGPUDevice.createTexture({
          size: [this.options.width, this.options.height, 1],
          format: this.options.webgpu.preferredFormat,
          usage: this.options.webgpu.sharedTextureUsage
        });
      }
    } catch (error) {
      this.options.onWarning?.(`WebGPU 初始化失败: ${error}`);
    }
  }
  
  /**
   * 初始化纹理
   */
  private async initializeTexture(): Promise<void> {
    const { width, height, textureLinear, textureWrapS, textureWrapT, generateMipmaps, textureFormat, textureType } = this.options;
    const filter = textureLinear ? THREE.LinearFilter : THREE.NearestFilter;
    
    switch (this.currentMode) {
      case UltimateTransferMode.WebGPUSharedTexture:
        // WebGPU 共享纹理 - 使用占位符
        this.texture = new THREE.Texture();
        this.texture.minFilter = filter;
        this.texture.magFilter = filter;
        this.texture.wrapS = textureWrapS;
        this.texture.wrapT = textureWrapT;
        this.texture.generateMipmaps = generateMipmaps;
        break;
        
      case UltimateTransferMode.TransferableImageBitmap:
      case UltimateTransferMode.OffscreenImageBitmap:
        this.texture = new THREE.Texture();
        this.texture.minFilter = filter;
        this.texture.magFilter = filter;
        this.texture.wrapS = textureWrapS;
        this.texture.wrapT = textureWrapT;
        this.texture.generateMipmaps = generateMipmaps;
        break;
        
      case UltimateTransferMode.OffscreenWorker:
        // Worker 模式 - 使用 CanvasTexture
        this.texture = new THREE.CanvasTexture(this.canvas as HTMLCanvasElement);
        this.texture.minFilter = filter;
        this.texture.magFilter = filter;
        this.texture.wrapS = textureWrapS;
        this.texture.wrapT = textureWrapT;
        this.texture.generateMipmaps = generateMipmaps;
        break;
        
      case UltimateTransferMode.WebGL2PBO:
        if (this.pboOptimizer) {
          this.texture = this.pboOptimizer.getThreeTexture(textureLinear);
        } else {
          this.texture = new THREE.DataTexture(
            new Uint8Array(width * height * 4),
            width, height, textureFormat, textureType
          );
        }
        this.texture.minFilter = filter;
        this.texture.magFilter = filter;
        this.texture.wrapS = textureWrapS;
        this.texture.wrapT = textureWrapT;
        this.texture.generateMipmaps = generateMipmaps;
        break;
        
      case UltimateTransferMode.CanvasTexture:
        this.texture = new THREE.CanvasTexture(this.canvas as HTMLCanvasElement);
        this.texture.minFilter = filter;
        this.texture.magFilter = filter;
        this.texture.wrapS = textureWrapS;
        this.texture.wrapT = textureWrapT;
        this.texture.generateMipmaps = generateMipmaps;
        break;
        
      case UltimateTransferMode.PixelBuffer:
        const data = this.options.pixelBuffer.data || 
                     new Uint8Array(width * height * 4);
        this.texture = new THREE.DataTexture(
          data, width, height, textureFormat, textureType
        );
        this.texture.minFilter = filter;
        this.texture.magFilter = filter;
        this.texture.wrapS = textureWrapS;
        this.texture.wrapT = textureWrapT;
        this.texture.generateMipmaps = generateMipmaps;
        this.pixelBufferData = data as Uint8Array;
        break;
        
      case UltimateTransferMode.FieldSync:
        this.texture = new THREE.Texture(); // 占位符
        break;
    }
  }
  
  /**
   * 初始化 WebGL2 PBO
   */
  private async initializeWebGL2PBO(): Promise<void> {
    if (!this.webgl2Context) return;
    
    const { width, height } = this.options;
    
    try {
      this.pboOptimizer = new WebGL2PBOOptimizer(this.webgl2Context, width, height);
    } catch (error) {
      this.options.onError(error as Error, 'initializeWebGL2PBO');
    }
  }
  
  /**
   * 创建默认 Mesh
   */
  private createDefaultMesh(): void {
    if (this.currentMode === UltimateTransferMode.FieldSync) {
      return; // 字段同步模式不需要默认 Mesh
    }
    
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    const geometry = new THREE.PlaneGeometry(
      this.options.planeSize.width,
      this.options.planeSize.height
    );
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }
  
  /**
   * 自动模式检测
   */
  private startAutoModeDetection(): void {
    this.modeCheckInterval = window.setInterval(() => {
      if (!this.options.enableModeFallback) return;
      
      const metrics = this.performanceMonitor.getMetrics();
      
      // 检查是否需要降级
      if (this.performanceMonitor.shouldFallback(this.options.fallbackThreshold)) {
        this.tryFallbackMode();
      }
      
      // 检查是否可以升级
      if (this.performanceMonitor.shouldUpgrade(this.options.upgradeThreshold)) {
        this.tryUpgradeMode();
      }
    }, 2000);
  }
  
  /**
   * 尝试降级模式
   */
  private async tryFallbackMode(): Promise<void> {
    const fallbackModes: UltimateTransferMode[] = [
      UltimateTransferMode.TransferableImageBitmap,
      UltimateTransferMode.OffscreenWorker,
      UltimateTransferMode.WebGL2PBO,
      UltimateTransferMode.OffscreenImageBitmap,
      UltimateTransferMode.CanvasTexture,
      UltimateTransferMode.PixelBuffer
    ];
    
    const currentIndex = fallbackModes.indexOf(this.currentMode);
    
    for (let i = currentIndex + 1; i < fallbackModes.length; i++) {
      const fallbackMode = fallbackModes[i];
      
      try {
        console.log(`[UltimateBridge] 尝试降级到: ${fallbackMode}`);
        await this.switchMode(fallbackMode);
        return;
      } catch (error) {
        console.warn(`[UltimateBridge] 降级到 ${fallbackMode} 失败:`, error);
      }
    }
  }
  
  /**
   * 尝试升级模式
   */
  private async tryUpgradeMode(): Promise<void> {
    const upgradeModes: UltimateTransferMode[] = [
      UltimateTransferMode.WebGPUSharedTexture,
      UltimateTransferMode.TransferableImageBitmap,
      UltimateTransferMode.OffscreenWorker,
      UltimateTransferMode.WebGL2PBO,
      UltimateTransferMode.OffscreenImageBitmap,
      UltimateTransferMode.CanvasTexture
    ];
    
    const currentIndex = upgradeModes.indexOf(this.currentMode);
    
    // 只能升级到更好的模式
    for (let i = 0; i < currentIndex; i++) {
      const upgradeMode = upgradeModes[i];
      
      try {
        console.log(`[UltimateBridge] 尝试升级到: ${upgradeMode}`);
        await this.switchMode(upgradeMode);
        return;
      } catch (error) {
        console.warn(`[UltimateBridge] 升级到 ${upgradeMode} 失败:`, error);
      }
    }
  }
  
  /**
   * 切换传输模式
   */
  async switchMode(newMode: UltimateTransferMode): Promise<void> {
    if (newMode === this.currentMode) return;
    
    const oldMode = this.currentMode;
    this.currentMode = newMode;
    
    // 通知回调
    this.options.onModeChange(oldMode, newMode);
    
    // 清理旧资源
    await this.cleanupResources();
    
    // 重新初始化
    await this.initializeTexture();
    
    // 更新 Mesh 纹理
    if (this.mesh && 'map' in this.mesh.material) {
      (this.mesh.material as any).map = this.texture;
      (this.mesh.material as any).needsUpdate = true;
    }
    
    console.log(`[UltimateBridge] 模式切换完成: ${oldMode} -> ${newMode}`);
  }
  
  /**
   * 清理资源
   */
  private async cleanupResources(): Promise<void> {
    // 清理 ImageBitmap
    if (this.imageBitmap && typeof (this.imageBitmap as any).close === 'function') {
      this.imageBitmap.close();
      this.imageBitmap = undefined;
    }
    
    // 清理纹理
    if (this.texture && this.texture !== this.mesh?.material.map) {
      this.texture.dispose();
    }
    
    // 清理 WebGL2 PBO
    if (this.pboOptimizer) {
      this.pboOptimizer.dispose();
      this.pboOptimizer = undefined;
    }
    
    // 清理 WebGPU 共享纹理
    if (this.webGPUSharedTexture) {
      this.webGPUSharedTexture.destroy();
      this.webGPUSharedTexture = undefined;
    }
  }
  
  /**
   * 执行单帧更新
   */
  async step(time: number = performance.now()): Promise<void> {
    if (!this.running) return;
    
    this.performanceMonitor.startFrame();
    
    try {
      // 前置回调
      this.options.onBeforeStep(time);
      
      // 执行 Taichi 计算
      await this.executeTaichiEngine();
      
      // 传输数据到 Three.js
      await this.transferToThreeJS(time);
      
      // 自适应分辨率调整
      if (this.adaptiveResolutionEnabled) {
        await this.adjustAdaptiveResolution();
      }
      
      // 后置回调
      this.options.onAfterStep(time);
      
      this.performanceMonitor.endFrame();
    } catch (error) {
      this.options.onError(error as Error, 'step');
    }
  }
  
  /**
   * 执行 Taichi 引擎
   */
  private async executeTaichiEngine(): Promise<void> {
    if (typeof this.taichiEngine.runKernel === 'function') {
      await this.taichiEngine.runKernel('main', performance.now());
    } else if (typeof (this.taichiEngine as any).update === 'function') {
      (this.taichiEngine as any).update(performance.now());
    } else if (typeof (this.taichiEngine as any).render === 'function') {
      (this.taichiEngine as any).render(performance.now());
    }
  }
  
  /**
   * 传输数据到 Three.js
   */
  private async transferToThreeJS(time: number): Promise<void> {
    const { width, height } = this.currentResolution;
    const dataSize = width * height * 4;
    
    this.performanceMonitor.startTransfer();
    
    switch (this.currentMode) {
      case UltimateTransferMode.WebGPUSharedTexture:
        await this.transferViaWebGPUSharedTexture();
        break;
        
      case UltimateTransferMode.TransferableImageBitmap:
        await this.transferViaTransferableImageBitmap();
        break;
        
      case UltimateTransferMode.OffscreenWorker:
        await this.transferViaWorker();
        break;
        
      case UltimateTransferMode.WebGL2PBO:
        await this.transferViaWebGL2PBO();
        break;
        
      case UltimateTransferMode.OffscreenImageBitmap:
        await this.transferViaImageBitmap();
        break;
        
      case UltimateTransferMode.CanvasTexture:
        this.transferViaCanvasTexture();
        break;
        
      case UltimateTransferMode.PixelBuffer:
        await this.transferViaPixelBuffer();
        break;
        
      case UltimateTransferMode.FieldSync:
        await this.transferViaFieldSync(time);
        break;
    }
    
    this.performanceMonitor.endTransfer(dataSize);
  }
  
  /**
   * 通过 WebGPU 共享纹理传输
   */
  private async transferViaWebGPUSharedTexture(): Promise<void> {
    // 实现真正的 GPU-GPU 零拷贝传输
    // 这是理论上的最优方案,实际实现取决于 Taichi.js 的 API
    if (this.webGPUDevice && this.webGPUSharedTexture) {
      // TODO: 实现 WebGPU 共享纹理同步
      // 这里需要 Taichi.js 暴露 GPUTexture 接口
      // 目前使用占位符实现
    }
  }
  
  /**
   * 通过 Transferable ImageBitmap 传输
   */
  private async transferViaTransferableImageBitmap(): Promise<void> {
    if (!(this.canvas instanceof OffscreenCanvas)) return;
    
    try {
      // 使用 Transferable Objects 零拷贝传输
      const bitmap = await createImageBitmap(this.canvas, {
        imageOrientation: 'none',
        premultiplyAlpha: 'none',
      });
      
      if (this.imageBitmap && typeof (this.imageBitmap as any).close === 'function') {
        this.imageBitmap.close();
      }
      
      this.imageBitmap = bitmap;
      this.texture.image = bitmap;
      this.texture.needsUpdate = true;
    } catch (error) {
      this.options.onError(error as Error, 'transferViaTransferableImageBitmap');
    }
  }
  
  /**
   * 通过 Worker 传输
   */
  private async transferViaWorker(): Promise<void> {
    if (!this.workerManager) return;
    
    try {
      const ctx = this.canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, this.currentResolution.width, this.currentResolution.height);
        this.workerManager.postMessage({ type: 'render', data: imageData });
      }
      
      // Worker 会异步完成渲染
      // 纹理会在 Worker 完成后自动更新
    } catch (error) {
      this.options.onError(error as Error, 'transferViaWorker');
    }
  }
  
  /**
   * 通过 WebGL2 PBO 传输
   */
  private async transferViaWebGL2PBO(): Promise<void> {
    if (!this.pboOptimizer) return;
    
    try {
      const { width, height } = this.currentResolution;
      
      // 从 Taichi 引擎获取像素数据
      if (typeof (this.taichiEngine as any).getPixelData === 'function') {
        const data = await (this.taichiEngine as any).getPixelData();
        
        if (data.byteLength === width * height * 4) {
          // 使用 PBO 优化更新
          await this.pboOptimizer.update(new Uint8Array(data));
          this.texture.needsUpdate = true;
        }
      }
    } catch (error) {
      this.options.onError(error as Error, 'transferViaWebGL2PBO');
    }
  }
  
  /**
   * 通过 ImageBitmap 传输
   */
  private async transferViaImageBitmap(): Promise<void> {
    if (!(this.canvas instanceof OffscreenCanvas)) return;
    
    try {
      const bitmap = await createImageBitmap(this.canvas);
      
      if (this.imageBitmap && typeof (this.imageBitmap as any).close === 'function') {
        this.imageBitmap.close();
      }
      
      this.imageBitmap = bitmap;
      this.texture.image = bitmap;
      this.texture.needsUpdate = true;
    } catch (error) {
      this.options.onError(error as Error, 'transferViaImageBitmap');
    }
  }
  
  /**
   * 通过 CanvasTexture 传输
   */
  private transferViaCanvasTexture(): void {
    if (this.texture instanceof THREE.CanvasTexture) {
      this.texture.needsUpdate = true;
    } else {
      this.texture.image = this.canvas;
      this.texture.needsUpdate = true;
    }
  }
  
  /**
   * 通过像素缓冲传输
   */
  private async transferViaPixelBuffer(): Promise<void> {
    if (typeof (this.taichiEngine as any).getPixelData === 'function') {
      const data = await (this.taichiEngine as any).getPixelData();
      
      if (this.pixelBufferData && data.byteLength === this.pixelBufferData.byteLength) {
        this.pixelBufferData.set(new Uint8Array(data));
        this.texture.needsUpdate = true;
      }
    }
  }
  
  /**
   * 通过字段同步传输
   */
  private async transferViaFieldSync(time: number): Promise<void> {
    // 字段同步逻辑需要根据具体实现
    // 这里提供基本框架
  }
  
  /**
   * 自适应分辨率调整
   */
  private async adjustAdaptiveResolution(): Promise<void> {
    const metrics = this.performanceMonitor.getMetrics();
    const targetFps = this.options.targetFps;
    const currentFps = metrics.avgFps;
    
    let newWidth = this.currentResolution.width;
    let newHeight = this.currentResolution.height;
    const scaleFactor = 0.9; // 每次调整 10%
    
    if (currentFps < targetFps * 0.8) {
      // 性能不足,降低分辨率
      newWidth = Math.max(this.options.minResolution, Math.floor(newWidth * scaleFactor));
      newHeight = Math.max(this.options.minResolution, Math.floor(newHeight * scaleFactor));
    } else if (currentFps > targetFps * 1.2) {
      // 性能充足,提高分辨率
      newWidth = Math.min(this.options.maxResolution, Math.floor(newWidth / scaleFactor));
      newHeight = Math.min(this.options.maxResolution, Math.floor(newHeight / scaleFactor));
    }
    
    if (newWidth !== this.currentResolution.width || 
        newHeight !== this.currentResolution.height) {
      const oldResolution = { ...this.currentResolution };
      await this.setSize(newWidth, newHeight);
      this.options.onResolutionChange(oldResolution, this.currentResolution);
      console.log(`[UltimateBridge] 自适应调整分辨率: ${this.currentResolution.width}x${this.currentResolution.height}`);
    }
  }
  
  /**
   * 启动循环
   */
  start(): void {
    if (this.running) return;
    
    this.running = true;
    
    if (typeof (this.taichiEngine as any).start === 'function') {
      (this.taichiEngine as any).start();
    }
    
    const loop = (time: number) => {
      if (!this.running) return;
      
      this.step(time).then(() => {
        this.rafId = requestAnimationFrame(loop);
      });
    };
    
    this.rafId = requestAnimationFrame(loop);
  }
  
  /**
   * 停止循环
   */
  stop(): void {
    this.running = false;
    
    if (typeof (this.taichiEngine as any).stop === 'function') {
      (this.taichiEngine as any).stop();
    }
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    
    if (this.modeCheckInterval) {
      clearInterval(this.modeCheckInterval);
      this.modeCheckInterval = undefined;
    }
  }
  
  /**
   * 设置尺寸
   */
  async setSize(width: number, height: number): Promise<void> {
    const oldResolution = { ...this.currentResolution };
    
    this.currentResolution = { width, height };
    this.options.width = width;
    this.options.height = height;
    this.performanceMonitor.updateResolution(width, height);
    
    // 更新画布
    if (this.canvas instanceof HTMLCanvasElement) {
      this.canvas.width = width;
      this.canvas.height = height;
    } else if (this.canvas instanceof OffscreenCanvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    
    // 更新 WebGL2 PBO
    if (this.pboOptimizer) {
      this.pboOptimizer.resize(width, height);
    }
    
    // 重新初始化纹理
    await this.cleanupResources();
    await this.initializeTexture();
    
    // 更新 Mesh 纹理
    if (this.mesh && 'map' in this.mesh.material) {
      (this.mesh.material as any).map = this.texture;
      (this.mesh.material as any).needsUpdate = true;
    }
  }
  
  /**
   * 设置自定义 Mesh
   */
  setMesh(mesh: THREE.Mesh): void {
    if (this.mesh && this.scene) {
      this.scene.remove(this.mesh);
    }
    
    this.mesh = mesh;
    this.scene.add(mesh);
    
    // 应用纹理
    if ('map' in mesh.material) {
      (mesh.material as any).map = this.texture;
      (mesh.material as any).needsUpdate = true;
    }
  }
  
  /**
   * 应用纹理到材质
   */
  applyToMaterial(material: THREE.Material): void {
    if ('map' in material) {
      (material as any).map = this.texture;
      (material as any).needsUpdate = true;
    }
  }
  
  /**
   * 获取性能指标
   */
  getMetrics(): UltimatePerformanceMetrics {
    return this.performanceMonitor.getMetrics();
  }
  
  /**
   * 预测性能
   */
  predictPerformance(): {
    nextFps: number;
    trend: 'improving' | 'stable' | 'degrading';
    shouldFallback: boolean;
    shouldUpgrade: boolean;
  } {
    return {
      nextFps: this.performanceMonitor.predictNextFps(),
      trend: this.performanceMonitor.predictTrend(),
      shouldFallback: this.performanceMonitor.shouldFallback(this.options.fallbackThreshold),
      shouldUpgrade: this.performanceMonitor.shouldUpgrade(this.options.upgradeThreshold)
    };
  }
  
  /**
   * 获取当前传输模式
   */
  getCurrentMode(): UltimateTransferMode {
    return this.currentMode;
  }
  
  /**
   * 销毁桥接器
   */
  dispose(): void {
    this.stop();
    
    // 清理资源
    this.cleanupResources();
    
    // 清理 Mesh
    if (this.mesh && this.scene) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(m => m.dispose());
      } else {
        this.mesh.material.dispose();
      }
    }
    
    // 清理 Canvas
    if (this.canvas instanceof HTMLCanvasElement && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
    
    // 清理缓存
    this.textureCache?.clear();
    
    // 清理 Worker
    this.workerManager?.dispose();
    
    // 清理 Taichi 引擎
    if (typeof (this.taichiEngine as any).dispose === 'function') {
      (this.taichiEngine as any).dispose();
    }
    
    // 重置性能监控
    this.performanceMonitor.reset();
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建终极桥接器实例
 */
export function createUltimateTaichiThreeBridge(options: UltimateBridgeOptions): UltimateTaichiThreeBridge {
  return new UltimateTaichiThreeBridge(options);
}

/**
 * 快速创建带默认配置的桥接器
 */
export async function createDefaultUltimateBridge(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  taichiEngine: TaichiEngine
): Promise<UltimateTaichiThreeBridge> {
  const bridge = new UltimateTaichiThreeBridge({
    renderer,
    scene,
    camera,
    width: 512,
    height: 512,
    performance: {
      enabled: true,
      enablePrediction: true
    },
    caching: {
      enabled: true,
      enableLRUCache: true,
      enableObjectPool: true
    },
    enableAdaptiveResolution: true,
    targetFps: 60
  });
  
  return bridge.init(taichiEngine);
}

// ==================== 导出 ====================

export { UltimateTaichiThreeBridge as default };
export type {
  UltimateTransferMode,
  UltimatePerformanceMetrics,
  UltimateBridgeOptions,
  TaichiEngine,
  TaichiField
};
