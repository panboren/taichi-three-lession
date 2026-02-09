<template>
  <div class="professional-portal">
    <!-- 主要3D画布 -->
    <div ref="mainCanvas" class="main-canvas"></div>

    <!-- 粒子背景层 -->
    <canvas ref="particleCanvas" class="particle-background"></canvas>

    <!-- 全息HUD界面 -->
    <div class="holographic-hud">
      <!-- 顶部量子状态栏 -->
      <div class="quantum-status-bar">
        <div class="branding">
          <div class="logo-primary">QUANTUM_NEXUS</div>
          <div class="logo-secondary">时空维度控制器 v3.0</div>
        </div>
        <div class="system-metrics">
          <div class="metric-item">
            <span class="metric-label">量子频率</span>
            <span class="metric-value">{{ quantumFrequency }} Hz</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">维度稳定性</span>
            <span class="metric-value">{{ dimensionStability }}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">神经连接</span>
            <span class="metric-value">{{ neuralConnections }}</span>
          </div>
        </div>
      </div>

      <!-- 中央控制面板 -->
      <div class="central-control-panel">
        <div class="panel-glass-effect"></div>
        <div class="panel-content">
          <h2 class="panel-title">量子操控中心</h2>

          <!-- 主要控制按钮 -->
          <div class="primary-controls">
            <button
              class="quantum-button primary"
              :disabled="isTransitioning"
              @click="initiateQuantumLeap"
            >
              <div class="button-glow"></div>
              <span class="button-icon">⚛️</span>
              <span class="button-text">量子跃迁</span>
              <div class="button-ripple"></div>
            </button>

            <button
              class="quantum-button secondary"
              :class="{ active: neuralNetworkActive }"
              @click="activateNeuralNetwork"
            >
              <div class="button-glow"></div>
              <span class="button-icon">🧠</span>
              <span class="button-text">神经网络</span>
            </button>

            <button
              class="quantum-button tertiary"
              :class="{ active: timeDistortionActive }"
              @click="enableTimeDistortion"
            >
              <div class="button-glow"></div>
              <span class="button-icon">⏱️</span>
              <span class="button-text">时空扭曲</span>
            </button>
          </div>

          <!-- 维度导航器 -->
          <div class="dimension-navigator">
            <h3>维度导航</h3>
            <div class="dimension-grid">
              <div
                v-for="dim in dimensions"
                :key="dim.id"
                class="dimension-cell"
                :class="{ active: dim.id === currentDimension }"
                @click="navigateToDimension(dim.id)"
              >
                <div class="cell-inner">
                  <div class="dimension-icon">{{ dim.icon }}</div>
                  <div class="dimension-name">{{ dim.name }}</div>
                  <div class="dimension-status">{{ dim.status }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据可视化面板 -->
      <div class="data-visualization-panel">
        <div class="panel-header">
          <h3>实时数据流监测</h3>
          <div class="data-status">
            <div class="status-indicator" :class="{ active: dataStreamActive }"></div>
            <span>{{ dataStreamActive ? '数据流活跃' : '数据流休眠' }}</span>
          </div>
        </div>

        <div class="data-charts">
          <!-- 频谱分析器 -->
          <div class="spectrum-analyzer">
            <div class="analyzer-header">
              <span>量子频谱分析</span>
              <div class="frequency-bars">
                <div
                  v-for="(bar, index) in spectrumBars"
                  :key="index"
                  class="frequency-bar"
                  :style="{ height: bar.height + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- 粒子计数器 -->
          <div class="particle-counter">
            <div class="counter-display">
              <div class="counter-value">{{ particleCount.toLocaleString() }}</div>
              <div class="counter-label">活跃粒子</div>
            </div>
            <div class="counter-graphic">
              <div v-for="i in 8" :key="i" class="particle-orbit"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部交互指南 -->
      <div class="interaction-guide">
        <div class="guide-section">
          <h4>交互控制</h4>
          <div class="control-list">
            <div class="control-item">
              <kbd>🖱️ 拖拽</kbd>
              <span>旋转视角</span>
            </div>
            <div class="control-item">
              <kbd>🖱️ 滚轮</kbd>
              <span>缩放维度</span>
            </div>
            <div class="control-item">
              <kbd>空格键</kbd>
              <span>暂停/继续</span>
            </div>
            <div class="control-item">
              <kbd>ESC</kbd>
              <span>紧急重置</span>
            </div>
          </div>
        </div>

        <div class="progress-section">
          <div class="dimension-progress">
            <span>当前维度: {{ currentDimension }}/7</span>
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: (currentDimension / 7) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 应急系统 -->
    <div class="emergency-system">
      <button class="emergency-button" title="紧急协议启动" @click="triggerEmergencyProtocol">
        <div class="emergency-pulse"></div>
        <span class="emergency-icon">⚠️</span>
        <span class="emergency-text">EMERGENCY</span>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="quantum-initialization">
        <div class="init-sequence">
          <div v-for="(step, index) in initSteps" :key="index" class="sequence-item">
            <div class="step-indicator" :class="{ completed: step.completed }"></div>
            <span class="step-text">{{ step.text }}</span>
          </div>
        </div>
        <div class="quantum-spinner">
          <div v-for="i in 3" :key="i" class="spinner-ring"></div>
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
const isTransitioning = ref(false)
const neuralNetworkActive = ref(false)
const timeDistortionActive = ref(false)
const dataStreamActive = ref(true)
const currentDimension = ref(1)

// 系统状态数据
const quantumFrequency = ref(440)
const dimensionStability = ref(98.7)
const neuralConnections = ref(1024)
const particleCount = ref(50000)

// 维度数据
const dimensions = reactive([
  { id: 1, name: '物质维度', icon: '⚛️', status: '稳定' },
  { id: 2, name: '能量维度', icon: '⚡', status: '活跃' },
  { id: 3, name: '时间维度', icon: '⏱️', status: '波动' },
  { id: 4, name: '空间维度', icon: '🌌', status: '扩张' },
  { id: 5, name: '意识维度', icon: '🧠', status: '觉醒' },
  { id: 6, name: '量子维度', icon: '🌀', status: '叠加' },
  { id: 7, name: '超弦维度', icon: '🎵', status: '共振' }
])

// 频谱分析数据
const spectrumBars = reactive(
  Array.from({ length: 32 }, () => ({
    height: Math.random() * 100
  }))
)

// 初始化步骤
const initSteps = reactive([
  { text: '量子引擎启动', completed: false },
  { text: '维度锚定系统', completed: false },
  { text: '神经网络连接', completed: false },
  { text: '粒子加速器', completed: false },
  { text: '时空校准完毕', completed: false }
])

// Three.js 对象
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let particleSystem: THREE.Points
let animationId: number
let particlePositions: Float32Array
let particleVelocities: Float32Array

// 粒子系统
let particleCtx: CanvasRenderingContext2D
let particles2D: Array<{
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}> = []

// 初始化专业级场景
const initProfessionalScene = () => {
  // 创建高级场景设置
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000011)
  scene.fog = new THREE.Fog(0x000011, 50, 300)

  // 专业级相机配置
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000)
  camera.position.set(0, 0, 50)

  // 高性能渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  if (mainCanvas.value) {
    mainCanvas.value.appendChild(renderer.domElement)
  }

  // 专业光照系统
  setupProfessionalLighting()

  // 创建复杂的几何结构
  createAdvancedGeometry()

  // 初始化粒子系统
  initParticleSystem()

  console.log('✅ 专业级量子场景初始化完成')
}

