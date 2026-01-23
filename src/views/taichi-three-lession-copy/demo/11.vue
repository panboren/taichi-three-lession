<template>
  <div class="taichi-integration-page">
    <div id="canvas-container" class="canvas-container"></div>
    <div class="info-panel">
      <h3>课程11: Taichi.js + Three.js 性能协作</h3>
      <p>状态: {{ status }}</p>
      <p>粒子数量: {{ particleCount }}</p>
      <p>FPS: {{ fps }}</p>
      <p>计算时间: {{ computeTime.toFixed(2) }}ms</p>
      <p>传输时间: {{ transferTime.toFixed(2) }}ms</p>

      <div class="architecture-diagram">
        <h4>架构流程</h4>
        <div class="flow-diagram">
          <div class="node taichi">
            <div class="node-icon">⚡</div>
            <div class="node-label">Taichi.js</div>
            <div class="node-desc">WebGPU计算内核</div>
          </div>
          <div class="arrow">→</div>
          <div class="node transfer">
            <div class="node-icon">🔄</div>
            <div class="node-label">数据传输</div>
            <div class="node-desc">ArrayBuffer</div>
          </div>
          <div class="arrow">→</div>
          <div class="node three">
            <div class="node-icon">🎨</div>
            <div class="node-label">Three.js</div>
            <div class="node-desc">3D渲染</div>
          </div>
        </div>
      </div>

      <div class="code-section">
        <h4>Taichi.js 内核代码</h4>
        <pre><code>// Taichi.js GPU 计算内核
@ti.kernel
def update_particles(dt: ti.f32):
  for i in range(n):
    # 更新位置
    positions[i] += velocities[i] * dt
    
    # 边界反弹
    for d in ti.static(range(3)):
      if abs(positions[i][d]) > 10:
        velocities[i][d] *= -0.8</code></pre>
      </div>

      <div class="controls">
        <button @click="togglePause">{{ isPaused ? '继续' : '暂停' }}</button>
        <button @click="resetSimulation">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import * as ti from 'taichi.js'
import { onMounted, onUnmounted, ref } from 'vue'

// 状态
const status = ref('初始化中...')
const particleCount = ref(50000)
const fps = ref(60)
const computeTime = ref(0)
const transferTime = ref(0)
const isPaused = ref(false)

// Three.js 变量
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let particles: THREE.Points | null = null
let animationId: number = 0

// Taichi.js 变量
let ti: any = null
let positions: any = null // Taichi field
let velocities: any = null // Taichi field
let updateKernel: any = null // Taichi kernel
let n = 50000 // 粒子数量

// ==================== Taichi.js GPU 计算层 ====================

// 初始化 Taichi.js
async function initTaichi() {
  try {
    console.log('初始化 Taichi.js...')
    
    // 等待 Taichi.js 初始化
    ti = await (window as any).ti?.init()
    
    if (!ti) {
      // 如果全局 ti 不可用，尝试从模块导入
      console.log('尝试导入 Taichi.js...')
      // ti 已经从 'taichi.js' 导入
      await ti.init()
    }
    
    status.value = 'Taichi.js 初始化成功'
    return true
  } catch (error) {
    console.error('Taichi.js 初始化失败:', error)
    status.value = '使用 CPU 模拟'
    return false
  }
}

// 创建 Taichi 粒子场
function createTaichiFields() {
  try {
    // 创建位置和速度字段（3D 向量）
    positions = ti.Vector.field(3, ti.f32, [n])
    velocities = ti.Vector.field(3, ti.f32, [n])
    
    console.log('创建了 Taichi 字段')
    return true
  } catch (error) {
    console.error('创建 Taichi 字段失败:', error)
    return false
  }
}

// 创建 Taichi 更新内核
function createUpdateKernel() {
  try {
    // 将变量添加到内核作用域
    ti.addToKernelScope({
      positions,
      velocities,
      n
    })
    
    // 创建更新内核
    updateKernel = ti.kernel((dt: number) => {
      for (let i = 0; i < n; i++) {
        // 更新位置
        positions[i][0] += velocities[i][0] * dt
        positions[i][1] += velocities[i][1] * dt
        positions[i][2] += velocities[i][2] * dt
        
        // 边界反弹 (边界 = 10)
        const bounds = 10
        const bounce = -0.8
        
        for (let d = 0; d < 3; d++) {
          if (positions[i][d] > bounds) {
            positions[i][d] = bounds
            velocities[i][d] *= bounce
          } else if (positions[i][d] < -bounds) {
            positions[i][d] = -bounds
            velocities[i][d] *= bounce
          }
        }
      }
    })
    
    console.log('创建了 Taichi 更新内核')
    return true
  } catch (error) {
    console.error('创建 Taichi 内核失败:', error)
    return false
  }
}

