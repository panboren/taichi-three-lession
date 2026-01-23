<template>
  <div class="project-page">
    <div id="canvas-container" class="canvas-container"></div>
    <div class="info-panel">
      <h3>课程10: 综合项目 - 完整粒子系统</h3>
      <p>粒子数量: {{ particleCount }}</p>
      <p>FPS: {{ fps }}</p>
      <p>当前模式: {{ currentModeName }}</p>
      <div class="mode-selector">
        <button
          v-for="mode in modes"
          :key="mode.id"
          @click="switchMode(mode.id)"
          :class="{ active: currentMode === mode.id }"
        >
          {{ mode.name }}
        </button>
      </div>
      <div class="controls">
        <button @click="togglePause">{{ isPaused ? '继续' : '暂停' }}</button>
        <button @click="toggleBloom">{{ bloomEnabled ? '禁用' : '启用' }}辉光</button>
        <button @click="resetSimulation">重置</button>
      </div>
      <div class="tips">
        <p>💡 提示: 尝试不同模式，观察粒子系统如何适应不同场景</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { onMounted, onUnmounted, ref } from 'vue'

// 状态
const particleCount = ref(20000)
const fps = ref(60)
const currentMode = ref('galaxy')
const currentModeName = ref('银河系')
const isPaused = ref(false)
const bloomEnabled = ref(true)

// 模式定义
interface Mode {
  id: string
  name: string
  setup: () => void
  update: (time: number) => void
}

const modes: Mode[] = [
  { id: 'galaxy', name: '银河系', setup: setupGalaxy, update: updateGalaxy },
  { id: 'fireworks', name: '烟花', setup: setupFireworks, update: updateFireworks },
  { id: 'snow', name: '雪花', setup: setupSnow, update: updateSnow },
  { id: 'matrix', name: '矩阵', setup: setupMatrix, update: updateMatrix },
  { id: 'vortex', name: '旋涡', setup: setupVortex, update: updateVortex }
]

// Three.js 变量
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let particles: THREE.Points | null = null
let composer: EffectComposer | null = null
let bloomPass: UnrealBloomPass | null = null
let animationId: number = 0

// 粒子数据
let positions: Float32Array = new Float32Array(0)
let velocities: Float32Array = new Float32Array(0)
let colors: Float32Array = new Float32Array(0)
let sizes: Float32Array = new Float32Array(0)
let lifetimes: Float32Array = new Float32Array(0)

// 性能监控
let frameCount = 0
let lastTime = performance.now()
let fireworks: Array<{ position: THREE.Vector3; velocity: THREE.Vector3; color: THREE.Color; time: number }> = []

// 初始化 Three.js
function initThreeJS() {
  console.log('初始化 Three.js...')

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000005)

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 20, 40)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: false })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const container = document.getElementById('canvas-container')
  if (container) {
    container.appendChild(renderer.domElement)
  }

  // 后处理
  composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  )
  bloomPass.threshold = 0
  bloomPass.strength = 1.5
  bloomPass.radius = 0.5
  composer.addPass(bloomPass)

  console.log('Three.js 初始化成功')
}

// 创建粒子系统
function createParticles() {
  if (particles) {
    scene?.remove(particles)
    particles.geometry.dispose()
    particles.material.dispose()
  }

  const count = particleCount.value
  positions = new Float32Array(count * 3)
  velocities = new Float32Array(count * 3)
  colors = new Float32Array(count * 3)
  sizes = new Float32Array(count)
  lifetimes = new Float32Array(count)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })

  particles = new THREE.Points(geometry, material)
  scene?.add(particles)
}

// ============= 银河系模式 =============
function setupGalaxy() {
  fireworks = []
  const count = particleCount.value

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 螺旋星系
    const arm = i % 3
    const angle = (i / count) * Math.PI * 6 + arm * (Math.PI * 2 / 3)
    const radius = 2 + (i / count) * 25 + Math.random() * 2

    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = (Math.random() - 0.5) * 2
    positions[i3 + 2] = Math.sin(angle) * radius

    velocities[i3] = 0
    velocities[i3 + 1] = 0
    velocities[i3 + 2] = 0

    // 颜色 - 蓝色到黄色渐变
    const hue = 0.5 + (i / count) * 0.3
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b

    sizes[i] = 0.2 + Math.random() * 0.3
    lifetimes[i] = 1
  }
}

function updateGalaxy(time: number) {
  const count = particleCount.value

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 旋转
    const angle = time * 0.1
    const x = positions[i3]
    const z = positions[i3 + 2]
    const dist = Math.sqrt(x * x + z * z)

    const newAngle = Math.atan2(z, x) + angle * (10 / (dist + 5))

    positions[i3] = Math.cos(newAngle) * dist
    positions[i3 + 2] = Math.sin(newAngle) * dist
  }
}

