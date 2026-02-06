<template>
  <div ref="containerRef" class="digital-space">
    <canvas ref="canvasRef" class="webgl-canvas" />

    <div class="ui-layer">
      <div class="scene-indicator">
        <div
          v-for="i in SCENE_COUNT"
          :key="i"
          :class="['indicator-dot', { active: currentScene === i }]"
          @click="goToScene(i)"
        />
      </div>

      <div class="narrative-container">
        <div ref="textRef" class="narrative-text">
          <h1 class="glitch-text">{{ currentText.title }}</h1>
          <p class="subtitle">{{ currentText.subtitle }}</p>
        </div>
      </div>

      <div class="scroll-hint" :class="{ hidden: isScrolling }">
        <span>滚动探索</span>
        <div class="mouse-icon">
          <div class="wheel" />
        </div>
      </div>

      <div class="interaction-hint">
        <span class="hint-text">拖拽旋转 · 滚轮缩放 · 点击探索</span>
      </div>
    </div>

    <div class="post-processing-overlay" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import gsap from 'gsap'

// 常量定义
const SCENE_COUNT = 3
const STAR_COUNT = 1500
const DATA_FLOW_COUNT = 400
const ANIMATION_FPS = 60
const SCROLL_COOLDOWN = 1500
const MOUSE_SENSITIVITY = 0.5

// 场景叙事内容
const scenes = [
  {
    title: '星云门户',
    subtitle: '穿越数字边界，进入无限可能',
    description: '在这里，现实与虚拟的界限开始消融'
  },
  {
    title: '核心装置',
    subtitle: '精密构造，科技与艺术的完美融合',
    description: '每一个细节都承载着未来的重量'
  },
  {
    title: '数据矩阵',
    subtitle: '信息流中，见证未来的诞生',
    description: '数据不再冰冷，而是有温度的思考'
  }
] as const

// 响应式引用
const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()
const textRef = ref<HTMLDivElement>()
const currentScene = ref(1)
const isScrolling = ref(false)

const currentText = computed(() => scenes[currentScene.value - 1])

// Three.js 核心变量
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let composer: EffectComposer
let controls: OrbitControls
let animationId: number

// 场景对象
let portalGroup: THREE.Group
let coreGroup: THREE.Group
let matrixGroup: THREE.Group
let starField: THREE.Points
let dataFlowSystem: THREE.Points

// 鼠标交互状态
const mouseState = { x: 0, y: 0, targetX: 0, targetY: 0 }

// 资源清理列表
const disposableResources: { dispose: () => void }[] = []

// 初始化 Three.js 场景
const initThree = (): void => {
  const container = containerRef.value
  const canvas = canvasRef.value
  if (!container || !canvas) return

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000411, 0.015)

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 0, 15)

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000411, 1)

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 1.5
  controls.minDistance = 8
  controls.maxDistance = 25
  disposableResources.push({ dispose: () => controls.dispose() })

  setupLighting()
  createScenes()
  setupPostProcessing()

  // 初始只显示第一个场景
  coreGroup.visible = false
  matrixGroup.visible = false

  setupEventListeners()
  animate()
}

// 设置灯光
const setupLighting = (): void => {
  const ambientLight = new THREE.AmbientLight(0x0a1a3a, 0.4)
  scene.add(ambientLight)

  const mainLight = new THREE.DirectionalLight(0x00f7ff, 1.2)
  mainLight.position.set(5, 10, 7)
  scene.add(mainLight)

  const accentLight1 = new THREE.PointLight(0xff00ff, 2, 30)
  accentLight1.position.set(-8, 5, 5)
  scene.add(accentLight1)

  const accentLight2 = new THREE.PointLight(0xff6b00, 1.5, 25)
  accentLight2.position.set(8, -3, -5)
  scene.add(accentLight2)
}

// 创建所有场景
const createScenes = (): void => {
  createNebulaPortal()
  createCoreDevice()
  createDataMatrix()
  createStarField()
  createDataFlow()
}

