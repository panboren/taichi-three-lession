<template>
  <div class="next-gen-enterprise">
    <!-- 3D 画布 -->
    <div ref="canvasContainer" class="canvas-container"></div>

    <!-- 全息 HUD 界面 -->
    <div class="holographic-hud">
      <!-- 顶部导航栏 -->
      <header class="hud-header">
        <div class="logo-section">
          <div class="logo-ring"></div>
          <div class="logo-core"></div>
          <div class="logo-text">
            <span class="brand-name">NEXUS</span>
            <span class="brand-tagline">Enterprise Solutions</span>
          </div>
        </div>

        <nav class="main-nav">
          <a v-for="item in navItems" :key="item.id" :href="item.href" class="nav-link" :class="{ active: activeNav === item.id }" @click.prevent="scrollToSection(item.id)">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.text }}</span>
            <span class="nav-indicator"></span>
          </a>
        </nav>

        <div class="header-actions">
          <button class="action-btn" @click="toggleLanguage">
            <span>{{ currentLang === 'zh' ? 'EN' : '中文' }}</span>
          </button>
          <button class="action-btn primary" @click="showContact = true">
            <span>{{ t('contact') }}</span>
            <div class="btn-glow"></div>
          </button>
        </div>
      </header>

      <!-- 实时状态面板 -->
      <div class="status-panel">
        <div class="status-item">
          <span class="status-label">FPS</span>
          <span class="status-value">{{ fps }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">{{ t('system') }}</span>
          <span class="status-value online">ONLINE</span>
        </div>
        <div class="status-item">
          <span class="status-label">{{ t('visitors') }}</span>
          <span class="status-value">{{ visitorCount }}</span>
        </div>
      </div>

      <!-- 侧边数据流 -->
      <div class="data-stream-panel">
        <div class="stream-header">
          <span>{{ t('dataStream') }}</span>
        </div>
        <div class="stream-lines">
          <div v-for="(line, index) in dataStreamLines" :key="index" class="stream-line" :style="{ animationDelay: index * 0.1 + 's' }">
            <span class="line-time">{{ line.time }}</span>
            <span class="line-type" :class="line.type">{{ line.type }}</span>
            <span class="line-value">{{ line.value }}</span>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <main class="main-content">
        <!-- Hero 区域 -->
        <section ref="heroSection" class="hero-section">
          <div class="hero-content">
            <div class="hero-badge">
              <span class="badge-pulse"></span>
              <span>{{ t('nextGen') }}</span>
            </div>
            <h1 class="hero-title">
              <span class="title-line">{{ t('heroTitle1') }}</span>
              <span class="title-line accent">{{ t('heroTitle2') }}</span>
            </h1>
            <p class="hero-subtitle">{{ t('heroSubtitle') }}</p>
            <div class="hero-actions">
              <button class="hero-btn primary" @click="scrollToSection('features')">
                <span>{{ t('explore') }}</span>
                <div class="btn-shine"></div>
              </button>
              <button class="hero-btn secondary" @click="showDemo = true">
                <span>{{ t('watchDemo') }}</span>
              </button>
            </div>

            <!-- 统计数据 -->
            <div class="stats-grid">
              <div v-for="stat in heroStats" :key="stat.id" class="stat-card">
                <div class="stat-icon">{{ stat.icon }}</div>
                <div class="stat-info">
                  <div class="stat-value" :data-value="stat.value">0</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 特性展示区域 -->
        <section ref="featuresSection" class="features-section">
          <div class="section-header">
            <span class="section-tag">{{ t('features') }}</span>
            <h2 class="section-title">{{ t('featuresTitle') }}</h2>
            <p class="section-desc">{{ t('featuresDesc') }}</p>
          </div>

          <div class="features-grid">
            <div v-for="feature in features" :key="feature.id" class="feature-card" @mouseenter="onFeatureHover(feature.id)">
              <div class="feature-icon">{{ feature.icon }}</div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-desc">{{ feature.desc }}</p>
              <div class="feature-stats">
                <div class="mini-stat">
                  <span class="mini-label">Performance</span>
                  <div class="mini-bar">
                    <div class="mini-fill" :style="{ width: feature.performance + '%' }"></div>
                  </div>
                </div>
              </div>
              <div class="feature-glow"></div>
            </div>
          </div>
        </section>

        <!-- 解决方案区域 -->
        <section ref="solutionsSection" class="solutions-section">
          <div class="section-header">
            <span class="section-tag">{{ t('solutions') }}</span>
            <h2 class="section-title">{{ t('solutionsTitle') }}</h2>
            <p class="section-desc">{{ t('solutionsDesc') }}</p>
          </div>

          <div class="solutions-carousel">
            <div v-for="(solution, index) in solutions" :key="solution.id" class="solution-card" :class="{ active: activeSolution === index }" @click="activeSolution = index">
              <div class="solution-visual">
                <div class="visual-ring"></div>
                <div class="visual-core">{{ solution.icon }}</div>
              </div>
              <div class="solution-content">
                <h3 class="solution-title">{{ solution.title }}</h3>
                <p class="solution-desc">{{ solution.desc }}</p>
                <div class="solution-tech">
                  <span v-for="tech in solution.tech" :key="tech" class="tech-tag">{{ tech }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 技术栈区域 -->
        <section ref="techSection" class="tech-section">
          <div class="section-header">
            <span class="section-tag">{{ t('technology') }}</span>
            <h2 class="section-title">{{ t('techTitle') }}</h2>
            <p class="section-desc">{{ t('techDesc') }}</p>
          </div>

          <div class="tech-grid">
            <div v-for="tech in techStack" :key="tech.id" class="tech-card">
              <div class="tech-icon">{{ tech.icon }}</div>
              <h3 class="tech-name">{{ tech.name }}</h3>
              <div class="tech-bar">
                <div class="tech-progress" :style="{ width: tech.level + '%' }"></div>
              </div>
              <p class="tech-desc">{{ tech.desc }}</p>
            </div>
          </div>
        </section>

        <!-- CTA 区域 -->
        <section ref="ctaSection" class="cta-section">
          <div class="cta-content">
            <h2 class="cta-title">{{ t('ctaTitle') }}</h2>
            <p class="cta-subtitle">{{ t('ctaSubtitle') }}</p>
            <div class="cta-actions">
              <button class="cta-btn primary" @click="showContact = true">
                <span>{{ t('getStarted') }}</span>
                <div class="btn-pulse"></div>
              </button>
              <button class="cta-btn secondary" @click="showDemo = true">
                <span>{{ t('scheduleDemo') }}</span>
              </button>
            </div>

            <!-- 客户 Logo -->
            <div class="client-logos">
              <div class="logo-grid">
                <div v-for="logo in clientLogos" :key="logo.id" class="client-logo">
                  <span class="logo-text">{{ logo.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- 底部信息栏 -->
      <footer class="hud-footer">
        <div class="footer-content">
          <div class="footer-brand">
            <span class="footer-logo">NEXUS</span>
            <span class="footer-copy">© 2024 Nexus Enterprise. All rights reserved.</span>
          </div>
          <div class="footer-links">
            <a href="#" class="footer-link">Privacy</a>
            <a href="#" class="footer-link">Terms</a>
            <a href="#" class="footer-link">Security</a>
          </div>
        </div>
      </footer>

      <!-- 滚动进度指示器 -->
      <div class="scroll-progress">
        <div class="progress-bar" :style="{ width: scrollProgress + '%' }"></div>
      </div>
    </div>

    <!-- 联系弹窗 -->
    <div v-if="showContact" class="modal-overlay" @click.self="showContact = false">
      <div class="contact-modal">
        <button class="modal-close" @click="showContact = false">×</button>
        <h2>{{ t('contactUs') }}</h2>
        <form class="contact-form">
          <input type="text" :placeholder="t('name')" />
          <input type="email" :placeholder="t('email')" />
          <textarea :placeholder="t('message')" rows="4"></textarea>
          <button type="submit" class="submit-btn">
            <span>{{ t('send') }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 注册 GSAP 插件
gsap.registerPlugin(ScrollTrigger)

// 响应式数据
const canvasContainer = ref<HTMLElement>()
const heroSection = ref<HTMLElement>()
const featuresSection = ref<HTMLElement>()
const solutionsSection = ref<HTMLElement>()
const techSection = ref<HTMLElement>()
const ctaSection = ref<HTMLElement>()

const showContact = ref(false)
const showDemo = ref(false)
const activeNav = ref('hero')
const activeSolution = ref(0)
const currentLang = ref('zh')
const scrollProgress = ref(0)
const fps = ref(60)
const visitorCount = ref(8724)

// 导航项
const navItems = [
  { id: 'hero', href: '#hero', icon: '🏠', text: '首页' },
  { id: 'features', href: '#features', icon: '✨', text: '特性' },
  { id: 'solutions', href: '#solutions', icon: '💡', text: '解决方案' },
  { id: 'tech', href: '#tech', icon: '⚡', text: '技术栈' },
  { id: 'contact', href: '#contact', icon: '📞', text: '联系' }
]

// Hero 统计数据
const heroStats = [
  { id: 1, icon: '🚀', value: '99.9%', label: 'Uptime' },
  { id: 2, icon: '📊', value: '500+', label: 'Clients' },
  { id: 3, icon: '⚡', value: '10M+', label: 'Transactions' },
  { id: 4, icon: '🌍', value: '50+', label: 'Countries' }
]

// 特性列表
const features = [
  { id: 1, icon: '🔮', title: 'AI-Powered Analytics', desc: 'Advanced machine learning algorithms that provide real-time insights and predictive analytics.', performance: 95 },
  { id: 2, icon: '🌐', title: 'Global CDN', desc: 'Lightning-fast content delivery with edge computing nodes in 200+ locations worldwide.', performance: 98 },
  { id: 3, icon: '🔒', title: 'Enterprise Security', desc: 'Military-grade encryption and compliance with SOC2, ISO 27001, and GDPR standards.', performance: 99 },
  { id: 4, icon: '📱', title: 'Cross-Platform', desc: 'Seamless experience across web, mobile, and desktop applications with a single codebase.', performance: 92 },
  { id: 5, icon: '⚙️', title: 'Auto-Scaling', desc: 'Intelligent resource allocation that scales automatically based on demand and usage patterns.', performance: 97 },
  { id: 6, icon: '🎯', title: 'Real-Time Sync', desc: 'Millisecond data synchronization across all connected devices and applications.', performance: 96 }
]

// 解决方案
const solutions = [
  { id: 1, icon: '🏢', title: 'Enterprise Management', desc: 'Complete enterprise resource planning with integrated CRM, ERP, and HR modules.', tech: ['Cloud', 'AI', 'Big Data'] },
  { id: 2, icon: '🛒', title: 'E-Commerce Platform', desc: 'Scalable e-commerce solution with payment processing, inventory management, and analytics.', tech: ['Vue', 'Node.js', 'Redis'] },
  { id: 3, icon: '📊', title: 'Data Analytics', desc: 'Advanced analytics platform with real-time dashboards, reports, and predictive modeling.', tech: ['Python', 'TensorFlow', 'D3.js'] },
  { id: 4, icon: '🤖', title: 'AI & Automation', desc: 'Intelligent automation solutions for workflow optimization and decision support.', tech: ['NLP', 'CV', 'RL'] }
]

// 技术栈
const techStack = [
  { id: 1, icon: '⚛️', name: 'Vue 3', level: 95, desc: 'Progressive JavaScript framework for building user interfaces' },
  { id: 2, icon: '🎨', name: 'Three.js', level: 90, desc: '3D graphics library for creating immersive web experiences' },
  { id: 3, icon: '🚀', name: 'Vite', level: 92, desc: 'Next-generation frontend tooling with instant HMR' },
  { id: 4, icon: '💾', name: 'TypeScript', level: 88, desc: 'Type-safe JavaScript with enhanced tooling' },
  { id: 5, icon: '🎭', name: 'GSAP', level: 94, desc: 'Professional animation library for web and beyond' },
  { id: 6, icon: '☁️', name: 'Cloud Native', level: 91, desc: 'Built for modern cloud infrastructure and containers' }
]

// 客户 Logo
const clientLogos = [
  { id: 1, name: 'TechCorp' },
  { id: 2, name: 'Innovate Inc' },
  { id: 3, name: 'FutureLab' },
  { id: 4, name: 'GlobalSoft' },
  { id: 5, name: 'NextGen' }
]

// 数据流模拟
const dataStreamLines = ref([
  { time: '10:42:31', type: 'INFO', value: 'System initialized' },
  { time: '10:42:32', type: 'SUCCESS', value: 'Connection established' },
  { time: '10:42:33', type: 'DATA', value: 'Syncing data...' },
  { time: '10:42:34', type: 'SUCCESS', value: 'Data synced' },
  { time: '10:42:35', type: 'INFO', value: 'User interaction' },
  { time: '10:42:36', type: 'WARNING', value: 'High traffic' },
  { time: '10:42:37', type: 'INFO', value: 'Optimizing...' }
])

// 翻译
const t = (key: string) => {
  const translations: Record<string, Record<string, string>> = {
    zh: {
      nextGen: '下一代企业解决方案',
      heroTitle1: '重塑企业',
      heroTitle2: '数字未来',
      heroSubtitle: '融合 AI、云计算与 3D 可视化技术，打造智能化企业级平台',
      explore: '探索功能',
      watchDemo: '观看演示',
      features: '核心特性',
      featuresTitle: '为什么选择我们',
      featuresDesc: '我们提供全方位的企业级解决方案，帮助您的业务在数字时代保持领先',
      solutions: '解决方案',
      solutionsTitle: '定制化解决方案',
      solutionsDesc: '根据您的业务需求，提供量身定制的数字化解决方案',
      technology: '技术栈',
      techTitle: '领先技术',
      techDesc: '采用最前沿的技术栈，确保产品的性能和可扩展性',
      ctaTitle: '准备好开始了吗？',
      ctaSubtitle: '立即联系我们的团队，开启数字化转型之旅',
      getStarted: '立即开始',
      scheduleDemo: '预约演示',
      contact: '联系我们',
      contactUs: '联系我们',
      name: '姓名',
      email: '邮箱',
      message: '留言',
      send: '发送',
      system: '系统状态',
      visitors: '在线访客',
      dataStream: '数据流'
    },
    en: {
      nextGen: 'Next-Gen Enterprise Solutions',
      heroTitle1: 'Reshaping',
      heroTitle2: 'Digital Future',
      heroSubtitle: 'Integrating AI, Cloud Computing & 3D Visualization for Intelligent Enterprise Platforms',
      explore: 'Explore',
      watchDemo: 'Watch Demo',
      features: 'Features',
      featuresTitle: 'Why Choose Us',
      featuresDesc: 'We provide comprehensive enterprise solutions to keep your business ahead in the digital age',
      solutions: 'Solutions',
      solutionsTitle: 'Custom Solutions',
      solutionsDesc: 'Tailored digital solutions based on your business needs',
      technology: 'Technology',
      techTitle: 'Cutting-Edge Tech',
      techDesc: 'Using the latest technology stack to ensure performance and scalability',
      ctaTitle: 'Ready to Start?',
      ctaSubtitle: 'Contact our team today and begin your digital transformation journey',
      getStarted: 'Get Started',
      scheduleDemo: 'Schedule Demo',
      contact: 'Contact',
      contactUs: 'Contact Us',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send',
      system: 'System',
      visitors: 'Visitors',
      dataStream: 'Data Stream'
    }
  }
  return translations[currentLang.value][key] || key
}

// Three.js 对象
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let particleSystem: THREE.Points
let torusKnot: THREE.Mesh
let animationId: number
let particles: Float32Array
let velocities: Float32Array

// 初始化 3D 场景
const init3DScene = () => {
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000011, 0.002)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 50

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  if (canvasContainer.value) {
    canvasContainer.value.appendChild(renderer.domElement)
  }

  // 粒子系统
  createParticles()

  // 环面纽结
  createTorusKnot()

  // 光照
  const ambientLight = new THREE.AmbientLight(0x444466, 0.5)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0x00ffff, 1, 100)
  pointLight.position.set(10, 10, 10)
  scene.add(pointLight)

  animate3D()
}

// 创建粒子系统
const createParticles = () => {
  const particleCount = 5000
  const geometry = new THREE.BufferGeometry()
  particles = new Float32Array(particleCount * 3)
  velocities = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    particles[i3] = (Math.random() - 0.5) * 200
    particles[i3 + 1] = (Math.random() - 0.5) * 200
    particles[i3 + 2] = (Math.random() - 0.5) * 200

    velocities[i3] = (Math.random() - 0.5) * 0.02
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.02
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02

    const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  })

  particleSystem = new THREE.Points(geometry, material)
  scene.add(particleSystem)
}

// 创建环面纽结
const createTorusKnot = () => {
  const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16)
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  })
  torusKnot = new THREE.Mesh(geometry, material)
  scene.add(torusKnot)
}

