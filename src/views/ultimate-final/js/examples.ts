/**
 * 终极桥接器使用示例
 *
 * 本文件包含各种使用场景的示例代码
 */

import * as THREE from 'three'
import {
  UltimateTaichiThreeBridge,
  UltimateTransferMode,
  TaichiEngine,
  createUltimateTaichiThreeBridge,
  createDefaultUltimateBridge,
  UltimatePerformanceMetrics
} from './UltimateTaichiThreeBridge'

// ==================== 示例 1: 基础集成 ====================

/**
 * 示例 1: 最简单的使用方式
 */
export async function example1_BasicIntegration() {
  console.log('=== 示例 1: 基础集成 ===')

  // 1. 初始化 Three.js
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // 2. 创建 Taichi 引擎 (模拟)
  const taichiEngine: TaichiEngine = {
    runKernel: async (name: string, time: number) => {
      // 模拟 Taichi 计算
      console.log(`Running kernel: ${name} at time: ${time}`)
    },
    getPixelData: async () => {
      // 模拟返回像素数据
      return new ArrayBuffer(512 * 512 * 4)
    }
  }

  // 3. 创建桥接器 (自动选择最优模式)
  const bridge = await createDefaultUltimateBridge(renderer, scene, camera, taichiEngine)

  // 4. 动画循环
  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()

  // 5. 监控性能
  setInterval(() => {
    const metrics = bridge.getMetrics()
    console.log(`FPS: ${metrics.fps.toFixed(1)}, Mode: ${metrics.mode}`)
  }, 1000)

  return bridge
}

// ==================== 示例 2: 高级配置 ====================

/**
 * 示例 2: 完整的高级配置
 */
export async function example2_AdvancedConfiguration() {
  console.log('=== 示例 2: 高级配置 ===')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const taichiEngine: TaichiEngine = {
    runKernel: async (name: string, time: number) => {
      console.log(`Running kernel: ${name}`)
    },
    getPixelData: async () => {
      return new ArrayBuffer(1024 * 1024 * 4)
    }
  }

  // 创建桥接器并配置所有选项
  const bridge = new UltimateTaichiThreeBridge({
    renderer,
    scene,
    camera,

    // 渲染设置
    width: 1024,
    height: 1024,
    maxResolution: 2048,
    minResolution: 256,
    enableAdaptiveResolution: true,
    targetFps: 60,

    // 强制使用特定模式 (可选)
    mode: UltimateTransferMode.TransferableImageBitmap,

    // 纹理设置
    planeSize: { width: 4, height: 4 },
    textureLinear: true,

    // WebGL2 PBO 优化
    enableWebGL2PBO: true,
    pboBufferSize: 16,

    // WebGPU 设置
    webgpu: {
      enabled: true,
      preferredFormat: 'rgba8unorm',
      powerPreference: 'high-performance',
      enableSharedTexture: true
    },

    // OffscreenCanvas 设置
    offscreen: {
      enabled: true,
      enableTransferable: true,
      enableWorker: false
    },

    // 缓存池化
    caching: {
      enabled: true,
      textureCacheSize: 10,
      enableLRUCache: true,
      enableObjectPool: true
    },

    // 性能监控
    performance: {
      enabled: true,
      updateInterval: 1000,
      enablePrediction: true,
      historySize: 120
    },

    // 回调
    onBeforeStep: time => {
      console.log(`[Before Step] time: ${time.toFixed(2)}`)
    },
    onAfterStep: time => {
      console.log(`[After Step] time: ${time.toFixed(2)}`)
    },
    onPerformanceUpdate: metrics => {
      console.log(
        `[Performance] FPS: ${metrics.fps.toFixed(1)}, ` +
          `Transfer: ${metrics.avgTransferTime.toFixed(2)}ms, ` +
          `Stability: ${metrics.stabilityScore.toFixed(2)}`
      )
    },
    onModeChange: (from, to) => {
      console.log(`[Mode Change] ${from} -> ${to}`)
    },
    onResolutionChange: (from, to) => {
      console.log(`[Resolution Change] ${from.width}x${from.height} -> ${to.width}x${to.height}`)
    },
    onError: (error, context) => {
      console.error(`[Error] ${context}:`, error)
    },
    onWarning: warning => {
      console.warn(`[Warning] ${warning}`)
    }
  })

  await bridge.init(taichiEngine)

  // 动画循环
  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()

  return bridge
}