// 初始化粒子数据
function initializeParticles() {
  const spacing = 0.8
  let index = 0
  const gridSize = Math.ceil(Math.pow(n, 1 / 3))
  
  // 使用 CPU 初始化数据，然后传输到 GPU
  const initPositions = new Float32Array(n * 3)
  const initVelocities = new Float32Array(n * 3)
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        if (index >= n) break
        
        initPositions[index * 3] = x * spacing - gridSize * spacing / 2
        initPositions[index * 3 + 1] = y * spacing - gridSize * spacing / 2
        initPositions[index * 3 + 2] = z * spacing - gridSize * spacing / 2
        
        // 随机速度
        initVelocities[index * 3] = (Math.random() - 0.5) * 2
        initVelocities[index * 3 + 1] = (Math.random() - 0.5) * 2
        initVelocities[index * 3 + 2] = (Math.random() - 0.5) * 2
        
        index++
      }
    }
  }
  
  // 传输数据到 Taichi 字段
  try {
    // Taichi.js 应该提供方法来设置字段值
    // 这部分可能需要根据实际的 API 调整
    console.log('初始化粒子数据完成')
  } catch (error) {
    console.error('初始化粒子数据失败:', error)
  }
  
  return { positions: initPositions, velocities: initVelocities }
}

// CPU 后备计算（当 Taichi.js 不可用时）
let cpuPositions: Float32Array = new Float32Array(n * 3)
let cpuVelocities: Float32Array = new Float32Array(n * 3)

function initCUParticles() {
  const spacing = 0.8
  let index = 0
  const gridSize = Math.ceil(Math.pow(n, 1 / 3))
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        if (index >= n) break
        
        cpuPositions[index * 3] = x * spacing - gridSize * spacing / 2
        cpuPositions[index * 3 + 1] = y * spacing - gridSize * spacing / 2
        cpuPositions[index * 3 + 2] = z * spacing - gridSize * spacing / 2
        
        cpuVelocities[index * 3] = (Math.random() - 0.5) * 2
        cpuVelocities[index * 3 + 1] = (Math.random() - 0.5) * 2
        cpuVelocities[index * 3 + 2] = (Math.random() - 0.5) * 2
        
        index++
      }
    }
  }
}

function updateCUParticles(dt: number) {
  const bounds = 10
  const bounce = -0.8
  
  for (let i = 0; i < n; i++) {
    const i3 = i * 3
    
    // 更新位置
    cpuPositions[i3] += cpuVelocities[i3] * dt
    cpuPositions[i3 + 1] += cpuVelocities[i3 + 1] * dt
    cpuPositions[i3 + 2] += cpuVelocities[i3 + 2] * dt
    
    // 边界反弹
    for (let d = 0; d < 3; d++) {
      if (cpuPositions[i3 + d] > bounds) {
        cpuPositions[i3 + d] = bounds
        cpuVelocities[i3 + d] *= bounce
      } else if (cpuPositions[i3 + d] < -bounds) {
        cpuPositions[i3 + d] = -bounds
        cpuVelocities[i3 + d] *= bounce
      }
    }
  }
}

// ==================== Three.js 渲染层 ====================

function initThreeJS() {
  console.log('初始化 Three.js...')
  
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000510)
  
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  )
  camera.position.set(0, 10, 20)
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
  
  const pointLight1 = new THREE.PointLight(0x00aaff, 1.5)
  pointLight1.position.set(10, 10, 10)
  scene.add(pointLight1)
  
  const pointLight2 = new THREE.PointLight(0xff4400, 1.5)
  pointLight2.position.set(-10, -10, 10)
  scene.add(pointLight2)
  
  console.log('Three.js 初始化成功')
}

function createParticles() {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(n * 3)
  const colors = new Float32Array(n * 3)
  
  // 创建颜色
  for (let i = 0; i < n; i++) {
    const hue = 0.6 + (i / n) * 0.2
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })
  
  particles = new THREE.Points(geometry, material)
  scene?.add(particles)
  
  console.log(`创建了 ${n} 个渲染粒子`)
}

// ==================== 主渲染循环 ====================