// 3D 动画循环
const animate3D = () => {
  animationId = requestAnimationFrame(animate3D)

  // 更新粒子
  const positions = particleSystem.geometry.attributes.position.array as Float32Array
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += velocities[i]
    positions[i + 1] += velocities[i + 1]
    positions[i + 2] += velocities[i + 2]

    // 边界检查
    if (Math.abs(positions[i]) > 100) velocities[i] *= -1
    if (Math.abs(positions[i + 1]) > 100) velocities[i + 1] *= -1
    if (Math.abs(positions[i + 2]) > 100) velocities[i + 2] *= -1
  }
  particleSystem.geometry.attributes.position.needsUpdate = true

  // 旋转环面纽结
  torusKnot.rotation.x += 0.001
  torusKnot.rotation.y += 0.002

  // 根据 scrollProgress 调整相机
  camera.position.y = scrollProgress.value * 0.3 - 25

  renderer.render(scene, camera)
}

// 初始化 GSAP 动画
const initAnimations = () => {
  // 导航进入动画
  gsap.from('.hud-header', {
    y: -100,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  })

  // Hero 动画
  gsap.from('.hero-badge', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    delay: 0.5
  })

  gsap.from('.hero-title .title-line', {
    y: 60,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    delay: 0.7
  })

  gsap.from('.hero-subtitle', {
    y: 40,
    opacity: 0,
    duration: 0.8,
    delay: 1
  })

  gsap.from('.hero-actions', {
    y: 40,
    opacity: 0,
    duration: 0.8,
    delay: 1.2
  })

  // 统计卡片动画
  gsap.from('.stat-card', {
    y: 50,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    delay: 1.4
  })

  // 数字递增动画
  gsap.to('.stat-value', {
    innerText: (index) => {
      const values = ['99.9', '500', '10', '50']
      return values[index]
    },
    duration: 2,
    stagger: 0.2,
    snap: { innerText: 0.1 },
    ease: 'power2.out'
  })

  // 滚动触发动画 - 特性
  gsap.from('.feature-card', {
    scrollTrigger: {
      trigger: featuresSection.value,
      start: 'top 70%',
      end: 'bottom 30%',
      toggleActions: 'play none none reverse'
    },
    y: 80,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15
  })

  // 滚动触发动画 - 解决方案
  gsap.from('.solution-card', {
    scrollTrigger: {
      trigger: solutionsSection.value,
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    scale: 0.8,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2
  })

  // 滚动触发动画 - 技术栈
  gsap.from('.tech-card', {
    scrollTrigger: {
      trigger: techSection.value,
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    x: -50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15
  })
}

// 滚动到指定区域
const scrollToSection = (sectionId: string) => {
  activeNav.value = sectionId
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// 特性悬停效果
const onFeatureHover = (id: number) => {
  // 可以在这里添加更复杂的交互效果
}

// 切换语言
const toggleLanguage = () => {
  currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
}

// 监听滚动
const handleScroll = () => {
  const scrollTop = window.pageYOffset
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = (scrollTop / docHeight) * 100

  // 更新活动导航
  const sections = ['hero', 'features', 'solutions', 'tech', 'cta']
  for (const section of sections) {
    const element = document.getElementById(section)
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top <= 100 && rect.bottom >= 100) {
        activeNav.value = section
        break
      }
    }
  }
}

