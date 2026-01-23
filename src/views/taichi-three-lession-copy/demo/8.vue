<template>
  <div class="performance-page">
    <div id="canvas-container" class="canvas-container"></div>
    <div class="info-panel">
      <h3>课程8: 性能优化与自适应控制</h3>
      <p>粒子数量: {{ currentParticleCount }}</p>
      <p>FPS: {{ fps }}</p>
      <p>目标FPS: {{ targetFps }}</p>
      <p>质量等级: {{ qualityLevel }}</p>
      <p>分辨率缩放: {{ resolutionScale.toFixed(2) }}x</p>
      <div class="charts">
        <div class="chart">
          <h4>FPS 历史</h4>
          <div class="chart-bars">
            <div
              v-for="(value, index) in fpsHistory"
              :key="index"
              class="bar"
              :style="{ height: `${(value / 60) * 100}%`, background: getFpsColor(value) }"
            ></div>
          </div>
        </div>
      </div>
      <div class="controls">
        <button @click="toggleAutoQuality">
          {{ autoQuality ? '禁用自动' : '启用自动' }}质量控制
        </button>
        <button @click="increaseQuality">提高质量</button>
        <button @click="decreaseQuality">降低质量</button>
        <button @click="resetSimulation">重置</button>
      </div>
      <div class="params" v-if="!autoQuality">
        <label>
          粒子数:
          <input
            type="range"
            v-model.number="manualParticleCount"
            min="1000"
            max="50000"
            step="1000"
            @change="manualUpdate"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from 'vue'

// 状态
const currentParticleCount = ref(15000)
const fps = ref(60)
const targetFps = ref(60)
const qualityLevel = ref('高')
const resolutionScale = ref(1.0)
const autoQuality = ref(true)
const manualParticleCount = ref(15000)

// FPS 历史
const fpsHistory = ref<number[]>([])
const MAX_HISTORY = 60

// 质量等级
enum QualityLevel {
  Low = 0,
  Medium = 1,
  High = 2,
  Ultra = 3
}

const qualitySettings = {
  [QualityLevel.Low]: { particles: 5000, resolution: 0.5, name: '低' },
  [QualityLevel.Medium]: { particles: 15000, resolution: 0.75, name: '中' },
  [QualityLevel.High]: { particles: 30000, resolution: 1.0, name: '高' },
  [QualityLevel.Ultra]: { particles: 50000, resolution: 1.5, name: '超高' }
}

let currentQuality = QualityLevel.High

// Three.js 变量
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let particles: THREE.Points | null = null
let animationId: number = 0

// 粒子数据
let positions: Float32Array = new Float32Array(0)
let colors: Float32Array = new Float32Array(0)

// 性能监控
let frameCount = 0
let lastTime = performance.now()
let lastQualityUpdate = performance.now()
const QUALITY_UPDATE_INTERVAL = 2000 // 2秒更新一次质量

// 初始化 Three.js
function initThreeJS() {
  console.log('初始化 Three.js...')

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020205)

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  )
  camera.position.set(0, 0, 20)

  renderer = new THREE.WebGLRenderer({
    antialias: false, // 性能优化：禁用抗锯齿
    powerPreference: 'high-performance' // 性能优化：优先使用高性能GPU
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio * resolutionScale.value, 2))

  const container = document.getElementById('canvas-container')
  if (container) {
    container.appendChild(renderer.domElement)
  }

  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)

  console.log('Three.js 初始化成功')
}

// 创建粒子系统
function createParticles() {
  const count = currentParticleCount.value

  // 重建粒子系统
  if (particles) {
    scene?.remove(particles)
    particles.geometry.dispose()
    particles.material.dispose()
  }

  positions = new Float32Array(count * 3)
  colors = new Float32Array(count * 3)

  // 初始化粒子
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 螺旋分布
    const angle = i * 0.1
    const radius = 5 + Math.random() * 5

    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = Math.sin(angle) * radius
    positions[i3 + 2] = (Math.random() - 0.5) * 10

    // 颜色
    const hue = i / count
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  particles = new THREE.Points(geometry, material)
  scene?.add(particles)

  console.log(`创建了 ${count} 个粒子`)
}

// 更新粒子
function updateParticles() {
  if (!particles) return

  const count = currentParticleCount.value
  const time = performance.now() * 0.001

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 螺旋运动
    const angle = time * 0.5 + i * 0.0001
    const radius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2)

    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = Math.sin(angle) * radius
    positions[i3 + 2] = Math.sin(time * 0.3 + i * 0.01) * 5

    // 更新颜色
    const hue = (i / count + time * 0.1) % 1
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  particles.geometry.attributes.position.needsUpdate = true
  particles.geometry.attributes.color.needsUpdate = true
}

