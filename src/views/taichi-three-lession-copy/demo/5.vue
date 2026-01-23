<template>
  <div class="sph-page">
    <div id="canvas-container" class="canvas-container"></div>
    <div class="info-panel">
      <h3>课程5: 流体粒子模拟 (SPH)</h3>
      <p>粒子数量: {{ particleCount }}</p>
      <p>FPS: {{ fps }}</p>
      <p>模拟参数:</p>
      <div class="params">
        <label>
          刚度:
          <input type="range" v-model.number="stiffness" min="10" max="1000" step="10" />
          {{ stiffness }}
        </label>
        <label>
          粘度:
          <input type="range" v-model.number="viscosity" min="0" max="0.5" step="0.01" />
          {{ viscosity.toFixed(2) }}
        </label>
        <label>
          重力:
          <input type="range" v-model.number="gravity" min="-20" max="0" step="0.5" />
          {{ gravity }}
        </label>
      </div>
      <div class="controls">
        <button @click="resetSimulation">重置模拟</button>
        <button @click="togglePause">{{ isPaused ? '继续' : '暂停' }}</button>
        <button @click="addObstacle">添加障碍物</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from 'vue'

// 状态
const particleCount = ref(1500)
const fps = ref(0)
const stiffness = ref(200)
const viscosity = ref(0.1)
const gravity = ref(-9.8)
const isPaused = ref(false)

// SPH 参数
const REST_DENSITY = 0.5
const SMOOTHING_RADIUS = 0.8
const PARTICLE_RADIUS = 0.15
const BOUNDS = { min: -8, max: 8 }

// Three.js 变量
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let particles: THREE.Points | null = null
let obstacles: THREE.Mesh[] = []
let animationId: number = 0

// 粒子数据
let positions: Float32Array = new Float32Array(0)
let velocities: Float32Array = new Float32Array(0)
let densities: Float32Array = new Float32Array(0)
let pressures: Float32Array = new Float32Array(0)

// 性能监控
let frameCount = 0
let lastTime = performance.now()

// SPH 核函数
function computeDensityKernel(r: number, h: number): number {
  if (r >= h) return 0
  const x = 1 - r / h
  return (315 / (64 * Math.PI * h * h * h)) * x * x * x
}

function computePressureGradientKernel(r: number, h: number): number {
  if (r >= h || r < 0.0001) return 0
  const x = 1 - r / h
  return -(45 / (Math.PI * h * h * h * h * h * h)) * x * x
}

function computeViscosityKernel(r: number, h: number): number {
  if (r >= h) return 0
  const x = 1 - r / h
  return (45 / (Math.PI * h * h * h * h * h * h)) * x
}

// 初始化 Three.js
function initThreeJS() {
  console.log('初始化 Three.js...')

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x001122)

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  )
  camera.position.set(0, 0, 25)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const container = document.getElementById('canvas-container')
  if (container) {
    container.appendChild(renderer.domElement)
  }

  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0x00aaff, 1.5)
  pointLight.position.set(10, 10, 10)
  scene.add(pointLight)

  // 创建边界框
  const boxGeometry = new THREE.BoxGeometry(16, 16, 2)
  const boxEdges = new THREE.EdgesGeometry(boxGeometry)
  const boxLine = new THREE.LineSegments(
    boxEdges,
    new THREE.LineBasicMaterial({ color: 0x00ffff })
  )
  scene.add(boxLine)

  console.log('Three.js 初始化成功')
}

// 创建流体粒子
function createFluidParticles() {
  const count = particleCount.value
  positions = new Float32Array(count * 3)
  velocities = new Float32Array(count * 3)
  densities = new Float32Array(count)
  pressures = new Float32Array(count)

  // 初始化粒子位置 - 网格分布
  const gridSize = Math.ceil(Math.pow(count, 1 / 3))
  const spacing = (PARTICLE_RADIUS * 2) * 1.1
  const startX = -((gridSize - 1) * spacing) / 2
  const startY = -6
  const startZ = -0.5

  let index = 0
  for (let ix = 0; ix < gridSize; ix++) {
    for (let iy = 0; iy < gridSize; iy++) {
      for (let iz = 0; iz < gridSize; iz++) {
        if (index >= count) break

        positions[index * 3] = startX + ix * spacing + (Math.random() - 0.5) * 0.02
        positions[index * 3 + 1] = startY + iy * spacing + (Math.random() - 0.5) * 0.02
        positions[index * 3 + 2] = startZ + iz * spacing

        velocities[index * 3] = (Math.random() - 0.5) * 0.1
        velocities[index * 3 + 1] = (Math.random() - 0.5) * 0.1
        velocities[index * 3 + 2] = 0

        index++
      }
    }
  }

  // 创建粒子几何体
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  // 根据密度计算颜色
  const colors = new Float32Array(count * 3)
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: PARTICLE_RADIUS * 3,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  })

  particles = new THREE.Points(geometry, material)
  scene?.add(particles)

  console.log(`创建了 ${count} 个流体粒子`)
}

