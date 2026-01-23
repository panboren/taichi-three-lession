<template>
  <div class="instancing-page">
    <div id="canvas-container" class="canvas-container"></div>
    <div class="info-panel">
      <h3>课程7: GPU实例化渲染</h3>
      <p>实例数量: {{ instanceCount }}</p>
      <p>FPS: {{ fps }}</p>
      <p>渲染模式: {{ renderMode }}</p>
      <div class="controls">
        <button @click="setRenderMode('points')">点渲染</button>
        <button @click="setRenderMode('instanced')">实例化</button>
        <button @click="setGeometryType('sphere')">球体</button>
        <button @click="setGeometryType('cube')">立方体</button>
        <button @click="togglePause">{{ isPaused ? '继续' : '暂停' }}</button>
        <button @click="changeCount(10000)">10K</button>
        <button @click="changeCount(50000)">50K</button>
        <button @click="changeCount(100000)">100K</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from 'vue'

// 状态
const instanceCount = ref(50000)
const fps = ref(0)
const renderMode = ref('实例化')
const isPaused = ref(false)

// 几何类型
enum GeometryType {
  Sphere = 'sphere',
  Cube = 'cube'
}

let currentGeometryType = GeometryType.Sphere

// Three.js 变量
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let points: THREE.Points | null = null
let instancedMesh: THREE.InstancedMesh | null = null
let animationId: number = 0

// 实例数据
let positions: Float32Array = new Float32Array(0)
let colors: Float32Array = new Float32Array(0)
let scales: Float32Array = new Float32Array(0)
let dummy: THREE.Object3D
let _color: THREE.Color

// 性能监控
let frameCount = 0
let lastTime = performance.now()

// 初始化 Three.js
function initThreeJS() {
  console.log('初始化 Three.js...')

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050510)

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 0, 40)

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

  const pointLight1 = new THREE.PointLight(0xff4400, 1.5)
  pointLight1.position.set(20, 20, 20)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0x0044ff, 1.5)
  pointLight2.position.set(-20, -20, 20)
  scene.add(pointLight2)

  // 初始化辅助对象
  dummy = new THREE.Object3D()
  _color = new THREE.Color()

  console.log('Three.js 初始化成功')
}

// 创建点渲染粒子系统
function createPoints() {
  if (points) {
    scene?.remove(points)
    points.geometry.dispose()
    points.material.dispose()
  }

  const count = instanceCount.value

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))

  // 自定义着色器材质
  const material = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })

  points = new THREE.Points(geometry, material)
  scene?.add(points)

  console.log(`创建了 ${count} 个点`)
}

// 创建实例化网格
function createInstancedMesh() {
  if (instancedMesh) {
    scene?.remove(instancedMesh)
    instancedMesh.geometry.dispose()
    instancedMesh.material.dispose()
  }

  const count = instanceCount.value

  // 创建基础几何体
  let geometry: THREE.BufferGeometry
  switch (currentGeometryType) {
    case GeometryType.Sphere:
      geometry = new THREE.SphereGeometry(0.3, 8, 6)
      break
    case GeometryType.Cube:
      geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
      break
    default:
      geometry = new THREE.SphereGeometry(0.3, 8, 6)
  }

  // 创建材质
  const material = new THREE.MeshStandardMaterial({
    roughness: 0.4,
    metalness: 0.6,
    transparent: true,
    opacity: 0.9
  })

  // 创建实例化网格
  instancedMesh = new THREE.InstancedMesh(geometry, material, count)
  instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

  // 设置每个实例的位置、旋转和缩放
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    dummy.position.set(positions[i3], positions[i3 + 1], positions[i3 + 2])

    // 根据颜色设置旋转
    dummy.rotation.x = colors[i3] * Math.PI * 2
    dummy.rotation.y = colors[i3 + 1] * Math.PI * 2

    const scale = scales[i]
    dummy.scale.set(scale, scale, scale)

    dummy.updateMatrix()
    instancedMesh.setMatrixAt(i, dummy.matrix)

    // 设置颜色
    _color.setRGB(colors[i3], colors[i3 + 1], colors[i3 + 2])
    instancedMesh.setColorAt(i, _color)
  }

  instancedMesh.instanceMatrix.needsUpdate = true
  if (instancedMesh.instanceColor) {
    instancedMesh.instanceColor.needsUpdate = true
  }

  scene?.add(instancedMesh)

  console.log(`创建了 ${count} 个实例`)
}