// 窗口大小调整
const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 模拟数据流更新
const updateDataStream = () => {
  const types = ['INFO', 'SUCCESS', 'WARNING', 'DATA']
  const messages = [
    'Syncing data...',
    'User interaction',
    'Processing request',
    'Cache updated',
    'Optimizing...',
    'Connection active',
    'Data synced'
  ]

  const newLine = {
    time: new Date().toLocaleTimeString(),
    type: types[Math.floor(Math.random() * types.length)],
    value: messages[Math.floor(Math.random() * messages.length)]
  }

  dataStreamLines.value.push(newLine)
  if (dataStreamLines.value.length > 7) {
    dataStreamLines.value.shift()
  }
}

// 组件挂载
onMounted(() => {
  init3DScene()
  initAnimations()

  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)

  // 定时更新数据流
  setInterval(updateDataStream, 3000)

  // 定时更新访客数
  setInterval(() => {
    visitorCount.value += Math.floor(Math.random() * 10) - 3
  }, 5000)

  // 定时更新 FPS
  setInterval(() => {
    fps.value = Math.floor(Math.random() * 5) + 55
  }, 2000)
})

// 组件卸载
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.next-gen-enterprise {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow-x: hidden;
  background: linear-gradient(135deg, #000011 0%, #0a0a2a 50%, #111133 100%);
  color: #ffffff;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.canvas-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.holographic-hud {
  position: relative;
  z-index: 10;
  min-height: 100vh;
}

// 顶部导航
.hud-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(0, 5, 20, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  z-index: 100;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;

  .logo-ring {
    position: relative;
    width: 50px;
    height: 50px;
    border: 2px solid #00ffff;
    border-radius: 50%;
    animation: logoSpin 10s linear infinite;

    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: 50%;
      width: 4px;
      height: 4px;
      background: #00ffff;
      border-radius: 50%;
      transform: translateX(-50%);
    }
  }

  .logo-core {
    position: absolute;
    left: 27px;
    width: 8px;
    height: 8px;
    background: #00ffff;
    border-radius: 50%;
    box-shadow: 0 0 20px #00ffff;
  }

  .logo-text {
    display: flex;
    flex-direction: column;

    .brand-name {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 2px;
      background: linear-gradient(90deg, #00ffff, #ff00ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .brand-tagline {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.6);
      letter-spacing: 1px;
    }
  }
}

.main-nav {
  display: flex;
  gap: 40px;

  .nav-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      color: #00ffff;
    }

    &.active {
      color: #00ffff;

      .nav-indicator {
        width: 100%;
      }
    }

    .nav-icon {
      font-size: 18px;
    }

    .nav-indicator {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #00ffff, #ff00ff);
      transition: width 0.3s ease;
    }
  }
}

