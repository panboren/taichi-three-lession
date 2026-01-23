<template>
  <div class="trails-page">
    <div id="canvas-container" class="canvas-container"></div>
    <div class="info-panel">
      <h3>课程9: 粒子轨迹与尾迹效果</h3>
      <p>粒子数量: {{ particleCount }}</p>
      <p>FPS: {{ fps }}</p>
      <p>轨迹长度: {{ trailLength }}</p>
      <div class="controls">
        <button @click="increaseTrailLength">增加轨迹</button>
        <button @click="decreaseTrailLength">减少轨迹</button>
        <button @click="toggleTrails">{{ showTrails ? '隐藏' : '显示' }}轨迹</button>
        <button @click="togglePause">{{ isPaused ? '继续' : '暂停' }}</button>
        <button @click="changePattern('spiral')">螺旋</button>
        <button @click="changePattern('wave')">波浪</button>
        <button @click="changePattern('explosion')">爆炸</button>
        <button @click="resetSimulation">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from 'vue'

// 状态
const particleCount = ref(500)
const fps = ref(0)
const trailLength = ref(50)
const showTrails = ref(true)
const isPaused = ref(false)

// 运动模式
enum PatternType {
  Spiral = 'spiral',
  Wave = 'wave',
  Explosion = 'explosion'
}

let currentPattern = PatternType.Spiral

// Three.js 变量
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let particles: THREE.Points | null = null
let trails: THREE.Line[] = []
let animationId: number = 0

// 粒子数据
let positions: Float32Array = new Float32Array(0)
let velocities: Float32Array = new Float32Array(0)
let colors: Float32Array = new Float32Array(0)
let trailPositions: Float32Array[][] = []
let trailColors: Float32Array[][] = []

// 性能监控
let frameCount = 0
let lastTime = performance.now()

// 初始化 Three.js
function initThreeJS() {
  console.log('初始化 Three.js...')

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050515)

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  )
  camera.position.set(0, 10, 25)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: false // 性能优化
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const container = document.getElementById('canvas-container')
  if (container) {
    container.appendChild(renderer.domElement)
  }

  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0x00ffff, 1.5)
  pointLight.position.set(10, 10, 10)
  scene.add(pointLight)

  console.log('Three.js 初始化成功')
}

// 创建粒子系统
function createParticles() {
  const count = particleCount.value

  positions = new Float32Array(count * 3)
  velocities = new Float32Array(count * 3)
  colors = new Float32Array(count * 3)

  // 初始化粒子
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    positions[i3] = (Math.random() - 0.5) * 10
    positions[i3 + 1] = (Math.random() - 0.5) * 10
    positions[i3 + 2] = (Math.random() - 0.5) * 10

    velocities[i3] = (Math.random() - 0.5) * 0.1
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.1
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.1

    // 颜色 - 渐变
    const hue = i / count
    const color = new THREE.Color().setHSL(hue, 1, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending
  })

  particles = new THREE.Points(geometry, material)
  scene?.add(particles)

  console.log(`创建了 ${count} 个粒子`)
}

// 创建轨迹
function createTrails() {
  // 清除旧轨迹
  clearTrails()

  const count = particleCount.value

  for (let i = 0; i < count; i++) {
    trailPositions[i] = []
    trailColors[i] = []

    // 创建轨迹线
    const geometry = new THREE.BufferGeometry()
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })

    const line = new THREE.Line(geometry, material)
    line.visible = showTrails.value
    scene?.add(line)
    trails.push(line)
  }

  console.log(`创建了 ${count} 条轨迹`)
}

// 清除轨迹
function clearTrails() {
  trails.forEach(line => {
    scene?.remove(line)
    line.geometry.dispose()
    line.material.dispose()
  })
  trails = []
  trailPositions = []
  trailColors = []
}

// 更新轨迹
function updateTrails() {
  const count = particleCount.value
  const maxTrail = trailLength.value

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 记录当前位置
    if (!trailPositions[i]) trailPositions[i] = []
    if (!trailColors[i]) trailColors[i] = []

    trailPositions[i].push(positions[i3], positions[i3 + 1], positions[i3 + 2])
    trailColors[i].push(colors[i3], colors[i3 + 1], colors[i3 + 2])

    // 限制轨迹长度
    while (trailPositions[i].length > maxTrail * 3) {
      trailPositions[i].splice(0, 3)
      trailColors[i].splice(0, 3)
    }

    // 更新轨迹线
    const line = trails[i]
    if (line && trailPositions[i].length >= 6) {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(trailPositions[i], 3)
      )
      geometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(trailColors[i], 3)
      )

      line.geometry.dispose()
      line.geometry = geometry
      line.visible = showTrails.value
    }
  }
}