// 初始化实例数据
function initInstanceData() {
  const count = instanceCount.value
  positions = new Float32Array(count * 3)
  colors = new Float32Array(count * 3)
  scales = new Float32Array(count)

  // 在球体内分布
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 使用黄金角螺旋分布
    const theta = i * 2.39996
    const y = 1 - (i / (count - 1)) * 2
    const radius = Math.sqrt(1 - y * y)
    const phi = theta

    const scale = 15 + Math.random() * 5

    positions[i3] = radius * Math.cos(phi) * scale
    positions[i3 + 1] = y * scale
    positions[i3 + 2] = radius * Math.sin(phi) * scale

    // 颜色 - 彩虹渐变
    const hue = i / count
    const color = new THREE.Color().setHSL(hue, 1, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b

    // 缩放
    scales[i] = 0.5 + Math.random() * 1.5
  }
}

// 更新实例
function updateInstances() {
  if (!instancedMesh) return

  const count = instanceCount.value
  const time = performance.now() * 0.001

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    dummy.position.set(positions[i3], positions[i3 + 1], positions[i3 + 2])

    // 旋转
    dummy.rotation.x = colors[i3] * Math.PI * 2 + time * 0.5
    dummy.rotation.y = colors[i3 + 1] * Math.PI * 2 + time * 0.3

    const scale = scales[i] * (1 + Math.sin(time * 2 + i * 0.01) * 0.2)
    dummy.scale.set(scale, scale, scale)

    dummy.updateMatrix()
    instancedMesh.setMatrixAt(i, dummy.matrix)
  }

  instancedMesh.instanceMatrix.needsUpdate = true
}

// 更新点
function updatePoints() {
  if (!points) return

  const count = instanceCount.value
  const time = performance.now() * 0.001

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    // 缓慢旋转
    const angle = time * 0.1 + i * 0.0001
    const r = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2)

    positions[i3] = Math.sin(angle) * r * Math.cos(angle * 0.5)
    positions[i3 + 1] = Math.cos(angle) * r * Math.sin(angle * 0.5)
    positions[i3 + 2] = Math.sin(angle * 0.5) * r

    // 更新颜色
    const hue = (i / count + time * 0.1) % 1
    const color = new THREE.Color().setHSL(hue, 1, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b

    // 更新缩放
    scales[i] = 0.5 + Math.sin(time * 3 + i * 0.01) * 0.3
  }

  points.geometry.attributes.position.needsUpdate = true
  points.geometry.attributes.color.needsUpdate = true
  points.geometry.attributes.scale.needsUpdate = true
}

// 设置渲染模式
function setRenderMode(mode: string) {
  if (mode === 'points') {
    renderMode.value = '点渲染'
    createPoints()
  } else {
    renderMode.value = '实例化'
    createInstancedMesh()
  }
}

// 设置几何体类型
function setGeometryType(type: string) {
  switch (type) {
    case 'sphere':
      currentGeometryType = GeometryType.Sphere
      break
    case 'cube':
      currentGeometryType = GeometryType.Cube
      break
  }
  if (renderMode.value === '实例化') {
    createInstancedMesh()
  }
}

// 改变数量
function changeCount(count: number) {
  instanceCount.value = count
  initInstanceData()
  if (renderMode.value === '点渲染') {
    createPoints()
  } else {
    createInstancedMesh()
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

  const time = performance.now() * 0.001

  // 更新相机
  camera.position.x = Math.sin(time * 0.1) * 20
  camera.position.z = Math.cos(time * 0.1) * 20
  camera.position.y = Math.sin(time * 0.05) * 10
  camera.lookAt(0, 0, 0)

  // 更新粒子
  if (renderMode.value === '点渲染') {
    updatePoints()
  } else {
    updateInstances()
  }

  // 渲染
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
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

// 暂停/继续
function togglePause() {
  isPaused.value = !isPaused.value
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

  if (points) {
    points.geometry.dispose()
    points.material.dispose()
  }

  if (instancedMesh) {
    instancedMesh.geometry.dispose()
    instancedMesh.material.dispose()
  }
}

onMounted(() => {
  initThreeJS()
  initInstanceData()
  createInstancedMesh()
  animate()
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
.instancing-page {
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
  background: rgba(5, 5, 16, 0.9);
  color: white;
  border-radius: 12px;
  font-family: Arial, sans-serif;
  pointer-events: auto;
  max-width: 320px;
  border: 1px solid rgba(255, 100, 50, 0.3);

  h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #ff6432;
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
      background: linear-gradient(135deg, #ff6432 0%, #cc5228 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 100, 50, 0.4);
      }

      &:active {
        transform: translateY(0);
      }

      &:nth-child(5),
      &:nth-child(6),
      &:nth-child(7) {
        background: linear-gradient(135deg, #4488ff 0%, #2266cc 100%);
      }
    }
  }
}
</style>