// 场景1: 星云门户
const createNebulaPortal = (): void => {
  portalGroup = new THREE.Group()

  const ringMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00f7ff,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x00f7ff,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.8
  })

  const mainRing = new THREE.Mesh(new THREE.TorusGeometry(3, 0.15, 16, 100), ringMaterial)
  portalGroup.add(mainRing)

  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(2, 0.1, 16, 80), ringMaterial.clone())
  innerRing.material.emissiveIntensity = 0.8
  innerRing.rotation.x = Math.PI / 3
  portalGroup.add(innerRing)

  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.08, 16, 120), ringMaterial.clone())
  outerRing.material.emissive = new THREE.Color(0xff00ff)
  outerRing.material.emissiveIntensity = 0.3
  outerRing.rotation.y = Math.PI / 4
  portalGroup.add(outerRing)

  // 能量粒子环
  for (let i = 0; i < 3; i++) {
    const particleRingMaterial = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x00f7ff : 0xff00ff,
      transparent: true,
      opacity: 0.3 - i * 0.08,
      side: THREE.DoubleSide
    })
    const particleRing = new THREE.Mesh(
      new THREE.RingGeometry(3.5 + i * 0.5, 3.5 + i * 0.5 + 0.02, 64),
      particleRingMaterial
    )
    particleRing.rotation.x = Math.PI / 2 + i * 0.3
    portalGroup.add(particleRing)
  }

  const energyCore = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 32, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0x00f7ff,
      metalness: 0.5,
      roughness: 0,
      transmission: 0.8,
      thickness: 1,
      emissive: 0x00f7ff,
      emissiveIntensity: 0.3
    })
  )
  portalGroup.add(energyCore)

  scene.add(portalGroup)
}

// 场景2: 核心装置
const createCoreDevice = (): void => {
  coreGroup = new THREE.Group()

  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(4, 4, 4)),
    new THREE.LineBasicMaterial({ color: 0x00f7ff })
  )
  coreGroup.add(frame)

  const glassBox = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 3.5, 3.5),
    new THREE.MeshPhysicalMaterial({
      color: 0x0a1a3a,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.5,
      transparent: true,
      opacity: 0.3
    })
  )
  coreGroup.add(glassBox)

  const rotatingCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.2, 0),
    new THREE.MeshPhysicalMaterial({
      color: 0xff6b00,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xff6b00,
      emissiveIntensity: 0.4
    })
  )
  rotatingCore.name = 'rotatingCore'
  coreGroup.add(rotatingCore)

  // 卫星环
  for (let i = 0; i < 4; i++) {
    const satelliteGroup = new THREE.Group()
    const satellite = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.3, 0),
      new THREE.MeshPhysicalMaterial({
        color: 0x00f7ff,
        metalness: 0.8,
        roughness: 0.3,
        emissive: 0x00f7ff,
        emissiveIntensity: 0.3
      })
    )
    satellite.position.x = 2.5
    satelliteGroup.add(satellite)
    satelliteGroup.rotation.z = (i / 4) * Math.PI * 2
    satelliteGroup.name = `satellite${i}`
    coreGroup.add(satelliteGroup)
  }

  scene.add(coreGroup)
}

// 场景3: 数据矩阵
const createDataMatrix = (): void => {
  matrixGroup = new THREE.Group()
  const gridSize = 6
  const spacing = 1.5

  // 创建数据立方体
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const heightRatio = (Math.sin(x * 0.8) + Math.cos(y * 0.8) + 2) / 4
      const dataCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        new THREE.MeshPhysicalMaterial({
          color: new THREE.Color().setHSL(0.55 + heightRatio * 0.15, 0.8, 0.3 + heightRatio * 0.3),
          metalness: 0.7,
          roughness: 0.2,
          emissive: new THREE.Color().setHSL(0.55 + heightRatio * 0.15, 0.8, 0.1),
          emissiveIntensity: heightRatio * 0.5
        })
      )
      dataCube.position.set(
        (x - gridSize / 2 + 0.5) * spacing,
        (y - gridSize / 2 + 0.5) * spacing,
        (heightRatio - 0.5) * 3
      )
      dataCube.scale.set(1, 1, heightRatio * 2 + 0.5)
      dataCube.name = `dataCube_${x}_${y}`
      matrixGroup.add(dataCube)
    }
  }

  // 创建连接线
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00f7ff,
    transparent: true,
    opacity: 0.2
  })

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const createLine = (dx: number, dy: number): void => {
        const startCube = matrixGroup.getObjectByName(`dataCube_${x}_${y}`) as THREE.Mesh
        const endCube = matrixGroup.getObjectByName(`dataCube_${x + dx}_${y + dy}`) as THREE.Mesh
        if (startCube && endCube) {
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([startCube.position, endCube.position]),
            lineMaterial
          )
          matrixGroup.add(line)
        }
      }

      if (x < gridSize - 1) createLine(1, 0)
      if (y < gridSize - 1) createLine(0, 1)
    }
  }

  scene.add(matrixGroup)
}