.header-actions {
  display: flex;
  gap: 15px;

  .action-btn {
    position: relative;
    padding: 12px 24px;
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 8px;
    color: #00ffff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    &.primary {
      background: linear-gradient(135deg, #00ffff, #0088ff);
      border: none;
      color: #000;

      .btn-glow {
        position: absolute;
        inset: -2px;
        background: linear-gradient(135deg, #00ffff, #ff00ff, #00ffff);
        border-radius: 10px;
        z-index: -1;
        filter: blur(10px);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        .btn-glow {
          opacity: 0.6;
        }
      }
    }
  }
}

// 状态面板
.status-panel {
  position: fixed;
  top: 100px;
  left: 40px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 90;

  .status-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    background: rgba(0, 20, 40, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 255, 255, 0.1);
    border-radius: 8px;

    .status-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }

    .status-value {
      font-size: 14px;
      font-weight: bold;
      color: #00ffff;

      &.online {
        color: #00ff88;
        text-shadow: 0 0 10px #00ff88;
      }
    }
  }
}

// 数据流面板
.data-stream-panel {
  position: fixed;
  top: 100px;
  right: 40px;
  width: 280px;
  background: rgba(0, 10, 20, 0.7);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 255, 255, 0.15);
  border-radius: 12px;
  padding: 15px;
  z-index: 90;

  .stream-header {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .stream-lines {
    .stream-line {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 0;
      font-size: 11px;
      font-family: 'Courier New', monospace;
      animation: streamSlide 0.3s ease;

      .line-time {
        color: rgba(255, 255, 255, 0.4);
      }

      .line-type {
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 9px;
        font-weight: bold;

        &.INFO {
          color: #00ffff;
          background: rgba(0, 255, 255, 0.1);
        }

        &.SUCCESS {
          color: #00ff88;
          background: rgba(0, 255, 136, 0.1);
        }

        &.WARNING {
          color: #ffaa00;
          background: rgba(255, 170, 0, 0.1);
        }

        &.DATA {
          color: #ff00ff;
          background: rgba(255, 0, 255, 0.1);
        }
      }

      .line-value {
        flex: 1;
        color: rgba(255, 255, 255, 0.7);
        text-align: right;
      }
    }
  }
}