// 专业级光照系统
const setupProfessionalLighting = () => {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0x222244, 0.3)
  scene.add(ambientLight)

  // 主要方向光
  const directionalLight = new THREE.DirectionalLight(0x4488ff, 1.2)
  directionalLight.position.set(20, 30, 20)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  // 补充光源
  const fillLight = new THREE.PointLight(0xff4488, 0.8, 100)
  fillLight.position.set(-30, 20, -20)
  scene.add(fillLight)

  // 背景光
  const rimLight = new THREE.HemisphereLight(0x444488, 0x221133, 0.4)
  scene.add(rimLight)
}

// 高级几何结构
const createAdvancedGeometry = () => {
  // 中央量子核心
  const coreGeometry = new THREE.IcosahedronGeometry(3, 3)
  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00ffff,
    emissive: 0x004444,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.8
  })
  const quantumCore = new THREE.Mesh(coreGeometry, coreMaterial)
  quantumCore.castShadow = true
  scene.add(quantumCore)

  // 能量环系统
  const ringGroup = new THREE.Group()
  for (let i = 0; i < 5; i++) {
    const ringGeometry = new THREE.TorusGeometry(8 + i * 3, 0.3, 16, 100)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(i / 5, 1, 0.6),
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = Math.PI / 2
    ringGroup.add(ring)
  }
  scene.add(ringGroup)

  // 添加高级动画
  gsap.to(quantumCore.rotation, {
    x: Math.PI * 2,
    y: Math.PI * 2,
    duration: 15,
    repeat: -1,
    ease: 'none'
  })

  gsap.to(ringGroup.rotation, {
    y: Math.PI * 2,
    duration: 20,
    repeat: -1,
    ease: 'none'
  })
}

