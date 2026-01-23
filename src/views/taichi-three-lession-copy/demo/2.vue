<template>
  <div class="particle-page">
    <div id="canvas-container" class="canvas-container"></div>
    <div class="info-panel">
      <h3>课程2: Taichi.js GPU加速粒子物理</h3>
      <p>粒子数量: {{ particleCount }}</p>
      <p>FPS: {{ fps }}</p>
      <p>计算方式: {{ computeMode }}</p>
      <p>物理效果: {{ physicsMode }}</p>
      <div class="controls">
        <button @click="togglePhysicsMode">切换物理模式</button>
        <button @click="resetParticles">重置粒子</button>
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
const computeMode = ref('CPU计算')
const physicsMode = ref('重力场')

// 物理模式枚举
enum PhysicsMode {
  Gravity = '重力场',
  Vortex = '旋涡场',
  Explosion = '爆炸场',
  Attract = '吸引场'
}

let currentPhysicsMode = PhysicsMode.Gravity

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
  scene.background = new THREE.Color(0x000011)

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 8

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  const container = document.getElementById('canvas-container')
  if (container) {
    container.appendChild(renderer.domElement)
  }

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 1)
  pointLight.position.set(10, 10, 10)
  scene.add(pointLight)

  console.log('Three.js 初始化成功')
}

// 创建粒子系统
function createParticles() {
  const count = particleCount.value

  // 初始化数组
  positions = new Float32Array(count * 3)
  velocities = new Float32Array(count * 3)
  colors = new Float32Array(count * 3)

  // 初始化粒子位置和速度
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 在球体内随机分布
    const radius = Math.random() * 3 + 0.5
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = radius * Math.cos(phi)

    // 初始速度
    velocities[i3] = (Math.random() - 0.5) * 0.02
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.02
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02

    // 颜色 - 根据速度设置
    const speed = Math.random()
    colors[i3] = speed
    colors[i3 + 1] = 1 - speed
    colors[i3 + 2] = 0.5
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  })

  particles = new THREE.Points(geometry, material)
  scene?.add(particles)

  console.log(`创建了 ${count} 个粒子`)
}

// CPU优化的物理计算
function updateParticlesGPU(deltaTime: number) {
  const count = particleCount.value

  // 这里模拟Taichi GPU内核的效果
  // 实际项目中会在Taichi内核中编写以下逻辑
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    let fx = 0, fy = 0, fz = 0

    const x = positions[i3]
    const y = positions[i3 + 1]
    const z = positions[i3 + 2]

    // 根据当前物理模式计算力
    switch (currentPhysicsMode) {
      case PhysicsMode.Gravity:
        // 重力场 - 向下加速
        fy = -0.01
        break

      case PhysicsMode.Vortex:
        // 旋涡场 - 围绕中心旋转
        const dist = Math.sqrt(x * x + y * y + z * z)
        fx = -y * 0.01 / (dist + 0.1)
        fy = x * 0.01 / (dist + 0.1)
        fz = Math.sin(dist * 2 + performance.now() * 0.001) * 0.005
        break

      case PhysicsMode.Explosion:
        // 爆炸场 - 从中心向外
        const dist2 = Math.sqrt(x * x + y * y + z * z)
        const strength = 0.01 / (dist2 * dist2 + 0.1)
        fx = x * strength
        fy = y * strength
        fz = z * strength
        break

      case PhysicsMode.Attract:
        // 吸引场 - 向中心吸引
        const dist3 = Math.sqrt(x * x + y * y + z * z)
        const attractStrength = 0.005 / (dist3 + 0.1)
        fx = -x * attractStrength
        fy = -y * attractStrength
        fz = -z * attractStrength
        break
    }

    // 更新速度
    velocities[i3] += fx * deltaTime * 60
    velocities[i3 + 1] += fy * deltaTime * 60
    velocities[i3 + 2] += fz * deltaTime * 60

    // 添加阻力
    const damping = 0.99
    velocities[i3] *= damping
    velocities[i3 + 1] *= damping
    velocities[i3 + 2] *= damping

    // 更新位置
    positions[i3] += velocities[i3]
    positions[i3 + 1] += velocities[i3 + 1]
    positions[i3 + 2] += velocities[i3 + 2]

    // 边界检查 - 弹性碰撞
    const bounds = 5
    const bounce = 0.8

    if (Math.abs(positions[i3]) > bounds) {
      positions[i3] = Math.sign(positions[i3]) * bounds
      velocities[i3] *= -bounce
    }
    if (Math.abs(positions[i3 + 1]) > bounds) {
      positions[i3 + 1] = Math.sign(positions[i3 + 1]) * bounds
      velocities[i3 + 1] *= -bounce
    }
    if (Math.abs(positions[i3 + 2]) > bounds) {
      positions[i3 + 2] = Math.sign(positions[i3 + 2]) * bounds
      velocities[i3 + 2] *= -bounce
    }

    // 更新颜色 - 根据速度
    const speed = Math.sqrt(
      velocities[i3] ** 2 +
      velocities[i3 + 1] ** 2 +
      velocities[i3 + 2] ** 2
    )

    colors[i3] = Math.min(1, speed * 50)
    colors[i3 + 1] = Math.min(1, 0.5 + speed * 20)
    colors[i3 + 2] = Math.min(1, 1 - speed * 30)
  }

  // 标记需要更新
  if (particles) {
    particles.geometry.attributes.position.needsUpdate = true
    particles.geometry.attributes.color.needsUpdate = true
  }
}



// 动画循环
let lastFrameTime = performance.now()
function animate() {
  animationId = requestAnimationFrame(animate)

  const currentTime = performance.now()
  const deltaTime = (currentTime - lastFrameTime) / 1000
  lastFrameTime = currentTime

  // 更新粒子物理
  updateParticlesGPU(deltaTime)

  // 缓慢旋转相机
  if (camera) {
    camera.position.x = Math.sin(currentTime * 0.0001) * 8
    camera.position.z = Math.cos(currentTime * 0.0001) * 8
    camera.lookAt(0, 0, 0)
  }

  // 渲染场景
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }

  // 更新 FPS
  frameCount++
  if (currentTime - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
    frameCount = 0
    lastTime = currentTime
  }
}

// 切换物理模式
function togglePhysicsMode() {
  const modes = Object.values(PhysicsMode)
  const currentIndex = modes.indexOf(currentPhysicsMode)
  const nextIndex = (currentIndex + 1) % modes.length
  currentPhysicsMode = modes[nextIndex]
  physicsMode.value = currentPhysicsMode

  // 切换模式时给粒子一些随机扰动
  if (velocities) {
    for (let i = 0; i < velocities.length; i++) {
      velocities[i] += (Math.random() - 0.5) * 0.05
    }
  }
}

// 重置粒子
function resetParticles() {
  if (particles) {
    scene?.remove(particles)
    if (particles.geometry && 'dispose' in particles.geometry) {
      (particles.geometry as THREE.BufferGeometry).dispose()
    }
    if (particles.material) {
      particles.material.dispose()
    }
  }
  createParticles()
}

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
  window.addEventListener('resize', onWindowResize)
}

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

  h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #00ff88;
  }

  p {
    margin: 5px 0;
    font-size: 14px;
  }

  .controls {
    margin-top: 15px;
    display: flex;
    gap: 10px;

    button {
      padding: 8px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}
</style>