// 主要内容
.main-content {
  position: relative;
  z-index: 5;
}

// Hero 区域
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 40px;
}

.hero-content {
  max-width: 1200px;
  text-align: center;

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 20px;
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 30px;
    font-size: 14px;
    color: #00ffff;
    margin-bottom: 30px;

    .badge-pulse {
      width: 8px;
      height: 8px;
      background: #00ff88;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
  }

  .hero-title {
    font-size: clamp(48px, 8vw, 80px);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 30px;

    .title-line {
      display: block;

      &.accent {
        background: linear-gradient(90deg, #00ffff, #ff00ff, #ff0080);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
  }

  .hero-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.7);
    max-width: 600px;
    margin: 0 auto 40px;
  }

  .hero-actions {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-bottom: 60px;

    .hero-btn {
      position: relative;
      padding: 16px 40px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;

      &.primary {
        background: linear-gradient(135deg, #00ffff, #0088ff);
        border: none;
        color: #000;

        .btn-shine {
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, #00ffff, #ff00ff, #00ffff);
          border-radius: 14px;
          z-index: -1;
          filter: blur(15px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(0, 255, 255, 0.3);

          .btn-shine {
            opacity: 0.5;
          }
        }
      }

      &.secondary {
        background: transparent;
        border: 2px solid rgba(0, 255, 255, 0.5);
        color: #00ffff;

        &:hover {
          background: rgba(0, 255, 255, 0.1);
          transform: translateY(-3px);
        }
      }
    }
  }

  // 统计卡片
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
    max-width: 900px;
    margin: 0 auto;

    .stat-card {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 25px;
      background: rgba(0, 20, 40, 0.4);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 255, 255, 0.15);
      border-radius: 16px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 255, 255, 0.4);
        box-shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
      }

      .stat-icon {
        font-size: 32px;
      }

      .stat-info {
        text-align: left;

        .stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #00ffff;
          line-height: 1;
        }

        .stat-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 5px;
        }
      }
    }
  }
}