// ============= 烟花模式 =============
function setupFireworks() {
  fireworks = []
  const count = particleCount.value

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    positions[i3] = (Math.random() - 0.5) * 50
    positions[i3 + 1] = -20
    positions[i3 + 2] = (Math.random() - 0.5) * 50

    velocities[i3] = (Math.random() - 0.5) * 0.1
    velocities[i3 + 1] = Math.random() * 0.5 + 0.2
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.1

    const color = new THREE.Color().setHSL(Math.random(), 1, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b

    sizes[i] = 0.3 + Math.random() * 0.2
    lifetimes[i] = Math.random()
  }
}

function updateFireworks(time: number) {
  const count = particleCount.value

  // 发射新烟花
  if (Math.random() < 0.02 && fireworks.length < 5) {
    fireworks.push({
      position: new THREE.Vector3((Math.random() - 0.5) * 20, -20, (Math.random() - 0.5) * 20),
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.2, Math.random() * 0.3 + 0.3, (Math.random() - 0.5) * 0.2),
      color: new THREE.Color().setHSL(Math.random(), 1, 0.6),
      time: time
    })
  }

  // 更新烟花
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 重力
    velocities[i3 + 1] -= 0.01
    velocities[i3] *= 0.98
    velocities[i3 + 1] *= 0.98
    velocities[i3 + 2] *= 0.98

    positions[i3] += velocities[i3]
    positions[i3 + 1] += velocities[i3 + 1]
    positions[i3 + 2] += velocities[i3 + 2]

    lifetimes[i] -= 0.005

    // 重置
    if (lifetimes[i] <= 0 || positions[i3 + 1] < -25) {
      // 从烟花中重新发射
      if (fireworks.length > 0 && Math.random() < 0.1) {
        const fw = fireworks[Math.floor(Math.random() * fireworks.length)]
        positions[i3] = fw.position.x
        positions[i3 + 1] = fw.position.y
        positions[i3 + 2] = fw.position.z

        velocities[i3] = (Math.random() - 0.5) * 0.3
        velocities[i3 + 1] = Math.random() * 0.3
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.3

        colors[i3] = fw.color.r
        colors[i3 + 1] = fw.color.g
        colors[i3 + 2] = fw.color.b

        lifetimes[i] = 1
      } else {
        lifetimes[i] = 0.5
      }
    }
  }

  // 清理旧烟花
  fireworks = fireworks.filter(fw => time - fw.time < 10)
}

// ============= 雪花模式 =============
function setupSnow() {
  fireworks = []
  const count = particleCount.value

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    positions[i3] = (Math.random() - 0.5) * 50
    positions[i3 + 1] = Math.random() * 30 - 15
    positions[i3 + 2] = (Math.random() - 0.5) * 50

    velocities[i3] = (Math.random() - 0.5) * 0.02
    velocities[i3 + 1] = -0.05 - Math.random() * 0.1
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02

    colors[i3] = 1
    colors[i3 + 1] = 1
    colors[i3 + 2] = 1

    sizes[i] = 0.1 + Math.random() * 0.3
    lifetimes[i] = 1
  }
}

function updateSnow(time: number) {
  const count = particleCount.value

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 飘落
    positions[i3] += Math.sin(time + i * 0.1) * 0.01 + velocities[i3]
    positions[i3 + 1] += velocities[i3 + 1]
    positions[i3 + 2] += Math.cos(time + i * 0.1) * 0.01 + velocities[i3 + 2]

    // 重置
    if (positions[i3 + 1] < -20) {
      positions[i3] = (Math.random() - 0.5) * 50
      positions[i3 + 1] = 20
      positions[i3 + 2] = (Math.random() - 0.5) * 50
    }
  }
}

// ============= 矩阵模式 =============
function setupMatrix() {
  fireworks = []
  const count = particleCount.value
  const cols = 100
  const rows = Math.ceil(count / cols)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    const col = i % cols
    const row = Math.floor(i / cols)

    positions[i3] = (col - cols / 2) * 0.5
    positions[i3 + 1] = (row - rows / 2) * 0.5
    positions[i3 + 2] = 0

    velocities[i3] = 0
    velocities[i3 + 1] = 0
    velocities[i3 + 2] = 0

    const color = new THREE.Color().setHSL(0.33, 1, Math.random() * 0.5 + 0.3)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b

    sizes[i] = 0.2
    lifetimes[i] = Math.random()
  }
}

function updateMatrix(time: number) {
  const count = particleCount.value

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 矩阵雨效果
    lifetimes[i] += 0.02

    const brightness = Math.sin(lifetimes[i]) * 0.5 + 0.5
    const color = new THREE.Color().setHSL(0.33, 1, brightness * 0.5 + 0.3)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b

    sizes[i] = 0.2 + brightness * 0.2
  }
}

