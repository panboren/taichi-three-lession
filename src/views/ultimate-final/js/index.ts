/**
 * ============================================================================
 * 🚀 终极 Taichi.js + Three.js 集成桥接器 - 入口文件
 * ============================================================================
 *
 * 版本: Final Ultimate v1.0
 *
 * @author AI Assistant
 * @license MIT
 */

// 导出主类和类型
export {
  UltimateTaichiThreeBridge,
  createUltimateTaichiThreeBridge,
  createDefaultUltimateBridge
} from './UltimateTaichiThreeBridge'

export type {
  UltimateTransferMode,
  UltimatePerformanceMetrics,
  UltimateBridgeOptions,
  TaichiEngine,
  TaichiField
} from './UltimateTaichiThreeBridge'

// 导出示例 (可选, 仅用于开发/测试)
export {
  example1_BasicIntegration,
  example2_AdvancedConfiguration,
  example3_PerformanceMonitoring,
  example4_ModeSwitching,
  example5_CustomMesh,
  example6_MultipleMaterials,
  example7_ResponsiveResize,
  example8_ErrorHandling,
  example9_ResourceCleanup,
  runAllExamples
} from './examples'

// 导出常量
export const VERSION = '1.0.0'
export const NAME = 'Ultimate Taichi-Three Bridge'

/**
 * 快速开始示例
 *
 * ```typescript
 * import { createDefaultUltimateBridge } from '@your-package/ultimate-bridge';
 *
 * const bridge = await createDefaultUltimateBridge(
 *   renderer,
 *   scene,
 *   camera,
 *   taichiEngine
 * );
 *
 * bridge.start();
 * ```
 */

/**
 * 完整配置示例
 *
 * ```typescript
 * import { UltimateTaichiThreeBridge, UltimateTransferMode } from '@your-package/ultimate-bridge';
 *
 * const bridge = new UltimateTaichiThreeBridge({
 *   renderer,
 *   scene,
 *   camera,
 *   mode: UltimateTransferMode.WebGPUSharedTexture,
 *   enableAdaptiveResolution: true,
 *   targetFps: 60,
 *   // ... 更多配置
 * });
 *
 * await bridge.init(taichiEngine);
 * ```
 */
