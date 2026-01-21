<template>
  <div class="ultimate-page">
    <!-- 3D 渲染容器 -->
    <div ref="canvasContainer" class="canvas-container"></div>

    <!-- 性能监控面板 -->
    <div class="performance-panel">
      <h3>性能监控</h3>
      <div class="metric">
        <span>FPS:</span>
        <span :class="fpsClass">{{ performanceData.fps.toFixed(1) }}</span>
      </div>
      <div class="metric">
        <span>平均帧时间:</span>
        <span>{{ performanceData.avgFrameTime.toFixed(2) }}ms</span>
      </div>
      <div class="metric">
        <span>传输时间:</span>
        <span>{{ performanceData.avgTransferTime.toFixed(2) }}ms</span>
      </div>
      <div class="metric">
        <span>传输模式:</span>
        <span class="mode-badge">{{ currentMode }}</span>
      </div>
      <div class="metric">
        <span>稳定性:</span>
        <span :class="stabilityClass">
          {{ (performanceData.stabilityScore * 100).toFixed(1) }}%
        </span>
      </div>
      <div class="metric">
        <span>分辨率:</span>
        <span>
          {{ performanceData.currentResolution.width }}x{{
            performanceData.currentResolution.height
          }}
        </span>
      </div>
      <div class="metric">
        <span>趋势:</span>
        <span :class="trendClass">{{ trendEmoji }} {{ trendText }}</span>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>控制面板</h3>
      <div class="control-group">
        <label>传输模式:</label>
        <select v-model="selectedMode" :disabled="autoMode" @change="changeMode">
          <option value="auto">自动选择</option>
          <option value="webgpu-shared-texture">WebGPU 共享纹理</option>
          <option value="transferable-imagebitmap">Transferable ImageBitmap</option>
          <option value="offscreen-worker">Offscreen Worker</option>
          <option value="webgl2-pbo">WebGL2 PBO</option>
          <option value="offscreen-imagebitmap">Offscreen ImageBitmap</option>
          <option value="canvas-texture">Canvas 纹理</option>
          <option value="pixel-buffer">像素缓冲区</option>
        </select>
      </div>
      <div class="control-group">
        <label>自适应分辨率:</label>
        <input v-model="adaptiveResolution" type="checkbox" @change="toggleAdaptiveResolution" />
      </div>
      <div class="control-group">
        <label>自动模式切换:</label>
        <input v-model="autoMode" type="checkbox" @change="toggleAutoMode" />
      </div>
      <div class="control-group">
        <label>目标 FPS: {{ targetFps }}</label>
        <input
          v-model.number="targetFps"
          type="range"
          min="30"
          max="120"
          @input="updateTargetFps"
        />
      </div>
      <div class="control-group">
        <label>粒子数量: {{ particleCount }}</label>
        <input
          v-model.number="particleCount"
          type="range"
          min="100"
          max="10000"
          step="100"
          @input="updateParticleCount"
        />
      </div>
    </div>

    <!-- 场景信息 -->
    <div class="info-panel">
      <h3>场景信息</h3>
      <p>Taichi.js + Three.js 高性能集成演示</p>
      <p>粒子系统: {{ particleCount }} 个粒子</p>
      <p>物理模拟: 实时计算</p>
      <p>渲染: GPU 加速</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>初始化 Taichi.js 和 Three.js...</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-overlay">
      <p>{{ error }}</p>
      <button @click="error = ''">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import Stats from 'stats.js'
import type { UltimateTaichiThreeBridge, TaichiEngine } from './js/UltimateTaichiThreeBridge'
import {
  UltimateTransferMode,
  type UltimatePerformanceMetrics
} from './js/UltimateTaichiThreeBridge'

// DOM 引用
const canvasContainer = ref<HTMLDivElement>()

// 状态管理
const loading = ref(true)
const error = ref('')
const selectedMode = ref<UltimateTransferMode | 'auto'>('auto')
const autoMode = ref(true)
const adaptiveResolution = ref(false)
const targetFps = ref(60)
const particleCount = ref(1000)

// 性能数据
const performanceData = ref<UltimatePerformanceMetrics>({
  mode: UltimateTransferMode.CanvasTexture,
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
})

const currentMode = ref('CanvasTexture')

// 计算属性
const fpsClass = computed(() => {
  const fps = performanceData.value.fps
  if (fps >= 55) return 'good'
  if (fps >= 30) return 'warning'
  return 'bad'
})

const stabilityClass = computed(() => {
  const score = performanceData.value.stabilityScore
  if (score >= 0.8) return 'good'
  if (score >= 0.5) return 'warning'
  return 'bad'
})