// ==================== 示例 3: 性能监控和预测 ====================

/**
 * 示例 3: 实时性能监控和预测
 */
export async function example3_PerformanceMonitoring() {
  console.log('=== 示例 3: 性能监控 ===')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const taichiEngine: TaichiEngine = {
    runKernel: async (name: string, time: number) => {},
    getPixelData: async () => new ArrayBuffer(512 * 512 * 4)
  }

  const bridge = new UltimateTaichiThreeBridge({
    renderer,
    scene,
    camera,
    performance: {
      enabled: true,
      updateInterval: 500,
      enablePrediction: true,
      enableProfiling: true
    },
    onPerformanceUpdate: (metrics: UltimatePerformanceMetrics) => {
      // 实时显示性能指标
      console.log(
        `
FPS: ${metrics.fps.toFixed(1)} / ${metrics.avgFps.toFixed(1)} / ${metrics.minFps.toFixed(1)}-${metrics.maxFps.toFixed(1)}
Transfer: ${metrics.avgTransferTime.toFixed(2)}ms
Compute: ${metrics.avgComputeTime.toFixed(2)}ms
Frame Time: ${metrics.avgFrameTime.toFixed(2)}ms (σ: ${metrics.frameTimeStdDev.toFixed(2)})
Data: ${(metrics.dataTransferSize / 1024).toFixed(1)}KB / ${metrics.dataThroughput.toFixed(1)}MB/s
Stability: ${(metrics.stabilityScore * 100).toFixed(1)}%
Drops: ${metrics.dropFrameCount} / ${metrics.frameCount}
Predicted: ${metrics.predictedFps.toFixed(1)} FPS (${metrics.predictedTrend})
Resolution: ${metrics.currentResolution.width}x${metrics.currentResolution.height}
Mode: ${metrics.mode}
      `.trim()
      )
    }
  })

  await bridge.init(taichiEngine)

  // 定期检查性能预测
  setInterval(() => {
    const prediction = bridge.predictPerformance()
    console.log('Performance Prediction:', prediction)

    if (prediction.shouldFallback) {
      console.warn('⚠️ Performance is low, consider downgrading mode')
    }
    if (prediction.shouldUpgrade) {
      console.log('✅ Performance is good, consider upgrading mode')
    }
  }, 2000)

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()

  return bridge
}

// ==================== 示例 4: 模式切换 ====================

/**
 * 示例 4: 手动和自动模式切换
 */
export async function example4_ModeSwitching() {
  console.log('=== 示例 4: 模式切换 ===')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const taichiEngine: TaichiEngine = {
    runKernel: async (name: string, time: number) => {},
    getPixelData: async () => new ArrayBuffer(512 * 512 * 4)
  }

  const bridge = new UltimateTaichiThreeBridge({
    renderer,
    scene,
    camera,
    mode: UltimateTransferMode.CanvasTexture, // 从最兼容的模式开始
    autoDetectMode: true,
    enableModeFallback: true,
    fallbackThreshold: 45,
    upgradeThreshold: 55,
    onModeChange: (from, to) => {
      console.log(`🔄 Mode switched: ${from} -> ${to}`)
      const metrics = bridge.getMetrics()
      console.log(`   FPS: ${metrics.fps.toFixed(1)}`)
    }
  })

  await bridge.init(taichiEngine)

  // 手动切换模式 (如果需要)
  setTimeout(async () => {
    console.log('Manually switching to TransferableImageBitmap mode...')
    await bridge.switchMode(UltimateTransferMode.TransferableImageBitmap)
  }, 5000)

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()

  return bridge
}

// ==================== 示例 5: 自定义 Mesh ====================

/**
 * 示例 5: 使用自定义 Mesh 而不是默认平面
 */