// 特性区域
.features-section {
  min-height: 100vh;
  padding: 100px 40px;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;

  .section-tag {
    display: inline-block;
    padding: 6px 16px;
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 20px;
    font-size: 12px;
    color: #00ffff;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 20px;
  }

  .section-title {
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 700;
    margin-bottom: 20px;
    background: linear-gradient(90deg, #ffffff, #00ffff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .section-desc {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.6);
    max-width: 600px;
    margin: 0 auto;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;

  .feature-card {
    position: relative;
    padding: 40px;
    background: rgba(0, 15, 30, 0.5);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(0, 255, 255, 0.1);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.4s ease;

    &:hover {
      transform: translateY(-10px);
      border-color: rgba(0, 255, 255, 0.4);
      box-shadow: 0 20px 60px rgba(0, 255, 255, 0.15);

      .feature-glow {
        opacity: 1;
      }
    }

    .feature-icon {
      font-size: 48px;
      margin-bottom: 20px;
    }

    .feature-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 15px;
      color: #ffffff;
    }

    .feature-desc {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .feature-stats {
      .mini-stat {
        .mini-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
        }

        .mini-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          margin-top: 8px;
          overflow: hidden;

          .mini-fill {
            height: 100%;
            background: linear-gradient(90deg, #00ffff, #ff00ff);
            border-radius: 2px;
          }
        }
      }
    }

    .feature-glow {
      position: absolute;
      inset: -2px;
      background: linear-gradient(135deg, #00ffff, #ff00ff, #00ffff);
      border-radius: 22px;
      z-index: -1;
      filter: blur(20px);
      opacity: 0;
      transition: opacity 0.4s ease;
    }
  }
}

// 解决方案区域
.solutions-section {
  min-height: 100vh;
  padding: 100px 40px;
}

.solutions-carousel {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;

  .solution-card {
    display: flex;
    gap: 25px;
    padding: 40px;
    background: rgba(0, 15, 30, 0.5);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(0, 255, 255, 0.1);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.4s ease;

    &:hover,
    &.active {
      border-color: rgba(0, 255, 255, 0.4);
      transform: scale(1.02);
      box-shadow: 0 20px 60px rgba(0, 255, 255, 0.2);
    }

    .solution-visual {
      position: relative;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;

      .visual-ring {
        position: absolute;
        inset: 0;
        border: 2px solid rgba(0, 255, 255, 0.3);
        border-radius: 50%;
        animation: ringPulse 3s infinite;
      }

      .visual-core {
        font-size: 32px;
      }
    }

    .solution-content {
      flex: 1;

      .solution-title {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 10px;
      }

      .solution-desc {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 15px;
      }

      .solution-tech {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .tech-tag {
          padding: 4px 12px;
          background: rgba(0, 255, 255, 0.1);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 15px;
          font-size: 11px;
          color: #00ffff;
        }
      }
    }
  }
}

// 技术栈区域
.tech-section {
  min-height: 100vh;
  padding: 100px 40px;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;

  .tech-card {
    padding: 35px;
    background: rgba(0, 15, 30, 0.5);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(0, 255, 255, 0.1);
    border-radius: 16px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      border-color: rgba(0, 255, 255, 0.3);
    }

    .tech-icon {
      font-size: 36px;
      margin-bottom: 15px;
    }

    .tech-name {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 15px;
    }

    .tech-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      margin-bottom: 15px;
      overflow: hidden;

      .tech-progress {
        height: 100%;
        background: linear-gradient(90deg, #00ffff, #ff00ff);
        border-radius: 3px;
      }
    }

    .tech-desc {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      line-height: 1.5;
    }
  }
}

// CTA 区域
.cta-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 40px;
}