// 计算 SPH 密度和压力
function computeDensityPressure() {
  const count = particleCount.value
  const h = SMOOTHING_RADIUS

  // 计算密度
  for (let i = 0; i < count; i++) {
    densities[i] = 0
    const ix = positions[i * 3]
    const iy = positions[i * 3 + 1]
    const iz = positions[i * 3 + 2]

    for (let j = 0; j < count; j++) {
      const jx = positions[j * 3]
      const jy = positions[j * 3 + 1]
      const jz = positions[j * 3 + 2]

      const dx = ix - jx
      const dy = iy - jy
      const dz = iz - jz
      const r = Math.sqrt(dx * dx + dy * dy + dz * dz)

      densities[i] += computeDensityKernel(r, h)
    }
  }

  // 计算压力
  for (let i = 0; i < count; i++) {
    pressures[i] = stiffness.value * (densities[i] - REST_DENSITY)
  }
}

// 计算力
function computeForces(): Float32Array {
  const count = particleCount.value
  const h = SMOOTHING_RADIUS
  const forces = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    let fx = 0, fy = 0, fz = 0
    const ix = positions[i * 3]
    const iy = positions[i * 3 + 1]
    const iz = positions[i * 3 + 2]
    const ivx = velocities[i * 3]
    const ivy = velocities[i * 3 + 1]
    const ivz = velocities[i * 3 + 2]

    for (let j = 0; j < count; j++) {
      if (i === j) continue

      const jx = positions[j * 3]
      const jy = positions[j * 3 + 1]
      const jz = positions[j * 3 + 2]
      const jvx = velocities[j * 3]
      const jvy = velocities[j * 3 + 1]
      const jvz = velocities[j * 3 + 2]

      const dx = ix - jx
      const dy = iy - jy
      const dz = iz - jz
      const r = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (r > 0 && r < h) {
        const dirX = dx / r
        const dirY = dy / r
        const dirZ = dz / r

        // 压力力
        const pressureForce = (pressures[i] + pressures[j]) / 2 * computePressureGradientKernel(r, h)
        fx -= pressureForce * dirX
        fy -= pressureForce * dirY
        fz -= pressureForce * dirZ

        // 粘性力
        const viscosityKernel = computeViscosityKernel(r, h)
        fx += viscosity.value * viscosityKernel * (jvx - ivx)
        fy += viscosity.value * viscosityKernel * (jvy - ivy)
        fz += viscosity.value * viscosityKernel * (jvz - ivz)
      }
    }

    // 重力
    fy += gravity.value * densities[i]

    forces[i * 3] = fx
    forces[i * 3 + 1] = fy
    forces[i * 3 + 2] = fz
  }

  return forces
}

// 障碍物碰撞检测
function handleObstacleCollisions() {
  for (let obstacle of obstacles) {
    const obstaclePos = obstacle.position
    const radius = (obstacle.geometry as THREE.SphereGeometry).parameters.radius || 1

    for (let i = 0; i < particleCount.value; i++) {
      const px = positions[i * 3]
      const py = positions[i * 3 + 1]
      const pz = positions[i * 3 + 2]

      const dx = px - obstaclePos.x
      const dy = py - obstaclePos.y
      const dz = pz - obstaclePos.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      const minDist = radius + PARTICLE_RADIUS
      if (dist < minDist) {
        // 推出障碍物
        const pushFactor = (minDist - dist) / dist
        positions[i * 3] += dx * pushFactor
        positions[i * 3 + 1] += dy * pushFactor
        positions[i * 3 + 2] += dz * pushFactor

        // 反射速度
        const nx = dx / dist
        const ny = dy / dist
        const nz = dz / dist
        const dot = velocities[i * 3] * nx + velocities[i * 3 + 1] * ny + velocities[i * 3 + 2] * nz
        const restitution = 0.5

        velocities[i * 3] -= (1 + restitution) * dot * nx
        velocities[i * 3 + 1] -= (1 + restitution) * dot * ny
        velocities[i * 3 + 2] -= (1 + restitution) * dot * nz
      }
    }
  }
}

