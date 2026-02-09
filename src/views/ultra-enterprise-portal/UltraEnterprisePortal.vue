<template>
  <div class="ultra-enterprise-portal">
    <!-- 主3D画布 -->
    <div ref="mainCanvas" class="main-canvas"></div>

    <!-- 粒子背景 -->
    <canvas ref="particleCanvas" class="particle-background"></canvas>

    <!-- 全息界面 -->
    <div class="holographic-interface">
      <!-- 企业标识栏 -->
      <div class="enterprise-branding">
        <div class="brand-logo">
          <div class="logo-core"></div>
          <div class="logo-orbits">
            <div v-for="i in 4" :key="i" class="orbit" :style="{ '--delay': i + 's' }"></div>
          </div>
          <div class="logo-satellites">
            <div v-for="i in 8" :key="i" class="satellite" :style="{ '--rotation': (i * 45) + 'deg' }"></div>
          </div>
        </div>
        <div class="brand-info">
          <h1 class="company-name">NEXUS ENTERPRISE</h1>
          <p class="tagline">引领未来的数字化转型</p>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="navigation-menu">
        <ul class="menu-items">
          <li v-for="(item, index) in menuItems" :key="index" class="menu-item">
            <a href="#" @click="navigateTo(item.path)" class="menu-link">
              <span class="menu-icon">{{ item.icon }}</span>
              <span class="menu-text">{{ item.text }}</span>
              <div class="menu-glow"></div>
            </a>
          </li>
        </ul>
      </nav>

      <!-- 业务概览仪表板 -->
      <div class="business-dashboard">
        <div class="dashboard-header">
          <h2>全球业务概览</h2>
          <div class="dashboard-controls">
            <button class="control-btn" @click="toggleMetrics">切换指标</button>
            <button class="control-btn" @click="refreshData">刷新数据</button>
          </div>
        </div>
        <div class="metrics-grid">
          <div v-for="(metric, index) in metrics" :key="index" class="metric-card">
            <div class="metric-icon">{{ metric.icon }}</div>
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-trend" :class="{ up: metric.trend > 0, down: metric.trend < 0 }">
              {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 3D地球展示 -->
      <div class="globe-container">
        <div class="globe-controls">
          <button class="globe-btn" @click="rotateGlobeLeft">←</button>
          <button class="globe-btn" @click="rotateGlobeRight">→</button>
        </div>
        <div class="globe-info">
          <h3>全球运营网络</h3>
          <p>{{ globeInfo }}</p>
        </div>
      </div>

      <!-- 产品展示区 -->
      <div class="product-showcase">
        <h2>核心产品系列</h2>
        <div class="products-grid">
          <div v-for="(product, index) in products" :key="index" class="product-card">
            <div class="product-image">
              <div class="product-icon">{{ product.icon }}</div>
            </div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p>{{ product.description }}</p>
              <div class="product-features">
                <span v-for="(feature, fIndex) in product.features" :key="fIndex" class="feature-tag">
                  {{ feature }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系我们 -->
      <div class="contact-section">
        <h2>联系我们</h2>
        <div class="contact-methods">
          <div v-for="(method, index) in contactMethods" :key="index" class="contact-method">
            <div class="contact-icon">{{ method.icon }}</div>
            <div class="contact-info">
              <h4>{{ method.title }}</h4>
              <p>{{ method.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能监控 -->
    <div class="performance-monitor">
      <div class="perf-item">
        <span>FPS:</span>
        <span>{{ fps }}</span>
      </div>
      <div class="perf-item">
        <span>粒子数:</span>
        <span>{{ particleCount }}</span>
      </div>
      <div class="perf-item">
        <span>内存:</span>
        <span>{{ memoryUsage }}%</span>
      </div>
    </div>

    <!-- 加载界面 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="enterprise-loader">
        <div class="loader-core"></div>
        <div class="loader-orbits">
          <div v-for="i in 3" :key="i" class="loader-orbit" :style="{ '--delay': i + 's' }"></div>
        </div>
        <div class="loader-text">企业系统初始化中...</div>
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
const fps = ref(60)
const particleCount = ref(0)
const memoryUsage = ref(45)

// 导航菜单
const menuItems = reactive([
  { icon: '🏠', text: '首页', path: '/' },
  { icon: '💼', text: '业务', path: '/business' },
  { icon: '💡', text: '创新', path: '/innovation' },
  { icon: '📈', text: '数据', path: '/analytics' },
  { icon: '👥', text: '团队', path: '/team' },
  { icon: '📞', text: '联系', path: '/contact' }
])

// 业务指标
const metrics = reactive([
  { icon: '🌍', value: '24/7', label: '全球服务', trend: 0 },
  { icon: '💰', value: '$1.2B', label: '年收入', trend: 12.5 },
  { icon: '👥', value: '15K+', label: '客户', trend: 8.3 },
  { icon: '🚀', value: '98%', label: '满意度', trend: 2.1 },
  { icon: '⚡', value: '42%', label: '增长率', trend: 15.7 },
  { icon: '🌐', value: '48', label: '国家', trend: 5.2 }
])

// 产品信息
const products = reactive([
  {
    icon: '☁️',
    name: '云服务平台',
    description: '企业级云计算解决方案，提供高可用性和可扩展性',
    features: ['AI驱动', '自动化', '安全性', '全球部署']
  },
  {
    icon: '🤖',
    name: 'AI智能系统',
    description: '先进的人工智能平台，助力企业智能化转型',
    features: ['机器学习', '自然语言', '预测分析', '自动化']
  },
  {
    icon: '🔒',
    name: '安全防护',
    description: '企业级安全解决方案，保障数据资产安全',
    features: ['加密', '身份验证', '威胁检测', '合规性']
  },
  {
    icon: '📊',
    name: '数据洞察',
    description: '大数据分析平台，挖掘商业价值',
    features: ['实时分析', '可视化', '预测模型', '智能推荐']
  }
])

// 联系方式
const contactMethods = reactive([
  { icon: '📍', title: '总部地址', content: '上海市浦东新区世纪大道1001号' },
  { icon: '📞', title: '联系电话', content: '+86 21 1234 5678' },
  { icon: '📧', title: '商务合作', content: 'business@nexus-enterprise.com' },
  { icon: '🌐', title: '官方网站', content: 'www.nexus-enterprise.com' }
])

// 地球信息
const globeInfo = ref('全球运营网络覆盖48个国家和地区')

// Three.js 对象
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animationId: number
let earthMesh: THREE.Mesh
let stars: THREE.Points

// 粒子系统
let particleCtx: CanvasRenderingContext2D
let particles: Array<{
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
}> = []

// 初始化3D场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000b1a)
  scene.fog = new THREE.Fog(0x000b1a, 20, 100)

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 50

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true

  if (mainCanvas.value) {
    mainCanvas.value.appendChild(renderer.domElement)
  }

  // 添加光照
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 20, 15)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5)
  scene.add(hemisphereLight)

  // 创建地球
  createEarth()

  // 创建星空背景
  createStarField()

  console.log('✅ 企业级3D场景初始化完成')
}

// 创建地球
const createEarth = () => {
  const geometry = new THREE.SphereGeometry(10, 64, 64)
  const textureLoader = new THREE.TextureLoader()
  
  // 创建简单的地球纹理（实际项目中会使用真实纹理）
  const material = new THREE.MeshPhongMaterial({
    color: 0x1a5fb4,
    specular: 0x111111,
    shininess: 50,
    transparent: true,
    opacity: 0.9
  })

  earthMesh = new THREE.Mesh(geometry, material)
  earthMesh.castShadow = true
  earthMesh.receiveShadow = true
  scene.add(earthMesh)

  // 添加地球旋转动画
  gsap.to(earthMesh.rotation, {
    y: Math.PI * 2,
    duration: 60,
    repeat: -1,
    ease: 'none'
  })
}

// 创建星空背景
const createStarField = () => {
  const starCount = 5000
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200
    positions[i + 1] = (Math.random() - 0.5) * 200
    positions[i + 2] = (Math.random() - 0.5) * 200
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.2,
    transparent: true,
    opacity: 0.8
  })

  stars = new THREE.Points(geometry, material)
  scene.add(stars)
}

