<template>
  <div class="collision-page">
    <div id="canvas-container" class="canvas-container"></div>
    <div class="info-panel">
      <h3>课程6: 碰撞检测与响应</h3>
      <p>粒子数量: {{ particleCount }}</p>
      <p>FPS: {{ fps }}</p>
      <p>碰撞类型: {{ collisionType }}</p>
      <div class="controls">
        <button @click="switchCollisionType('sphere')">球形碰撞</button>
        <button @click="switchCollisionType('plane')">平面碰撞</button>
        <button @click="switchCollisionType('box')">盒子碰撞</button>
        <button @click="togglePause">{{ isPaused ? '继续' : '暂停' }}</button>
        <button @click="resetSimulation">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from 'vue'

// 状态
const particleCount = ref(2000)
const fps = ref(0)
const collisionType = ref('球形碰撞')
const isPaused = ref(false)

// 碰撞类型枚举
enum CollisionType {
  Sphere = 'sphere',
  Plane = 'plane',
  Box = 'box'
}

let currentCollisionType = CollisionType.Sphere

// 物理参数
const PARTICLE_RADIUS = 0.08
const SPHERE_RADIUS = 3
const GRAVITY = -9.8
const BOUNCE = 0.8

// Three.js 变量
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let particles: THREE.Points | null = null
let collisionObject: THREE.Mesh | null = null
let animationId: number = 0

// 粒子数据
let positions: Float32Array = new Float32Array(0)
let velocities: Float32Array = new Float32Array(0)
let colors: Float32Array = new Float32Array(0)

// 性能监控
let frameCount = 0
let lastTime = performance.now()

// 初始化 Three.js
function initThreeJS() {
  console.log('初始化 Three.js...')

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a1a)

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  )
  camera.position.set(0, 2, 12)
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

  const pointLight = new THREE.PointLight(0xff8800, 1.2)
  pointLight.position.set(8, 8, 8)
  scene.add(pointLight)

  const fillLight = new THREE.PointLight(0x0088ff, 0.8)
  fillLight.position.set(-8, -4, 4)
  scene.add(fillLight)

  console.log('Three.js 初始化成功')
}

// 创建碰撞对象
function createCollisionObject() {
  if (collisionObject) {
    scene?.remove(collisionObject)
    collisionObject.geometry.dispose()
    collisionObject.material.dispose()
  }

  let geometry: THREE.BufferGeometry
  let material: THREE.Material

  switch (currentCollisionType) {
    case CollisionType.Sphere:
      geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 32)
      material = new THREE.MeshStandardMaterial({
        color: 0x4488ff,
        metalness: 0.7,
        roughness: 0.2,
        transparent: true,
        opacity: 0.6
      })
      break

    case CollisionType.Plane:
      geometry = new THREE.PlaneGeometry(10, 10)
      material = new THREE.MeshStandardMaterial({
        color: 0x44ff44,
        metalness: 0.5,
        roughness: 0.3,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      })
      break

    case CollisionType.Box:
      geometry = new THREE.BoxGeometry(5, 5, 5)
      material = new THREE.MeshStandardMaterial({
        color: 0xff44ff,
        metalness: 0.6,
        roughness: 0.2,
        transparent: true,
        opacity: 0.6
      })
      break
  }

  collisionObject = new THREE.Mesh(geometry, material)
  collisionObject.position.set(0, 0, 0)
  scene?.add(collisionObject)
}

// 创建粒子系统
function createParticles() {
  const count = particleCount.value
  positions = new Float32Array(count * 3)
  velocities = new Float32Array(count * 3)
  colors = new Float32Array(count * 3)

  // 初始化粒子位置
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 在碰撞对象上方随机分布
    positions[i3] = (Math.random() - 0.5) * 6
    positions[i3 + 1] = 5 + Math.random() * 3
    positions[i3 + 2] = (Math.random() - 0.5) * 6

    // 初始速度
    velocities[i3] = (Math.random() - 0.5) * 0.5
    velocities[i3 + 1] = Math.random() * -1
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.5

    // 初始颜色
    colors[i3] = 1.0
    colors[i3 + 1] = 0.6 + Math.random() * 0.4
    colors[i3 + 2] = 0.2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: PARTICLE_RADIUS * 2.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  })

  particles = new THREE.Points(geometry, material)
  scene?.add(particles)

  console.log(`创建了 ${count} 个粒子`)
}