// 更新粒子
function updateParticles() {
  const count = particleCount.value
  const dt = 0.008 // 时间步长

  // 计算 SPH
  computeDensityPressure()
  const forces = computeForces()

  // 更新速度和位置
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const invDensity = 1 / Math.max(densities[i], 0.0001)

    // 加速度
    const ax = forces[i3] * invDensity
    const ay = forces[i3 + 1] * invDensity
    const az = forces[i3 + 2] * invDensity

    velocities[i3] += ax * dt
    velocities[i3 + 1] += ay * dt
    velocities[i3 + 2] += az * dt

    positions[i3] += velocities[i3] * dt
    positions[i3 + 1] += velocities[i3 + 1] * dt
    positions[i3 + 2] += velocities[i3 + 2] * dt

    // 边界碰撞
    const minB = BOUNDS.min + PARTICLE_RADIUS
    const maxB = BOUNDS.max - PARTICLE_RADIUS

    if (positions[i3] < minB) {
      positions[i3] = minB
      velocities[i3] *= -0.5
    }
    if (positions[i3] > maxB) {
      positions[i3] = maxB
      velocities[i3] *= -0.5
    }
    if (positions[i3 + 1] < minB) {
      positions[i3 + 1] = minB
      velocities[i3 + 1] *= -0.5
    }
    if (positions[i3 + 1] > maxB) {
      positions[i3 + 1] = maxB
      velocities[i3 + 1] *= -0.5
    }
    if (positions[i3 + 2] < -0.8) {
      positions[i3 + 2] = -0.8
      velocities[i3 + 2] *= -0.5
    }
    if (positions[i3 + 2] > 0.8) {
      positions[i3 + 2] = 0.8
      velocities[i3 + 2] *= -0.5
    }
  }

  // 障碍物碰撞
  handleObstacleCollisions()

  // 更新颜色（根据密度）
  if (particles) {
    const colors = particles.geometry.attributes.color.array as Float32Array
    for (let i = 0; i < count; i++) {
      const densityRatio = Math.min(1, densities[i] / (REST_DENSITY * 3))
      colors[i * 3] = 0.2 + densityRatio * 0.3
      colors[i * 3 + 1] = 0.4 + densityRatio * 0.4
      colors[i * 3 + 2] = 0.8 + densityRatio * 0.2
    }
    particles.geometry.attributes.color.needsUpdate = true
    particles.geometry.attributes.position.needsUpdate = true
  }
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

  // 更新流体
  updateParticles()

  // 渲染
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }

  // FPS 计算
  const currentTime = performance.now()
  frameCount++
  if (currentTime - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
    frameCount = 0
    lastTime = currentTime
  }
}

// 重置模拟
function resetSimulation() {
  if (particles) {
    scene?.remove(particles)
    particles.geometry.dispose()
    particles.material.dispose()
  }
  createFluidParticles()
}

// 暂停/继续
function togglePause() {
  isPaused.value = !isPaused.value
}

// 添加障碍物
function addObstacle() {
  const geometry = new THREE.SphereGeometry(1, 32, 32)
  const material = new THREE.MeshStandardMaterial({
    color: 0xff4444,
    metalness: 0.5,
    roughness: 0.3
  })
  const sphere = new THREE.Mesh(geometry, material)
  sphere.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    0
  )
  obstacles.push(sphere)
  scene?.add(sphere)
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

  obstacles.forEach(obj => {
    obj.geometry.dispose()
    obj.material.dispose()
  })
}

onMounted(() => {
  initThreeJS()
  createFluidParticles()
  animate()
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
.sph-page {
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
  background: rgba(0, 0, 20, 0.9);
  color: white;
  border-radius: 12px;
  font-family: Arial, sans-serif;
  pointer-events: auto;
  max-width: 320px;
  border: 1px solid rgba(0, 170, 255, 0.3);

  h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #00aaff;
  }

  p {
    margin: 8px 0;
    font-size: 14px;
  }

  .params {
    margin: 15px 0;
    display: flex;
    flex-direction: column;
    gap: 10px;

    label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;

      input[type="range"] {
        flex: 1;
        cursor: pointer;
      }
    }
  }

  .controls {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    margin-top: 15px;

    button {
      padding: 10px 16px;
      background: linear-gradient(135deg, #00aaff 0%, #0066cc 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 170, 255, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}
</style>