// 初始化粒子系统
const initParticles = () => {
  if (!particleCanvas.value) return

  particleCanvas.value.width = window.innerWidth
  particleCanvas.value.height = window.innerHeight
  particleCtx = particleCanvas.value.getContext('2d')!

  // 创建粒子
  for (let i = 0; i < 200; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() * 60 + 180 // 蓝绿色调
    })
  }

  animateParticles()
}

// 粒子动画
const animateParticles = () => {
  if (!particleCtx) return

  particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  particles.forEach(particle => {
    // 更新位置
    particle.x += particle.vx
    particle.y += particle.vy

    // 边界检测
    if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1
    if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1

    // 绘制粒子
    particleCtx.beginPath()
    particleCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    particleCtx.fillStyle = `hsla(${particle.hue}, 80%, 60%, ${particle.opacity})`
    particleCtx.fill()
  })

  requestAnimationFrame(animateParticles)
}

// 渲染循环
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 更新FPS
  updateFPS()

  // 旋转星星
  if (stars) {
    stars.rotation.y += 0.001
  }

  // 渲染场景
  renderer.render(scene, camera)
}

// 更新FPS
const updateFPS = () => {
  const now = performance.now()
  const delta = now - (window as any).lastTime
  if (delta > 1000) {
    fps.value = Math.round((1000 / delta) * 100) / 100
    ;(window as any).lastTime = now
  }
}