// 自适应质量控制
function updateQualityControl() {
  const now = performance.now()
  if (now - lastQualityUpdate < QUALITY_UPDATE_INTERVAL) return

  lastQualityUpdate = now

  if (fps.value < targetFps.value - 5) {
    // FPS过低，降低质量
    decreaseQuality()
  } else if (fps.value > targetFps.value + 5 && currentQuality < QualityLevel.Ultra) {
    // FPS稳定，尝试提高质量
    increaseQuality()
  }
}

// 增加质量
function increaseQuality() {
  if (currentQuality < QualityLevel.Ultra) {
    currentQuality++
    applyQualitySettings()
  }
}

// 降低质量
function decreaseQuality() {
  if (currentQuality > QualityLevel.Low) {
    currentQuality--
    applyQualitySettings()
  }
}

// 应用质量设置
function applyQualitySettings() {
  const settings = qualitySettings[currentQuality]
  currentParticleCount.value = settings.particles
  resolutionScale.value = settings.resolution
  qualityLevel.value = settings.name

  // 更新渲染器分辨率
  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio * resolutionScale.value, 2))
  }

  // 重建粒子系统
  createParticles()
}

// 手动更新
function manualUpdate() {
  autoQuality.value = false
  currentParticleCount.value = manualParticleCount.value
  createParticles()
}

// 切换自动质量控制
function toggleAutoQuality() {
  autoQuality.value = !autoQuality.value
  if (autoQuality.value) {
    // 重新启用自动质量控制
    currentQuality = QualityLevel.High
    applyQualitySettings()
  }
}

// 获取FPS颜色
function getFpsColor(value: number): string {
  if (value >= 55) return '#00ff00'
  if (value >= 45) return '#ffff00'
  if (value >= 30) return '#ff8800'
  return '#ff0000'
}

// 更新FPS历史
function updateFpsHistory() {
  fpsHistory.value.push(fps.value)
  if (fpsHistory.value.length > MAX_HISTORY) {
    fpsHistory.value.shift()
  }
}

// 动画循环
function animate() {
  animationId = requestAnimationFrame(animate)

  const currentTime = performance.now()

  // 更新粒子
  updateParticles()

  // 渲染
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }

  // FPS计算
  frameCount++
  if (currentTime - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
    frameCount = 0
    lastTime = currentTime

    // 更新FPS历史
    updateFpsHistory()

    // 自动质量控制
    if (autoQuality.value) {
      updateQualityControl()
    }
  }
}

// 重置模拟
function resetSimulation() {
  fpsHistory.value = []
  currentQuality = QualityLevel.High
  if (autoQuality.value) {
    applyQualitySettings()
  } else {
    createParticles()
  }
}

// 窗口大小变化
function onWindowResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 清理
function cleanup() {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onWindowResize)

  if (renderer) {
    const container = document.getElementById('canvas-container')
    if (container && renderer.domElement && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement)
    }
    renderer.dispose()
  }

  if (particles) {
    particles.geometry.dispose()
    particles.material.dispose()
  }
}

onMounted(() => {
  initThreeJS()
  createParticles()
  animate()
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
.performance-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.info-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 20px;
  background: rgba(2, 2, 5, 0.95);
  color: white;
  border-radius: 12px;
  font-family: Arial, sans-serif;
  pointer-events: auto;
  max-width: 340px;
  border: 1px solid rgba(0, 255, 100, 0.3);

  h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #00ff64;
  }

  p {
    margin: 8px 0;
    font-size: 14px;

    strong {
      color: #00ff64;
    }
  }

  .charts {
    margin: 15px 0;

    .chart {
      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #888;
      }

      .chart-bars {
        display: flex;
        align-items: flex-end;
        gap: 2px;
        height: 80px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        padding: 4px;

        .bar {
          flex: 1;
          min-width: 3px;
          border-radius: 2px;
          transition: height 0.2s;
        }
      }
    }
  }

  .controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 15px;

    button {
      padding: 10px 12px;
      background: linear-gradient(135deg, #00ff64 0%, #00cc50 100%);
      color: #000;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: bold;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 255, 100, 0.4);
      }

      &:active {
        transform: translateY(0);
      }

      &:nth-child(4) {
        grid-column: span 2;
        background: linear-gradient(135deg, #4488ff 0%, #2266cc 100%);
        color: white;
      }
    }
  }

  .params {
    margin-top: 15px;

    label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;

      input[type="range"] {
        flex: 1;
        cursor: pointer;
      }
    }
  }
}
</style>
