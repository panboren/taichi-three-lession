<template>
  <div class="tutorial-page">
    <!-- 左侧面板 - 教程导航和说明 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h1>Taichi.js + Three.js 教程</h1>
        <p>增强版桥接器实战案例</p>
      </div>

      <!-- 教程选择 -->
      <div class="tutorial-selector">
        <el-select v-model="currentTutorial" placeholder="选择教程" size="large">
          <el-option
            v-for="tutorial in tutorials"
            :key="tutorial.id"
            :label="tutorial.title"
            :value="tutorial.id"
          >
            <span>{{ tutorial.icon }} {{ tutorial.title }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ tutorial.level }}
            </span>
          </el-option>
        </el-select>
      </div>

      <!-- 当前教程说明 -->
      <div class="tutorial-info">
        <h2>{{ currentTutorialData.title }}</h2>
        <div class="level-badge">{{ currentTutorialData.level }}</div>
        <p class="description">{{ currentTutorialData.description }}</p>

        <div class="feature-list">
          <h3>功能特点</h3>
          <ul>
            <li v-for="feature in currentTutorialData.features" :key="feature">✓ {{ feature }}</li>
          </ul>
        </div>

        <div class="code-preview">
          <h3>代码示例</h3>
          <pre><code>{{ currentTutorialData.code }}</code></pre>
        </div>
      </div>

      <!-- 控制面板 -->
      <div class="control-panel">
        <h3>控制面板</h3>

        <!-- 传输模式 -->
        <div class="control-group">
          <label>传输模式</label>
          <el-select v-model="selectedMode" @change="handleModeChange">
            <el-option label="Transferable (高性能)" value="transferable" />
            <el-option label="WebGL2 PBO (中性能)" value="webgl2pbo" />
            <el-option label="DataTexture (精确控制)" value="datatexture" />
            <el-option label="Canvas (兼容性最好)" value="canvas" />
          </el-select>
        </div>

        <!-- 分辨率 -->
        <div class="control-group">
          <label>分辨率</label>
          <el-slider
            v-model="resolution"
            :min="256"
            :max="2048"
            :step="64"
            @change="(value: number) => handleResolutionChange(value)"
          />
          <span class="value">{{ resolution }}x{{ resolution }}</span>
        </div>

        <!-- 粒子数量 -->
        <div class="control-group">
          <label>粒子数量</label>
          <el-slider
            v-model="particleCount"
            :min="1000"
            :max="100000"
            :step="1000"
            @change="(value: number) => handleParticleCountChange(value)"
          />
          <span class="value">{{ particleCount }}</span>
        </div>

        <!-- 功能开关 -->
        <div class="control-group">
          <el-checkbox v-model="enableAdaptive" @change="(val: boolean) => handleAdaptiveChange(val)">
            自适应分辨率
          </el-checkbox>
        </div>

        <div class="control-group">
          <el-checkbox v-model="enableAutoOpt" @change="(val: boolean) => handleAutoOptChange(val)">自动优化</el-checkbox>
        </div>

        <div class="control-group">
          <el-checkbox v-model="enableRotation" @change="(val: boolean) => handleRotationChange(val)">
            旋转粒子系统
          </el-checkbox>
        </div>

        <!-- 按钮 -->
        <div class="button-group">
          <el-button type="primary" :loading="loading" @click="restart">重新开始</el-button>
          <el-button @click="togglePause">
            {{ paused ? '继续' : '暂停' }}
          </el-button>
          <el-button type="danger" @click="resetStats">重置统计</el-button>
        </div>
      </div>
    </div>

    <!-- 右侧主区域 -->
    <div class="main-content">
      <!-- 3D 场景容器 -->
      <div ref="canvasContainer" class="canvas-container"></div>

      <!-- 性能监控面板 -->
      <div class="performance-panel">
        <div class="panel-header">
          <h3>性能监控</h3>
          <span class="status" :class="performanceStatus">{{ performanceStatusText }}</span>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">FPS</div>
            <div class="metric-value" :class="fpsClass">{{ metrics.fps.toFixed(1) }}</div>
            <div v-if="metrics.predictedTrend !== 'stable'" class="metric-trend">
              {{ trendIcon }} {{ metrics.predictedTrend }}
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-label">平均帧时间</div>
            <div class="metric-value">{{ metrics.avgFrameTime.toFixed(2) }}ms</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">传输时间</div>
            <div class="metric-value">{{ metrics.avgTransferTime.toFixed(2) }}ms</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">稳定性</div>
            <div class="metric-value" :class="stabilityClass">
              {{ (metrics.stabilityScore * 100).toFixed(1) }}%
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-label">传输模式</div>
            <div class="metric-value mode-badge">{{ metrics.mode }}</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">分辨率</div>
            <div class="metric-value">
              {{ metrics.currentResolution.width }}x{{ metrics.currentResolution.height }}
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-label">帧数</div>
            <div class="metric-value">{{ metrics.frameCount }}</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">丢帧数</div>
            <div class="metric-value warning">{{ metrics.dropFrameCount }}</div>
          </div>
        </div>

        <!-- 性能预测 -->
        <div class="prediction-section">
          <h4>性能预测</h4>
          <div class="prediction-grid">
            <div class="prediction-item">
              <span>预测 FPS:</span>
              <span :class="predictionClass">{{ prediction.nextFps.toFixed(1) }}</span>
            </div>
            <div class="prediction-item">
              <span>趋势:</span>
              <span :class="trendClass">{{ predictionText }}</span>
            </div>
            <div class="prediction-item">
              <span>建议:</span>
              <span>{{ suggestionText }}</span>
            </div>
          </div>
        </div>

        <!-- 性能历史图表 -->
        <div class="chart-section">
          <h4>FPS 历史</h4>
          <div ref="fpsChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 事件日志 -->
      <div class="log-panel">
        <div class="panel-header">
          <h3>事件日志</h3>
          <el-button size="small" @click="clearLogs">清空</el-button>
        </div>
        <div ref="logContainer" class="log-content">
          <div v-for="(log, index) in logs" :key="index" :class="['log-item', `log-${log.type}`]">
            <span class="log-time">{{ formatTime(log.time) }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { createSmartBridge } from './js'
import { TransportMode, type PerformanceMetrics } from './js/types'

// 教程数据
const tutorials = [
  {
    id: 'basic',
    icon: '📚',
    title: '01. 基础用法',
    level: '入门',
    description: '学习如何创建和初始化桥接器,建立基础的 Taichi.js + Three.js 渲染管道。',
    features: ['创建桥接器实例', '初始化 Taichi 引擎', '启动渲染循环', '基础性能监控'],
    code: `const bridge = createSmartBridge(renderer, scene, camera)
await bridge.init(taichiEngine)
bridge.start()`
  },
  {
    id: 'transport',
    icon: '🚀',
    title: '02. 传输模式',
    level: '进阶',
    description: '深入了解5种传输模式的工作原理和性能特点,选择最适合的方案。',
    features: [
      'WebGPU 零拷贝传输',
      'Transferable 高性能模式',
      'WebGL2 PBO 异步传输',
      'DataTexture 精确控制',
      'Canvas 兼容性模式'
    ],
    code: `// 手动切换传输模式
await bridge.switchMode(TransportMode.Transferable)

// 检查支持的模式
const supported = bridge.getSupportedModes()`
  },
  {
    id: 'adaptive',
    icon: '📊',
    title: '03. 自适应分辨率',
    level: '进阶',
    description: '实现动态分辨率调整,在保持流畅体验的同时最大化渲染质量。',
    features: ['自动性能检测', '动态分辨率缩放', '目标 FPS 控制', '性能阈值配置'],
    code: `const bridge = createSmartBridge(renderer, scene, camera, {
  enableAdaptiveResolution: true,
  targetFps: 60,
  maxResolution: 2048,
  minResolution: 256
})`
  },
  {
    id: 'custom',
    icon: '🎨',
    title: '04. 自定义渲染',
    level: '高级',
    description: '使用自定义 Mesh 和材质,创建独特的视觉效果。',
    features: ['自定义几何体', '自定义材质', '多纹理应用', '高级着色器'],
    code: `// 创建自定义 Mesh
const geometry = new THREE.SphereGeometry(1, 64, 64)
const material = new THREE.MeshStandardMaterial({
  map: bridge.texture,
  roughness: 0.5
})
bridge.setMesh(new THREE.Mesh(geometry, material))`
  },
  {
    id: 'optimize',
    icon: '⚡',
    title: '05. 性能优化',
    level: '高级',
    description: '掌握性能监控和优化技巧,实现最佳渲染效果。',
    features: ['实时性能指标', '性能预测算法', '自动优化策略', '资源管理'],
    code: `// 获取性能指标
const metrics = bridge.getMetrics()

// 性能预测
const prediction = bridge.predictPerformance()

// 手动优化
await bridge.optimize()`
  },
  {
    id: 'advanced',
    icon: '🌟',
    title: '06. 高级应用',
    level: '专家',
    description: '综合运用所有功能,创建高性能的实时渲染应用。',
    features: ['流体模拟', '地形生成', '粒子系统', '光线追踪'],
    code: `// 综合配置
const bridge = createSmartBridge(renderer, scene, camera, {
  enableAdaptiveResolution: true,
  enableAutoOptimization: true,
  performance: {
    enablePrediction: true,
    historySize: 120
  }
})`
  }
]

// 状态变量
const currentTutorial = ref('basic')
const selectedMode = ref('transferable')
const resolution = ref(1024)
const particleCount = ref(10000)
const enableAdaptive = ref(false)
const enableAutoOpt = ref(true)
const enableRotation = ref(true)
const paused = ref(false)
const loading = ref(false)

// 性能数据
const metrics = ref<PerformanceMetrics>({
  mode: 'transferable' as TransportMode,
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
  currentResolution: { width: 1024, height: 1024 },
  lastUpdate: performance.now()
})

const prediction = ref({
  nextFps: 60,
  trend: 'stable' as 'improving' | 'stable' | 'degrading',
  shouldFallback: false,
  shouldUpgrade: false
})

// 日志
const logs = ref<Array<{ time: number; type: string; message: string }>>([])

// Three.js 和桥接器
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let bridge: any = null
let particleSystem: THREE.Points | null = null
let animationId: number | null = null

// DOM 引用
const canvasContainer = ref<HTMLElement>()
const logContainer = ref<HTMLElement>()

// 计算属性
const currentTutorialData = computed(() => {
  return tutorials.find(t => t.id === currentTutorial.value) || tutorials[0]
})

const performanceStatus = computed(() => {
  const fps = metrics.value.fps
  if (fps >= 55) return 'good'
  if (fps >= 30) return 'medium'
  return 'bad'
})

const performanceStatusText = computed(() => {
  const status = performanceStatus.value
  if (status === 'good') return '优秀'
  if (status === 'medium') return '一般'
  return '较差'
})

const fpsClass = computed(() => {
  const fps = metrics.value.fps
  if (fps >= 55) return 'good'
  if (fps >= 30) return 'medium'
  return 'bad'
})

const stabilityClass = computed(() => {
  const score = metrics.value.stabilityScore
  if (score >= 0.9) return 'good'
  if (score >= 0.7) return 'medium'
  return 'bad'
})

const trendIcon = computed(() => {
  const trend = metrics.value.predictedTrend
  if (trend === 'improving') return '📈'
  if (trend === 'degrading') return '📉'
  return '➡️'
})

const predictionClass = computed(() => {
  const nextFps = prediction.value.nextFps
  if (nextFps >= 55) return 'good'
  if (nextFps >= 30) return 'medium'
  return 'bad'
})

const trendClass = computed(() => {
  const trend = prediction.value.trend
  if (trend === 'improving') return 'improving'
  if (trend === 'degrading') return 'degrading'
  return 'stable'
})

const predictionText = computed(() => {
  const trend = prediction.value.trend
  if (trend === 'improving') return '📈 提升'
  if (trend === 'degrading') return '📉 下降'
  return '➡️ 稳定'
})

const suggestionText = computed(() => {
  if (prediction.value.shouldFallback) return '⚠️ 建议降低性能'
  if (prediction.value.shouldUpgrade) return '✅ 可以提升性能'
  return '✨ 当前状态良好'
})

// 添加日志
function addLog(type: string, message: string) {
  logs.value.unshift({
    time: Date.now(),
    type,
    message
  })

  // 限制日志数量
  if (logs.value.length > 100) {
    logs.value.pop()
  }

  // 自动滚动
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = 0
    }
  })
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