.cta-content {
  max-width: 800px;
  text-align: center;

  .cta-title {
    font-size: clamp(36px, 6vw, 56px);
    font-weight: 800;
    margin-bottom: 20px;
    background: linear-gradient(90deg, #00ffff, #ff00ff, #ff0080);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cta-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 40px;
  }

  .cta-actions {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-bottom: 60px;

    .cta-btn {
      position: relative;
      padding: 18px 45px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.3s ease;

      &.primary {
        background: linear-gradient(135deg, #00ffff, #0088ff);
        border: none;
        color: #000;

        .btn-pulse {
          position: absolute;
          inset: -4px;
          background: linear-gradient(135deg, #00ffff, #ff00ff);
          border-radius: 34px;
          z-index: -1;
          filter: blur(20px);
          opacity: 0.6;
          animation: btnPulse 2s infinite;
        }

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 20px 50px rgba(0, 255, 255, 0.4);
        }
      }

      &.secondary {
        background: transparent;
        border: 2px solid rgba(0, 255, 255, 0.5);
        color: #00ffff;

        &:hover {
          background: rgba(0, 255, 255, 0.1);
          transform: scale(1.05);
        }
      }
    }
  }

  .client-logos {
    .logo-grid {
      display: flex;
      gap: 30px;
      justify-content: center;
      flex-wrap: wrap;

      .client-logo {
        padding: 15px 30px;
        background: rgba(0, 20, 40, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;

        .logo-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 600;
        }
      }
    }
  }
}

// 底部
.hud-footer {
  position: relative;
  padding: 30px 40px;
  background: rgba(0, 5, 15, 0.8);
  border-top: 1px solid rgba(0, 255, 255, 0.1);

  .footer-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .footer-logo {
        font-size: 20px;
        font-weight: 700;
        color: #00ffff;
      }

      .footer-copy {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
      }
    }

    .footer-links {
      display: flex;
      gap: 30px;

      .footer-link {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.6);
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
          color: #00ffff;
        }
      }
    }
  }
}

