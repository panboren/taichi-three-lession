<template>
  <div class="next-gen-corporate">
    <!-- 3D场景画布 -->
    <div ref="canvasContainer" class="threejs-canvas"></div>

    <!-- 滚动容器 -->
    <div ref="scrollContainer" class="scroll-container" @scroll="handleScroll">
      <!-- 首页英雄区域 -->
      <section ref="heroSection" class="hero-section">
        <div class="hero-content">
          <div class="hero-glow"></div>
          <h1 class="hero-title">
            <span v-for="(line, index) in heroTitle" :key="index" class="title-line">
              {{ line }}
            </span>
          </h1>
          <p class="hero-subtitle">{{ heroSubtitle }}</p>
          <div class="hero-buttons">
            <button class="cta-button primary" @click="scrollToNext">
              <span class="button-text">探索未来</span>
              <div class="button-glow"></div>
            </button>
            <button class="cta-button secondary" @click="scrollToContact">
              <span class="button-text">联系我们</span>
            </button>
          </div>
        </div>

        <!-- 3D Logo展示 -->
        <div class="hero-logo">
          <div ref="logo3D" class="logo-3d"></div>
        </div>
      </section>

      <!-- 特效动画模块 -->
      <section ref="effectsSection" class="effects-section">
        <div class="section-header">
          <h2 class="section-title">创新技术展示</h2>
          <p class="section-description">下一代数字体验技术</p>
        </div>

        <div class="effects-grid">
          <div
            v-for="(effect, index) in effects"
            :key="index"
            class="effect-card"
            :class="{ active: activeEffect === index }"
            @mouseenter="activateEffect(index)"
          >
            <div class="card-glow"></div>
            <div class="effect-icon">{{ effect.icon }}</div>
            <h3 class="effect-title">{{ effect.title }}</h3>
            <p class="effect-description">{{ effect.description }}</p>
            <div class="tech-stack">
              <span v-for="tech in effect.tech" :key="tech" class="tech-tag">
                {{ tech }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ECharts数据可视化模块 -->
      <section ref="chartsSection" class="charts-section">
        <div class="section-header">
          <h2 class="section-title">数据洞察</h2>
          <p class="section-description">实时业务数据分析</p>
        </div>

        <div class="charts-grid">
          <div ref="chart1" class="chart-container"></div>
          <div ref="chart2" class="chart-container"></div>
          <div ref="chart3" class="chart-container"></div>
          <div ref="chart4" class="chart-container"></div>
        </div>
      </section>

      <!-- 联系我们模块 -->
      <section ref="contactSection" class="contact-section">
        <div class="section-header">
          <h2 class="section-title">开启合作</h2>
          <p class="section-description">让我们共同创造未来</p>
        </div>

        <div class="contact-content">
          <div class="contact-form">
            <form @submit.prevent="submitForm">
              <div class="form-group">
                <input
                  v-model="contactForm.name"
                  type="text"
                  placeholder="您的姓名"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <input
                  v-model="contactForm.email"
                  type="email"
                  placeholder="邮箱地址"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <textarea
                  v-model="contactForm.message"
                  placeholder="项目需求"
                  class="form-textarea"
                ></textarea>
              </div>
              <button type="submit" class="submit-button">
                <span class="button-text">发送消息</span>
                <div class="button-pulse"></div>
              </button>
            </form>
          </div>

          <div class="contact-info">
            <div class="info-item">
              <div class="info-icon">📍</div>
              <div class="info-content">
                <h4>总部地址</h4>
                <p>上海市浦东新区陆家嘴金融中心</p>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">📞</div>
              <div class="info-content">
                <h4>联系电话</h4>
                <p>+86 400-888-8888</p>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">✉️</div>
              <div class="info-content">
                <h4>商务邮箱</h4>
                <p>business@nextgen.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 滚动进度指示器 -->
    <div class="scroll-progress">
      <div class="progress-bar" :style="{ height: scrollProgress + '%' }"></div>
    </div>

    <!-- 侧边导航 -->
    <div class="side-navigation">
      <div
        v-for="(nav, index) in navigation"
        :key="index"
        class="nav-dot"
        :class="{ active: currentSection === index }"
        @click="scrollToSection(index)"
      >
        <div class="dot-glow"></div>
        <span class="nav-tooltip">{{ nav }}</span>
      </div>
    </div>

    <!-- 性能监控 -->
    <div v-if="showPerfMonitor" class="performance-monitor">
      <div class="perf-item">
        <span>FPS:</span>
        <span>{{ fps }}</span>
      </div>
      <div class="perf-item">
        <span>Objects:</span>
        <span>{{ objectCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'
import * as echarts from 'echarts'

// DOM引用
const canvasContainer = ref<HTMLElement>()
const scrollContainer = ref<HTMLElement>()
const heroSection = ref<HTMLElement>()
const effectsSection = ref<HTMLElement>()
const chartsSection = ref<HTMLElement>()
const contactSection = ref<HTMLElement>()
const logo3D = ref<HTMLElement>()
const chart1 = ref<HTMLElement>()
const chart2 = ref<HTMLElement>()
const chart3 = ref<HTMLElement>()
const chart4 = ref<HTMLElement>()

// 响应式数据
const scrollProgress = ref(0)
const currentSection = ref(0)
const activeEffect = ref(-1)
const fps = ref(60)
const objectCount = ref(0)
const showPerfMonitor = ref(false)

// 内容数据
const heroTitle = ref(['NEXT GEN', 'CORPORATE', 'SOLUTIONS'])
const heroSubtitle = ref('引领数字化转型的下一代企业解决方案')

const effects = reactive([
  {
    icon: '🚀',
    title: 'WebGL 3D渲染',
    description: '基于Three.js的高性能3D图形渲染技术',
    tech: ['Three.js', 'WebGL2', 'Shader']
  },
  {
    icon: '🎨',
    title: 'GSAP动画引擎',
    description: '专业级动画库，打造流畅交互体验',
    tech: ['GSAP', 'Animation', 'Timeline']
  },
  {
    icon: '📊',
    title: '数据可视化',
    description: 'ECharts驱动的实时数据展示',
    tech: ['ECharts', 'D3.js', 'Canvas']
  },
  {
    icon: '⚡',
    title: '性能优化',
    description: '极致的加载速度和运行效率',
    tech: ['Web Workers', 'Lazy Loading', 'CDN']
  },
  {
    icon: '📱',
    title: '响应式设计',
    description: '全平台适配的现代化界面',
    tech: ['Vue3', 'SCSS', 'Flexbox']
  },
  {
    icon: '🔒',
    title: '安全保障',
    description: '企业级安全防护体系',
    tech: ['HTTPS', 'JWT', 'Encryption']
  }
])

const navigation = ref(['首页', '技术', '数据', '联系'])

// 联系表单数据
const contactForm = reactive({
  name: '',
  email: '',
  message: ''
})

// Three.js对象
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animationId: number
let particles: THREE.Points
let logoMesh: THREE.Mesh

// 相机位置控制
const cameraPositions = [
  { x: 0, y: 0, z: 50 }, // 首页
  { x: 0, y: -30, z: 40 }, // 特效模块
  { x: 0, y: -60, z: 35 }, // 图表模块
  { x: 0, y: -90, z: 30 } // 联系模块
]

// 性能监控
let frameCount = 0
let lastTime = performance.now()

// 初始化3D场景
const initThreeJSScene = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a1a)
  scene.fog = new THREE.Fog(0x0a0a1a, 50, 200)

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 0, 50)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  if (canvasContainer.value) {
    canvasContainer.value.appendChild(renderer.domElement)
  }

  // 添加光照
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // 创建粒子系统
  createParticleSystem()

  // 创建3D Logo
  createLogo3D()

  console.log('✅ 3D场景初始化完成')
}

