<template>
  <div class="ultimate-enterprise-portal">
    <!-- 3D 画布 -->
    <div ref="canvasContainer" class="canvas-container"></div>

    <!-- 粒子背景 -->
    <canvas ref="particleCanvas" class="particle-background"></canvas>

    <!-- 全息 HUD 界面 -->
    <div class="holographic-hud">
      <!-- 顶部导航栏 -->
      <header class="hud-header">
        <div class="logo-section">
          <div class="logo-3d-container">
            <div class="logo-core"></div>
            <div class="logo-orbits">
              <div v-for="i in 5" :key="i" class="orbit" :style="{ '--delay': i + 's' }"></div>
            </div>
            <div class="logo-satellites">
              <div v-for="i in 12" :key="i" class="satellite" :style="{ '--rotation': (i * 30) + 'deg' }"></div>
            </div>
          </div>
          <div class="logo-text">
            <span class="brand-name">NEXUS ULTIMATE</span>
            <span class="brand-tagline">Enterprise Solutions 3.0</span>
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
        <div class="status-item">
          <span class="status-label">Uptime</span>
          <span class="status-value uptime">99.99%</span>
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

      <!-- 全球业务可视化 -->
      <div class="globe-panel">
        <div class="globe-header">
          <span>{{ t('globalPresence') }}</span>
        </div>
        <div class="globe-visualization">
          <div class="globe-core"></div>
          <div class="globe-rings">
            <div v-for="i in 3" :key="i" class="globe-ring" :style="{ '--delay': i * 0.5 + 's' }"></div>
          </div>
          <div class="globe-points">
            <div v-for="point in globePoints" :key="point.id" class="globe-point" :style="{ top: point.y + '%', left: point.x + '%' }">
              <div class="point-pulse"></div>
            </div>
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

        <!-- AI 分析仪表板 -->
        <section ref="aiAnalyticsSection" class="ai-analytics-section">
          <div class="section-header">
            <span class="section-tag">AI Powered</span>
            <h2 class="section-title">{{ t('aiAnalytics') }}</h2>
            <p class="section-desc">{{ t('aiAnalyticsDesc') }}</p>
          </div>

          <div class="analytics-dashboard">
            <div class="dashboard-grid">
              <div class="dashboard-card">
                <div class="card-header">
                  <span class="card-icon">📊</span>
                  <span class="card-title">{{ t('realTimeData') }}</span>
                </div>
                <div class="card-content">
                  <div class="data-chart">
                    <div v-for="i in 20" :key="i" class="chart-bar" :style="{ height: Math.random() * 80 + 20 + '%' }"></div>
                  </div>
                </div>
              </div>
              
              <div class="dashboard-card">
                <div class="card-header">
                  <span class="card-icon">🔮</span>
                  <span class="card-title">{{ t('predictions') }}</span>
                </div>
                <div class="card-content">
                  <div class="prediction-indicators">
                    <div v-for="pred in predictions" :key="pred.id" class="prediction-item">
                      <span class="prediction-label">{{ pred.label }}</span>
                      <span class="prediction-value">{{ pred.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="dashboard-card">
                <div class="card-header">
                  <span class="card-icon">🧠</span>
                  <span class="card-title">{{ t('insights') }}</span>
                </div>
                <div class="card-content">
                  <div class="insight-tags">
                    <span v-for="insight in insights" :key="insight" class="insight-tag">{{ insight }}</span>
                  </div>
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
            <div v-for="feature in features" :key="feature.id" class="feature-card" @mouseenter="onFeatureHover(feature.id)" @mouseleave="onFeatureLeave(feature.id)">
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
              <div class="feature-particles" v-if="activeFeature === feature.id">
                <div v-for="i in 5" :key="i" class="particle" :style="{ animationDelay: i * 0.1 + 's' }"></div>
              </div>
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

        <!-- 安全性区域 -->
        <section ref="securitySection" class="security-section">
          <div class="section-header">
            <span class="section-tag">🔒 {{ t('security') }}</span>
            <h2 class="section-title">{{ t('securityTitle') }}</h2>
            <p class="section-desc">{{ t('securityDesc') }}</p>
          </div>

          <div class="security-grid">
            <div v-for="security in securityFeatures" :key="security.id" class="security-card">
              <div class="security-icon">{{ security.icon }}</div>
              <h3 class="security-title">{{ security.title }}</h3>
              <p class="security-desc">{{ security.desc }}</p>
              <div class="security-status">
                <div class="status-indicator secure"></div>
                <span>{{ t('secure') }}</span>
              </div>
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
            <span class="footer-logo">NEXUS ULTIMATE</span>
            <span class="footer-copy">© 2024 Nexus Ultimate Enterprise. All rights reserved.</span>
          </div>
          <div class="footer-links">
            <a href="#" class="footer-link">Privacy</a>
            <a href="#" class="footer-link">Terms</a>
            <a href="#" class="footer-link">Security</a>
            <a href="#" class="footer-link">Compliance</a>
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

    <!-- 演示视频弹窗 -->
    <div v-if="showDemo" class="modal-overlay" @click.self="showDemo = false">
      <div class="demo-modal">
        <button class="modal-close" @click="showDemo = false">×</button>
        <div class="demo-video">
          <div class="video-placeholder">
            <span>🎬 {{ t('demoVideo') }}</span>
          </div>
        </div>
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
const particleCanvas = ref<HTMLCanvasElement>()
const heroSection = ref<HTMLElement>()
const featuresSection = ref<HTMLElement>()
const solutionsSection = ref<HTMLElement>()
const techSection = ref<HTMLElement>()
const securitySection = ref<HTMLElement>()
const aiAnalyticsSection = ref<HTMLElement>()
const ctaSection = ref<HTMLElement>()

const showContact = ref(false)
const showDemo = ref(false)
const activeNav = ref('hero')
const activeSolution = ref(0)
const currentLang = ref('zh')
const scrollProgress = ref(0)
const fps = ref(60)
const visitorCount = ref(12489)
const activeFeature = ref<number | null>(null)

// 导航项
const navItems = [
  { id: 'hero', href: '#hero', icon: '🏠', text: '首页' },
  { id: 'aiAnalytics', href: '#aiAnalytics', icon: '🧠', text: 'AI分析' },
  { id: 'features', href: '#features', icon: '✨', text: '特性' },
  { id: 'solutions', href: '#solutions', icon: '💡', text: '解决方案' },
  { id: 'tech', href: '#tech', icon: '⚡', text: '技术栈' },
  { id: 'security', href: '#security', icon: '🔒', text: '安全' },
  { id: 'contact', href: '#contact', icon: '📞', text: '联系' }
]

// Hero 统计数据
const heroStats = [
  { id: 1, icon: '🚀', value: '99.99%', label: 'Uptime' },
  { id: 2, icon: '📊', value: '1000+', label: 'Clients' },
  { id: 3, icon: '⚡', value: '50M+', label: 'Transactions' },
  { id: 4, icon: '🌍', value: '80+', label: 'Countries' }
]

// AI 预测数据
const predictions = [
  { id: 1, label: 'Revenue Growth', value: '+12.5%' },
  { id: 2, label: 'Market Share', value: '+3.2%' },
  { id: 3, label: 'Efficiency', value: '+18.7%' }
]

// AI 洞察标签
const insights = [
  'Market Trends', 'Customer Behavior', 'Operational Efficiency', 
  'Risk Analysis', 'Growth Opportunities', 'Cost Optimization'
]

// 特性列表
const features = [
  { id: 1, icon: '🔮', title: 'AI-Powered Analytics', desc: 'Advanced machine learning algorithms that provide real-time insights and predictive analytics.', performance: 98 },
  { id: 2, icon: '🌐', title: 'Global CDN', desc: 'Lightning-fast content delivery with edge computing nodes in 200+ locations worldwide.', performance: 99 },
  { id: 3, icon: '🔒', title: 'Enterprise Security', desc: 'Military-grade encryption and compliance with SOC2, ISO 27001, and GDPR standards.', performance: 100 },
  { id: 4, icon: '📱', title: 'Cross-Platform', desc: 'Seamless experience across web, mobile, and desktop applications with a single codebase.', performance: 95 },
  { id: 5, icon: '⚙️', title: 'Auto-Scaling', desc: 'Intelligent resource allocation that scales automatically based on demand and usage patterns.', performance: 97 },
  { id: 6, icon: '🎯', title: 'Real-Time Sync', desc: 'Millisecond data synchronization across all connected devices and applications.', performance: 98 }
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
  { id: 1, icon: '⚛️', name: 'Vue 3', level: 98, desc: 'Progressive JavaScript framework for building user interfaces' },
  { id: 2, icon: '🎨', name: 'Three.js', level: 95, desc: '3D graphics library for creating immersive web experiences' },
  { id: 3, icon: '🚀', name: 'Vite', level: 96, desc: 'Next-generation frontend tooling with instant HMR' },
  { id: 4, icon: '💾', name: 'TypeScript', level: 92, desc: 'Type-safe JavaScript with enhanced tooling' },
  { id: 5, icon: '🎭', name: 'GSAP', level: 97, desc: 'Professional animation library for web and beyond' },
  { id: 6, icon: '☁️', name: 'Cloud Native', level: 94, desc: 'Built for modern cloud infrastructure and containers' },
  { id: 7, icon: '🤖', name: 'AI/ML', level: 90, desc: 'Machine Learning and AI-powered solutions' },
  { id: 8, icon: '🔒', name: 'Blockchain', level: 88, desc: 'Secure and decentralized solutions' }
]

// 安全特性
const securityFeatures = [
  { id: 1, icon: '🔐', title: 'End-to-End Encryption', desc: 'Military-grade encryption for all data in transit and at rest.', status: 'secure' },
  { id: 2, icon: '🛡️', title: 'Multi-Factor Auth', desc: 'Advanced authentication mechanisms to protect user accounts.', status: 'secure' },
  { id: 3, icon: '🔍', title: 'Threat Detection', desc: 'AI-powered threat detection and response systems.', status: 'secure' },
  { id: 4, icon: '📋', title: 'Compliance', desc: 'SOC2, ISO 27001, GDPR and other compliance certifications.', status: 'secure' }
]

// 客户 Logo
const clientLogos = [
  { id: 1, name: 'GlobalTech' },
  { id: 2, name: 'InnovateCorp' },
  { id: 3, name: 'FutureLabs' },
  { id: 4, name: 'EnterprisePro' },
  { id: 5, name: 'NexusGroup' },
  { id: 6, name: 'DigitalFirst' }
]

// 全球业务点
const globePoints = [
  { id: 1, x: 20, y: 30 },
  { id: 2, x: 45, y: 25 },
  { id: 3, x: 70, y: 35 },
  { id: 4, x: 30, y: 60 },
  { id: 5, x: 60, y: 55 },
  { id: 6, x: 80, y: 40 },
  { id: 7, x: 40, y: 45 },
  { id: 8, x: 75, y: 70 }
]

// 数据流模拟
const dataStreamLines = ref([
  { time: '10:42:31', type: 'INFO', value: 'System initialized' },
  { time: '10:42:32', type: 'SUCCESS', value: 'Connection established' },
  { time: '10:42:33', type: 'DATA', value: 'Syncing data...' },
  { time: '10:42:34', type: 'SUCCESS', value: 'Data synced' },
  { time: '10:42:35', type: 'INFO', value: 'User interaction' },
  { time: '10:42:36', type: 'WARNING', value: 'High traffic' },
  { time: '10:42:37', type: 'INFO', value: 'Optimizing...' },
  { time: '10:42:38', type: 'SUCCESS', value: 'AI analysis complete' }
])

// 翻译
const t = (key: string) => {
  const translations: Record<string, Record<string, string>> = {
    zh: {
      nextGen: '终极企业解决方案',
      heroTitle1: '重塑企业',
      heroTitle2: '数字未来',
      heroSubtitle: '融合 AI、云计算、区块链与 3D 可视化技术，打造智能化企业级平台',
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
      dataStream: '数据流',
      globalPresence: '全球业务',
      aiAnalytics: 'AI 分析',
      aiAnalyticsDesc: '利用人工智能技术，实时分析业务数据，预测市场趋势',
      realTimeData: '实时数据',
      predictions: '预测分析',
      insights: '智能洞察',
      security: '安全',
      securityTitle: '企业级安全',
      securityDesc: '采用最先进的安全技术保护您的业务数据',
      secure: '安全',
      demoVideo: '演示视频'
    },
    en: {
      nextGen: 'Ultimate Enterprise Solutions',
      heroTitle1: 'Reshaping',
      heroTitle2: 'Digital Future',
      heroSubtitle: 'Integrating AI, Cloud Computing, Blockchain & 3D Visualization for Intelligent Enterprise Platforms',
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
      dataStream: 'Data Stream',
      globalPresence: 'Global Presence',
      aiAnalytics: 'AI Analytics',
      aiAnalyticsDesc: 'Using AI technology to analyze business data and predict market trends in real-time',
      realTimeData: 'Real-Time Data',
      predictions: 'Predictive Analysis',
      insights: 'Intelligent Insights',
      security: 'Security',
      securityTitle: 'Enterprise Security',
      securityDesc: 'Using the most advanced security technologies to protect your business data',
      secure: 'Secure',
      demoVideo: 'Demo Video'
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
let earthMesh: THREE.Mesh
let stars: THREE.Points
let animationId: number
let particles: Float32Array
let velocities: Float32Array

// 2D 粒子系统
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

// 初始化 3D 场景
const init3DScene = () => {
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000011, 0.002)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 50

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true

  if (canvasContainer.value) {
    canvasContainer.value.appendChild(renderer.domElement)
  }

  // 粒子系统
  createParticles()

  // 地球
  createEarth()

  // 环面纽结
  createTorusKnot()

  // 星空
  createStars()

  // 光照
  const ambientLight = new THREE.AmbientLight(0x444466, 0.5)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0x00ffff, 1, 100)
  pointLight.position.set(10, 10, 10)
  pointLight.castShadow = true
  scene.add(pointLight)

  const hemiLight = new THREE.HemisphereLight(0x4488ff, 0x221133, 0.6)
  scene.add(hemiLight)

  animate3D()
}

// 创建粒子系统
const createParticles = () => {
  const particleCount = 8000
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
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  particleSystem = new THREE.Points(geometry, material)
  scene.add(particleSystem)
}

// 创建地球
const createEarth = () => {
  const geometry = new THREE.SphereGeometry(15, 64, 64)
  const material = new THREE.MeshPhongMaterial({
    color: 0x1a5fb4,
    specular: 0x111111,
    shininess: 50,
    transparent: true,
    opacity: 0.9
  })
  
  earthMesh = new THREE.Mesh(geometry, material)
  earthMesh.position.y = -10
  earthMesh.castShadow = true
  earthMesh.receiveShadow = true
  scene.add(earthMesh)

  // 地球旋转动画
  gsap.to(earthMesh.rotation, {
    y: Math.PI * 2,
    duration: 60,
    repeat: -1,
    ease: 'none'
  })
}

// 创建环面纽结
const createTorusKnot = () => {
  const geometry = new THREE.TorusKnotGeometry(8, 2, 100, 16)
  const material = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
    emissive: 0x004444,
    shininess: 100
  })
  torusKnot = new THREE.Mesh(geometry, material)
  torusKnot.position.y = 10
  scene.add(torusKnot)
}

// 创建星空
const createStars = () => {
  const starCount = 10000
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(starCount * 3)
  const colors = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 1000
    positions[i + 1] = (Math.random() - 0.5) * 1000
    positions[i + 2] = (Math.random() - 0.5) * 1000

    // 随机星色
    const color = new THREE.Color()
    color.setHSL(Math.random() * 0.2 + 0.5, 0.5, Math.random() * 0.5 + 0.3)
    colors[i] = color.r
    colors[i + 1] = color.g
    colors[i + 2] = color.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  })

  stars = new THREE.Points(geometry, material)
  scene.add(stars)
}