// 创建星空背景
const createStarField = (): void => {
  const starGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(STAR_COUNT * 3)
  const colors = new Float32Array(STAR_COUNT * 3)

  for (let i = 0; i < STAR_COUNT; i++) {
    const radius = 50 + Math.random() * 100
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    const colorChoice = Math.random()
    if (colorChoice < 0.4) {
      colors[i * 3] = 0
      colors[i * 3 + 1] = 0.97
      colors[i * 3 + 2] = 1
    } else if (colorChoice < 0.7) {
      colors[i * 3] = 1
      colors[i * 3 + 1] = 0
      colors[i * 3 + 2] = 1
    } else {
      colors[i * 3] = 1
      colors[i * 3 + 1] = 1
      colors[i * 3 + 2] = 1
    }
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  starField = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
  )
  scene.add(starField)
}

// 创建数据流粒子
const createDataFlow = (): void => {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(DATA_FLOW_COUNT * 3)
  const velocities = []

  for (let i = 0; i < DATA_FLOW_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40

    velocities.push({
      x: (Math.random() - 0.5) * 0.05,
      y: (Math.random() - 0.5) * 0.05,
      z: (Math.random() - 0.5) * 0.05
    })
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  dataFlowSystem = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.15,
      color: 0x00f7ff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
  )
  dataFlowSystem.userData.velocities = velocities
  scene.add(dataFlowSystem)
}

// 设置后期处理
const setupPostProcessing = (): void => {
  composer = new EffectComposer(renderer)

  composer.addPass(new RenderPass(scene, camera))

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  )
  bloomPass.threshold = 0.3
  bloomPass.strength = 1.2
  bloomPass.radius = 0.5
  composer.addPass(bloomPass)
}

// 设置事件监听器
const setupEventListeners = (): void => {
  window.addEventListener('resize', onWindowResize)
  window.addEventListener('mousemove', onMouseMove)
  canvasRef.value?.addEventListener('wheel', onScroll, { passive: false })

  disposableResources.push({
    dispose: () => {
      window.removeEventListener('resize', onWindowResize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  })
}

// 动画循环
const animate = (): void => {
  animationId = requestAnimationFrame(animate)

  const time = Date.now() * 0.001

  updatePortalAnimation(time)
  updateCoreAnimation(time)
  updateMatrixAnimation(time)
  updateStarAnimation(time)
  updateDataFlowAnimation(time)
  updateCameraPosition()

  controls.update()
  composer.render()
}

// 更新星云门户动画
const updatePortalAnimation = (time: number): void => {
  if (!portalGroup.visible) return
  portalGroup.rotation.y = time * 0.3
  portalGroup.rotation.x = Math.sin(time * 0.5) * 0.1
}

// 更新核心装置动画
const updateCoreAnimation = (time: number): void => {
  if (!coreGroup.visible) return

  const rotatingCore = coreGroup.getObjectByName('rotatingCore') as THREE.Mesh
  if (rotatingCore) {
    rotatingCore.rotation.x = time * 0.8
    rotatingCore.rotation.y = time * 1.2
  }

  for (let i = 0; i < 4; i++) {
    const satellite = coreGroup.getObjectByName(`satellite${i}`) as THREE.Group
    if (satellite) {
      satellite.rotation.z = time * 0.5 + (i / 4) * Math.PI * 2
      satellite.rotation.x = Math.sin(time + i) * 0.3
    }
  }
}

// 更新数据矩阵动画
const updateMatrixAnimation = (time: number): void => {
  if (!matrixGroup.visible) return

  const gridSize = 6
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const cube = matrixGroup.getObjectByName(`dataCube_${x}_${y}`) as THREE.Mesh
      if (cube) {
        const wave = Math.sin(time * 2 + x * 0.5 + y * 0.5)
        cube.material.emissiveIntensity = (wave + 1) * 0.25
        cube.position.z = wave * 0.5
      }
    }
  }
}

