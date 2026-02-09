<template>
  <div class="learning-demo">
    <div class="demo-container">
      <!-- 3D画布 -->
      <div ref="canvasRef" class="canvas-area"></div>

      <!-- 控制面板 -->
      <div class="control-panel">
        <h3>🎮 交互控制</h3>
        <div class="controls">
          <button class="btn primary" @click="rotateCube">旋转立方体</button>
          <button class="btn secondary" @click="changeColor">改变颜色</button>
          <button class="btn danger" @click="resetScene">重置场景</button>
        </div>

        <div class="info">
          <h4>📊 当前状态</h4>
          <p>FPS: {{ fps }} 帧/秒</p>
          <p>旋转角度: X={{ rotationX.toFixed(2) }}, Y={{ rotationY.toFixed(2) }}</p>
          <p>当前颜色: {{ currentColor }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'

// 响应式数据
const canvasRef = ref<HTMLElement>()
const fps = ref(0)
const rotationX = ref(0)
const rotationY = ref(0)
const currentColor = ref('#00ff00')

// Three.js 对象
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let cube: THREE.Mesh
let animationId: number

// 性能监控
let frameCount = 0
let lastTime = performance.now()

// 初始化场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(800, 600)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // 添加到DOM
  if (canvasRef.value) {
    canvasRef.value.appendChild(renderer.domElement)
  }

  // 添加光照
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  // 创建立方体
  const geometry = new THREE.BoxGeometry(2, 2, 2)
  const material = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    shininess: 100
  })
  cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  console.log('✅ 3D场景初始化完成')
}

// 渲染循环
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 更新FPS
  frameCount++
  const currentTime = performance.now()
  if (currentTime - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
    frameCount = 0
    lastTime = currentTime
  }

  // 更新旋转角度显示
  rotationX.value = cube.rotation.x
  rotationY.value = cube.rotation.y

  // 渲染场景
  renderer.render(scene, camera)
}

// 交互函数
const rotateCube = () => {
  console.log('🔄 执行旋转动画')

  // 使用GSAP创建平滑的旋转动画
  gsap.to(cube.rotation, {
    x: cube.rotation.x + Math.PI,
    y: cube.rotation.y + Math.PI,
    duration: 1.5,
    ease: 'power2.inOut'
  })
}

const changeColor = () => {
  // 随机生成新颜色
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]
  const newColor = colors[Math.floor(Math.random() * colors.length)]

  console.log(`🎨 改变颜色为: #${newColor.toString(16)}`)
  currentColor.value = `#${newColor.toString(16)}`

  // 使用GSAP动画改变颜色
  gsap.to(cube.material, {
    color: newColor,
    duration: 0.8,
    ease: 'power2.out'
  })
}

const resetScene = () => {
  console.log('↩️ 重置场景')

  // 重置旋转
  gsap.to(cube.rotation, {
    x: 0,
    y: 0,
    duration: 1,
    ease: 'elastic.out(1, 0.5)'
  })

  // 重置颜色
  gsap.to(cube.material, {
    color: 0x00ff00,
    duration: 1,
    ease: 'power2.out'
  })

  currentColor.value = '#00ff00'
}

// 鼠标交互
const setupMouseInteraction = () => {
  if (!canvasRef.value) return

  // 鼠标悬停效果
  canvasRef.value.addEventListener('mouseenter', () => {
    gsap.to(cube.scale, {
      x: 1.1,
      y: 1.1,
      z: 1.1,
      duration: 0.3
    })
  })

  canvasRef.value.addEventListener('mouseleave', () => {
    gsap.to(cube.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.3
    })
  })

  // 点击效果
  canvasRef.value.addEventListener('click', event => {
    console.log('🖱️ 点击了画布')

    // 获取点击位置相对于画布的坐标
    const rect = canvasRef.value!.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    console.log(`点击坐标: (${x.toFixed(2)}, ${y.toFixed(2)})`)

    // 点击时的小动画效果
    gsap.to(cube.scale, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    })
  })
}

// 组件生命周期
onMounted(() => {
  console.log('🚀 组件挂载开始')
  initScene()
  animate()
  setupMouseInteraction()
  console.log('🎉 组件挂载完成')
})

onUnmounted(() => {
  console.log('🧹 清理资源')
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<style scoped>
.learning-demo {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 20px;
}

.demo-container {
  display: flex;
  gap: 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.canvas-area {
  width: 800px;
  height: 600px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(0, 255, 224, 0.3);
}

.control-panel {
  width: 300px;
  color: white;
}

.control-panel h3 {
  color: #00ffe0;
  margin-bottom: 20px;
  font-size: 20px;
  text-align: center;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.primary {
  background: linear-gradient(45deg, #00a8ff, #00ffe0);
  color: #0a0a1a;
}

.secondary {
  background: linear-gradient(45deg, #ff00c8, #ff6b9d);
  color: white;
}

.danger {
  background: linear-gradient(45deg, #ff4757, #ff6b81);
  color: white;
}

.info {
  background: rgba(10, 10, 26, 0.7);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 224, 0.2);
}

.info h4 {
  color: #00a8ff;
  margin-bottom: 15px;
  font-size: 18px;
}

.info p {
  margin: 8px 0;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  color: #a0a0c0;
}

.info p:first-of-type {
  color: #00ffe0;
  font-weight: bold;
}
</style>