// 导航到指定页面
const navigateTo = (path: string) => {
  console.log(`导航到: ${path}`)
  // 在实际应用中这里会执行路由跳转
}

// 切换指标显示
const toggleMetrics = () => {
  // 随机更新指标值以模拟数据变化
  metrics.forEach(metric => {
    if (typeof metric.value === 'number') {
      metric.value += Math.floor(Math.random() * 10)
    }
  })
}

// 刷新数据
const refreshData = () => {
  // 模拟数据刷新动画
  gsap.to('.metric-card', {
    scale: 1.05,
    duration: 0.2,
    yoyo: true,
    repeat: 1,
    ease: 'power1.inOut'
  })
}

// 旋转地球
const rotateGlobeLeft = () => {
  if (earthMesh) {
    gsap.to(earthMesh.rotation, {
      y: earthMesh.rotation.y - Math.PI / 4,
      duration: 1,
      ease: 'power2.out'
    })
  }
}

const rotateGlobeRight = () => {
  if (earthMesh) {
    gsap.to(earthMesh.rotation, {
      y: earthMesh.rotation.y + Math.PI / 4,
      duration: 1,
      ease: 'power2.out'
    })
  }
}

// 窗口大小调整
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

// 页面加载完成
const onPageLoaded = () => {
  setTimeout(() => {
    isLoading.value = false
    initScene()
    initParticles()
    animate()
  }, 3000)
}