// 更新星空动画
const updateStarAnimation = (time: number): void => {
  if (!starField) return
  starField.rotation.y = time * 0.02
}

// 更新数据流粒子动画
const updateDataFlowAnimation = (time: number): void => {
  if (!dataFlowSystem) return

  const positions = dataFlowSystem.geometry.attributes.position.array as Float32Array
  const velocities = dataFlowSystem.userData.velocities as { x: number; y: number; z: number }[]

  for (let i = 0; i < velocities.length; i++) {
    positions[i * 3] += velocities[i].x
    positions[i * 3 + 1] += velocities[i].y
    positions[i * 3 + 2] += velocities[i].z

    const range = 20
    if (Math.abs(positions[i * 3]) > range) positions[i * 3] *= -0.9
    if (Math.abs(positions[i * 3 + 1]) > range) positions[i * 3 + 1] *= -0.9
    if (Math.abs(positions[i * 3 + 2]) > range) positions[i * 3 + 2] *= -0.9
  }

  dataFlowSystem.geometry.attributes.position.needsUpdate = true
  dataFlowSystem.rotation.y = time * 0.1
}

// 更新相机位置
const updateCameraPosition = (): void => {
  mouseState.targetX = mouseState.x * MOUSE_SENSITIVITY
  mouseState.targetY = mouseState.y * 0.3

  camera.position.x += (mouseState.targetX - camera.position.x) * 0.02
  camera.position.y += (-mouseState.targetY - camera.position.y) * 0.02
  camera.lookAt(0, 0, 0)
}

// 窗口大小调整
const onWindowResize = (): void => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
}

// 鼠标移动
const onMouseMove = (event: MouseEvent): void => {
  mouseState.x = (event.clientX / window.innerWidth) * 2 - 1
  mouseState.y = (event.clientY / window.innerHeight) * 2 - 1
}

// 滚动切换场景
const onScroll = (event: WheelEvent): void => {
  event.preventDefault()

  if (isScrolling.value) return

  isScrolling.value = true
  setTimeout(() => { isScrolling.value = false }, SCROLL_COOLDOWN)

  const nextScene = event.deltaY > 0
    ? currentScene.value < SCENE_COUNT ? currentScene.value + 1 : 1
    : currentScene.value > 1 ? currentScene.value - 1 : SCENE_COUNT

  goToScene(nextScene)
}

// 切换到指定场景
const goToScene = (sceneIndex: number): void => {
  if (sceneIndex === currentScene.value) return

  const previousScene = currentScene.value
  currentScene.value = sceneIndex

  animateSceneTransition(previousScene, sceneIndex)
}

// 场景切换动画
const animateSceneTransition = (from: number, to: number): void => {
  const sceneMap = { 1: portalGroup, 2: coreGroup, 3: matrixGroup } as const
  const fromGroup = sceneMap[from as keyof typeof sceneMap]
  const toGroup = sceneMap[to as keyof typeof sceneMap]

  if (!fromGroup || !toGroup) return

  // 文本淡出
  gsap.to(textRef.value, {
    opacity: 0,
    y: -30,
    duration: 0.4,
    ease: 'power2.in',
    onComplete: () => {
      switchSceneObject(fromGroup, toGroup)

      // 文本淡入
      gsap.to(textRef.value, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      })
    }
  })

  // 相机推拉动画
  gsap.to(camera.position, {
    z: 18,
    duration: 0.3,
    ease: 'power2.in',
    onComplete: () => {
      gsap.to(camera.position, {
        z: 15,
        duration: 0.5,
        ease: 'power2.out'
      })
    }
  })
}

