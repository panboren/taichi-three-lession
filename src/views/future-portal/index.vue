<template>
  <div class="future-portal">
    <!-- 3D画布容器 -->
    <div ref="canvasContainer" class="canvas-wrapper"></div>

    <!-- HUD界面层 -->
    <div class="hud-overlay">
      <!-- 顶部状态栏 -->
      <div class="status-bar">
        <div class="logo">时空界面2.0</div>
        <div class="fps-counter">FPS: {{ fps }}</div>
      </div>

      <!-- 中央控制面板 -->
      <div v-if="showControls" class="control-panel">
        <h2>交互控制</h2>
        <div class="controls">
          <button class="control-btn" @click="zoomIn">+</button>
          <button class="control-btn" @click="zoomOut">-</button>
          <button class="control-btn" @click="toggleAnimation">
            {{ isAnimating ? '⏸️' : '▶️' }}
          </button>
        </div>
      </div>

      <!-- 底部信息面板 -->
      <div class="info-panel">
        <div class="level-indicator">层级: {{ currentLevel }}/3</div>
        <div class="instructions">滚动缩放 · 拖拽旋转 · 点击交互</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'

// 响应式数据
const canvasContainer = ref<HTMLElement>()
const fps = ref(60)
const currentLevel = ref(1)
const showControls = ref(true)
const isAnimating = ref(true)

// Three.js 核心对象
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animationId: number

// 性能监控
let frameCount = 0
let lastTime = performance.now()

// 初始化3D场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a1a)

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // 添加到DOM
  if (canvasContainer.value) {
    canvasContainer.value.appendChild(renderer.domElement)
  }

  // 添加基础光照
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)
}

// 创建核心几何体
const createCoreObjects = () => {
  // 中心球体
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ffe0,
    emissive: 0x004040,
    shininess: 100
  })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  scene.add(sphere)

  // 轨迹环
  const ringGeometry = new THREE.TorusGeometry(2, 0.1, 16, 100)
  const ringMaterial = new THREE.MeshPhongMaterial({
    color: 0x00a8ff,
    transparent: true,
    opacity: 0.6
  })
  const ring = new THREE.Mesh(ringGeometry, ringMaterial)
  scene.add(ring)

  // 添加动画
  gsap.to(sphere.rotation, {
    x: Math.PI * 2,
    y: Math.PI * 2,
    duration: 8,
    repeat: -1,
    ease: 'none'
  })

  gsap.to(ring.rotation, {
    x: Math.PI * 2,
    duration: 12,
    repeat: -1,
    ease: 'none'
  })

  return { sphere, ring }
}

// 渲染循环
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 更新FPS计算
  frameCount++
  const currentTime = performance.now()
  if (currentTime - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
    frameCount = 0
    lastTime = currentTime
  }

  // 渲染场景
  renderer.render(scene, camera)
}

// 交互控制函数
const zoomIn = () => {
  gsap.to(camera.position, {
    z: Math.max(2, camera.position.z - 1),
    duration: 0.5,
    ease: 'power2.out'
  })
  currentLevel.value = Math.min(3, currentLevel.value + 1)
}

const zoomOut = () => {
  gsap.to(camera.position, {
    z: Math.min(10, camera.position.z + 1),
    duration: 0.5,
    ease: 'power2.out'
  })
  currentLevel.value = Math.max(1, currentLevel.value - 1)
}

const toggleAnimation = () => {
  isAnimating.value = !isAnimating.value
  // 这里可以添加暂停/继续动画的逻辑
}

// 窗口大小调整
const handleResize = () => {
  if (!camera || !renderer) return

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 鼠标交互
const setupMouseControls = () => {
  let isDragging = false
  let previousMousePosition = { x: 0, y: 0 }

  const onMouseDown = (event: MouseEvent) => {
    isDragging = true
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    }
  }

  const onMouseMove = (event: MouseEvent) => {
    if (!isDragging) return

    const deltaX = event.clientX - previousMousePosition.x
    const deltaY = event.clientY - previousMousePosition.y

    // 旋转相机
    camera.position.x += deltaX * 0.01
    camera.position.y -= deltaY * 0.01
    camera.lookAt(scene.position)

    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    }
  }

  const onMouseUp = () => {
    isDragging = false
  }

  // 添加事件监听器
  if (canvasContainer.value) {
    canvasContainer.value.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }
}

// 滚轮缩放
const setupWheelControl = () => {
  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? 0.5 : -0.5
    const newZ = Math.max(2, Math.min(15, camera.position.z + delta))

    gsap.to(camera.position, {
      z: newZ,
      duration: 0.3,
      ease: 'power2.out'
    })

    // 更新层级
    if (newZ < 5) currentLevel.value = 3
    else if (newZ < 10) currentLevel.value = 2
    else currentLevel.value = 1
  }

  if (canvasContainer.value) {
    canvasContainer.value.addEventListener('wheel', onWheel, { passive: false })
  }
}

// 组件挂载
onMounted(() => {
  initScene()
  createCoreObjects()
  animate()
  setupMouseControls()
  setupWheelControl()
  window.addEventListener('resize', handleResize)
})

// 组件卸载
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.future-portal {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%);
}

.canvas-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hud-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.status-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #00ffe0;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  text-shadow: 0 0 10px rgba(0, 255, 224, 0.5);

  .logo {
    font-weight: bold;
    letter-spacing: 2px;
  }

  .fps-counter {
    background: rgba(0, 255, 224, 0.1);
    padding: 4px 12px;
    border-radius: 20px;
    border: 1px solid rgba(0, 255, 224, 0.3);
  }
}

.control-panel {
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  background: rgba(10, 10, 26, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 224, 0.3);
  border-radius: 15px;
  padding: 20px;
  color: white;

  h2 {
    margin: 0 0 15px 0;
    color: #00a8ff;
    font-size: 16px;
  }

  .controls {
    display: flex;
    gap: 10px;
  }

  .control-btn {
    width: 40px;
    height: 40px;
    border: none;
    background: rgba(0, 168, 255, 0.2);
    color: #00a8ff;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.3s ease;
    pointer-events: auto;

    &:hover {
      background: rgba(0, 168, 255, 0.4);
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(0, 168, 255, 0.6);
    }
  }
}

.info-panel {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;

  .level-indicator {
    margin-bottom: 8px;
    color: #00ffe0;
    font-weight: bold;
  }

  .instructions {
    background: rgba(10, 10, 26, 0.6);
    display: inline-block;
    padding: 8px 20px;
    border-radius: 20px;
    border: 1px solid rgba(0, 255, 224, 0.2);
  }
}
</style>
