<template>
  <div class="particle-page">
    <div id="canvas-container" class="canvas-container"></div>
    <div class="info-panel">
      <h3>Taichi.js + Three.js 10000 粒子演示</h3>
      <p>粒子数量: {{ particleCount }}</p>
      <p>FPS: {{ fps }}</p>
      <p>传输模式: {{ mode }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from 'vue'

// 状态
const particleCount = ref(200000)
const fps = ref(0)
const mode = ref('CPU计算')

// Three.js 变量
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let particles: THREE.Points | null = null
let animationId: number = 0

// 性能监控
let frameCount = 0
let lastTime = performance.now()

// 初始化 Three.js 场景
function initThreeJS() {
  console.log('初始化 Three.js...')

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000011)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 5

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  const container = document.getElementById('canvas-container')
  if (container) {
    container.appendChild(renderer.domElement)
  }

  // 添加灯光
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

  // 创建粒子几何体
  const geometry = new THREE.BufferGeometry()

  // 位置数组 (x, y, z)
  const positions = new Float32Array(count * 3)
  // 颜色数组 (r, g, b)
  const colors = new Float32Array(count * 3)

  // 初始化粒子位置和颜色
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 在球体内随机分布
    const radius = Math.random() * 2
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = radius * Math.cos(phi)

    // 颜色渐变 (从蓝色到红色)
    colors[i3] = radius / 2 // R
    colors[i3 + 1] = 0.5 - radius / 4 // G
    colors[i3 + 2] = 1 - radius / 2 // B
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  // 创建粒子材质
  const material = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  // 创建粒子系统
  particles = new THREE.Points(geometry, material)
  scene?.add(particles)

  console.log(`创建了 ${count} 个粒子`)
}

// 计算粒子运动
async function updateParticlesWithTaichi(time: number) {
  if (!particles) return

  const positions = particles.geometry.attributes.position.array as Float32Array
  const count = positions.length / 3

  // 使用 CPU 进行计算
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 简单的螺旋运动
    const angle = time * 0.001 + i * 0.001
    const radius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2)

    positions[i3] = radius * Math.cos(angle)
    positions[i3 + 1] = radius * Math.sin(angle)
    positions[i3 + 2] = Math.sin(time * 0.002 + i * 0.01) * 2
  }

  particles.geometry.attributes.position.needsUpdate = true
}

// 动画循环
function animate() {
  animationId = requestAnimationFrame(animate)

  const time = performance.now()

  // 更新粒子
  updateParticlesWithTaichi(time)

  // 旋转整个粒子系统
  if (particles) {
    particles.rotation.y = time * 0.0001
  }

  // 渲染场景
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }

  // 更新 FPS
  frameCount++
  if (time - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (time - lastTime))
    frameCount = 0
    lastTime = time
  }
}

// 处理窗口大小变化
function onWindowResize() {
  if (!camera || !renderer) return

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 初始化演示
async function init() {
  // 初始化 Three.js
  initThreeJS()

  // 创建粒子系统
  createParticles()

  // 开始动画
  animate()

  // 添加窗口大小监听
  window.addEventListener('resize', onWindowResize)
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
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  font-family: Arial, sans-serif;
  pointer-events: none;

  h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #00ff88;
  }

  p {
    margin: 5px 0;
    font-size: 14px;
  }
}
</style>