// 切换场景对象
const switchSceneObject = (fromGroup: THREE.Group, toGroup: THREE.Group): void => {
  gsap.to(fromGroup.scale, {
    x: 0,
    y: 0,
    z: 0,
    duration: 0.4,
    ease: 'back.in(1.7)',
    onComplete: () => {
      fromGroup.visible = false
      fromGroup.scale.set(1, 1, 1)

      toGroup.visible = true
      toGroup.scale.set(0, 0, 0)
      gsap.to(toGroup.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.6,
        ease: 'back.out(1.7)'
      })
    }
  })
}

// 清理资源
const cleanup = (): void => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  disposableResources.forEach(resource => resource.dispose())
  renderer?.dispose()
  composer?.dispose()

  canvasRef.value?.removeEventListener('wheel', onScroll)
}

// 初始化
onMounted(() => {
  initThree()

  gsap.from(textRef.value, {
    opacity: 0,
    y: 50,
    duration: 1,
    ease: 'power3.out',
    delay: 0.5
  })

  gsap.from('.scene-indicator', {
    opacity: 0,
    x: -50,
    duration: 0.8,
    ease: 'power3.out',
    delay: 1
  })

  gsap.to('.mouse-icon .wheel', {
    y: 12,
    duration: 1,
    repeat: -1,
    ease: 'power2.inOut'
  })
})

onUnmounted(cleanup)
</script>

<style scoped lang="scss">
.digital-space {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #000411 0%, #0a1a3a 50%, #000814 100%);
}

.webgl-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.ui-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.scene-indicator {
  position: absolute;
  left: 40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 20px;
  pointer-events: auto;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(0, 247, 255, 0.3);
  border: 2px solid rgba(0, 247, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 247, 255, 0.6);
    transform: scale(1.2);
  }

  &.active {
    width: 16px;
    height: 16px;
    background: #00f7ff;
    border-color: #00f7ff;
    box-shadow: 0 0 20px rgba(0, 247, 255, 0.6);
  }
}

.narrative-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.narrative-text {
  pointer-events: auto;
}

.glitch-text {
  font-size: 4rem;
  font-weight: 700;
  color: #00f7ff;
  margin: 0 0 20px;
  text-shadow:
    0 0 10px rgba(0, 247, 255, 0.8),
    0 0 20px rgba(0, 247, 255, 0.6),
    0 0 40px rgba(0, 247, 255, 0.4);
  letter-spacing: 4px;
  animation: textGlow 2s ease-in-out infinite alternate;
}

@keyframes textGlow {
  from {
    text-shadow:
      0 0 10px rgba(0, 247, 255, 0.8),
      0 0 20px rgba(0, 247, 255, 0.6),
      0 0 40px rgba(0, 247, 255, 0.4);
  }
  to {
    text-shadow:
      0 0 15px rgba(0, 247, 255, 1),
      0 0 30px rgba(0, 247, 255, 0.8),
      0 0 60px rgba(0, 247, 255, 0.6);
  }
}

.subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  letter-spacing: 8px;
  font-weight: 300;
}

.scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  letter-spacing: 3px;
  transition: opacity 0.5s ease;

  &.hidden {
    opacity: 0;
  }
}

.mouse-icon {
  width: 24px;
  height: 38px;
  border: 2px solid rgba(0, 247, 255, 0.6);
  border-radius: 12px;
  position: relative;
}

.wheel {
  width: 4px;
  height: 8px;
  background: #00f7ff;
  border-radius: 2px;
  position: absolute;
  left: 50%;
  top: 8px;
  transform: translateX(-50%);
}

.interaction-hint {
  position: absolute;
  bottom: 40px;
  right: 40px;
  pointer-events: auto;
}

.hint-text {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
  letter-spacing: 2px;
}

.post-processing-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 4, 17, 0.3) 100%);
}

@media (max-width: 768px) {
  .glitch-text {
    font-size: 2.5rem;
    letter-spacing: 2px;
  }

  .subtitle {
    font-size: 1rem;
    letter-spacing: 4px;
  }

  .scene-indicator {
    left: 20px;
  }

  .scroll-hint {
    bottom: 30px;
  }

  .interaction-hint {
    bottom: 80px;
    right: 20px;
  }
}
</style>