function clearLogs() {
  logs.value = []
}

// 初始化 Three.js
async function initThree() {
  const container = canvasContainer.value
  if (!container) {
    console.error('[initThree] canvasContainer not found')
    return
  }

  console.log('[initThree] Starting initialization, container size:', container.clientWidth, container.clientHeight)

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0f)
  console.log('[initThree] Scene created')

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 3
  console.log('[initThree] Camera created')

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)
  console.log('[initThree] Renderer created and added to container')

  // 创建粒子系统
  createParticleSystem()

  // 创建桥接器（会创建一个平面显示 Taichi 渲染结果）
  await createBridge()

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  // 开始渲染
  startRenderLoop()

  addLog('info', 'Three.js 初始化完成')
}

// 创建粒子系统
function createParticleSystem() {
  const count = particleCount.value
  const geometry = new THREE.BufferGeometry()

  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    // 位置:球面分布
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = 1

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    // 颜色: 渐变
    const t = i / count
    colors[i * 3] = t
    colors[i * 3 + 1] = 1 - t
    colors[i * 3 + 2] = 0.5

    // 大小
    sizes[i] = Math.random() * 2 + 1
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.PointsMaterial({
    size: 0.01,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  })

  particleSystem = new THREE.Points(geometry, material)
  particleSystem.position.x = -0.8
  scene.add(particleSystem)

  addLog('info', `创建粒子系统: ${count} 个粒子`)
}