// 滚动进度
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  z-index: 1000;

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #00ffff, #ff00ff, #ff0080);
    transition: width 0.1s ease;
  }
}

// 弹窗
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .contact-modal {
    position: relative;
    width: 90%;
    max-width: 500px;
    padding: 40px;
    background: rgba(0, 15, 30, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 20px;

    .modal-close {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      color: rgba(255, 255, 255, 0.6);
      font-size: 24px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #00ffff;
        color: #00ffff;
      }
    }

    h2 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 30px;
      text-align: center;
      background: linear-gradient(90deg, #00ffff, #ff00ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 20px;

      input,
      textarea {
        width: 100%;
        padding: 15px;
        background: rgba(0, 20, 40, 0.5);
        border: 1px solid rgba(0, 255, 255, 0.2);
        border-radius: 10px;
        color: #ffffff;
        font-size: 14px;
        transition: all 0.3s ease;

        &::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        &:focus {
          outline: none;
          border-color: #00ffff;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
        }
      }

      .submit-btn {
        padding: 15px;
        background: linear-gradient(135deg, #00ffff, #0088ff);
        border: none;
        border-radius: 10px;
        color: #000;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
        }
      }
    }
  }
}

// 动画
@keyframes logoSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

@keyframes ringPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

@keyframes btnPulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

@keyframes streamSlide {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 响应式
@media (max-width: 1200px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .solutions-carousel {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hud-header {
    padding: 15px 20px;
  }

  .main-nav {
    display: none;
  }

  .status-panel,
  .data-stream-panel {
    display: none;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .tech-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 36px;
  }

  .cta-actions {
    flex-direction: column;
  }
}
</style>