// 初始化专业粒子系统
const initParticleSystem = () => {
  const particleCount = 20000
  const geometry = new THREE.BufferGeometry()

  particlePositions = new Float32Array(particleCount * 3)
  particleVelocities = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3

    // 球面分布
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = 30 + Math.random() * 70

    particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    particlePositions[i3 + 2] = radius * Math.cos(phi)

    // 径向速度
    const speed = 0.02 + Math.random() * 0.03
    particleVelocities[i3] = (Math.random() - 0.5) * speed
    particleVelocities[i3 + 1] = (Math.random() - 0.5) * speed
    particleVelocities[i3 + 2] = (Math.random() - 0.5) * speed

    // 颜色渐变
    const hue = i / particleCount
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  })

  particleSystem = new THREE.Points(geometry, material)
  scene.add(particleSystem)
}

// 2D粒子背景系统
const init2DParticles = () => {
  if (!particleCanvas.value) return

  particleCanvas.value.width = window.innerWidth
  particleCanvas.value.height = window.innerHeight
  particleCtx = particleCanvas.value.getContext('2d')!

  // 创建2D粒子
  for (let i = 0; i < 100; i++) {
    particles2D.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2
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

    // 边界检测
    if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1
    if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1

    // 绘制粒子
    particleCtx.beginPath()
    particleCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    particleCtx.fillStyle = `rgba(0, 255, 255, ${particle.opacity})`
    particleCtx.fill()
  })

  requestAnimationFrame(animate2DParticles)
}

// 专业渲染循环
const professionalAnimate = () => {
  animationId = requestAnimationFrame(professionalAnimate)

  // 更新3D粒子
  if (particleSystem) {
    const positions = particleSystem.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += particleVelocities[i]
      positions[i + 1] += particleVelocities[i + 1]
      positions[i + 2] += particleVelocities[i + 2]

      // 简单的边界反弹
      const distance = Math.sqrt(positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2)

      if (distance > 150) {
        const factor = 149 / distance
        positions[i] *= factor
        positions[i + 1] *= factor
        positions[i + 2] *= factor

        particleVelocities[i] *= -1
        particleVelocities[i + 1] *= -1
        particleVelocities[i + 2] *= -1
      }
    }

    particleSystem.geometry.attributes.position.needsUpdate = true
  }

  // 更新频谱分析器
  spectrumBars.forEach(bar => {
    bar.height = 20 + Math.random() * 80
  })

  // 渲染场景
  renderer.render(scene, camera)
}