// 初始化 2D 粒子背景
const init2DParticles = () => {
  if (!particleCanvas.value) return

  particleCanvas.value.width = window.innerWidth
  particleCanvas.value.height = window.innerHeight
  particleCtx = particleCanvas.value.getContext('2d')!

  // 创建 2D 粒子
  for (let i = 0; i < 300; i++) {
    particles2D.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.4 + 0.1,
      hue: Math.random() * 60 + 180 // 蓝绿色调
    })
  }

  animate2DParticles()
}

// 2D 粒子动画
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
    particleCtx.fillStyle = `hsla(${particle.hue}, 80%, 60%, ${particle.opacity})`
    particleCtx.fill()
  })

  requestAnimationFrame(animate2DParticles)
}

// 3D 动画循环
const animate3D = () => {
  animationId = requestAnimationFrame(animate3D)

  // 更新 3D 粒子
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
  torusKnot.rotation.x += 0.005
  torusKnot.rotation.y += 0.008

  // 旋转星星
  stars.rotation.y += 0.0005

  // 根据 scrollProgress 调整相机
  camera.position.y = scrollProgress.value * 0.5 - 25

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
      const values = ['99.99', '1000', '50', '80']
      return values[index]
    },
    duration: 2,
    stagger: 0.2,
    snap: { innerText: 0.1 },
    ease: 'power2.out'
  })

  // 滚动触发动画 - AI 分析
  gsap.from('.analytics-dashboard', {
    scrollTrigger: {
      trigger: aiAnalyticsSection.value,
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    y: 100,
    opacity: 0,
    duration: 1
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

  // 滚动触发动画 - 安全
  gsap.from('.security-card', {
    scrollTrigger: {
      trigger: securitySection.value,
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1
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
  activeFeature.value = id
  
  // 特性悬停动画
  gsap.to(`.feature-card[data-id="${id}"]`, {
    scale: 1.05,
    y: -10,
    duration: 0.3,
    ease: 'power2.out'
  })
}

// 特性离开效果
const onFeatureLeave = (id: number) => {
  activeFeature.value = null
  
  // 特性离开动画
  gsap.to(`.feature-card[data-id="${id}"]`, {
    scale: 1,
    y: 0,
    duration: 0.3,
    ease: 'power2.out'
  })
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
  const sections = ['hero', 'aiAnalytics', 'features', 'solutions', 'tech', 'security', 'cta']
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
  if (!camera || !renderer) return

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)

  if (particleCanvas.value) {
    particleCanvas.value.width = window.innerWidth
    particleCanvas.value.height = window.innerHeight
  }
}

// 模拟数据流更新
const updateDataStream = () => {
  const types = ['INFO', 'SUCCESS', 'WARNING', 'DATA', 'ERROR', 'SECURE']
  const messages = [
    'Syncing data...',
    'User interaction',
    'Processing request',
    'Cache updated',
    'Optimizing...',
    'Connection active',
    'Data synced',
    'AI analysis complete',
    'Security check passed',
    'Performance monitoring'
  ]

  const newLine = {
    time: new Date().toLocaleTimeString(),
    type: types[Math.floor(Math.random() * types.length)],
    value: messages[Math.floor(Math.random() * messages.length)]
  }

  dataStreamLines.value.push(newLine)
  if (dataStreamLines.value.length > 8) {
    dataStreamLines.value.shift()
  }
}

// 组件挂载
onMounted(() => {
  init3DScene()
  init2DParticles()
  initAnimations()

  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)

  // 定时更新数据流
  setInterval(updateDataStream, 2000)

  // 定时更新访客数
  setInterval(() => {
    visitorCount.value += Math.floor(Math.random() * 5)
  }, 3000)

  // 定时更新 FPS
  setInterval(() => {
    fps.value = Math.floor(Math.random() * 10) + 55
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
.ultimate-enterprise-portal {
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

.particle-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  opacity: 0.6;
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
  background: rgba(0, 5, 20, 0.85);
  backdrop-filter: blur(25px);
  border-bottom: 1px solid rgba(0, 255, 255, 0.15);
  z-index: 100;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 20px;

  .logo-3d-container {
    position: relative;
    width: 60px;
    height: 60px;

    .logo-core {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #00ffff, #ff00ff);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
      animation: pulse 2s infinite alternate;
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
        border: 1px solid rgba(0, 255, 255, 0.3);
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
        width: 4px;
        height: 4px;
        background: #00eeff;
        border-radius: 50%;
        transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-30px);
        box-shadow: 0 0 10px #00eeff;
        animation: satelliteOrbit 8s linear infinite;
      }
    }
  }

  .logo-text {
    display: flex;
    flex-direction: column;

    .brand-name {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 2px;
      background: linear-gradient(90deg, #00ffff, #ff00ff, #ffff00);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    }

    .brand-tagline {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
      letter-spacing: 1px;
    }
  }
}

.main-nav {
  display: flex;
  gap: 35px;

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
      
      .nav-indicator {
        width: 100%;
      }
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
  gap: 12px;
  z-index: 90;

  .status-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    background: rgba(0, 20, 40, 0.7);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(0, 255, 255, 0.15);
    border-radius: 10px;

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

      &.uptime {
        color: #00ffaa;
        text-shadow: 0 0 10px #00ffaacc;
      }
    }
  }
}

// 数据流面板
.data-stream-panel {
  position: fixed;
  top: 280px;
  right: 40px;
  width: 300px;
  background: rgba(0, 10, 20, 0.75);
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
      gap: 8px;
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
          color: #8888ff;
          background: rgba(136, 136, 255, 0.1);
        }

        &.ERROR {
          color: #ff4444;
          background: rgba(255, 68, 68, 0.1);
        }

        &.SECURE {
          color: #44ff88;
          background: rgba(68, 255, 136, 0.1);
        }
      }

      .line-value {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

// 全球业务可视化
.globe-panel {
  position: fixed;
  top: 100px;
  right: 40px;
  width: 280px;
  background: rgba(0, 10, 20, 0.75);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 255, 255, 0.15);
  border-radius: 12px;
  padding: 15px;
  z-index: 85;

  .globe-header {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .globe-visualization {
    position: relative;
    width: 100%;
    height: 150px;

    .globe-core {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 30px;
      height: 30px;
      background: radial-gradient(circle, #00ffff, #0088ff);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
    }

    .globe-rings {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      .globe-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        border: 1px solid rgba(0, 255, 255, 0.2);
        border-radius: 50%;
        transform: translate(-50%, -50%) rotateX(75deg);
        animation: orbitRotate 30s linear infinite;
        animation-delay: var(--delay);
      }
    }

    .globe-points {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      .globe-point {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #00ff88;
        border-radius: 50%;
        box-shadow: 0 0 10px #00ff88;
        transform: translate(-50%, -50%);

        .point-pulse {
          position: absolute;
          top: -10px;
          left: -10px;
          width: 24px;
          height: 24px;
          border: 1px solid #00ff88;
          border-radius: 50%;
          animation: pointPulse 2s infinite;
        }
      }
    }
  }
}

// 主要内容区域
.main-content {
  position: relative;
  z-index: 5;
  padding-top: 150px;
}

// Hero 区域
.hero-section {
  padding: 100px 40px;
  min-height: 100vh;
  display: flex;
  align-items: center;

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;

    .hero-badge {
      display: inline-block;
      position: relative;
      padding: 8px 20px;
      background: rgba(0, 200, 255, 0.1);
      border: 1px solid rgba(0, 200, 255, 0.3);
      border-radius: 20px;
      font-size: 12px;
      color: #00c8ff;
      margin-bottom: 30px;

      .badge-pulse {
        position: absolute;
        top: 50%;
        left: 10px;
        width: 6px;
        height: 6px;
        background: #00ff88;
        border-radius: 50%;
        transform: translateY(-50%);
        animation: badgePulse 1.5s infinite;
      }
    }

    .hero-title {
      font-size: 4rem;
      font-weight: 800;
      line-height: 1.1;
      margin: 0 0 20px 0;
      background: linear-gradient(90deg, #ffffff, #00ffff, #ff00ff, #ffff00);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 30px rgba(0, 255, 255, 0.3);

      .title-line {
        display: block;

        &.accent {
          font-size: 3.5rem;
        }
      }
    }

    .hero-subtitle {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.8);
      margin: 0 0 40px 0;
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 60px;

      .hero-btn {
        position: relative;
        padding: 16px 32px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        overflow: hidden;

        &.primary {
          background: linear-gradient(135deg, #00ffff, #0088ff);
          color: #000;

          .btn-shine {
            position: absolute;
            top: -50%;
            left: -60%;
            width: 20px;
            height: 200%;
            background: rgba(255, 255, 255, 0.6);
            transform: rotate(25deg);
            transition: all 0.8s;
          }

          &:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(0, 255, 255, 0.4);

            .btn-shine {
              left: 120%;
            }
          }
        }

        &.secondary {
          background: transparent;
          color: #00ffff;
          border: 1px solid rgba(0, 255, 255, 0.3);

          &:hover {
            background: rgba(0, 255, 255, 0.1);
            transform: translateY(-3px);
          }
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;

      .stat-card {
        padding: 20px 10px;
        background: rgba(0, 20, 40, 0.5);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 255, 255, 0.1);
        border-radius: 10px;
        text-align: center;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 255, 255, 0.3);
          box-shadow: 0 10px 20px rgba(0, 255, 255, 0.1);
        }

        .stat-icon {
          font-size: 24px;
          margin-bottom: 10px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #00ffff;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }
}

// AI 分析区域
.ai-analytics-section {
  padding: 100px 40px;
  min-height: 80vh;
  background: rgba(0, 10, 20, 0.3);

  .section-header {
    text-align: center;
    margin-bottom: 60px;

    .section-tag {
      display: inline-block;
      padding: 6px 15px;
      background: rgba(0, 200, 255, 0.1);
      border: 1px solid rgba(0, 200, 255, 0.3);
      border-radius: 20px;
      font-size: 12px;
      color: #00c8ff;
      margin-bottom: 15px;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 15px 0;
      background: linear-gradient(90deg, #ffffff, #00ffff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .section-desc {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.7);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
  }

  .analytics-dashboard {
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;

      .dashboard-card {
        background: rgba(0, 20, 40, 0.5);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 255, 255, 0.1);
        border-radius: 15px;
        padding: 25px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 255, 255, 0.3);
          box-shadow: 0 10px 30px rgba(0, 255, 255, 0.1);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;

          .card-icon {
            font-size: 20px;
          }

          .card-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #00ffff;
          }
        }

        .card-content {
          .data-chart {
            display: flex;
            align-items: flex-end;
            gap: 4px;
            height: 100px;

            .chart-bar {
              flex: 1;
              background: linear-gradient(to top, #00ffff, #ff00ff);
              border-radius: 3px 3px 0 0;
              min-width: 8px;
              transition: height 0.5s ease;
            }
          }

          .prediction-indicators {
            .prediction-item {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid rgba(0, 255, 255, 0.1);

              &:last-child {
                border-bottom: none;
              }

              .prediction-label {
                color: rgba(255, 255, 255, 0.7);
              }

              .prediction-value {
                font-weight: bold;
                color: #00ff88;
              }
            }
          }

          .insight-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .insight-tag {
              padding: 5px 12px;
              background: rgba(0, 200, 255, 0.1);
              border: 1px solid rgba(0, 200, 255, 0.2);
              border-radius: 20px;
              font-size: 0.8rem;
              color: #00c8ff;
            }
          }
        }
      }
    }
  }
}

// 特性展示区域
.features-section {
  padding: 100px 40px;
  min-height: 100vh;

  .section-header {
    text-align: center;
    margin-bottom: 60px;

    .section-tag {
      display: inline-block;
      padding: 6px 15px;
      background: rgba(0, 200, 255, 0.1);
      border: 1px solid rgba(0, 200, 255, 0.3);
      border-radius: 20px;
      font-size: 12px;
      color: #00c8ff;
      margin-bottom: 15px;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 15px 0;
      background: linear-gradient(90deg, #ffffff, #00ffff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .section-desc {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.7);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;

    .feature-card {
      position: relative;
      padding: 30px;
      background: rgba(0, 20, 40, 0.5);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 255, 255, 0.1);
      border-radius: 15px;
      transition: all 0.3s ease;
      overflow: hidden;

      .feature-icon {
        font-size: 36px;
        margin-bottom: 20px;
      }

      .feature-title {
        font-size: 1.5