const trendText = computed(() => {
  const trend = performanceData.value.predictedTrend
  switch (trend) {
    case 'improving':
      return '上升'
    case 'stable':
      return '稳定'
    case 'degrading':
      return '下降'
    default:
      return '未知'
  }
})

const trendEmoji = computed(() => {
  const trend = performanceData.value.predictedTrend
  switch (trend) {
    case 'improving':
      return '📈'
    case 'stable':
      return '➡️'
    case 'degrading':
      return '📉'
    default:
      return '❓'
  }
})

const trendClass = computed(() => {
  const trend = performanceData.value.predictedTrend
  switch (trend) {
    case 'improving':
      return 'good'
    case 'stable':
      return 'warning'
    case 'degrading':
      return 'bad'
    default:
      return ''
  }
})

// 全局变量
let bridge: UltimateTaichiThreeBridge | null = null
let threeScene: THREE.Scene | null = null
let threeCamera: THREE.PerspectiveCamera | null = null
let threeRenderer: THREE.WebGLRenderer | null = null
let animationId: number | null = null
let particleSystem: THREE.Points | null = null
let particleGeometry: THREE.BufferGeometry | null = null
let stats: Stats | null = null

// 初始化
onMounted(async () => {
  try {
    await initTaichiThree()
    loading.value = false
  } catch (err) {
    error.value = `初始化失败: ${err}`
    loading.value = false
  }
})

// 清理
onUnmounted(() => {
  cleanup()
})

// 创建 Taichi 模拟引擎
function createTaichiEngine(): TaichiEngine {
  const particlePositions = new Float32Array(particleCount.value * 3)
  const particleColors = new Float32Array(particleCount.value * 3)

  // 初始化粒子位置和颜色
  for (let i = 0; i < particleCount.value; i++) {
    const i3 = i * 3
    // 球形分布
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 2 + Math.random() * 2

    particlePositions[i3] = r * Math.sin(phi) * Math.cos(theta)
    particlePositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    particlePositions[i3 + 2] = r * Math.cos(phi)

    // 彩虹颜色
    particleColors[i3] = Math.random()
    particleColors[i3 + 1] = Math.random()
    particleColors[i3 + 2] = Math.random()
  }

  return {
    getPixelData: async () => {
      // 模拟 Taichi 计算像素数据
      const width = 512
      const height = 512
      const data = new Uint8Array(width * height * 4)

      for (let i = 0; i < width * height; i++) {
        const i4 = i * 4
        const x = i % width
        const y = Math.floor(i / width)
        const time = performance.now() * 0.001

        // 创建动态图案
        const nx = x / width - 0.5
        const ny = y / height - 0.5
        const dist = Math.sqrt(nx * nx + ny * ny)
        const angle = Math.atan2(ny, nx) + time

        data[i4] = Math.floor(127 + 127 * Math.sin(angle * 5 + dist * 10))
        data[i4 + 1] = Math.floor(127 + 127 * Math.cos(angle * 5 - dist * 10))
        data[i4 + 2] = Math.floor(127 + 127 * Math.sin(angle * 3 + time * 2))
        data[i4 + 3] = 255
      }

      return data.buffer as ArrayBuffer
    },

    runKernel: async (name: string, time: number) => {
      // 模拟内核执行
      return null
    },

    sync: async () => {
      // 模拟同步
    },

    update: (time?: number) => {
      // 模拟更新
    }
  }
}

// 更新粒子系统
function updateParticles(time: number) {
  if (!particleSystem || !particleGeometry) return

  const positions = particleGeometry.attributes.position.array as Float32Array
  const colors = particleGeometry.attributes.color.array as Float32Array

  for (let i = 0; i < particleCount.value; i++) {
    const i3 = i * 3

    // 旋转粒子
    const x = positions[i3]
    const y = positions[i3 + 1]
    const z = positions[i3 + 2]

    const speed = 0.001 * ((i % 5) + 1)
    const rotSpeed = time * speed

    const cosT = Math.cos(rotSpeed)
    const sinT = Math.sin(rotSpeed)

    // Y 轴旋转
    positions[i3] = x * cosT - z * sinT
    positions[i3 + 2] = x * sinT + z * cosT

    // 动态颜色
    colors[i3] = (Math.sin(time * 0.001 + i * 0.1) + 1) * 0.5
    colors[i3 + 1] = (Math.cos(time * 0.001 + i * 0.1) + 1) * 0.5
    colors[i3 + 2] = (Math.sin(time * 0.0015 + i * 0.2) + 1) * 0.5
  }

  particleGeometry.attributes.position.needsUpdate = true
  particleGeometry.attributes.color.needsUpdate = true
}