// 交互控制函数
const initiateQuantumLeap = () => {
  if (isTransitioning.value) return

  isTransitioning.value = true

  // 量子跃迁动画序列
  const tl = gsap.timeline({
    onComplete: () => {
      isTransitioning.value = false
      currentDimension.value = (currentDimension.value % 7) + 1
    }
  })

  // 相机移动
  tl.to(camera.position, {
    z: 20,
    duration: 1,
    ease: 'power2.inOut'
  })

  // 核心缩放
  tl.to(
    scene.children[0].scale,
    {
      x: 3,
      y: 3,
      z: 3,
      duration: 0.5,
      yoyo: true,
      repeat: 1
    },
    0
  )

  // 返回原位
  tl.to(
    camera.position,
    {
      z: 50,
      duration: 1,
      ease: 'power2.inOut'
    },
    1
  )
}

const activateNeuralNetwork = () => {
  neuralNetworkActive.value = !neuralNetworkActive.value

  // 神经网络激活效果
  gsap.to(neuralConnections, {
    value: neuralNetworkActive.value ? 2048 : 1024,
    duration: 0.8,
    ease: 'power2.out'
  })
}

const enableTimeDistortion = () => {
  timeDistortionActive.value = !timeDistortionActive.value

  // 时空扭曲效果
  gsap.to(dimensionStability, {
    value: timeDistortionActive.value ? 85.3 : 98.7,
    duration: 1,
    ease: 'power2.out'
  })
}

const navigateToDimension = (dimensionId: number) => {
  if (isTransitioning.value) return

  currentDimension.value = dimensionId

  // 维度切换动画
  gsap.to(camera.position, {
    x: (dimensionId - 4) * 15,
    duration: 1.5,
    ease: 'power2.inOut'
  })
}

const triggerEmergencyProtocol = () => {
  // 紧急重置所有系统
  gsap.to([camera.position, scene.rotation], {
    x: 0,
    y: 0,
    z: 50,
    duration: 2,
    ease: 'power3.out'
  })

  neuralNetworkActive.value = false
  timeDistortionActive.value = false
  currentDimension.value = 1
}

// 窗口响应式处理
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
      // 暂停/继续动画
      break
    case 'Escape':
      triggerEmergencyProtocol()
      break
  }
}