// ============= 旋涡模式 =============
function setupVortex() {
  fireworks = []
  const count = particleCount.value

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 20

    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = (Math.random() - 0.5) * 10
    positions[i3 + 2] = Math.sin(angle) * radius

    velocities[i3] = 0
    velocities[i3 + 1] = 0
    velocities[i3 + 2] = 0

    const hue = radius / 20
    const color = new THREE.Color().setHSL(hue, 1, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b

    sizes[i] = 0.2 + (1 - radius / 20) * 0.3
    lifetimes[i] = 1
  }
}

function updateVortex(time: number) {
  const count = particleCount.value

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    const x = positions[i3]
    const z = positions[i3 + 2]
    const dist = Math.sqrt(x * x + z * z)

    // 向中心吸引
    const force = 0.02 / (dist + 0.1)
    velocities[i3] -= x * force
    velocities[i3 + 2] -= z * force

    // 旋转
    velocities[i3] -= z * 0.01
    velocities[i3 + 2] += x * 0.01

    // 阻力
    velocities[i3] *= 0.98
    velocities[i3 + 1] *= 0.98
    velocities[i3 + 2] *= 0.98

    positions[i3] += velocities[i3]
    positions[i3 + 1] += velocities[i3 + 1]
    positions[i3 + 2] += velocities[i3 + 2]

    // 重置到外围
    if (dist < 0.5) {
      const angle = Math.random() * Math.PI * 2
      positions[i3] = Math.cos(angle) * 20
      positions[i3 + 1] = (Math.random() - 0.5) * 10
      positions[i3 + 2] = Math.sin(angle) * 20

      velocities[i3] = 0
      velocities[i3 + 1] = 0
      velocities[i3 + 2] = 0
    }
  }
}

// 切换模式
function switchMode(modeId: string) {
  currentMode.value = modeId
  const mode = modes.find(m => m.id === modeId)
  if (mode) {
    currentModeName.value = mode.name
    mode.setup()
    updateParticlesAttributes()
  }
}

// 更新粒子属性
function updateParticlesAttributes() {
  if (!particles) return

  particles.geometry.attributes.position.needsUpdate = true
  particles.geometry.attributes.color.needsUpdate = true
  particles.geometry.attributes.size.needsUpdate = true
}

// 切换暂停
function togglePause() {
  isPaused.value = !isPaused.value
}

// 切换辉光
function toggleBloom() {
  bloomEnabled.value = !bloomEnabled.value
  if (bloomPass) {
    bloomPass.enabled = bloomEnabled.value
  }
}

// 重置模拟
function resetSimulation() {
  const mode = modes.find(m => m.id === currentMode.value)
  if (mode) {
    mode.setup()
  }
}

// 动画循环
function animate() {
  animationId = requestAnimationFrame(animate)

  if (isPaused.value) {
    if (composer) {
      composer.render()
    }
    return
  }

  const time = performance.now() * 0.001

  // 更新模式
  const mode = modes.find(m => m.id === currentMode.value)
  if (mode) {
    mode.update(time)
  }

  updateParticlesAttributes()

  // 渲染
  if (composer) {
    composer.render()
  }

  // FPS
  const currentTime = performance.now()
  frameCount++
  if (currentTime - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
    frameCount = 0
    lastTime = currentTime
  }
}

// 窗口大小变化
function onWindowResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  if (composer) {
    composer.setSize(window.innerWidth, window.innerHeight)
  }
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

  if (composer) {
    composer.dispose()
  }
}

onMounted(() => {
  initThreeJS()
  createParticles()
  setupGalaxy()
  updateParticlesAttributes()
  animate()
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
.project-page {
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
  background: rgba(0, 0, 5, 0.95);
  color: white;
  border-radius: 12px;
  font-family: Arial, sans-serif;
  pointer-events: auto;
  max-width: 320px;
  border: 1px solid rgba(255, 215, 0, 0.3);

  h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #ffd700;
  }

  p {
    margin: 8px 0;
    font-size: 14px;
  }

  .mode-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 15px 0;

    button {
      padding: 8px 12px;
      background: rgba(255, 215, 0, 0.1);
      color: #ffd700;
      border: 1px solid rgba(255, 215, 0, 0.3);
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 215, 0, 0.2);
      }

      &.active {
        background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
        color: #000;
        border-color: #ffd700;
        font-weight: bold;
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
      background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
      color: #000;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: bold;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
      }

      &:active {
        transform: translateY(0);
      }

      &:nth-child(3) {
        grid-column: span 2;
        background: linear-gradient(135deg, #4488ff 0%, #2266cc 100%);
        color: white;
      }
    }
  }

  .tips {
    margin-top: 15px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }
}
</style>
