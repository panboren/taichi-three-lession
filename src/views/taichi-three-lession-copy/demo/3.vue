<template>
  <div class="particle-page">
    <div id="canvas-container" class="canvas-container"></div>
    <div class="info-panel">
      <h3>课程3: 交互式粒子系统</h3>
      <p>粒子数量: {{ particleCount }}</p>
      <p>FPS: {{ fps }}</p>
      <p>鼠标位置: ({{ mouseX.toFixed(2) }}, {{ mouseY.toFixed(2) }})</p>
      <p>交互模式: {{ interactionMode }}</p>
      <div class="controls">
        <button @click="setInteractionMode('attract')">吸引</button>
        <button @click="setInteractionMode('repel')">排斥</button>
        <button @click="setInteractionMode('trail')">拖尾</button>
        <button @click="togglePause">{{ isPaused ? '继续' : '暂停' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from 'vue'

// 状态
const particleCount = ref(10000)
const fps = ref(0)
const mouseX = ref(0)
const mouseY = ref(0)
const interactionMode = ref('吸引')
const isPaused = ref(false)

// 交互模式枚举
enum Mode {
  Attract = 'attract',
  Repel = 'repel',
  Trail = 'trail'
}

let currentMode = Mode.Attract

// 鼠标位置 (归一化到 -1 到 1)
let mouseWorldPos = new THREE.Vector3(0, 0, 0)

// Three.js 变量
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let particles: THREE.Points | null = null
let animationId: number = 0

// 性能监控
let frameCount = 0
let lastTime = performance.now()

// 粒子数据
let positions: Float32Array = new Float32Array(0)
let velocities: Float32Array = new Float32Array(0)
let colors: Float32Array = new Float32Array(0)

// 初始化 Three.js 场景
function initThreeJS() {
  console.log('初始化 Three.js...')

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000008)

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 10

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  const container = document.getElementById('canvas-container')
  if (container) {
    container.appendChild(renderer.domElement)
  }

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  // 添加点光源跟随鼠标
  const pointLight = new THREE.PointLight(0x00ffff, 2, 20)
  pointLight.position.set(0, 0, 5)
  scene.add(pointLight)

  console.log('Three.js 初始化成功')
}

// 创建粒子系统
function createParticles() {
  const count = particleCount.value

  positions = new Float32Array(count * 3)
  velocities = new Float32Array(count * 3)
  colors = new Float32Array(count * 3)

  // 在3D空间中创建粒子
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 随机分布在立方体内
    positions[i3] = (Math.random() - 0.5) * 10
    positions[i3 + 1] = (Math.random() - 0.5) * 10
    positions[i3 + 2] = (Math.random() - 0.5) * 10

    // 初始速度
    velocities[i3] = (Math.random() - 0.5) * 0.01
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.01
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.01

    // 颜色 - 青色到紫色渐变
    const t = Math.random()
    colors[i3] = 0.2 + t * 0.3
    colors[i3 + 1] = 0.5 + t * 0.5
    colors[i3 + 2] = 0.8 + t * 0.2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })

  particles = new THREE.Points(geometry, material)
  scene?.add(particles)

  console.log(`创建了 ${count} 个粒子`)
}

// 鼠标交互 - 投射到3D世界坐标
function updateMouseWorldPos(clientX: number, clientY: number) {
  if (!camera) return

  // 归一化设备坐标 (-1 到 1)
  const ndcX = (clientX / window.innerWidth) * 2 - 1
  const ndcY = -(clientY / window.innerHeight) * 2 + 1

  // 投射到z=0平面
  const vector = new THREE.Vector3(ndcX, ndcY, 0.5)
  vector.unproject(camera)

  const dir = vector.sub(camera.position).normalize()
  const distance = -camera.position.z / dir.z
  const pos = camera.position.clone().add(dir.multiplyScalar(distance))

  mouseWorldPos.copy(pos)

  // 更新UI
  mouseX.value = ndcX
  mouseY.value = ndcY
}