// 球形碰撞检测
function handleSphereCollision() {
  if (!collisionObject) return

  const spherePos = collisionObject.position
  const radius = SPHERE_RADIUS + PARTICLE_RADIUS

  for (let i = 0; i < particleCount.value; i++) {
    const i3 = i * 3
    const px = positions[i3]
    const py = positions[i3 + 1]
    const pz = positions[i3 + 2]

    const dx = px - spherePos.x
    const dy = py - spherePos.y
    const dz = pz - spherePos.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (dist < radius) {
      // 计算法线
      const nx = dx / dist
      const ny = dy / dist
      const nz = dz / dist

      // 将粒子推出球体
      const overlap = radius - dist
      positions[i3] += nx * overlap
      positions[i3 + 1] += ny * overlap
      positions[i3 + 2] += nz * overlap

      // 反射速度
      const dot = velocities[i3] * nx + velocities[i3 + 1] * ny + velocities[i3 + 2] * nz
      if (dot < 0) {
        velocities[i3] -= (1 + BOUNCE) * dot * nx
        velocities[i3 + 1] -= (1 + BOUNCE) * dot * ny
        velocities[i3 + 2] -= (1 + BOUNCE) * dot * nz

        // 碰撞时改变颜色
        colors[i3] = 1.0
        colors[i3 + 1] = 1.0
        colors[i3 + 2] = 1.0
      }
    }
  }
}

// 平面碰撞检测
function handlePlaneCollision() {
  if (!collisionObject) return

  for (let i = 0; i < particleCount.value; i++) {
    const i3 = i * 3

    // 平面位于 y=0，法线向上
    const planeY = 0

    if (positions[i3 + 1] < planeY + PARTICLE_RADIUS) {
      positions[i3 + 1] = planeY + PARTICLE_RADIUS

      if (velocities[i3 + 1] < 0) {
        velocities[i3 + 1] *= -BOUNCE

        // 增加摩擦力
        velocities[i3] *= 0.95
        velocities[i3 + 2] *= 0.95

        // 碰撞时改变颜色
        colors[i3] = 0.2
        colors[i3 + 1] = 1.0
        colors[i3 + 2] = 0.2
      }
    }
  }
}

// 盒子碰撞检测
function handleBoxCollision() {
  if (!collisionObject) return

  const boxSize = 5 / 2
  const boxMin = -boxSize + PARTICLE_RADIUS
  const boxMax = boxSize - PARTICLE_RADIUS

  for (let i = 0; i < particleCount.value; i++) {
    const i3 = i * 3

    // 检查每个轴
    for (let axis = 0; axis < 3; axis++) {
      const pos = positions[i3 + axis]
      const vel = velocities[i3 + axis]

      if (pos < boxMin) {
        positions[i3 + axis] = boxMin
        if (vel < 0) {
          velocities[i3 + axis] *= -BOUNCE
          // 碰撞时改变颜色
          colors[i3] = 1.0
          colors[i3 + 1] = 0.2
          colors[i3 + 2] = 1.0
        }
      } else if (pos > boxMax) {
        positions[i3 + axis] = boxMax
        if (vel > 0) {
          velocities[i3 + axis] *= -BOUNCE
          // 碰撞时改变颜色
          colors[i3] = 1.0
          colors[i3 + 1] = 0.2
          colors[i3 + 2] = 1.0
        }
      }
    }
  }
}