// 创建桥接器
async function createBridge() {
  try {
    bridge = createSmartBridge(renderer, scene, camera, {
      width: resolution.value,
      height: resolution.value,
      maxResolution: 2048,
      minResolution: 256,
      preferredMode: selectedMode.value as TransportMode,
      enableAdaptiveResolution: enableAdaptive.value,
      targetFps: 60,
      enableAutoOptimization: enableAutoOpt.value,
      planeSize: { width: 1.2, height: 1.2 },
      performance: {
        enabled: true,
        updateInterval: 500,
        enablePrediction: true,
        historySize: 120
      },
      onPerformanceUpdate: m => {
        metrics.value = m
        updatePrediction()
      },
      onModeChange: (from, to) => {
        addLog('info', `传输模式切换: ${from} -> ${to}`)
      },
      onResolutionChange: (from, to) => {
        addLog('info', `分辨率调整: ${from.width}x${from.height} -> ${to.width}x${to.height}`)
      },
      onError: error => {
        addLog('error', `错误: ${error.message}`)
      },
      onWarning: warning => {
        addLog('warning', `警告: ${warning}`)
      }
    })

    // 创建模拟的 Taichi 引擎
    const mockTaichiEngine = createMockTaichiEngine()

    // 初始化桥接器
    await bridge.init(mockTaichiEngine)

    // 启动桥接器渲染
    bridge.start()

    addLog('success', '桥接器初始化完成')
    addLog('info', `传输模式: ${bridge.getCurrentMode()}`)
  } catch (error) {
    console.error('Failed to create bridge:', error)
    addLog('error', `创建桥接器失败: ${(error as Error).message}`)
  }
}

