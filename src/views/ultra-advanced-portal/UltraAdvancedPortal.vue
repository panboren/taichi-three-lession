<template>
  <div class="ultra-advanced-portal">
    <!-- 主3D画布 -->
    <div ref="mainCanvas" class="main-canvas"></div>

    <!-- 2D粒子背景 -->
    <canvas ref="particleCanvas" class="particle-background"></canvas>

    <!-- 全息界面 -->
    <div class="holographic-interface">
      <!-- 量子状态栏 -->
      <div class="quantum-status-bar">
        <div class="branding">
          <div class="logo-primary">QUANTUM_INFINITY</div>
          <div class="logo-secondary">超维度现实控制器 v5.0</div>
        </div>
        <div class="system-stats">
          <div class="stat-item">
            <span class="stat-label">量子纠缠</span>
            <span class="stat-value">{{ quantumEntanglement }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">维度稳定性</span>
            <span class="stat-value">{{ dimensionStability }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">神经链接</span>
            <span class="stat-value">{{ neuralLinks }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">粒子密度</span>
            <span class="stat-value">{{ particleDensity }}k</span>
          </div>
        </div>
      </div>

      <!-- 中央控制台 -->
      <div class="central-console">
        <div class="console-glass">
          <div class="console-content">
            <h2 class="console-title">超维度控制中心</h2>

            <!-- 主控按钮 -->
            <div class="main-controls">
              <button
                class="dimension-button primary"
                :class="{ active: realityShiftActive }"
                @click="initiateRealityShift"
              >
                <div class="button-glow"></div>
                <div class="button-content">
                  <span class="button-icon">🌌</span>
                  <span class="button-text">现实重构</span>
                </div>
                <div class="button-pulse"></div>
              </button>

              <button
                class="dimension-button secondary"
                :class="{ active: consciousnessLinkActive }"
                @click="activateConsciousnessLink"
              >
                <div class="button-glow"></div>
                <div class="button-content">
                  <span class="button-icon">🧠</span>
                  <span class="button-text">意识链接</span>
                </div>
              </button>

              <button
                class="dimension-button tertiary"
                :class="{ active: timeFoldActive }"
                @click="enableTimeFold"
              >
                <div class="button-glow"></div>
                <div class="button-content">
                  <span class="button-icon">⏳</span>
                  <span class="button-text">时间折叠</span>
                </div>
              </button>
            </div>

            <!-- 维度选择器 -->
            <div class="dimension-selector">
              <h3>维度选择器</h3>
              <div class="dimension-grid">
                <div
                  v-for="dim in dimensions"
                  :key="dim.id"
                  class="dimension-card"
                  :class="{ active: dim.id === currentDimension }"
                  @click="switchDimension(dim.id)"
                >
                  <div class="card-inner">
                    <div class="dimension-icon">{{ dim.icon }}</div>
                    <div class="dimension-name">{{ dim.name }}</div>
                    <div class="dimension-stability">{{ dim.stability }}%</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 实时数据流 -->
            <div class="data-stream">
              <h3>量子数据流</h3>
              <div class="stream-visualizer">
                <div
                  v-for="(bar, index) in streamData"
                  :key="index"
                  class="stream-bar"
                  :style="{ height: bar.height + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边信息面板 -->
      <div class="side-panel">
        <div class="panel-glass">
          <div class="panel-content">
            <h3>系统监控</h3>
            <div class="monitor-grid">
              <div class="monitor-item">
                <div class="monitor-label">CPU负载</div>
                <div class="monitor-value">{{ cpuLoad }}%</div>
                <div class="monitor-bar">
                  <div class="monitor-fill" :style="{ width: cpuLoad + '%' }"></div>
                </div>
              </div>
              <div class="monitor-item">
                <div class="monitor-label">内存使用</div>
                <div class="monitor-value">{{ memoryUsage }}%</div>
                <div class="monitor-bar">
                  <div class="monitor-fill" :style="{ width: memoryUsage + '%' }"></div>
                </div>
              </div>
              <div class="monitor-item">
                <div class="monitor-label">GPU性能</div>
                <div class="monitor-value">{{ gpuPerformance }}%</div>
                <div class="monitor-bar">
                  <div class="monitor-fill" :style="{ width: gpuPerformance + '%' }"></div>
                </div>
              </div>
            </div>

            <div class="performance-metrics">
              <div class="metric">
                <span>FPS:</span>
                <span>{{ fps }}</span>
              </div>
              <div class="metric">
                <span>延迟:</span>
                <span>{{ latency }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部交互提示 -->
      <div class="interaction-hints">
        <div class="hint-section">
          <h4>交互控制</h4>
          <div class="hint-grid">
            <div class="hint-item">
              <kbd>🖱️ 拖拽</kbd>
              <span>视角旋转</span>
            </div>
            <div class="hint-item">
              <kbd>🖱️ 滚轮</kbd>
              <span>缩放层级</span>
            </div>
            <div class="hint-item">
              <kbd>WASD</kbd>
              <span>自由移动</span>
            </div>
            <div class="hint-item">
              <kbd>Shift</kbd>
              <span>加速模式</span>
            </div>
          </div>
        </div>

        <div class="progress-section">
          <div class="dimension-progress">
            <span>当前维度: {{ currentDimension }}/12</span>
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: (currentDimension / 12) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 紧急协议按钮 -->
    <div class="emergency-protocol">
      <button class="emergency-btn" @click="triggerEmergencyProtocol">
        <div class="pulse-animation"></div>
        <span class="emergency-text">🚨 EMERGENCY PROTOCOL</span>
      </button>
    </div>

    <!-- 加载界面 -->
    <div v-if="isLoading" class="loading-screen">
      <div class="quantum-init">
        <div class="init-steps">
          <div v-for="(step, index) in initSteps" :key="index" class="init-step">
            <div class="step-indicator" :class="{ completed: step.completed }"></div>
            <span class="step-text">{{ step.text }}</span>
          </div>
        </div>
        <div class="quantum-loader">
          <div v-for="i in 4" :key="i" class="loader-orbit"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'

// 响应式数据
const mainCanvas = ref<HTMLElement>()
const particleCanvas = ref<HTMLCanvasElement>()
const isLoading = ref(true)
const realityShiftActive = ref(false)
const consciousnessLinkActive = ref(false)
const timeFoldActive = ref(false)
const currentDimension = ref(1)

// 系统状态
const quantumEntanglement = ref(99.9)
const dimensionStability = ref(99.5)
const neuralLinks = ref(2048)
const particleDensity = ref(100)
const fps = ref(60)
const cpuLoad = ref(45)
const memoryUsage = ref(62)
const gpuPerformance = ref(88)
const latency = ref(12)

// 维度数据
const dimensions = reactive([
  { id: 1, name: '物理维度', icon: '⚛️', stability: 100 },
  { id: 2, name: '能量维度', icon: '⚡', stability: 98 },
  { id: 3, name: '时间维度', icon: '⏱️', stability: 95 },
  { id: 4, name: '空间维度', icon: '🌌', stability: 97 },
  { id: 5, name: '意识维度', icon: '🧠', stability: 92 },
  { id: 6, name: '量子维度', icon: '🌀', stability: 90 },
  { id: 7, name: '弦理论维度', icon: '🎵', stability: 88 },
  { id: 8, name: '平行宇宙', icon: '🔮', stability: 85 },
  { id: 9, name: '虚数维度', icon: '🔢', stability: 82 },
  { id: 10, name: '暗物质维度', icon: '🌑', stability: 80 },
  { id: 11, name: '信息维度', icon: '💾', stability: 78 },
  { id: 12, name: '超维度', icon: '🚀', stability: 75 }
])

// 数据流
const streamData = reactive(
  Array.from({ length: 64 }, () => ({
    height: Math.random() * 100
  }))
)

// 初始化步骤
const initSteps = reactive([
  { text: '量子场初始化', completed: false },
  { text: '维度锚定激活', completed: false },
  { text: '神经网络连接', completed: false },
  { text: '粒子加速器启动', completed: false },
  { text: '时空校准完成', completed: false },
  { text: '超维度通道开放', completed: false }
])

// Three.js 对象
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let particleSystem: THREE.Points
let animationId: number
let particlePositions: Float32Array
let particleVelocities: Float32Array

// 2D粒子系统
let particleCtx: CanvasRenderingContext2D
let particles2D: Array<{
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
}> = []

// 初始化超高级场景
const initUltraAdvancedScene = () => {
  // 创建超高级场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  scene.fog = new THREE.Fog(0x000000, 100, 500)

  // 超广角相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
  camera.position.set(0, 0, 100)

  // 高性能渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    logarithmicDepthBuffer: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  if (mainCanvas.value) {
    mainCanvas.value.appendChild(renderer.domElement)
  }

  // 超级光照系统
  setupSuperLighting()

  // 创建超复杂几何结构
  createSuperComplexGeometry()

  // 初始化超大规模粒子系统
  initSuperParticleSystem()

  console.log('✅ 超高级量子场景初始化完成')
}

// 超级光照系统
const setupSuperLighting = () => {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0x444466, 0.4)
  scene.add(ambientLight)

  // 主光源
  const mainLight = new THREE.DirectionalLight(0x4488ff, 1.5)
  mainLight.position.set(50, 100, 50)
  mainLight.castShadow = true
  mainLight.shadow.mapSize.width = 4096
  mainLight.shadow.mapSize.height = 4096
  scene.add(mainLight)

  // 辅助光源
  const fillLight = new THREE.PointLight(0xff4488, 1.0, 200)
  fillLight.position.set(-100, 50, -50)
  scene.add(fillLight)

  // 背景光
  const rimLight = new THREE.HemisphereLight(0x444488, 0x221133, 0.6)
  scene.add(rimLight)

  // 聚光灯
  const spotLight = new THREE.SpotLight(0x00ffff, 0.8, 200, Math.PI / 6, 0.5, 1)
  spotLight.position.set(0, 50, 0)
  scene.add(spotLight)
}

// 超复杂几何结构
const createSuperComplexGeometry = () => {
  // 中心超立方体
  const superCubeGeometry = new THREE.BoxGeometry(10, 10, 10)
  const superCubeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00ffff,
    emissive: 0x004444,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    transparent: true,
    opacity: 0.9,
    wireframe: false
  })
  const superCube = new THREE.Mesh(superCubeGeometry, superCubeMaterial)
  superCube.castShadow = true
  scene.add(superCube)

  // 量子环系统
  const quantumRingGroup = new THREE.Group()
  for (let i = 0; i < 8; i++) {
    const ringGeometry = new THREE.TorusGeometry(15 + i * 4, 0.5, 16, 100)
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(i / 8, 1, 0.6),
      transparent: true,
      opacity: 0.6,
      emissive: new THREE.Color().setHSL(i / 8, 1, 0.1),
      side: THREE.DoubleSide
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = Math.PI / 2
    ring.rotation.z = (i * Math.PI) / 4
    quantumRingGroup.add(ring)
  }
  scene.add(quantumRingGroup)

  // 星际网格
  const gridGroup = new THREE.Group()
  for (let i = 0; i < 12; i++) {
    const gridGeometry = new THREE.PlaneGeometry(200, 200)
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(i / 12, 0.7, 0.5),
      transparent: true,
      opacity: 0.1,
      wireframe: true
    })
    const grid = new THREE.Mesh(gridGeometry, gridMaterial)
    grid.rotation.x = Math.PI / 2
    grid.position.y = -50 + i * 10
    gridGroup.add(grid)
  }
  scene.add(gridGroup)

  // 添加超级动画
  gsap.to(superCube.rotation, {
    x: Math.PI * 4,
    y: Math.PI * 4,
    duration: 30,
    repeat: -1,
    ease: 'none'
  })

  gsap.to(quantumRingGroup.rotation, {
    x: Math.PI * 2,
    y: Math.PI * 2,
    z: Math.PI * 2,
    duration: 40,
    repeat: -1,
    ease: 'none'
  })

  gsap.to(gridGroup.rotation, {
    x: Math.PI * 0.5,
    y: Math.PI * 0.5,
    duration: 60,
    repeat: -1,
    ease: 'none'
  })
}