// 创建粒子系统
const createParticleSystem = () => {
  const particleCount = 5000
  const geometry = new THREE.BufferGeometry()

  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3

    // 球形分布
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = 80 + Math.random() * 120

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = radius * Math.cos(phi)

    // 颜色渐变
    const color = new THREE.Color()
    color.setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)
  objectCount.value = particleCount
}

// 创建3D Logo
const createLogo3D = () => {
  const geometry = new THREE.IcosahedronGeometry(8, 2)
  const material = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    emissive: 0x004444,
    shininess: 100,
    transparent: true,
    opacity: 0.8
  })

  logoMesh = new THREE.Mesh(geometry, material)
  logoMesh.position.set(20, 0, 0)
  scene.add(logoMesh)
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

  // 旋转粒子系统
  if (particles) {
    particles.rotation.y += 0.001
  }

  // 旋转Logo
  if (logoMesh) {
    logoMesh.rotation.x += 0.01
    logoMesh.rotation.y += 0.015
  }

  // 渲染场景
  renderer.render(scene, camera)
}

// 滚动处理
const handleScroll = () => {
  if (!scrollContainer.value) return

  const scrollTop = scrollContainer.value.scrollTop
  const scrollHeight = scrollContainer.value.scrollHeight - window.innerHeight
  scrollProgress.value = (scrollTop / scrollHeight) * 100

  // 确定当前区域
  const sections = [heroSection, effectsSection, chartsSection, contactSection]
  const sectionHeights = sections.map(section => section.value?.offsetHeight || 0)
  const totalHeight = sectionHeights.reduce((a, b) => a + b, 0)

  let accumulatedHeight = 0
  for (let i = 0; i < sections.length; i++) {
    accumulatedHeight += sectionHeights[i]
    if (scrollTop < accumulatedHeight - window.innerHeight / 2) {
      currentSection.value = i
      updateCameraPosition(i)
      break
    }
  }
}