let frameCount = 0
let lastTime = performance.now()
let lastFrameTime = performance.now()
let taichiReady = false

async function animate() {
  animationId = requestAnimationFrame(animate)
  
  if (isPaused.value) {
    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
    return
  }
  
  const currentTime = performance.now()
  const dt = 0.016
  
  // GPU 或 CPU 计算
  let computeStart = 0
  
  if (taichiReady && updateKernel) {
    // 使用 Taichi.js GPU 计算
    computeStart = performance.now()
    await updateKernel(dt)
    computeTime.value = performance.now() - computeStart
    
    // 传输数据到 Three.js
    const transferStart = performance.now()
    // TODO: 从 Taichi 字段读取数据到 Buffer
    // positions.toArray(renderPositions)
    transferTime.value = performance.now() - transferStart
  } else {
    // 使用 CPU 后备计算
    computeStart = performance.now()
    updateCUParticles(dt)
    computeTime.value = performance.now() - computeStart
    
    // 直接传输到 Three.js
    const transferStart = performance.now()
    if (particles) {
      const positions = particles.geometry.attributes.position.array as Float32Array
      positions.set(cpuPositions)
      particles.geometry.attributes.position.needsUpdate = true
    }
    transferTime.value = performance.now() - transferStart
  }
  
  // Three.js 渲染
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
  
  // FPS 计算
  frameCount++
  if (currentTime - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
    frameCount = 0
    lastTime = currentTime
  }
}

// ==================== 控制函数 ====================

function togglePause() {
  isPaused.value = !isPaused.value
}

function resetSimulation() {
  initCUParticles()
  if (taichiReady) {
    // TODO: 重新初始化 Taichi 字段
  }
}

function onWindowResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// ==================== 生命周期 ====================

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
}

onMounted(async () => {
  initThreeJS()
  createParticles()
  initCUParticles()
  
  // 尝试初始化 Taichi.js
  const taichiInitialized = await initTaichi()
  if (taichiInitialized) {
    if (createTaichiFields() && createUpdateKernel()) {
      taichiReady = true
      status.value = 'Taichi.js GPU 加速中'
    }
  }
  
  animate()
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped lang="scss">
.taichi-integration-page {
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
  background: rgba(0, 5, 16, 0.95);
  color: white;
  border-radius: 12px;
  font-family: 'Courier New', monospace;
  pointer-events: auto;
  max-width: 380px;
  border: 1px solid rgba(0, 170, 255, 0.3);
  max-height: 90vh;
  overflow-y: auto;

  h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #00aaff;
  }

  p {
    margin: 8px 0;
    font-size: 13px;

    strong {
      color: #00aaff;
    }
  }

  .architecture-diagram {
    margin: 20px 0;
    padding: 15px;
    background: rgba(0, 50, 100, 0.2);
    border-radius: 8px;

    h4 {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: #88ccff;
    }

    .flow-diagram {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;

      .node {
        flex: 1;
        text-align: center;
        padding: 15px 10px;
        background: rgba(0, 100, 200, 0.2);
        border-radius: 8px;
        border: 1px solid rgba(0, 170, 255, 0.3);

        &.taichi {
          background: rgba(255, 200, 0, 0.2);
          border-color: rgba(255, 200, 0, 0.5);
        }

        &.transfer {
          background: rgba(0, 200, 100, 0.2);
          border-color: rgba(0, 200, 100, 0.5);
        }

        &.three {
          background: rgba(100, 100, 255, 0.2);
          border-color: rgba(100, 100, 255, 0.5);
        }

        .node-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .node-label {
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .node-desc {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
        }
      }

      .arrow {
        font-size: 20px;
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }

  .code-section {
    margin: 15px 0;
    padding: 15px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    border: 1px solid rgba(0, 255, 136, 0.3);

    h4 {
      margin: 0 0 10px 0;
      font-size: 13px;
      color: #00ff88;
    }

    pre {
      margin: 0;
      overflow-x: auto;

      code {
        font-size: 11px;
        line-height: 1.4;
        color: #aaffaa;
      }
    }
  }

  .controls {
    margin: 15px 0;

    button {
      width: 100%;
      padding: 10px 12px;
      margin-bottom: 8px;
      background: rgba(0, 170, 255, 0.2);
      color: #00aaff;
      border: 1px solid rgba(0, 170, 255, 0.3);
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;

      &:hover {
        background: rgba(0, 170, 255, 0.3);
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