// 超大规模粒子系统
const initSuperParticleSystem = () => {
  const particleCount = 100000
  const geometry = new THREE.BufferGeometry()

  particlePositions = new Float32Array(particleCount * 3)
  particleVelocities = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3

    // 螺旋分布
    const angle = (i / particleCount) * Math.PI * 2 * 10
    const radius = Math.sqrt(i / particleCount) * 100
    const height = (i % 2 === 0 ? 1 : -1) * (i / particleCount) * 100

    particlePositions[i3] = Math.cos(angle) * radius
    particlePositions[i3 + 1] = height
    particlePositions[i3 + 2] = Math.sin(angle) * radius

    // 复杂速度模式
    const speed = 0.01 + Math.random() * 0.02
    particleVelocities[i3] = (Math.random() - 0.5) * speed
    particleVelocities[i3 + 1] = (Math.random() - 0.5) * speed
    particleVelocities[i3 + 2] = (Math.random() - 0.5) * speed

    // 渐变颜色
    const hue = (i / particleCount) % 1
    const color = new THREE.Color().setHSL(hue, 0.9, 0.7)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b

    // 随机大小
    sizes[i] = Math.random() * 2 + 0.5
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pointSize: { value: 2.0 }
    },
    vertexShader: `
attribute float size;
attribute vec3 color;
varying vec3 vColor;

void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
    `,
    fragmentShader: `
varying vec3 vColor;

void main() {
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  if (distanceToCenter > 0.5) discard;
  float alpha = 1.0 - 2.0 * distanceToCenter;
  gl_FragColor = vec4(vColor, alpha * 0.8);
}
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  particleSystem = new THREE.Points(geometry, material)
  scene.add(particleSystem)
}

// 2D粒子系统
const init2DParticles = () => {
  if (!particleCanvas.value) return

  particleCanvas.value.width = window.innerWidth
  particleCanvas.value.height = window.innerHeight
  particleCtx = particleCanvas.value.getContext('2d')!

  // 创建更多2D粒子
  for (let i = 0; i < 300; i++) {
    particles2D.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.4 + 0.1,
      hue: Math.random() * 360
    })
  }

  animate2DParticles()
}

// 2D粒子动画
const animate2DParticles = () => {
  if (!particleCtx) return

  particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  particles2D.forEach(particle => {
    // 更新位置
    particle.x += particle.vx
    particle.y += particle.vy

    // 边界反弹
    if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1
    if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1

    // 绘制粒子
    particleCtx.beginPath()
    particleCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    particleCtx.fillStyle = `hsla(${particle.hue}, 80%, 60%, ${particle.opacity})`
    particleCtx.fill()
  })

  requestAnimationFrame(animate2DParticles)
}

// 超级渲染循环
const ultraAdvancedAnimate = () => {
  animationId = requestAnimationFrame(ultraAdvancedAnimate)

  // 更新3D粒子系统
  if (particleSystem) {
    const positions = particleSystem.geometry.attributes.position.array as Float32Array
    const material = particleSystem.material as THREE.ShaderMaterial

    // 更新时间uniform
    material.uniforms.time.value = performance.now() * 0.001

    // 更新粒子位置
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += particleVelocities[i]
      positions[i + 1] += particleVelocities[i + 1]
      positions[i + 2] += particleVelocities[i + 2]

      // 复杂边界条件
      const distance = Math.sqrt(positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2)
      if (distance > 200) {
        positions[i] *= -0.9
        positions[i + 1] *= -0.9
        positions[i + 2] *= -0.9
      }
    }

    particleSystem.geometry.attributes.position.needsUpdate = true
  }

  // 更新数据流
  streamData.forEach((bar, index) => {
    bar.height = 10 + Math.random() * 90
  })

  // 更新系统监控
  cpuLoad.value = 40 + Math.random() * 20
  memoryUsage.value = 60 + Math.random() * 15
  gpuPerformance.value = 85 + Math.random() * 10
  latency.value = 8 + Math.random() * 8

  // 渲染场景
  renderer.render(scene, camera)
}

// 控制函数
const initiateRealityShift = () => {
  realityShiftActive.value = !realityShiftActive.value

  // 现实重构动画
  const tl = gsap.timeline()

  tl.to(camera.position, {
    x: realityShiftActive.value ? 30 : 0,
    y: realityShiftActive.value ? 20 : 0,
    z: realityShiftActive.value ? 80 : 100,
    duration: 2,
    ease: 'power3.inOut'
  })

  tl.to(
    scene.children[0].rotation,
    {
      x: realityShiftActive.value ? Math.PI : 0,
      y: realityShiftActive.value ? Math.PI * 2 : 0,
      duration: 2,
      ease: 'power3.inOut'
    },
    0
  )
}

const activateConsciousnessLink = () => {
  consciousnessLinkActive.value = !consciousnessLinkActive.value

  // 意识链接动画
  gsap.to(neuralLinks, {
    value: consciousnessLinkActive.value ? 4096 : 2048,
    duration: 1.5,
    ease: 'elastic.out(1, 0.3)'
  })

  gsap.to(quantumEntanglement, {
    value: consciousnessLinkActive.value ? 99.99 : 99.9,
    duration: 1.5,
    ease: 'power2.out'
  })
}

const enableTimeFold = () => {
  timeFoldActive.value = !timeFoldActive.value

  // 时间折叠动画
  gsap.to(dimensionStability, {
    value: timeFoldActive.value ? 85.5 : 99.5,
    duration: 2,
    ease: 'power2.out'
  })

  gsap.to(particleDensity, {
    value: timeFoldActive.value ? 150 : 100,
    duration: 2,
    ease: 'power2.out'
  })
}

const switchDimension = (dimensionId: number) => {
  currentDimension.value = dimensionId

  // 维度切换动画
  gsap.to(camera.position, {
    x: (dimensionId - 6.5) * 20,
    y: (dimensionId - 6.5) * 5,
    duration: 2.5,
    ease: 'expo.inOut'
  })

  // 更新维度稳定性
  const targetStability = dimensions.find(d => d.id === dimensionId)?.stability || 100
  gsap.to(dimensionStability, {
    value: targetStability,
    duration: 2,
    ease: 'power2.out'
  })
}

const triggerEmergencyProtocol = () => {
  // 紧急协议：重置所有系统
  gsap.to([camera.position, scene.rotation], {
    x: 0,
    y: 0,
    z: 100,
    duration: 3,
    ease: 'power4.out'
  })

  realityShiftActive.value = false
  consciousnessLinkActive.value = false
  timeFoldActive.value = false
  currentDimension.value = 1

  gsap.to([quantumEntanglement, dimensionStability], {
    value: 100,
    duration: 2,
    ease: 'power2.out'
  })
}

// 窗口调整
const handleResize = () => {
  if (!camera || !renderer) return

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)

  if (particleCanvas.value) {
    particleCanvas.value.width = window.innerWidth
    particleCanvas.value.height = window.innerHeight
  }
}

// 键盘控制
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.code) {
    case 'Space':
      event.preventDefault()
      initiateRealityShift()
      break
    case 'KeyC':
      activateConsciousnessLink()
      break
    case 'KeyT':
      enableTimeFold()
      break
    case 'Escape':
      triggerEmergencyProtocol()
      break
  }
}

// 组件生命周期
onMounted(() => {
  // 启动初始化序列
  setTimeout(() => {
    initSteps.forEach((step, index) => {
      setTimeout(() => {
        step.completed = true
      }, index * 1000)
    })

    setTimeout(() => {
      isLoading.value = false
      initUltraAdvancedScene()
      init2DParticles()
      ultraAdvancedAnimate()
    }, 6000)
  }, 800)

  // 添加事件监听
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped lang="scss">
.ultra-advanced-portal {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(ellipse at center, #000000 0%, #0a0a2a 50%, #1a0a3a 100%);
}

.main-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.particle-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  opacity: 0.5;
}

.holographic-interface {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  color: #00ffff;
  font-family: 'Orbitron', 'Monaco', 'Consolas', monospace;
}

.quantum-status-bar {
  position: absolute;
  top: 25px;
  left: 25px;
  right: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(0, 20, 40, 0.4);
  backdrop-filter: blur(30px);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  pointer-events: auto;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);

  .branding {
    .logo-primary {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 4px;
      text-shadow: 0 0 30px rgba(0, 255, 255, 1);
      margin-bottom: 8px;
    }

    .logo-secondary {
      font-size: 14px;
      color: rgba(0, 255, 255, 0.8);
      letter-spacing: 2px;
    }
  }

  .system-stats {
    display: flex;
    gap: 40px;

    .stat-item {
      text-align: center;

      .stat-label {
        display: block;
        font-size: 12px;
        color: rgba(0, 255, 255, 0.7);
        margin-bottom: 5px;
      }

      .stat-value {
        display: block;
        font-size: 18px;
        font-weight: bold;
        color: #00ffff;
        text-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
      }
    }
  }
}

.central-console {
  position: absolute;
  top: 50%;
  left: 40px;
  transform: translateY(-50%);
  width: 380px;
  background: rgba(5, 15, 30, 0.5);
  backdrop-filter: blur(40px);
  border: 2px solid rgba(0, 255, 255, 0.4);
  border-radius: 25px;
  padding: 30px;
  pointer-events: auto;
  box-shadow: 0 0 40px rgba(0, 255, 255, 0.3);

  .console-glass {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 255, 255, 0.15) 0%,
      rgba(100, 0, 255, 0.1) 50%,
      rgba(255, 0, 128, 0.1) 100%
    );
    border-radius: 25px;
    pointer-events: none;
  }

  .console-content {
    position: relative;
    z-index: 2;

    .console-title {
      color: #00ffff;
      font-size: 20px;
      text-align: center;
      margin-bottom: 30px;
      text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
    }

    .main-controls {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 35px;
    }

    .dimension-button {
      position: relative;
      padding: 20px 25px;
      background: rgba(0, 30, 60, 0.7);
      border: 2px solid rgba(0, 255, 255, 0.5);
      border-radius: 15px;
      color: #00ffff;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      overflow: hidden;

      &.primary {
        background: linear-gradient(45deg, rgba(0, 255, 255, 0.3), rgba(0, 100, 200, 0.4));

        &:hover:not(.active) {
          border-color: #00ffff;
          box-shadow: 0 0 40px rgba(0, 255, 255, 0.8);
          transform: translateY(-3px);
        }

        &.active {
          border-color: #00ffff;
          box-shadow: 0 0 50px rgba(0, 255, 255, 1);
          background: linear-gradient(45deg, rgba(0, 255, 255, 0.5), rgba(0, 150, 255, 0.6));
        }
      }

      &.secondary {
        background: linear-gradient(45deg, rgba(255, 0, 128, 0.3), rgba(150, 0, 100, 0.4));
        border-color: rgba(255, 0, 128, 0.5);
        color: #ff0080;

        &.active {
          border-color: #ff0080;
          box-shadow: 0 0 40px rgba(255, 0, 128, 0.8);
        }
      }

      &.tertiary {
        background: linear-gradient(45deg, rgba(128, 0, 255, 0.3), rgba(80, 0, 150, 0.4));
        border-color: rgba(128, 0, 255, 0.5);
        color: #8000ff;

        &.active {
          border-color: #8000ff;
          box-shadow: 0 0 40px rgba(128, 0, 255, 0.8);
        }
      }

      .button-glow {
        position: absolute;
        top: -2px;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.8s;
      }

      .button-content {
        display: flex;
        align-items: center;
        gap: 12px;

        .button-icon {
          font-size: 24px;
        }

        .button-text {
          font-weight: 600;
          letter-spacing: 1px;
        }
      }

      .button-pulse {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(0, 255, 255, 0.5);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }

      &:hover .button-glow {
        left: 100%;
      }

      &:active .button-pulse {
        width: 300px;
        height: 300px;
        opacity: 0;
      }
    }
  }
}

.dimension-selector {
  h3 {
    color: #00ffff;
    font-size: 17px;
    margin-bottom: 20px;
    text-align: center;
  }

  .dimension-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }

  .dimension-card {
    background: rgba(0, 25, 50, 0.5);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 12px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #00ffff;
      background: rgba(0, 50, 100, 0.7);
      transform: translateY(-3px);
      box-shadow: 0 5px 20px rgba(0, 255, 255, 0.3);
    }

    &.active {
      border-color: #00ffff;
      background: rgba(0, 100, 200, 0.5);
      box-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
    }

    .card-inner {
      text-align: center;

      .dimension-icon {
        font-size: 28px;
        margin-bottom: 10px;
      }

      .dimension-name {
        font-size: 13px;
        color: #00ffff;
        margin-bottom: 5px;
      }

      .dimension-stability {
        font-size: 11px;
        color: rgba(0, 255, 255, 0.7);
      }
    }
  }
}

.data-stream {
  margin-top: 25px;

  h3 {
    color: #00ffff;
    font-size: 15px;
    margin-bottom: 15px;
    text-align: center;
  }

  .stream-visualizer {
    display: flex;
    gap: 2px;
    height: 80px;
    align-items: flex-end;
    background: rgba(0, 20, 40, 0.3);
    padding: 10px;
    border-radius: 10px;

    .stream-bar {
      flex: 1;
      background: linear-gradient(to top, #00ffff, #8000ff);
      border-radius: 2px 2px 0 0;
      min-height: 2px;
      transition: height 0.1s ease;
    }
  }
}

.side-panel {
  position: absolute;
  top: 50%;
  right: 40px;
  transform: translateY(-50%);
  width: 280px;
  background: rgba(5, 15, 30, 0.5);
  backdrop-filter: blur(40px);
  border: 2px solid rgba(128, 0, 255, 0.4);
  border-radius: 20px;
  padding: 25px;
  pointer-events: auto;
  box-shadow: 0 0 40px rgba(128, 0, 255, 0.3);

  .panel-glass {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(128, 0, 255, 0.1) 0%,
      rgba(0, 128, 255, 0.05) 50%,
      rgba(255, 0, 128, 0.1) 100%
    );
    border-radius: 20px;
    pointer-events: none;
  }

  .panel-content {
    position: relative;
    z-index: 2;

    h3 {
      color: #8000ff;
      font-size: 18px;
      margin-bottom: 25px;
      text-align: center;
    }

    .monitor-grid {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 20px;

      .monitor-item {
        .monitor-label {
          font-size: 12px;
          color: rgba(128, 0, 255, 0.8);
          margin-bottom: 5px;
        }

        .monitor-value {
          font-size: 16px;
          color: #8000ff;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .monitor-bar {
          width: 100%;
          height: 6px;
          background: rgba(80, 0, 128, 0.3);
          border-radius: 3px;
          overflow: hidden;

          .monitor-fill {
            height: 100%;
            background: linear-gradient(90deg, #8000ff, #ff0080);
            border-radius: 3px;
            transition: width 0.3s ease;
          }
        }
      }
    }

    .performance-metrics {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: rgba(128, 0, 255, 0.9);

      .metric {
        display: flex;
        flex-direction: column;
        align-items: center;

        span:first-child {
          color: rgba(128, 0, 255, 0.6);
        }

        span:last-child {
          font-weight: bold;
          color: #8000ff;
        }
      }
    }
  }
}

.interaction-hints {
  position: absolute;
  bottom: 30px;
  left: 30px;
  right: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  pointer-events: auto;

  .hint-section {
    h4 {
      color: #00ffff;
      font-size: 15px;
      margin-bottom: 15px;
      text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }

    .hint-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      .hint-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;

        kbd {
          background: rgba(0, 40, 80, 0.7);
          border: 1px solid rgba(0, 255, 255, 0.4);
          border-radius: 6px;
          padding: 4px 12px;
          font-family: inherit;
          color: #00ffff;
          font-size: 12px;
        }

        span {
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }

  .progress-section {
    .dimension-progress {
      text-align: right;

      span {
        display: block;
        color: #00ffff;
        font-size: 14px;
        margin-bottom: 10px;
      }

      .progress-track {
        width: 250px;
        height: 8px;
        background: rgba(0, 40, 80, 0.6);
        border-radius: 4px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ffff, #8000ff, #ff0080);
          border-radius: 4px;
          transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      }
    }
  }
}

.emergency-protocol {
  position: absolute;
  bottom: 30px;
  right: 30px;
  pointer-events: auto;

  .emergency-btn {
    position: relative;
    padding: 15px 25px;
    background: rgba(255, 0, 0, 0.3);
    border: 2px solid rgba(255, 0, 0, 0.6);
    border-radius: 30px;
    color: #ff4444;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
      background: rgba(255, 0, 0, 0.5);
      border-color: #ff4444;
      box-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
      transform: scale(1.05);
    }

    .pulse-animation {
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 2px solid rgba(255, 0, 0, 0.4);
      border-radius: 30px;
      animation: emergencyPulse 2s infinite;
    }

    .emergency-text {
      position: relative;
      z-index: 2;
    }
  }
}

.loading-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 5, 15, 0.98);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(20px);

  .quantum-init {
    text-align: center;

    .init-steps {
      margin-bottom: 50px;

      .init-step {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
        opacity: 0.4;
        transition: opacity 0.6s ease;

        &.completed {
          opacity: 1;

          .step-indicator {
            background: #00ff88;
            box-shadow: 0 0 20px #00ff88;
          }
        }

        .step-indicator {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #444;
          transition: all 0.6s ease;
        }

        .step-text {
          color: #00ffff;
          font-size: 16px;
        }
      }
    }

    .quantum-loader {
      position: relative;
      width: 100px;
      height: 100px;
      margin: 0 auto;

      .loader-orbit {
        position: absolute;
        border: 4px solid transparent;
        border-top-color: #00ffff;
        border-radius: 50%;
        animation: loaderSpin 2s linear infinite;

        &:nth-child(1) {
          width: 100px;
          height: 100px;
          top: 0;
          left: 0;
        }

        &:nth-child(2) {
          width: 80px;
          height: 80px;
          top: 10px;
          left: 10px;
          animation-delay: -0.5s;
          border-top-color: #8000ff;
        }

        &:nth-child(3) {
          width: 60px;
          height: 60px;
          top: 20px;
          left: 20px;
          animation-delay: -1s;
          border-top-color: #ff0080;
        }

        &:nth-child(4) {
          width: 40px;
          height: 40px;
          top: 30px;
          left: 30px;
          animation-delay: -1.5s;
          border-top-color: #ffff00;
        }
      }
    }
  }
}

@keyframes emergencyPulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes loaderSpin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>