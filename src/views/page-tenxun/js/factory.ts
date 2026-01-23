import * as THREE from 'three'
import { EnhancedTaichiThreeBridge } from './EnhancedTaichiThreeBridge'
import type { BridgeOptions } from './types'
import { TransportMode } from './types'

/**
 * 预设配置
 */
const PRESETS = {
  /**
   * 超高性能模式
   * - 优先使用 WebGPU
   * - 高分辨率
   * - 禁用自适应(假设设备性能足够)
   */
  ULTRA: {
    preferredMode: TransportMode.WebGPU,
    enableAdaptiveResolution: false,
    targetFps: 90,
    width: 2048,
    height: 2048,
    enableAutoOptimization: true,
    performance: {
      enabled: true,
      updateInterval: 1000,
      enablePrediction: true
    }
  } as Partial<BridgeOptions>,

  /**
   * 高性能模式
   * - 优先使用 Transferable
   * - 中高分辨率
   * - 禁用自适应
   */
  PERFORMANCE: {
    preferredMode: TransportMode.Transferable,
    enableAdaptiveResolution: false,
    targetFps: 60,
    width: 1024,
    height: 1024,
    enableAutoOptimization: true
  } as Partial<BridgeOptions>,

  /**
   * 兼容性模式
   * - 优先使用 Canvas
   * - 低分辨率
   * - 启用自适应
   */
  COMPATIBILITY: {
    preferredMode: TransportMode.Canvas,
    enableAdaptiveResolution: true,
    targetFps: 30,
    width: 512,
    height: 512,
    enableAutoOptimization: true,
    fallbackThreshold: 25,
    upgradeThreshold: 35
  } as Partial<BridgeOptions>,

  /**
   * 平衡模式
   * - 优先使用 Transferable
   * - 中等分辨率
   * - 启用自适应
   */
  BALANCED: {
    preferredMode: TransportMode.Transferable,
    enableAdaptiveResolution: true,
    targetFps: 45,
    width: 768,
    height: 768,
    enableAutoOptimization: true,
    performance: {
      enabled: true,
      updateInterval: 500,
      enablePrediction: true
    }
  } as Partial<BridgeOptions>,

  /**
   * 移动设备模式
   * - 优先使用 WebGL2PBO
   * - 低分辨率
   * - 激进的自适应
   */
  MOBILE: {
    preferredMode: TransportMode.WebGL2PBO,
    enableAdaptiveResolution: true,
    targetFps: 30,
    width: 512,
    height: 512,
    maxResolution: 768,
    minResolution: 256,
    resolutionScaleFactor: 0.8,
    enableAutoOptimization: true,
    fallbackThreshold: 25,
    upgradeThreshold: 35
  } as Partial<BridgeOptions>
}

/**
 * 创建基础桥接器
 */
export function createBridge(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: Partial<BridgeOptions> = {}
): EnhancedTaichiThreeBridge {
  const bridgeOptions: BridgeOptions = {
    renderer,
    scene,
    camera,
    width: 512,
    height: 512,
    targetFps: 60,
    enableAdaptiveResolution: false,
    enableAutoOptimization: true,
    ...options
  }

  return new EnhancedTaichiThreeBridge(bridgeOptions)
}

/**
 * 创建超高性能桥接器
 */
export function createUltraBridge(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: Partial<BridgeOptions> = {}
): EnhancedTaichiThreeBridge {
  return createBridge(renderer, scene, camera, {
    ...PRESETS.ULTRA,
    ...options
  })
}

/**
 * 创建高性能桥接器
 */
export function createPerformanceBridge(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: Partial<BridgeOptions> = {}
): EnhancedTaichiThreeBridge {
  return createBridge(renderer, scene, camera, {
    ...PRESETS.PERFORMANCE,
    ...options
  })
}

/**
 * 创建兼容性桥接器
 */
export function createCompatibilityBridge(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: Partial<BridgeOptions> = {}
): EnhancedTaichiThreeBridge {
  return createBridge(renderer, scene, camera, {
    ...PRESETS.COMPATIBILITY,
    ...options
  })
}

/**
 * 创建平衡桥接器
 */
export function createBalancedBridge(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: Partial<BridgeOptions> = {}
): EnhancedTaichiThreeBridge {
  return createBridge(renderer, scene, camera, {
    ...PRESETS.BALANCED,
    ...options
  })
}

/**
 * 创建移动设备桥接器
 */
export function createMobileBridge(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: Partial<BridgeOptions> = {}
): EnhancedTaichiThreeBridge {
  return createBridge(renderer, scene, camera, {
    ...PRESETS.MOBILE,
    ...options
  })
}

/**
 * 智能创建桥接器
 * 根据设备性能自动选择最佳预设
 */
export function createSmartBridge(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: Partial<BridgeOptions> = {}
): EnhancedTaichiThreeBridge {
  // 检测设备能力
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
  const isLowEnd = (navigator.hardwareConcurrency || 4) <= 2

  let preset: Partial<BridgeOptions>

  if (isMobile || isLowEnd) {
    preset = PRESETS.MOBILE
  } else if ((navigator.hardwareConcurrency || 4) >= 8) {
    preset = PRESETS.ULTRA
  } else {
    preset = PRESETS.BALANCED
  }

  return createBridge(renderer, scene, camera, {
    ...preset,
    ...options
  })
}