// 初始化 Taichi + Three.js
async function initTaichiThree() {
  if (!canvasContainer.value) return

  // 1. 初始化 Three.js 场景
  threeScene = new THREE.Scene()
  threeScene.background = new THREE.Color(0x0a0a1a)

  // 2. 创建相机
  threeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  threeCamera.position.z = 5

  // 3. 创建 Three.js 渲染器
  threeRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  threeRenderer.setSize(window.innerWidth, window.innerHeight)
  threeRenderer.setPixelRatio(window.devicePixelRatio)
  canvasContainer.value.appendChild(threeRenderer.domElement)

  // 4. 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  threeScene.add(ambientLight)

  const pointLight1 = new THREE.PointLight(0x00ff88, 1, 100)
  pointLight1.position.set(5, 5, 5)
  threeScene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0x0088ff, 1, 100)
  pointLight2.position.set(-5, -5, 5)
  threeScene.add(pointLight2)

  // 5. 创建粒子系统
  particleGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount.value * 3)
  const colors = new Float32Array(particleCount.value * 3)

  // 初始化粒子
  for (let i = 0; i < particleCount.value; i++) {
    const i3 = i * 3
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 2 + Math.random() * 2

    positions[i3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = r * Math.cos(phi)

    colors[i3] = Math.random()
    colors[i3 + 1] = Math.random()
    colors[i3 + 2] = Math.random()
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  particleSystem = new THREE.Points(particleGeometry, particleMaterial)
  threeScene.add(particleSystem)

  // 6. 创建 Taichi 桥接器
  const taichiEngine = createTaichiEngine()

  // 导入 UltimateTaichiThreeBridge
  const { UltimateTaichiThreeBridge } = await import('./js/UltimateTaichiThreeBridge')

  bridge = new UltimateTaichiThreeBridge({
    renderer: threeRenderer,
    scene: threeScene,
    camera: threeCamera,
    width: 512,
    height: 512,
    maxResolution: 2048,
    minResolution: 256,
    mode: autoMode.value ? UltimateTransferMode.CanvasTexture : selectedMode.value,
    autoDetectMode: autoMode.value,
    enableModeFallback: autoMode.value,
    enableAdaptiveResolution: adaptiveResolution.value,
    targetFps: targetFps.value,
    fallbackThreshold: 45,
    upgradeThreshold: 55,
    textureLinear: true,
    enableWebGL2PBO: true,
    performance: {
      enabled: true,
      enablePrediction: true,
      updateInterval: 500,
      historySize: 120
    },
    caching: {
      enabled: true,
      enableLRUCache: true,
      enableObjectPool: true
    },
    onPerformanceUpdate: metrics => {
      performanceData.value = metrics
      currentMode.value = metrics.mode
    }
  })

  // 7. 初始化桥接器
  await bridge.init(taichiEngine)

  // 8. 初始化 stats.js 性能监控
  initStats()

  // 9. 开始渲染循环
  startRenderLoop()
}

// 初始化 stats.js
function initStats() {
  stats = new Stats()
  stats.showPanel(0) // 0: fps, 1: ms
  stats.dom.style.position = 'absolute'
  stats.dom.style.top = '20px'
  stats.dom.style.right = '270px'
  stats.dom.style.zIndex = '100'
  document.body.appendChild(stats.dom)
}

// 渲染循环
function startRenderLoop() {
  function animate(time: number) {
    animationId = requestAnimationFrame(animate)

    if (!bridge || !threeRenderer || !threeCamera || !threeScene) return

    // 更新 stats.js
    stats?.begin()

    // 更新粒子
    updateParticles(time)

    // 更新桥接器
    bridge.step(time)

    // 旋转粒子系统
    if (particleSystem) {
      particleSystem.rotation.y += 0.001
      particleSystem.rotation.x += 0.0005
    }

    // Three.js 渲染
    threeRenderer.render(threeScene, threeCamera)

    // 结束 stats.js 监控
    stats?.end()
  }
  animate(0)
}

// 切换模式
async function changeMode() {
  if (!bridge) return

  const mode =
    selectedMode.value === 'auto'
      ? UltimateTransferMode.CanvasTexture
      : (selectedMode.value as UltimateTransferMode)

  try {
    await bridge['switchMode'](mode)
  } catch (err) {
    error.value = `切换模式失败: ${err}`
  }
}

// 切换自适应分辨率
function toggleAdaptiveResolution() {
  if (!bridge) return
  bridge.options.enableAdaptiveResolution = adaptiveResolution.value
}

// 切换自动模式
function toggleAutoMode() {
  if (!bridge) return
  if (autoMode.value) {
    selectedMode.value = 'auto'
  }
}

// 更新目标 FPS
function updateTargetFps() {
  if (!bridge) return
  bridge.options.targetFps = targetFps.value
}

// 更新粒子数量
function updateParticleCount() {
  // 重新初始化粒子系统
  if (particleSystem && particleGeometry) {
    threeScene?.remove(particleSystem)

    const positions = new Float32Array(particleCount.value * 3)
    const colors = new Float32Array(particleCount.value * 3)

    for (let i = 0; i < particleCount.value; i++) {
      const i3 = i * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2 + Math.random() * 2

      positions[i3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = r * Math.cos(phi)

      colors[i3] = Math.random()
      colors[i3 + 1] = Math.random()
      colors[i3 + 2] = Math.random()
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    particleSystem = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      })
    )

    threeScene?.add(particleSystem)
  }
}

