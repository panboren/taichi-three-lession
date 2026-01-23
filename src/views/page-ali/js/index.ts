/**
 * 入口文件
 */
export { UltimateTaichiThreeBridge } from './UltimateTaichiThreeBridge'
export {
  UltimateTransferMode,
  UltimatePerformanceMetrics,
  UltimateBridgeOptions,
  TaichiEngine
} from './types'

export function createUltimateTaichiThreeBridge(
  options: UltimateBridgeOptions
): UltimateTaichiThreeBridge {
  return new UltimateTaichiThreeBridge(options)
}

export async function createDefaultUltimateBridge(
  renderer: any, // THREE.WebGLRenderer
  scene: any, // THREE.Scene
  camera: any, // THREE.Camera
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
  })

  return bridge.init(taichiEngine)
}
