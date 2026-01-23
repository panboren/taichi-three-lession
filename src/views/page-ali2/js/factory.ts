import * as THREE from 'three'
import { TaichiThreeBridge } from './TaichiThreeBridge'
import { BridgeOptions, TransportMode } from './types'

// 预设配置
const PRESETS = {
  PERFORMANCE: {
    preferredMode: TransportMode.WebGPU,
    enableAdaptiveResolution: false,
    targetFps: 60,
    width: 1024,
    height: 1024
  } as Partial<BridgeOptions>,

  COMPATIBILITY: {
    preferredMode: TransportMode.Canvas,
    enableAdaptiveResolution: true,
    targetFps: 30,
    width: 512,
    height: 512
  } as Partial<BridgeOptions>,

  BALANCED: {
    preferredMode: TransportMode.Transferable,
    enableAdaptiveResolution: true,
    targetFps: 45,
    width: 768,
    height: 768
  } as Partial<BridgeOptions>
}

export function createBridge(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: Partial<BridgeOptions> = {}
): TaichiThreeBridge {
  const bridgeOptions: BridgeOptions = {
    renderer,
    scene,
    camera,
    width: 512,
    height: 512,
    targetFps: 60,
    enableAdaptiveResolution: false,
    ...options
  }

  return new TaichiThreeBridge(bridgeOptions)
}

export function createPerformanceBridge(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: Partial<BridgeOptions> = {}
): TaichiThreeBridge {
  return createBridge(renderer, scene, camera, {
    ...PRESETS.PERFORMANCE,
    ...options
  })
}

export function createCompatibilityBridge(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: Partial<BridgeOptions> = {}
): TaichiThreeBridge {
  return createBridge(renderer, scene, camera, {
    ...PRESETS.COMPATIBILITY,
    ...options
  })
}

export function createBalancedBridge(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: Partial<BridgeOptions> = {}
): TaichiThreeBridge {
  return createBridge(renderer, scene, camera, {
    ...PRESETS.BALANCED,
    ...options
  })
}