// 清理资源
function cleanup() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }

  bridge?.dispose()
  bridge = null

  threeRenderer?.dispose()
  threeRenderer = null

  if (particleGeometry) {
    particleGeometry.dispose()
    particleGeometry = null
  }

  if (threeScene) {
    threeScene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
    threeScene.clear()
  }

  // 移除 stats.js
  if (stats && stats.dom && stats.dom.parentNode) {
    stats.dom.parentNode.removeChild(stats.dom)
  }
  stats = null

  threeScene = null
  threeCamera = null
  particleSystem = null
}

// 窗口大小调整
window.addEventListener('resize', () => {
  if (!threeCamera || !threeRenderer) return

  const width = window.innerWidth
  const height = window.innerHeight

  threeCamera.aspect = width / height
  threeCamera.updateProjectionMatrix()
  threeRenderer.setSize(width, height)
})
</script>

<style scoped lang="scss">
.ultimate-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%);
}

.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.performance-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(10, 10, 26, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 136, 0.2);
  color: #fff;
  padding: 15px;
  border-radius: 12px;
  font-size: 14px;
  min-width: 240px;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 255, 136, 0.1);

  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #00ff88;
    font-weight: 600;
  }

  .metric {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 8px 0;
    padding: 4px 0;

    span:first-child {
      color: #aaa;
    }

    span:last-child {
      font-weight: 600;

      &.good {
        color: #00ff88;
      }
      &.warning {
        color: #ffaa00;
      }
      &.bad {
        color: #ff4444;
      }
    }

    .mode-badge {
      background: rgba(0, 255, 136, 0.2);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: #00ff88;
    }
  }
}

.control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(10, 10, 26, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 136, 255, 0.2);
  color: #fff;
  padding: 15px;
  border-radius: 12px;
  font-size: 14px;
  min-width: 240px;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 136, 255, 0.1);

  h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #0088ff;
    font-weight: 600;
  }

  .control-group {
    margin-bottom: 16px;

    label {
      display: block;
      margin-bottom: 6px;
      color: #ccc;
      font-size: 13px;
    }

    select {
      width: 100%;
      padding: 8px 12px;
      background: rgba(42, 42, 58, 0.8);
      color: #fff;
      border: 1px solid #444;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #0088ff;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    input[type='range'] {
      width: 100%;
      cursor: pointer;
      accent-color: #0088ff;
    }

    input[type='checkbox'] {
      cursor: pointer;
      transform: scale(1.3);
      accent-color: #0088ff;
    }
  }
}

.info-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(10, 10, 26, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 170, 0, 0.2);
  color: #fff;
  padding: 15px;
  border-radius: 12px;
  font-size: 13px;
  min-width: 200px;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(255, 170, 0, 0.1);

  h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #ffaa00;
    font-weight: 600;
  }

  p {
    margin: 6px 0;
    color: #aaa;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 26, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: #fff;

  .spinner {
    width: 60px;
    height: 60px;
    border: 4px solid #1a1a2e;
    border-top-color: #00ff88;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 24px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  p {
    font-size: 16px;
    color: #00ff88;
  }
}

.error-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.95);
  color: #fff;
  padding: 24px;
  border-radius: 12px;
  z-index: 1000;
  text-align: center;
  box-shadow: 0 4px 30px rgba(255, 0, 0, 0.3);

  p {
    margin-bottom: 16px;
    font-size: 15px;
  }

  button {
    padding: 10px 24px;
    background: #fff;
    color: #000;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
    }
  }
}
</style>