// 创建模拟的 Taichi 引擎
function createMockTaichiEngine() {
  return {
    async getPixelData() {
      // 模拟生成像素数据
      const width = resolution.value
      const height = resolution.value
      const data = new Uint8Array(width * height * 4)

      const time = performance.now() / 1000

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4

          // 创建渐变色效果
          const nx = x / width
          const ny = y / height

          data[i] = Math.floor((Math.sin(time + nx * 10) * 0.5 + 0.5) * 255) // R
          data[i + 1] = Math.floor((Math.cos(time + ny * 10) * 0.5 + 0.5) * 255) // G
          data[i + 2] = Math.floor((Math.sin(time + (nx + ny) * 5) * 0.5 + 0.5) * 255) // B
          data[i + 3] = 255 // A
        }
      }

      return data.buffer
    }
  }
}

// 更新性能预测
function updatePrediction() {
  if (!bridge) return

  try {
    prediction.value = bridge.predictPerformance()
  } catch (error) {
    console.error('Failed to get prediction:', error)
  }
}

// 开始渲染循环
function startRenderLoop() {
  function animate() {
    if (paused.value) {
      animationId = requestAnimationFrame(animate)
      return
    }

    // 更新粒子
    if (particleSystem && enableRotation.value) {
      particleSystem.rotation.y += 0.001
      particleSystem.rotation.x += 0.0005
    }

    // Three.js 渲染
    renderer.render(scene, camera)

    animationId = requestAnimationFrame(animate)
  }

  addLog('success', '渲染循环启动')
}