// 交互式粒子更新
function updateParticlesWithInteraction(deltaTime: number) {
  const count = particleCount.value
  const time = performance.now()

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    let fx = 0, fy = 0, fz = 0

    // 获取粒子位置
    const px = positions[i3]
    const py = positions[i3 + 1]
    const pz = positions[i3 + 2]

    // 计算到鼠标的距离
    const dx = mouseWorldPos.x - px
    const dy = mouseWorldPos.y - py
    const dz = mouseWorldPos.z - pz
    const distSq = dx * dx + dy * dy + dz * dz
    const dist = Math.sqrt(distSq)

    // 根据交互模式计算力
    switch (currentMode) {
      case Mode.Attract:
        // 吸引 - 向鼠标位置聚集
        const attractForce = 0.05 / (distSq + 0.1)
        fx = dx * attractForce
        fy = dy * attractForce
        fz = dz * attractForce
        break

      case Mode.Repel:
        // 排斥 - 远离鼠标
        const repelForce = 0.08 / (distSq + 0.01)
        fx = -dx * repelForce
        fy = -dy * repelForce
        fz = -dz * repelForce
        break

      case Mode.Trail:
        // 拖尾 - 沿鼠标移动方向
        if (dist < 3) {
          const trailForce = 0.02
          fx = Math.sin(time * 0.005 + i * 0.001) * trailForce
          fy = Math.cos(time * 0.005 + i * 0.001) * trailForce
          fz = dx * trailForce * 0.1
        }
        break
    }

    // 更新速度
    velocities[i3] += fx * deltaTime * 60
    velocities[i3 + 1] += fy * deltaTime * 60
    velocities[i3 + 2] += fz * deltaTime * 60

    // 添加布朗运动 (随机扰动)
    velocities[i3] += (Math.random() - 0.5) * 0.002
    velocities[i3 + 1] += (Math.random() - 0.5) * 0.002
    velocities[i3 + 2] += (Math.random() - 0.5) * 0.002

    // 阻力
    const damping = 0.98
    velocities[i3] *= damping
    velocities[i3 + 1] *= damping
    velocities[i3 + 2] *= damping

    // 更新位置
    positions[i3] += velocities[i3]
    positions[i3 + 1] += velocities[i3 + 1]
    positions[i3 + 2] += velocities[i3 + 2]

    // 边界处理 - 柔和边界
    const softBounds = 8
    const boundaryForce = 0.001

    if (Math.abs(positions[i3]) > softBounds) {
      velocities[i3] -= Math.sign(positions[i3]) * boundaryForce
    }
    if (Math.abs(positions[i3 + 1]) > softBounds) {
      velocities[i3 + 1] -= Math.sign(positions[i3 + 1]) * boundaryForce
    }
    if (Math.abs(positions[i3 + 2]) > softBounds) {
      velocities[i3 + 2] -= Math.sign(positions[i3 + 2]) * boundaryForce
    }

    // 更新颜色 - 根据到鼠标的距离
    const distanceFactor = Math.max(0, 1 - dist / 5)

    // 靠近鼠标时变亮
    colors[i3] = 0.2 + distanceFactor * 0.8
    colors[i3 + 1] = 0.5 + distanceFactor * 0.5
    colors[i3 + 2] = 1.0
  }

  if (particles) {
    particles.geometry.attributes.position.needsUpdate = true
    particles.geometry.attributes.color.needsUpdate = true
  }
}

// 动画循环
let lastFrameTime = performance.now()
function animate() {
  animationId = requestAnimationFrame(animate)

  if (isPaused.value) {
    return
  }

  const currentTime = performance.now()
  const deltaTime = (currentTime - lastFrameTime) / 1000
  lastFrameTime = currentTime

  // 更新粒子
  updateParticlesWithInteraction(deltaTime)

  // 缓慢旋转场景
  if (particles) {
    particles.rotation.y += 0.0005
  }

  // 更新光源位置
  const lights = scene?.children.filter(
    child => child instanceof THREE.PointLight
  )
  if (lights && lights[0]) {
    const light = lights[0] as THREE.PointLight
    light.position.x = mouseWorldPos.x
    light.position.y = mouseWorldPos.y
  }

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
  }
}

// 设置交互模式
function setInteractionMode(mode: string) {
  switch (mode) {
    case 'attract':
      currentMode = Mode.Attract
      interactionMode.value = '吸引'
      break
    case 'repel':
      currentMode = Mode.Repel
      interactionMode.value = '排斥'
      break
    case 'trail':
      currentMode = Mode.Trail
      interactionMode.value = '拖尾'
      break
  }
}

// 切换暂停
function togglePause() {
  isPaused.value = !isPaused.value
}

// 鼠标移动事件
function onMouseMove(event: MouseEvent) {
  updateMouseWorldPos(event.clientX, event.clientY)
}

// 窗口大小变化
function onWindowResize() {
  if (!camera || !renderer) return

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

async function init() {
  initThreeJS()
  createParticles()
  animate()

  // 事件监听
  window.addEventListener('resize', onWindowResize)
  window.addEventListener('mousemove', onMouseMove)
}

function cleanup() {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onWindowResize)
  window.removeEventListener('mousemove', onMouseMove)

  if (renderer) {
    const container = document.getElementById('canvas-container')
    if (container && renderer.domElement && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement)
    }
    renderer.dispose()
  }

  if (particles) {
    if (particles.geometry && 'dispose' in particles.geometry) {
      (particles.geometry as THREE.BufferGeometry).dispose()
    }
    if (particles.material) {
      particles.material.dispose()
    }
  }
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
.particle-page {
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
  padding: 15px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  font-family: Arial, sans-serif;
  pointer-events: auto;
  max-width: 280px;

  h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #00ffff;
  }

  p {
    margin: 5px 0;
    font-size: 14px;
  }

  .controls {
    margin-top: 15px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;

    button {
      padding: 8px 12px;
      background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 198, 255, 0.4);
      }

      &:active {
        transform: translateY(0);
      }

      &:nth-child(4) {
        grid-column: span 2;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
    }
  }
}
</style>
