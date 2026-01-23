<template>
  <div class="bridge-demo-page">
    <div id="canvas-container" class="canvas-container"></div>
    <div class="info-panel">
      <h3>课程4: Taichi-Three 数据传输</h3>
      <p>粒子数量: {{ particleCount }}</p>
      <p>FPS: {{ fps }}</p>
      <p>传输模式: {{ transferMode }}</p>
      <p>传输时间: {{ transferTime.toFixed(3) }}ms</p>
      <p>数据量: {{ dataThroughput.toFixed(2) }} MB/s</p>
      <div class="controls">
        <button @click="switchTransferMode('canvas')">Canvas模式</button>
        <button @click="switchTransferMode('data')">Data模式</button>
        <button @click="toggleAnimation">{{ isAnimating ? '暂停' : '继续' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from 'vue'

// 状态
const particleCount = ref(5000)
const fps = ref(0)
const transferMode = ref('Canvas模式')
const transferTime = ref(0)
const dataThroughput = ref(0)
const isAnimating = ref(true)

// 传输模式
enum TransferMode {
  Canvas = 'canvas',
  Data = 'data'
}

let currentTransferMode = TransferMode.Canvas

// Three.js 变量
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let particles: THREE.Points | null = null
let mesh: THREE.Mesh | null = null
let animationId: number = 0

// 数据传输相关
let taichiTexture: HTMLCanvasElement | null = null
let taichiCtx: CanvasRenderingContext2D | null = null
let imageData: ImageData | null = null
let dataArray: Uint8ClampedArray | null = null

// 性能监控
let frameCount = 0
let lastTime = performance.now()
let lastTransferTime = 0

// 初始化 Three.js 场景
function initThreeJS() {
  console.log('初始化 Three.js...')

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000010)

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 6

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  const container = document.getElementById('canvas-container')
  if (container) {
    container.appendChild(renderer.domElement)
  }

  // 灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xff00ff, 1.5)
  pointLight.position.set(5, 5, 5)
  scene.add(pointLight)

  console.log('Three.js 初始化成功')
}

// 创建用于传输的Canvas
function initTransferCanvas() {
  // 创建离屏Canvas用于Taichi渲染
  taichiTexture = document.createElement('canvas')
  taichiTexture.width = 256
  taichiTexture.height = 256

  taichiCtx = taichiTexture.getContext('2d')
  if (taichiCtx) {
    imageData = taichiCtx.createImageData(256, 256)
    dataArray = imageData.data
  }

  console.log('传输Canvas初始化完成')
}

// 创建粒子系统 - 用于Canvas模式
function createParticleMesh() {
  const count = particleCount.value

  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const angle = (i / count) * Math.PI * 2
    const radius = Math.random() * 2 + 1

    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = Math.sin(angle) * radius
    positions[i3 + 2] = (Math.random() - 0.5) * 2

    colors[i3] = 0.5 + Math.random() * 0.5
    colors[i3 + 1] = 0.3 + Math.random() * 0.3
    colors[i3 + 2] = 0.8 + Math.random() * 0.2
  }

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

  console.log('粒子系统创建完成')
}

// 创建平面网格 - 用于Data模式
function createDataMesh() {
  const geometry = new THREE.PlaneGeometry(4, 4, 256, 256)
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: false,
    side: THREE.DoubleSide
  })

  mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2
  mesh.visible = false
  scene?.add(mesh)

  console.log('数据网格创建完成')
}

// 模拟Taichi计算并传输数据 - Canvas模式
function updateWithCanvasMode(time: number) {
  if (!taichiCtx || !dataArray || !particles) return

  const startTime = performance.now()

  // 模拟Taichi在Canvas上渲染
  const width = 256
  const height = 256

  // 清空
  taichiCtx.fillStyle = 'black'
  taichiCtx.fillRect(0, 0, width, height)

  // 模拟Taichi内核计算并渲染到Canvas
  const imageData = taichiCtx.createImageData(width, height)
  const data = imageData.data

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4

      // 模拟物理计算 - 波纹效果
      const cx = width / 2
      const cy = height / 2
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      const wave = Math.sin(dist * 0.1 - time * 0.005) * 0.5 + 0.5

      data[i] = wave * 255     // R
      data[i + 1] = wave * 128 // G
      data[i + 2] = 255 - wave * 128 // B
      data[i + 3] = 255        // A
    }
  }

  taichiCtx.putImageData(imageData, 0, 0)

  // 更新粒子位置
  const positions = particles.geometry.attributes.position.array as Float32Array
  const count = particleCount.value

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 从Canvas数据中获取影响
    const x = Math.floor((i % width))
    const y = Math.floor((i / count) * height)
    const dataI = (y * width + x) * 4

    if (dataI < data.length) {
      const intensity = data[dataI] / 255
      positions[i3 + 1] = positions[i3 + 1] * 0.99 + intensity * 0.01
    }

    // 旋转
    const angle = time * 0.001 + i * 0.001
    const radius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2)
    positions[i3] = Math.cos(angle) * radius
    positions[i3 + 1] = Math.sin(angle) * radius
  }

  particles.geometry.attributes.position.needsUpdate = true

  const transferDuration = performance.now() - startTime
  transferTime.value = transferDuration
  lastTransferTime = transferDuration
}