// 更新相机位置
const updateCameraPosition = (sectionIndex: number) => {
  const targetPos = cameraPositions[sectionIndex]
  gsap.to(camera.position, {
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    duration: 1.5,
    ease: 'power2.inOut'
  })
}

// 滚动到指定区域
const scrollToSection = (index: number) => {
  const sections = [heroSection, effectsSection, chartsSection, contactSection]
  sections[index].value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

const scrollToNext = () => {
  scrollToSection(1)
}

const scrollToContact = () => {
  scrollToSection(3)
}

// 激活特效卡片
const activateEffect = (index: number) => {
  activeEffect.value = index

  // 特效激活动画
  gsap.fromTo(
    '.effect-card:nth-child(' + (index + 1) + ')',
    { scale: 1, y: 0 },
    {
      scale: 1.05,
      y: -10,
      duration: 0.3,
      ease: 'back.out(1.7)'
    }
  )
}

// 初始化ECharts图表
const initCharts = () => {
  // 图表1: 业务增长趋势
  if (chart1.value) {
    const chart = echarts.init(chart1.value)
    chart.setOption({
      title: {
        text: '业务增长趋势',
        textStyle: { color: '#00ffff' }
      },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        axisLine: { lineStyle: { color: '#00ffff' } }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#00ffff' } }
      },
      series: [
        {
          data: [120, 200, 150, 80, 70, 110],
          type: 'line',
          smooth: true,
          lineStyle: { color: '#00ffff' },
          areaStyle: { color: 'rgba(0, 255, 255, 0.2)' }
        }
      ]
    })
  }

  // 图表2: 技术栈分布
  if (chart2.value) {
    const chart = echarts.init(chart2.value)
    chart.setOption({
      title: {
        text: '技术栈占比',
        textStyle: { color: '#ff0080' }
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          data: [
            { value: 35, name: '前端技术' },
            { value: 25, name: '后端技术' },
            { value: 20, name: '数据库' },
            { value: 15, name: '运维工具' },
            { value: 5, name: '其他' }
          ],
          label: { color: '#fff' }
        }
      ]
    })
  }

  // 图表3和4可以根据需要添加更多图表
}

// 表单提交
const submitForm = () => {
  console.log('表单提交:', contactForm)

  // 成功动画
  gsap.to('.submit-button', {
    backgroundColor: '#00ff88',
    duration: 0.3,
    yoyo: true,
    repeat: 1
  })

  // 重置表单
  setTimeout(() => {
    contactForm.name = ''
    contactForm.email = ''
    contactForm.message = ''
  }, 1000)
}