// 组件生命周期
onMounted(() => {
  // 初始化序列
  setTimeout(() => {
    initSteps.forEach((step, index) => {
      setTimeout(() => {
        step.completed = true
      }, index * 800)
    })

    setTimeout(() => {
      isLoading.value = false
      initProfessionalScene()
      init2DParticles()
      professionalAnimate()
    }, 4000)
  }, 500)

  // 事件监听
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
.professional-portal {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #000011 0%, #0a0a2a 50%, #111133 100%);
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
  z-index: 0;
  opacity: 0.3;
}

.holographic-hud {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  color: #00ffff;
  font-family: 'Monaco', 'Consolas', monospace;
}

.quantum-status-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background: rgba(0, 20, 40, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 15px;
  pointer-events: auto;

  .branding {
    .logo-primary {
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 3px;
      text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
      margin-bottom: 5px;
    }

    .logo-secondary {
      font-size: 12px;
      color: rgba(0, 255, 255, 0.7);
      letter-spacing: 1px;
    }
  }

  .system-metrics {
    display: flex;
    gap: 30px;

    .metric-item {
      text-align: center;

      .metric-label {
        display: block;
        font-size: 11px;
        color: rgba(0, 255, 255, 0.6);
        margin-bottom: 3px;
      }

      .metric-value {
        display: block;
        font-size: 16px;
        font-weight: bold;
        color: #00ffff;
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
      }
    }
  }
}

.central-control-panel {
  position: absolute;
  top: 50%;
  left: 30px;
  transform: translateY(-50%);
  width: 320px;
  background: rgba(5, 15, 30, 0.4);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  padding: 25px;
  pointer-events: auto;

  .panel-glass-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 255, 255, 0.1) 0%,
      transparent 50%,
      rgba(255, 0, 128, 0.1) 100%
    );
    border-radius: 20px;
    pointer-events: none;
  }

  .panel-content {
    position: relative;
    z-index: 2;

    .panel-title {
      color: #00ffff;
      font-size: 18px;
      text-align: center;
      margin-bottom: 25px;
      text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
    }

    .primary-controls {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 30px;
    }

    .quantum-button {
      position: relative;
      padding: 15px 20px;
      background: rgba(0, 40, 60, 0.6);
      border: 2px solid rgba(0, 255, 255, 0.4);
      border-radius: 12px;
      color: #00ffff;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;

      &.primary {
        background: linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(0, 100, 150, 0.3));

        &:hover:not(:disabled) {
          border-color: #00ffff;
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
          transform: translateY(-2px);
        }
      }

      &.secondary {
        background: linear-gradient(45deg, rgba(255, 0, 128, 0.2), rgba(100, 0, 50, 0.3));
        border-color: rgba(255, 0, 128, 0.4);
        color: #ff0080;

        &.active {
          border-color: #ff0080;
          box-shadow: 0 0 20px rgba(255, 0, 128, 0.6);
        }
      }

      &.tertiary {
        background: linear-gradient(45deg, rgba(128, 0, 255, 0.2), rgba(50, 0, 100, 0.3));
        border-color: rgba(128, 0, 255, 0.4);
        color: #8000ff;

        &.active {
          border-color: #8000ff;
          box-shadow: 0 0 20px rgba(128, 0, 255, 0.6);
        }
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .button-icon {
        margin-right: 10px;
        font-size: 18px;
      }

      .button-text {
        font-weight: 600;
        letter-spacing: 1px;
      }

      .button-glow {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }

      &:hover .button-glow {
        left: 100%;
      }
    }
  }
}

.dimension-navigator {
  h3 {
    color: #00ffff;
    font-size: 16px;
    margin-bottom: 15px;
    text-align: center;
  }

  .dimension-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .dimension-cell {
    background: rgba(0, 30, 50, 0.4);
    border: 1px solid rgba(0, 255, 255, 0.2);
    border-radius: 10px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #00ffff;
      background: rgba(0, 50, 80, 0.6);
      transform: translateY(-2px);
    }

    &.active {
      border-color: #00ffff;
      background: rgba(0, 100, 150, 0.4);
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
    }

    .cell-inner {
      text-align: center;

      .dimension-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }

      .dimension-name {
        font-size: 12px;
        color: #00ffff;
        margin-bottom: 4px;
      }

      .dimension-status {
        font-size: 10px;
        color: rgba(0, 255, 255, 0.7);
      }
    }
  }
}

.data-visualization-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  background: rgba(5, 15, 30, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 15px;
  padding: 20px;
  pointer-events: auto;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      color: #00ffff;
      font-size: 16px;
      margin: 0;
    }

    .data-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;

      .status-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ff4444;

        &.active {
          background: #00ff88;
          box-shadow: 0 0 10px #00ff88;
        }
      }
    }
  }

  .data-charts {
    .spectrum-analyzer {
      margin-bottom: 20px;

      .analyzer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        font-size: 12px;
        color: rgba(0, 255, 255, 0.8);
      }

      .frequency-bars {
        display: flex;
        gap: 2px;
        height: 60px;
        align-items: flex-end;

        .frequency-bar {
          flex: 1;
          background: linear-gradient(to top, #00ffff, #8000ff);
          border-radius: 2px 2px 0 0;
          min-height: 5px;
          transition: height 0.1s ease;
        }
      }
    }

    .particle-counter {
      display: flex;
      align-items: center;
      gap: 15px;

      .counter-display {
        .counter-value {
          font-size: 24px;
          font-weight: bold;
          color: #00ffff;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }

        .counter-label {
          font-size: 11px;
          color: rgba(0, 255, 255, 0.7);
        }
      }

      .counter-graphic {
        position: relative;
        width: 60px;
        height: 60px;

        .particle-orbit {
          position: absolute;
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 50%;

          &:nth-child(1) {
            width: 20px;
            height: 20px;
            top: 20px;
            left: 20px;
          }
          &:nth-child(2) {
            width: 30px;
            height: 30px;
            top: 15px;
            left: 15px;
          }
          &:nth-child(3) {
            width: 40px;
            height: 40px;
            top: 10px;
            left: 10px;
          }
          &:nth-child(4) {
            width: 50px;
            height: 50px;
            top: 5px;
            left: 5px;
          }
          &:nth-child(5) {
            width: 25px;
            height: 25px;
            top: 17px;
            left: 17px;
          }
          &:nth-child(6) {
            width: 35px;
            height: 35px;
            top: 12px;
            left: 12px;
          }
          &:nth-child(7) {
            width: 45px;
            height: 45px;
            top: 7px;
            left: 7px;
          }
          &:nth-child(8) {
            width: 55px;
            height: 55px;
            top: 2px;
            left: 2px;
          }
        }
      }
    }
  }
}