export async function example5_CustomMesh() {
  console.log('=== 示例 5: 自定义 Mesh ===')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 2

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const taichiEngine: TaichiEngine = {
    runKernel: async (name: string, time: number) => {},
    getPixelData: async () => new ArrayBuffer(512 * 512 * 4)
  }

  const bridge = new UltimateTaichiThreeBridge({
    renderer,
    scene,
    camera,
    planeSize: { width: 2, height: 2 }
  })

  await bridge.init(taichiEngine)

  // 创建自定义几何体
  const geometry = new THREE.SphereGeometry(1, 64, 64)
  const material = new THREE.MeshBasicMaterial({
    map: bridge.texture,
    side: THREE.DoubleSide
  })
  const customMesh = new THREE.Mesh(geometry, material)

  // 设置自定义 Mesh
  bridge.setMesh(customMesh)

  function animate() {
    requestAnimationFrame(animate)
    customMesh.rotation.y += 0.01
    renderer.render(scene, camera)
  }
  animate()

  return bridge
}

// ==================== 示例 6: 多纹理应用 ====================

/**
 * 示例 6: 将同一纹理应用到多个材质
 */
export async function example6_MultipleMaterials() {
  console.log('=== 示例 6: 多纹理应用 ===')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const taichiEngine: TaichiEngine = {
    runKernel: async (name: string, time: number) => {},
    getPixelData: async () => new ArrayBuffer(512 * 512 * 4)
  }

  const bridge = new UltimateTaichiThreeBridge({
    renderer,
    scene,
    camera
  })

  await bridge.init(taichiEngine)

  // 移除默认 mesh
  if (bridge.mesh) {
    scene.remove(bridge.mesh)
  }

  // 创建多个使用相同纹理的 Mesh
  const materials = [
    new THREE.MeshBasicMaterial({ map: bridge.texture }),
    new THREE.MeshBasicMaterial({ map: bridge.texture, transparent: true, opacity: 0.8 }),
    new THREE.MeshBasicMaterial({ map: bridge.texture, side: THREE.BackSide })
  ]

  const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.7, 32, 32),
    new THREE.TorusGeometry(0.5, 0.2, 16, 100)
  ]

  geometries.forEach((geometry, i) => {
    const mesh = new THREE.Mesh(geometry, materials[i])
    mesh.position.x = (i - 1) * 2
    scene.add(mesh)
  })

  function animate() {
    requestAnimationFrame(animate)
    geometries.forEach((geometry, i) => {
      const mesh = scene.children[i] as THREE.Mesh
      mesh.rotation.x += 0.01 * (i + 1)
      mesh.rotation.y += 0.02 * (i + 1)
    })
    renderer.render(scene, camera)
  }
  animate()

  return bridge
}

// ==================== 示例 7: 响应式调整 ====================

/**
 * 示例 7: 响应窗口大小变化
 */
export async function example7_ResponsiveResize() {
  console.log('=== 示例 7: 响应式调整 ===')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const taichiEngine: TaichiEngine = {
    runKernel: async (name: string, time: number) => {},
    getPixelData: async () => new ArrayBuffer(512 * 512 * 4)
  }

  const bridge = new UltimateTaichiThreeBridge({
    renderer,
    scene,
    camera,
    enableAdaptiveResolution: true,
    maxResolution: 1024,
    minResolution: 256,
    onResolutionChange: (from, to) => {
      console.log(`📐 Resolution changed: ${from.width}x${from.height} -> ${to.width}x${to.height}`)
    }
  })

  await bridge.init(taichiEngine)

  // 响应窗口大小变化
  window.addEventListener('resize', async () => {
    const width = window.innerWidth
    const height = window.innerHeight

    // 更新 renderer
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    // 更新桥接器分辨率
    const newWidth = Math.min(1024, Math.floor(width * 0.5))
    const newHeight = Math.min(1024, Math.floor(height * 0.5))
    await bridge.setSize(newWidth, newHeight)
  })

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()

  return bridge
}

// ==================== 示例 8: 错误处理 ====================

/**
 * 示例 8: 完善的错误处理
 */