// 窗口大小调整
const handleResize = () => {
  if (!camera || !renderer) return

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 组件挂载
onMounted(() => {
  initThreeJSScene()
  animate()
  initCharts()

  // 入场动画序列
  gsap.from('.hero-title .title-line', {
    y: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.3,
    ease: 'power3.out',
    delay: 0.5
  })

  gsap.from('.hero-subtitle', {
    y: 50,
    opacity: 0,
    duration: 1,
    delay: 1.2
  })

  gsap.from('.cta-button', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    delay: 1.5
  })

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
.next-gen-corporate {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a1a 0%, #16213e 50%, #0f3460 100%);
}

.threejs-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.scroll-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  scroll-behavior: smooth;
  z-index: 2;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.hero-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10%;

  .hero-content {
    flex: 1;
    max-width: 600px;
    position: relative;
    z-index: 3;

    .hero-glow {
      position: absolute;
      top: -50px;
      left: -50px;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%);
      z-index: -1;
    }

    .hero-title {
      margin: 0 0 30px 0;

      .title-line {
        display: block;
        font-size: 4rem;
        font-weight: 800;
        color: #fff;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 10px;
        text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
      }
    }

    .hero-subtitle {
      font-size: 1.5rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 40px;
      line-height: 1.6;
    }

    .hero-buttons {
      display: flex;
      gap: 20px;

      .cta-button {
        position: relative;
        padding: 15px 35px;
        border: none;
        border-radius: 50px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        overflow: hidden;
        transition: all 0.3s ease;

        &.primary {
          background: linear-gradient(45deg, #00ffff, #0088ff);
          color: #0a0a1a;

          .button-glow {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            transition: left 0.5s;
          }

          &:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(0, 255, 255, 0.4);

            .button-glow {
              left: 100%;
            }
          }
        }

        &.secondary {
          background: transparent;
          color: #00ffff;
          border: 2px solid #00ffff;

          &:hover {
            background: rgba(0, 255, 255, 0.1);
            transform: translateY(-3px);
          }
        }
      }
    }
  }

  .hero-logo {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    .logo-3d {
      width: 300px;
      height: 300px;
    }
  }
}