.interaction-guide {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  pointer-events: auto;

  .guide-section {
    h4 {
      color: #00ffff;
      font-size: 14px;
      margin-bottom: 12px;
      text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }

    .control-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .control-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;

        kbd {
          background: rgba(0, 40, 60, 0.6);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 4px;
          padding: 2px 8px;
          font-family: inherit;
          color: #00ffff;
        }

        span {
          color: rgba(255, 255, 255, 0.8);
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
        font-size: 12px;
        margin-bottom: 8px;
      }

      .progress-track {
        width: 200px;
        height: 6px;
        background: rgba(0, 40, 60, 0.6);
        border-radius: 3px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ffff, #8000ff);
          border-radius: 3px;
          transition: width 0.5s ease;
        }
      }
    }
  }
}

.emergency-system {
  position: absolute;
  bottom: 20px;
  right: 20px;
  pointer-events: auto;

  .emergency-button {
    position: relative;
    padding: 12px 20px;
    background: rgba(255, 0, 0, 0.2);
    border: 2px solid rgba(255, 0, 0, 0.5);
    border-radius: 25px;
    color: #ff4444;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
      background: rgba(255, 0, 0, 0.4);
      border-color: #ff4444;
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.6);
      transform: scale(1.05);
    }

    .emergency-pulse {
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 2px solid rgba(255, 0, 0, 0.3);
      border-radius: 25px;
      animation: pulse 2s infinite;
    }

    .emergency-icon {
      margin-right: 8px;
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 10, 20, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(10px);

  .quantum-initialization {
    text-align: center;

    .init-sequence {
      margin-bottom: 40px;

      .sequence-item {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
        opacity: 0.5;
        transition: opacity 0.5s ease;

        &.completed {
          opacity: 1;

          .step-indicator {
            background: #00ff88;
            box-shadow: 0 0 15px #00ff88;
          }
        }

        .step-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #444;
          transition: all 0.5s ease;
        }

        .step-text {
          color: #00ffff;
          font-size: 14px;
        }
      }
    }

    .quantum-spinner {
      position: relative;
      width: 80px;
      height: 80px;
      margin: 0 auto;

      .spinner-ring {
        position: absolute;
        border: 3px solid transparent;
        border-top-color: #00ffff;
        border-radius: 50%;
        animation: spin 1.5s linear infinite;

        &:nth-child(1) {
          width: 80px;
          height: 80px;
          top: 0;
          left: 0;
        }

        &:nth-child(2) {
          width: 60px;
          height: 60px;
          top: 10px;
          left: 10px;
          animation-delay: -0.5s;
          border-top-color: #8000ff;
        }

        &:nth-child(3) {
          width: 40px;
          height: 40px;
          top: 20px;
          left: 20px;
          animation-delay: -1s;
          border-top-color: #ff0080;
        }
      }
    }
  }
}

@keyframes pulse {
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