// 组件挂载
onMounted(() => {
  onPageLoaded()
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
.ultra-enterprise-portal {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #000b1a 0%, #0a1929 50%, #1a2a3a 100%);
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
  opacity: 0.6;
}

.holographic-interface {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  color: #00eeff;
  font-family: 'Arial', 'Microsoft YaHei', sans-serif;
}

.enterprise-branding {
  position: absolute;
  top: 30px;
  left: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(0, 20, 40, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 15px;
  pointer-events: auto;

  .brand-logo {
    position: relative;
    width: 60px;
    height: 60px;

    .logo-core {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 30px;
      height: 30px;
      background: linear-gradient(45deg, #00eeff, #0066ff);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 20px rgba(0, 238, 255, 0.8);
    }

    .logo-orbits {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      .orbit {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        border: 1px solid rgba(0, 238, 255, 0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%) rotateX(75deg);
        animation: orbitRotate 20s linear infinite;
        animation-delay: var(--delay);
      }
    }

    .logo-satellites {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      .satellite {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6px;
        height: 6px;
        background: #00eeff;
        border-radius: 50%;
        transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-30px);
        box-shadow: 0 0 10px #00eeff;
        animation: satelliteOrbit 8s linear infinite;
      }
    }
  }

  .brand-info {
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #00eeff;
      text-shadow: 0 0 15px rgba(0, 238, 255, 0.8);
      margin: 0 0 5px 0;
    }

    .tagline {
      font-size: 14px;
      color: rgba(0, 238, 255, 0.7);
      margin: 0;
    }
  }
}

.navigation-menu {
  position: absolute;
  top: 30px;
  right: 30px;
  pointer-events: auto;

  .menu-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .menu-item {
    .menu-link {
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      background: rgba(0, 20, 40, 0.5);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 238, 255, 0.3);
      border-radius: 8px;
      color: #00eeff;
      text-decoration: none;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 80, 120, 0.6);
        border-color: #00eeff;
        transform: translateX(5px);
        box-shadow: 0 0 20px rgba(0, 238, 255, 0.5);

        .menu-glow {
          opacity: 1;
          transform: scale(1.1);
        }
      }

      .menu-icon {
        font-size: 18px;
      }

      .menu-text {
        font-size: 14px;
        font-weight: 500;
      }

      .menu-glow {
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 1px solid rgba(0, 238, 255, 0.5);
        border-radius: 8px;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
      }
    }
  }
}

.business-dashboard {
  position: absolute;
  bottom: 30px;
  left: 30px;
  width: calc(50% - 60px);
  background: rgba(0, 20, 40, 0.4);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 15px;
  padding: 20px;
  pointer-events: auto;

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #00eeff;
      font-size: 18px;
    }

    .dashboard-controls {
      display: flex;
      gap: 10px;

      .control-btn {
        padding: 6px 12px;
        background: rgba(0, 100, 150, 0.5);
        border: 1px solid rgba(0, 238, 255, 0.3);
        color: #00eeff;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(0, 150, 200, 0.7);
          border-color: #00eeff;
        }
      }
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;

    .metric-card {
      background: rgba(0, 30, 60, 0.4);
      border: 1px solid rgba(0, 238, 255, 0.2);
      border-radius: 10px;
      padding: 15px;
      text-align: center;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        border-color: #00eeff;
        box-shadow: 0 5px 15px rgba(0, 238, 255, 0.3);
      }

      .metric-icon {
        font-size: 24px;
        margin-bottom: 10px;
      }

      .metric-value {
        font-size: 18px;
        font-weight: bold;
        color: #00eeff;
        margin-bottom: 5px;
      }

      .metric-label {
        font-size: 12px;
        color: rgba(0, 238, 255, 0.7);
        margin-bottom: 5px;
      }

      .metric-trend {
        font-size: 12px;
        font-weight: bold;

        &.up {
          color: #00ff88;
        }

        &.down {
          color: #ff4444;
        }
      }
    }
  }
}

.globe-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  pointer-events: auto;

  .globe-controls {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;

    .globe-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(0, 20, 40, 0.7);
      border: 1px solid rgba(0, 238, 255, 0.3);
      color: #00eeff;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 100, 150, 0.7);
        border-color: #00eeff;
        transform: scale(1.1);
      }
    }
  }

  .globe-info {
    position: absolute;
    bottom: -80px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    color: #00eeff;
    width: 100%;

    h3 {
      margin: 0 0 5px 0;
      font-size: 16px;
    }

    p {
      margin: 0;
      font-size: 12px;
      color: rgba(0, 238, 255, 0.7);
    }
  }
}