.effects-section {
  position: relative;
  min-height: 100vh;
  padding: 100px 10%;
  background: rgba(10, 10, 26, 0.8);

  .section-header {
    text-align: center;
    margin-bottom: 80px;

    .section-title {
      font-size: 3rem;
      color: #00ffff;
      margin-bottom: 20px;
      text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
    }

    .section-description {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .effects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;

    .effect-card {
      position: relative;
      background: rgba(20, 30, 50, 0.6);
      border: 1px solid rgba(0, 255, 255, 0.3);
      border-radius: 20px;
      padding: 30px;
      text-align: center;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      cursor: pointer;

      &:hover {
        border-color: #00ffff;
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(0, 255, 255, 0.2);
      }

      &.active {
        border-color: #ff0080;
        box-shadow: 0 0 30px rgba(255, 0, 128, 0.4);
      }

      .card-glow {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 20px;
        background: linear-gradient(
          45deg,
          rgba(0, 255, 255, 0.1),
          transparent,
          rgba(255, 0, 128, 0.1)
        );
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover .card-glow {
        opacity: 1;
      }

      .effect-icon {
        font-size: 3rem;
        margin-bottom: 20px;
      }

      .effect-title {
        font-size: 1.5rem;
        color: #00ffff;
        margin-bottom: 15px;
      }

      .effect-description {
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 20px;
        line-height: 1.6;
      }

      .tech-stack {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;

        .tech-tag {
          background: rgba(0, 255, 255, 0.2);
          color: #00ffff;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.9rem;
          border: 1px solid rgba(0, 255, 255, 0.3);
        }
      }
    }
  }
}

.charts-section {
  position: relative;
  min-height: 100vh;
  padding: 100px 10%;
  background: rgba(5, 15, 35, 0.9);

  .section-header {
    text-align: center;
    margin-bottom: 80px;

    .section-title {
      font-size: 3rem;
      color: #ff0080;
      margin-bottom: 20px;
      text-shadow: 0 0 30px rgba(255, 0, 128, 0.5);
    }

    .section-description {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;

    .chart-container {
      height: 400px;
      background: rgba(20, 30, 50, 0.6);
      border-radius: 15px;
      padding: 20px;
      border: 1px solid rgba(255, 0, 128, 0.3);
    }
  }
}

.contact-section {
  position: relative;
  min-height: 100vh;
  padding: 100px 10%;
  background: rgba(15, 10, 35, 0.95);

  .section-header {
    text-align: center;
    margin-bottom: 80px;

    .section-title {
      font-size: 3rem;
      color: #8000ff;
      margin-bottom: 20px;
      text-shadow: 0 0 30px rgba(128, 0, 255, 0.5);
    }

    .section-description {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;

    .contact-form {
      background: rgba(30, 20, 50, 0.6);
      padding: 40px;
      border-radius: 20px;
      border: 1px solid rgba(128, 0, 255, 0.3);

      .form-group {
        margin-bottom: 25px;

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 15px;
          background: rgba(10, 10, 26, 0.6);
          border: 1px solid rgba(128, 0, 255, 0.3);
          border-radius: 10px;
          color: white;
          font-size: 1rem;

          &::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }

          &:focus {
            outline: none;
            border-color: #8000ff;
            box-shadow: 0 0 20px rgba(128, 0, 255, 0.3);
          }
        }

        .form-textarea {
          min-height: 150px;
          resize: vertical;
        }
      }

      .submit-button {
        position: relative;
        width: 100%;
        padding: 15px;
        background: linear-gradient(45deg, #8000ff, #ff0080);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        overflow: hidden;

        .button-pulse {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          transform: scaleX(0);
          transform-origin: left;
        }

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(128, 0, 255, 0.4);
        }
      }
    }

    .contact-info {
      .info-item {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 40px;

        .info-icon {
          font-size: 2rem;
          min-width: 50px;
        }

        .info-content {
          h4 {
            color: #8000ff;
            margin-bottom: 10px;
            font-size: 1.3rem;
          }

          p {
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
          }
        }
      }
    }
  }
}

.scroll-progress {
  position: fixed;
  top: 0;
  right: 0;
  width: 4px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.1);
  z-index: 100;

  .progress-bar {
    width: 100%;
    background: linear-gradient(to bottom, #00ffff, #ff0080, #8000ff);
    transition: height 0.1s ease;
  }
}

.side-navigation {
  position: fixed;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .nav-dot {
    position: relative;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      background: #00ffff;
      box-shadow: 0 0 20px #00ffff;
      transform: scale(1.3);
    }

    .dot-glow {
      position: absolute;
      top: -5px;
      left: -5px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 255, 255, 0.3), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover .dot-glow {
      opacity: 1;
    }

    .nav-tooltip {
      position: absolute;
      right: 25px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(10, 10, 26, 0.9);
      color: white;
      padding: 8px 15px;
      border-radius: 5px;
      font-size: 0.9rem;
      white-space: nowrap;
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: none;

      &::after {
        content: '';
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        border: 5px solid transparent;
        border-left-color: rgba(10, 10, 26, 0.9);
      }
    }

    &:hover .nav-tooltip {
      opacity: 1;
      right: 30px;
    }
  }
}

.performance-monitor {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 10px;
  color: white;
  font-family: 'Courier New', monospace;
  z-index: 100;

  .perf-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

@media (max-width: 1200px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 50px 5%;

    .hero-title .title-line {
      font-size: 3rem;
    }

    .hero-logo {
      margin-top: 50px;

      .logo-3d {
        width: 200px;
        height: 200px;
      }
    }
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .contact-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .hero-title .title-line {
    font-size: 2rem;
  }

  .section-title {
    font-size: 2rem !important;
  }

  .effects-grid {
    grid-template-columns: 1fr;
  }

  .side-navigation {
    right: 15px;
  }
}
</style>