// 空间分区优化 - 网格分区
function createSpatialGrid(particlePositions: Float32Array, gridSize: number): Map<string, number[]> {
  const grid = new Map<string, number[]>()

  for (let i = 0; i < particlePositions.length / 3; i++) {
    const cellX = Math.floor(particlePositions[i * 3] / gridSize)
    const cellY = Math.floor(particlePositions[i * 3 + 1] / gridSize)
    const cellZ = Math.floor(particlePositions[i * 3 + 2] / gridSize)
    const key = `${cellX},${cellY},${cellZ}`

    if (!grid.has(key)) {
      grid.set(key, [])
    }
    grid.get(key)!.push(i)
  }

  return grid
}

// 更新粒子
function updateParticles() {
  const dt = 0.016

  // 更新速度和位置
  for (let i = 0; i < particleCount.value; i++) {
    const i3 = i * 3

    // 重力
    velocities[i3 + 1] += GRAVITY * dt

    // 空气阻力
    velocities[i3] *= 0.999
    velocities[i3 + 1] *= 0.999
    velocities[i3 + 2] *= 0.999

    // 更新位置
    positions[i3] += velocities[i3]
    positions[i3 + 1] += velocities[i3 + 1]
    positions[i3 + 2] += velocities[i3 + 2]

    // 颜色逐渐恢复
    const time = performance.now() * 0.001
    colors[i3] = Math.max(1.0, colors[i3] * 0.99)
    colors[i3 + 1] = Math.max(0.6 + Math.sin(time + i * 0.1) * 0.2, colors[i3 + 1] * 0.99)
    colors[i3 + 2] = Math.max(0.2, colors[i3 + 2] * 0.99)
  }

  // 碰撞检测
  switch (currentCollisionType) {
    case CollisionType.Sphere:
      handleSphereCollision()
      break
    case CollisionType.Plane:
      handlePlaneCollision()
      break
    case CollisionType.Box:
      handleBoxCollision()
      break
  }

  // 边界重置
  for (let i = 0; i < particleCount.value; i++) {
    const i3 = i * 3
    if (positions[i3 + 1] < -10) {
      positions[i3] = (Math.random() - 0.5) * 6
      positions[i3 + 1] = 8
      positions[i3 + 2] = (Math.random() - 0.5) * 6
      velocities[i3] = (Math.random() - 0.5) * 0.5
      velocities[i3 + 1] = 0
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.5
    }
  }

  if (particles) {
    particles.geometry.attributes.position.needsUpdate = true
    particles.geometry.attributes.color.needsUpdate = true
  }
}

// 切换碰撞类型
function switchCollisionType(type: string) {
  switch (type) {
    case 'sphere':
      currentCollisionType = CollisionType.Sphere
      collisionType.value = '球形碰撞'
      break
    case 'plane':
      currentCollisionType = CollisionType.Plane
      collisionType.value = '平面碰撞'
      break
    case 'box':
      currentCollisionType = CollisionType.Box
      collisionType.value = '盒子碰撞'
      break
  }
  createCollisionObject()
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

  // 旋转碰撞对象
  if (collisionObject && currentCollisionType !== CollisionType.Plane) {
    collisionObject.rotation.x += 0.005
    collisionObject.rotation.y += 0.01
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

// 暂停/继续
function togglePause() {
  isPaused.value = !isPaused.value
}

// 重置模拟
function resetSimulation() {
  if (particles) {
    scene?.remove(particles)
    particles.geometry.dispose()
    particles.material.dispose()
  }
  createParticles()
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

  if (collisionObject) {
    collisionObject.geometry.dispose()
    collisionObject.material.dispose()
  }
}

onMounted(() => {
  initThreeJS()
  createCollisionObject()
  createParticles()
  animate()
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
.collision-page {
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
  background: rgba(10, 10, 26, 0.9);
  color: white;
  border-radius: 12px;
  font-family: Arial, sans-serif;
  pointer-events: auto;
  max-width: 280px;
  border: 1px solid rgba(255, 136, 0, 0.3);

  h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #ff8800;
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
      background: linear-gradient(135deg, #ff8800 0%, #cc6600 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 136, 0, 0.4);
      }

      &:active {
        transform: translateY(0);
      }

      &:nth-child(5) {
        grid-column: span 2;
        background: linear-gradient(135deg, #4488ff 0%, #2266cc 100%);
      }
    }
  }
}
</style>