// 更新粒子
function updateParticles() {
  if (!particles) return

  const count = particleCount.value
  const time = performance.now() * 0.001

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    switch (currentPattern) {
      case PatternType.Spiral:
        // 螺旋运动
        const angle = time * 0.5 + i * 0.01
        const radius = 5 + Math.sin(time * 0.3 + i * 0.05) * 2

        positions[i3] = Math.cos(angle) * radius
        positions[i3 + 1] = Math.sin(angle) * radius
        positions[i3 + 2] = Math.sin(time * 0.2 + i * 0.02) * 3

        velocities[i3] = (Math.random() - 0.5) * 0.05
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.05
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.05
        break

      case PatternType.Wave:
        // 波浪运动
        const waveX = (i / count) * 20 - 10
        const waveY = Math.sin(time * 2 + waveX * 0.5) * 3
        const waveZ = Math.cos(time * 1.5 + waveX * 0.3) * 3

        positions[i3] = waveX
        positions[i3 + 1] = waveY
        positions[i3 + 2] = waveZ

        velocities[i3] = 0
        velocities[i3 + 1] = 0
        velocities[i3 + 2] = 0
        break

      case PatternType.Explosion:
        // 爆炸运动
        positions[i3] += velocities[i3]
        positions[i3 + 1] += velocities[i3 + 1]
        positions[i3 + 2] += velocities[i3 + 2]

        // 重力
        velocities[i3 + 1] += -0.005

        // 阻力
        velocities[i3] *= 0.99
        velocities[i3 + 1] *= 0.99
        velocities[i3 + 2] *= 0.99

        // 边界重置
        if (positions[i3 + 1] < -10) {
          positions[i3] = (Math.random() - 0.5) * 2
          positions[i3 + 1] = 5
          positions[i3 + 2] = (Math.random() - 0.5) * 2

          velocities[i3] = (Math.random() - 0.5) * 0.3
          velocities[i3 + 1] = Math.random() * 0.2
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.3
        }
        break
    }

    // 更新颜色
    const hue = (i / count + time * 0.05) % 1
    const color = new THREE.Color().setHSL(hue, 1, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  particles.geometry.attributes.position.needsUpdate = true
  particles.geometry.attributes.color.needsUpdate = true
}

// 增加轨迹长度
function increaseTrailLength() {
  trailLength.value = Math.min(200, trailLength.value + 10)
}

// 减少轨迹长度
function decreaseTrailLength() {
  trailLength.value = Math.max(10, trailLength.value - 10)
}

// 切换轨迹显示
function toggleTrails() {
  showTrails.value = !showTrails.value
  trails.forEach(line => {
    line.visible = showTrails.value
  })
}

// 改变运动模式
function changePattern(pattern: string) {
  switch (pattern) {
    case 'spiral':
      currentPattern = PatternType.Spiral
      break
    case 'wave':
      currentPattern = PatternType.Wave
      break
    case 'explosion':
      currentPattern = PatternType.Explosion
      // 重置爆炸粒子
      for (let i = 0; i < particleCount.value; i++) {
        const i3 = i * 3
        positions[i3] = (Math.random() - 0.5) * 2
        positions[i3 + 1] = 5
        positions[i3 + 2] = (Math.random() - 0.5) * 2

        velocities[i3] = (Math.random() - 0.5) * 0.3
        velocities[i3 + 1] = Math.random() * 0.2
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.3
      }
      break
  }

  // 清除轨迹
  clearTrails()
  createTrails()
}

// 暂停/继续
function togglePause() {
  isPaused.value = !isPaused.value
}

// 重置模拟
function resetSimulation() {
  clearTrails()
  createParticles()
  createTrails()
}

// 动画循环
function animate() {
  animationId = requestAnimationFrame(animate)

  if (isPaused.value) {
    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
    return
  }

  updateParticles()
  updateTrails()

  // 旋转相机
  const time = performance.now() * 0.0001
  if (camera) {
    camera.position.x = Math.sin(time) * 25
    camera.position.z = Math.cos(time) * 25
    camera.lookAt(0, 0, 0)
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }

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

  clearTrails()
}

onMounted(() => {
  initThreeJS()
  createParticles()
  createTrails()
  animate()
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
.trails-page {
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
  background: rgba(5, 5, 21, 0.9);
  color: white;
  border-radius: 12px;
  font-family: Arial, sans-serif;
  pointer-events: auto;
  max-width: 300px;
  border: 1px solid rgba(0, 255, 255, 0.3);

  h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #00ffff;
  }

  p {
    margin: 8px 0;
    font-size: 14px;
  }

  .controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 15px;

    button {
      padding: 10px 12px;
      background: linear-gradient(135deg, #00ffff 0%, #00cccc 100%);
      color: #000;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: bold;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 255, 255, 0.4);
      }

      &:active {
        transform: translateY(0);
      }

      &:nth-child(5),
      &:nth-child(6),
      &:nth-child(7) {
        background: linear-gradient(135deg, #ff6600 0%, #cc5500 100%);
        color: white;
      }

      &:nth-child(8) {
        grid-column: span 2;
        background: linear-gradient(135deg, #4488ff 0%, #2266cc 100%);
        color: white;
      }
    }
  }
}
</style>