.product-showcase {
  position: absolute;
  top: 30px;
  right: 30px;
  width: 40%;
  max-width: 500px;
  background: rgba(0, 20, 40, 0.4);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 15px;
  padding: 20px;
  pointer-events: auto;

  h2 {
    margin: 0 0 20px 0;
    color: #00eeff;
    font-size: 18px;
    text-align: center;
  }

  .products-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;

    .product-card {
      display: flex;
      gap: 15px;
      padding: 15px;
      background: rgba(0, 30, 60, 0.3);
      border: 1px solid rgba(0, 238, 255, 0.2);
      border-radius: 10px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 50, 80, 0.4);
        border-color: #00eeff;
        transform: translateX(5px);
      }

      .product-image {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        background: rgba(0, 100, 150, 0.3);
        border-radius: 10px;

        .product-icon {
          font-size: 24px;
        }
      }

      .product-info {
        flex: 1;

        h3 {
          margin: 0 0 5px 0;
          color: #00eeff;
          font-size: 14px;
        }

        p {
          margin: 0 0 10px 0;
          font-size: 12px;
          color: rgba(0, 238, 255, 0.7);
        }

        .product-features {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;

          .feature-tag {
            padding: 2px 6px;
            background: rgba(0, 150, 200, 0.3);
            border: 1px solid rgba(0, 238, 255, 0.2);
            border-radius: 4px;
            font-size: 10px;
            color: rgba(0, 238, 255, 0.9);
          }
        }
      }
    }
  }
}

.contact-section {
  position: absolute;
  bottom: 30px;
  right: 30px;
  width: 40%;
  max-width: 500px;
  background: rgba(0, 20, 40, 0.4);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 15px;
  padding: 20px;
  pointer-events: auto;

  h2 {
    margin: 0 0 20px 0;
    color: #00eeff;
    font-size: 18px;
    text-align: center;
  }

  .contact-methods {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;

    .contact-method {
      display: flex;
      gap: 10px;
      padding: 10px;
      background: rgba(0, 30, 60, 0.3);
      border: 1px solid rgba(0, 238, 255, 0.2);
      border-radius: 8px;

      .contact-icon {
        font-size: 18px;
        display: flex;
        align-items: center;
      }

      .contact-info {
        flex: 1;

        h4 {
          margin: 0 0 5px 0;
          color: #00eeff;
          font-size: 12px;
        }

        p {
          margin: 0;
          font-size: 11px;
          color: rgba(0, 238, 255, 0.7);
        }
      }
    }
  }
}

.performance-monitor {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  background: rgba(0, 20, 40, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 238, 255, 0.3);
  border-radius: 10px;
  padding: 10px 20px;
  pointer-events: auto;
  z-index: 20;

  .perf-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    span:first-child {
      font-size: 10px;
      color: rgba(0, 238, 255, 0.7);
      margin-bottom: 3px;
    }

    span:last-child {
      font-size: 12px;
      color: #00eeff;
      font-weight: bold;
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
  backdrop-filter: blur(5px);

  .enterprise-loader {
    text-align: center;
    position: relative;

    .loader-core {
      width: 60px;
      height: 60px;
      background: linear-gradient(45deg, #00eeff, #0066ff);
      border-radius: 50%;
      margin: 0 auto 20px;
      box-shadow: 0 0 30px rgba(0, 238, 255, 0.8);
      animation: pulse 2s infinite;
    }

    .loader-orbits {
      position: relative;
      width: 100px;
      height: 100px;
      margin: 0 auto;

      .loader-orbit {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        border: 2px solid transparent;
        border-top-color: #00eeff;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: orbitRotate 4s linear infinite;
        animation-delay: var(--delay);
      }
    }

    .loader-text {
      color: #00eeff;
      font-size: 16px;
      margin-top: 20px;
      text-shadow: 0 0 10px rgba(0, 238, 255, 0.8);
    }
  }
}

@keyframes orbitRotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes satelliteOrbit {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) translateY(-30px) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(0deg) translateY(-30px) rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 30px rgba(0, 238, 255, 0.8);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 40px rgba(0, 238, 255, 1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 30px rgba(0, 238, 255, 0.8);
  }
}
</style>