export async function example8_ErrorHandling() {
  console.log('=== 示例 8: 错误处理 ===')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const taichiEngine: TaichiEngine = {
    runKernel: async (name: string, time: number) => {
      // 模拟可能的错误
      if (Math.random() > 0.95) {
        throw new Error('Random kernel error')
      }
    },
    getPixelData: async () => {
      if (Math.random() > 0.98) {
        throw new Error('Random pixel data error')
      }
      return new ArrayBuffer(512 * 512 * 4)
    }
  }

  const bridge = new UltimateTaichiThreeBridge({
    renderer,
    scene,
    camera,
    onBeforeStep: time => {
      try {
        // 可能抛出错误的代码
      } catch (error) {
        console.error('Error in onBeforeStep:', error)
      }
    },
    onAfterStep: time => {
      try {
        // 可能抛出错误的代码
      } catch (error) {
        console.error('Error in onAfterStep:', error)
      }
    },
    onError: (error, context) => {
      console.error(`❌ [${context}] Error:`, error.message)

      // 根据错误类型采取不同的处理
      if (error.message.includes('WebGPU')) {
        console.log('   ↳ Falling back to WebGL2 mode...')
        bridge.switchMode(UltimateTransferMode.WebGL2PBO)
      } else if (error.message.includes('OutOfMemory')) {
        console.log('   ↳ Reducing resolution...')
        bridge.setSize(256, 256)
      }
    },
    onWarning: warning => {
      console.warn(`⚠️ Warning: ${warning}`)
    }
  })

  try {
    await bridge.init(taichiEngine)
  } catch (error) {
    console.error('Failed to initialize bridge:', error)
    return null
  }

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()

  return bridge
}

// ==================== 示例 9: 资源清理 ====================

/**
 * 示例 9: 正确的资源清理
 */
export async function example9_ResourceCleanup() {
  console.log('=== 示例 9: 资源清理 ===')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const taichiEngine: TaichiEngine = {
    runKernel: async (name: string, time: number) => {},
    getPixelData: async () => new ArrayBuffer(512 * 512 * 4),
    dispose: () => {
      console.log('Taichi engine disposed')
    }
  }

  const bridge = new UltimateTaichiThreeBridge({
    renderer,
    scene,
    camera
  })

  await bridge.init(taichiEngine)

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()

  // 10 秒后清理资源
  setTimeout(() => {
    console.log('Cleaning up resources...')

    // 1. 停止桥接器
    bridge.stop()

    // 2. 销毁桥接器 (会清理所有资源)
    bridge.dispose()

    // 3. 清理 Three.js 资源
    scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose())
        } else {
          object.material.dispose()
        }
      }
    })

    // 4. 清理 renderer
    renderer.dispose()

    // 5. 移除 DOM 元素
    if (renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement)
    }

    console.log('✅ All resources cleaned up')
  }, 10000)

  return bridge
}

// ==================== 主入口 ====================

/**
 * 运行所有示例 (用于测试)
 */
export async function runAllExamples() {
  console.log('🚀 Running all examples...\n')

  const examples = [
    { name: 'Basic Integration', fn: example1_BasicIntegration },
    { name: 'Advanced Configuration', fn: example2_AdvancedConfiguration },
    { name: 'Performance Monitoring', fn: example3_PerformanceMonitoring },
    { name: 'Mode Switching', fn: example4_ModeSwitching },
    { name: 'Custom Mesh', fn: example5_CustomMesh },
    { name: 'Multiple Materials', fn: example6_MultipleMaterials },
    { name: 'Responsive Resize', fn: example7_ResponsiveResize },
    { name: 'Error Handling', fn: example8_ErrorHandling },
    { name: 'Resource Cleanup', fn: example9_ResourceCleanup }
  ]

  for (const example of examples) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Running: ${example.name}`)
    console.log(`${'='.repeat(60)}\n`)

    try {
      const bridge = await example.fn()
      console.log(`✅ ${example.name} completed successfully\n`)

      // 等待 5 秒后清理
      await new Promise(resolve => setTimeout(resolve, 5000))

      if (bridge) {
        bridge.dispose()
      }
    } catch (error) {
      console.error(`❌ ${example.name} failed:`, error)
    }
  }

  console.log('\n🎉 All examples completed!')
}

// 如果直接运行此文件
if (typeof window !== 'undefined' && (window as any).runExamples) {
  runAllExamples()
}