// 事件处理
async function handleModeChange(mode: string) {
  if (!bridge) return

  try {
    const success = await bridge.switchMode(mode as TransportMode)
    if (success) {
      addLog('success', `切换到 ${mode} 模式`)
    } else {
      addLog('error', `切换到 ${mode} 模式失败`)
    }
  } catch (error) {
    addLog('error', `模式切换错误: ${(error as Error).message}`)
  }
}

async function handleResolutionChange(res: number) {
  if (!bridge) return

  try {
    await bridge.setSize(res, res)
    addLog('success', `分辨率调整为 ${res}x${res}`)
  } catch (error) {
    addLog('error', `分辨率调整失败: ${(error as Error).message}`)
  }
}

function handleParticleCountChange(count: number) {
  if (particleSystem) {
    scene.remove(particleSystem)
    particleSystem = null
  }
  createParticleSystem()
  addLog('info', `粒子数量调整为 ${count}`)
}

function handleAdaptiveChange(enabled: boolean) {
  addLog('info', `自适应分辨率 ${enabled ? '已启用' : '已禁用'}`)
}

function handleAutoOptChange(enabled: boolean) {
  addLog('info', `自动优化 ${enabled ? '已启用' : '已禁用'}`)
}

function handleRotationChange(enabled: boolean) {
  addLog('info', `旋转动画 ${enabled ? '已启用' : '已禁用'}`)
}

function togglePause() {
  paused.value = !paused.value
  addLog('info', paused.value ? '已暂停' : '已继续')
}

function resetStats() {
  logs.value = []
  metrics.value = {
    mode: 'transferable' as TransportMode,
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
    currentResolution: { width: resolution.value, height: resolution.value },
    lastUpdate: performance.now()
  }
  prediction.value = {
    nextFps: 60,
    trend: 'stable' as 'improving' | 'stable' | 'degrading',
    shouldFallback: false,
    shouldUpgrade: false
  }
  addLog('info', '统计已重置')
}

async function restart() {
  loading.value = true
  paused.value = true

  // 清理
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  if (bridge) {
    bridge.dispose()
    bridge = null
  }

  if (particleSystem) {
    scene.remove(particleSystem)
    particleSystem = null
  }

  // 重新初始化
  await nextTick()
  createParticleSystem()
  await createBridge()

  paused.value = false
  requestAnimationFrame(() => startRenderLoop())

  loading.value = false
  addLog('success', '已重新开始')
}

// 窗口大小调整
function onWindowResize() {
  const container = canvasContainer.value
  if (!container || !camera || !renderer) return

  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()

  renderer.setSize(container.clientWidth, container.clientHeight)
}

// 组件挂载
onMounted(async () => {
  addLog('info', '正在初始化...')
  await initThree()
  window.addEventListener('resize', onWindowResize)
})

// 组件卸载
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  if (bridge) {
    bridge.dispose()
    bridge = null
  }

  if (renderer) {
    renderer.dispose()
  }

  window.removeEventListener('resize', onWindowResize)
})
</script>

<style scoped lang="scss">
.tutorial-page {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: #0a0a0f;
  overflow: hidden;
}