// 模拟Taichi计算并传输数据 - Data模式
function updateWithDataMode(time: number) {
  if (!dataArray || !mesh) return

  const startTime = performance.now()

  // 模拟Taichi计算生成数据
  const width = 256
  const height = 256
  const count = width * height

  // 创建数据纹理
  const data = new Float32Array(count * 4)

  for (let i = 0; i < count; i++) {
    const x = i % width
    const y = Math.floor(i / width)
    const i4 = i * 4

    // 模拟复杂的物理场计算
    const cx = width / 2
    const cy = height / 2
    const dx = (x - cx) / width * 4
    const dy = (y - cy) / height * 4
    const dist = Math.sqrt(dx * dx + dy * dy)

    // 动态波纹
    const wave1 = Math.sin(dist * 5 - time * 0.01) * 0.5 + 0.5
    const wave2 = Math.cos(dx * 3 + time * 0.008) * 0.3 + 0.3
    const wave3 = Math.sin(dy * 3 + time * 0.006) * 0.2 + 0.2

    // 顶点位移
    data[i4] = wave1 * 2      // Z位移
    data[i4 + 1] = wave2 * 1  // X位移
    data[i4 + 2] = wave3 * 1  // Y位移
    data[i4 + 3] = 1.0        // Alpha
  }

  // 更新网格顶点
  if (mesh.geometry instanceof THREE.PlaneGeometry) {
    const positionAttr = mesh.geometry.attributes.position
    for (let i = 0; i < positionAttr.count; i++) {
      const i4 = i * 4
      if (i4 < data.length) {
        positionAttr.setZ(i, data[i4])
      }
    }
    positionAttr.needsUpdate = true
  }

  const transferDuration = performance.now() - startTime
  transferTime.value = transferDuration
  lastTransferTime = transferDuration

  // 计算吞吐量 (MB/s)
  const dataSize = (count * 4 * 4) / (1024 * 1024) // 4 float per pixel, 4 bytes per float
  if (transferDuration > 0) {
    dataThroughput.value = (dataSize / transferDuration) * 1000
  }
}

// 切换传输模式
function switchTransferMode(mode: string) {
  switch (mode) {
    case 'canvas':
      currentTransferMode = TransferMode.Canvas
      transferMode.value = 'Canvas模式'
      if (mesh) mesh.visible = false
      if (particles) particles.visible = true
      break
    case 'data':
      currentTransferMode = TransferMode.Data
      transferMode.value = 'Data模式'
      if (mesh) mesh.visible = true
      if (particles) particles.visible = false
      break
  }
}

// 切换动画
function toggleAnimation() {
  isAnimating.value = !isAnimating.value
}

// 动画循环
function animate() {
  animationId = requestAnimationFrame(animate)

  if (!isAnimating.value) return

  const time = performance.now()

  // 根据模式更新
  switch (currentTransferMode) {
    case TransferMode.Canvas:
      updateWithCanvasMode(time)
      break
    case TransferMode.Data:
      updateWithDataMode(time)
      break
  }

  // 旋转场景
  if (currentTransferMode === TransferMode.Canvas && particles) {
    particles.rotation.z = time * 0.0002
  } else if (currentTransferMode === TransferMode.Data && mesh) {
    mesh.rotation.y = time * 0.0002
  }

  // 渲染
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }

  // FPS
  frameCount++
  if (time - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (time - lastTime))
    frameCount = 0
    lastTime = time
  }
}

function onWindowResize() {
  if (!camera || !renderer) return

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

async function init() {
  initThreeJS()
  initTransferCanvas()
  createParticleMesh()
  createDataMesh()
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

  if (mesh) {
    if (mesh.geometry && 'dispose' in mesh.geometry) {
      mesh.geometry.dispose()
    }
    if (mesh.material) {
      mesh.material.dispose()
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
.bridge-demo-page {
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
  background: rgba(0, 0, 0, 0.85);
  color: white;
  border-radius: 8px;
  font-family: Arial, sans-serif;
  pointer-events: auto;
  max-width: 300px;

  h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #ff00ff;
  }

  p {
    margin: 5px 0;
    font-size: 14px;

    span {
      color: #00ff88;
      font-weight: bold;
    }
  }

  .controls {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    button {
      padding: 10px 16px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}
</style>