// 左侧边栏
.sidebar {
  width: 380px;
  background: #1a1a24;
  border-right: 1px solid #2a2a3a;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    padding: 24px;
    border-bottom: 1px solid #2a2a3a;

    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 8px 0;
    }

    p {
      font-size: 14px;
      color: #888;
      margin: 0;
    }
  }

  .tutorial-selector {
    padding: 16px 24px;
    border-bottom: 1px solid #2a2a3a;

    :deep(.el-select) {
      width: 100%;

      .el-input__wrapper {
        background: #2a2a3a;
        box-shadow: none;
        border: 1px solid #3a3a4a;

        &:hover {
          border-color: #4a4a5a;
        }
      }
    }
  }

  .tutorial-info {
    padding: 24px;
    border-bottom: 1px solid #2a2a3a;

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .level-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #3b82f6;
      color: #fff;
      font-size: 12px;
      border-radius: 4px;
      margin-bottom: 12px;
    }

    .description {
      font-size: 14px;
      color: #aaa;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }

    .feature-list {
      h3 {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        margin: 0 0 8px 0;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          font-size: 13px;
          color: #888;
          padding: 4px 0;

          &:before {
            content: '✓ ';
            color: #10b981;
            margin-right: 4px;
          }
        }
      }
    }

    .code-preview {
      margin-top: 16px;

      h3 {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        margin: 0 0 8px 0;
      }

      pre {
        background: #0d0d14;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 0;

        code {
          font-size: 12px;
          color: #10b981;
          font-family: 'Courier New', monospace;
          line-height: 1.5;
        }
      }
    }
  }

  .control-panel {
    padding: 24px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 16px 0;
    }

    .control-group {
      margin-bottom: 16px;

      label {
        display: block;
        font-size: 13px;
        color: #aaa;
        margin-bottom: 8px;
      }

      :deep(.el-slider) {
        .el-slider__runway {
          background: #2a2a3a;
        }

        .el-slider__bar {
          background: #3b82f6;
        }

        .el-slider__button {
          border-color: #3b82f6;
        }
      }

      .value {
        display: inline-block;
        font-size: 12px;
        color: #3b82f6;
        margin-left: 8px;
      }

      :deep(.el-checkbox) {
        .el-checkbox__label {
          color: #aaa;
        }
      }

      :deep(.el-select) {
        width: 100%;

        .el-input__wrapper {
          background: #2a2a3a;
          box-shadow: none;
          border: 1px solid #3a3a4a;
        }
      }
    }

    .button-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      :deep(.el-button) {
        flex: 1;
        min-width: 80px;
      }
    }
  }
}

// 右侧主内容
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  position: relative;
  background: #0a0a0f;
  overflow: hidden;

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
}

// 性能面板
.performance-panel {
  padding: 16px 24px;
  background: #1a1a24;
  border-top: 1px solid #2a2a3a;
  max-height: 400px;
  overflow-y: auto;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;

      &.good {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
      }

      &.medium {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
      }

      &.bad {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .metric-card {
    background: #2a2a3a;
    padding: 12px;
    border-radius: 8px;
    position: relative;

    .metric-label {
      font-size: 12px;
      color: #888;
      margin-bottom: 4px;
    }

    .metric-value {
      font-size: 20px;
      font-weight: 600;
      color: #fff;

      &.good {
        color: #10b981;
      }

      &.medium {
        color: #f59e0b;
      }

      &.bad {
        color: #ef4444;
      }

      &.warning {
        color: #f59e0b;
      }

      &.mode-badge {
        font-size: 14px;
        background: #3b82f6;
        padding: 2px 8px;
        border-radius: 4px;
        display: inline-block;
      }
    }

    .metric-trend {
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: 12px;
    }
  }

  .prediction-section {
    background: #0d0d14;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;

    h4 {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 8px 0;
    }

    .prediction-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;

      .prediction-item {
        display: flex;
        justify-content: space-between;
        font-size: 13px;

        span:first-child {
          color: #888;
        }

        span:last-child {
          font-weight: 600;

          &.good {
            color: #10b981;
          }

          &.medium {
            color: #f59e0b;
          }

          &.bad {
            color: #ef4444;
          }

          &.improving {
            color: #10b981;
          }

          &.degrading {
            color: #ef4444;
          }

          &.stable {
            color: #3b82f6;
          }
        }
      }
    }
  }

  .chart-section {
    h4 {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 8px 0;
    }

    .chart-container {
      height: 120px;
      background: #0d0d14;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 13px;
    }
  }
}

// 日志面板
.log-panel {
  padding: 16px 24px;
  background: #1a1a24;
  border-top: 1px solid #2a2a3a;
  max-height: 200px;
  overflow-y: auto;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }
  }

  .log-content {
    max-height: 140px;
    overflow-y: auto;

    .log-item {
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px solid #2a2a3a;

      &:last-child {
        border-bottom: none;
      }

      .log-time {
        color: #666;
        margin-right: 8px;
      }

      .log-message {
        color: #aaa;

        .log-info & {
          color: #3b82f6;
        }

        .log-success & {
          color: #10b981;
        }

        .log-warning & {
          color: #f59e0b;
        }

        .log-error & {
          color: #ef4444;
        }
      }
    }
  }
}

// 滚动条样式
.sidebar,
.performance-panel,
.log-panel {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #0a0a0f;
  }

  &::-webkit-scrollbar-thumb {
    background: #3a3a4a;
    border-radius: 3px;

    &:hover {
      background: #4a4a5a;
    }
  }
}
</style>
