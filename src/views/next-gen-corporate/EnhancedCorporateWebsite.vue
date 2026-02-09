<template>
  <div class="enhanced-corporate">
    <!-- 3D场景画布 -->
    <div ref="canvasContainer" class="threejs-canvas"></div>

    <!-- 动态背景粒子 -->
    <canvas ref="particleCanvas" class="particle-background"></canvas>

    <!-- 全息扫描线效果 -->
    <div class="scan-lines">
      <div v-for="i in 20" :key="i" class="scan-line"></div>
    </div>

    <!-- 数字雨背景 -->
    <div class="matrix-rain">
      <div
        v-for="i in 30"
        :key="i"
        class="rain-column"
        :style="{ left: i * 3.33 + '%', animationDelay: i * 0.2 + 's' }"
      >
        <span v-for="j in 20" :key="j" class="matrix-char">{{ getRandomChar() }}</span>
      </div>
    </div>

    <!-- 滚动容器 -->
    <div ref="scrollContainer" class="scroll-container" @scroll="handleScroll">
      <!-- 首页英雄区域 -->
      <section ref="heroSection" class="hero-section">
        <div class="hero-content">
          <div class="hero-glow"></div>
          <div class="hero-neon-border"></div>

          <h1 class="hero-title">
            <span
              v-for="(line, index) in heroTitle"
              :key="index"
              :ref="el => (titleLines[index] = el)"
              class="title-line"
            >
              {{ line }}
            </span>
          </h1>

          <div class="typing-subtitle">
            <span class="cursor" :class="{ blink: typingComplete }">|</span>
            <span class="typed-text">{{ typedSubtitle }}</span>
          </div>

          <div class="hero-buttons">
            <button
              class="cta-button primary"
              @click="scrollToNext"
              @mouseenter="buttonHover($event, true)"
              @mouseleave="buttonHover($event, false)"
            >
              <span class="button-text">🚀 探索未来</span>
              <div class="button-glow"></div>
              <div class="button-ripple"></div>
            </button>
            <button
              class="cta-button secondary"
              @click="scrollToContact"
              @mouseenter="buttonHover($event, true)"
              @mouseleave="buttonHover($event, false)"
            >
              <span class="button-text">💬 联系我们</span>
              <div class="button-pulse"></div>
            </button>
          </div>

          <!-- 数据统计 -->
          <div class="hero-stats">
            <div v-for="(stat, index) in stats" :key="index" class="stat-item">
              <div :ref="el => (statNumbers[index] = el)" class="stat-number">0</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- 3D Logo展示 -->
        <div class="hero-logo">
          <div ref="logo3D" class="logo-3d-container">
            <div class="logo-core"></div>
            <div class="logo-orbits">
              <div v-for="i in 3" :key="i" class="orbit" :style="{ '--delay': i + 's' }"></div>
            </div>
            <div class="logo-energy-beams">
              <div
                v-for="i in 8"
                :key="i"
                class="beam"
                :style="{ '--rotation': i * 45 + 'deg' }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 特效动画模块 -->
      <section ref="effectsSection" class="effects-section">
        <div class="section-header">
          <h2 class="section-title glitch-text" data-text="创新技术展示">创新技术展示</h2>
          <div class="header-underline"></div>
          <p class="section-description">下一代数字体验技术</p>
        </div>

        <div class="effects-grid">
          <div
            v-for="(effect, index) in effects"
            :key="index"
            class="effect-card"
            :class="{ active: activeEffect === index }"
            @mouseenter="activateEffect(index)"
            @mouseleave="deactivateEffect()"
          >
            <div class="card-glow"></div>
            <div class="card-border"></div>
            <div class="effect-icon">{{ effect.icon }}</div>
            <h3 class="effect-title">{{ effect.title }}</h3>
            <p class="effect-description">{{ effect.description }}</p>
            <div class="tech-stack">
              <span v-for="tech in effect.tech" :key="tech" class="tech-tag">
                {{ tech }}
              </span>
            </div>
            <div class="card-particles">
              <div v-for="i in 5" :key="i" class="particle"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ECharts数据可视化模块 -->
      <section ref="chartsSection" class="charts-section">
        <div class="section-header">
          <h2 class="section-title">📊 数据洞察</h2>
          <div class="header-underline purple"></div>
          <p class="section-description">实时业务数据分析</p>
        </div>

        <div class="charts-grid">
          <div ref="chart1" class="chart-container">
            <div class="chart-glow"></div>
            <div class="chart-label">业务增长趋势</div>
          </div>
          <div ref="chart2" class="chart-container">
            <div class="chart-glow"></div>
            <div class="chart-label">技术栈分布</div>
          </div>
          <div ref="chart3" class="chart-container">
            <div class="chart-glow"></div>
            <div class="chart-label">用户活跃度</div>
          </div>
          <div ref="chart4" class="chart-container">
            <div class="chart-glow"></div>
            <div class="chart-label">市场占有率</div>
          </div>
        </div>
      </section>

      <!-- 联系我们模块 -->
      <section ref="contactSection" class="contact-section">
        <div class="section-header">
          <h2 class="section-title">🌐 开启合作</h2>
          <div class="header-underline violet"></div>
          <p class="section-description">让我们共同创造未来</p>
        </div>

        <div class="contact-content">
          <div class="contact-form">
            <form @submit.prevent="submitForm">
              <div class="form-group">
                <input v-model="contactForm.name" type="text" placeholder=" " class="form-input" />
                <label class="form-label">您的姓名</label>
                <div class="input-underline"></div>
              </div>
              <div class="form-group">
                <input
                  v-model="contactForm.email"
                  type="email"
                  placeholder=" "
                  class="form-input"
                />
                <label class="form-label">邮箱地址</label>
                <div class="input-underline"></div>
              </div>
              <div class="form-group">
                <textarea
                  v-model="contactForm.message"
                  placeholder=" "
                  class="form-textarea"
                ></textarea>
                <label class="form-label">项目需求</label>
                <div class="input-underline"></div>
              </div>
              <button type="submit" class="submit-button" @click="buttonClick($event)">
                <span class="button-text">🚀 发送消息</span>
                <div class="button-explosion"></div>
              </button>
            </form>
          </div>

          <div class="contact-info">
            <div v-for="(info, index) in contactInfo" :key="index" class="info-item">
              <div class="info-icon">{{ info.icon }}</div>
              <div class="info-content">
                <h4>{{ info.title }}</h4>
                <p>{{ info.content }}</p>
              </div>
              <div class="info-glow"></div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 滚动进度指示器 -->
    <div class="scroll-progress">
      <div class="progress-bar" :style="{ height: scrollProgress + '%' }">
        <div class="progress-glow"></div>
      </div>
      <div
        v-for="i in 4"
        :key="i"
        class="progress-marker"
        :class="{ active: currentSection >= i - 1 }"
      ></div>
    </div>

    <!-- 侧边导航 -->
    <div class="side-navigation">
      <div
        v-for="(nav, index) in navigation"
        :key="index"
        class="nav-dot"
        :class="{ active: currentSection === index }"
        @click="scrollToSection(index)"
        @mouseenter="navHover($event, true)"
        @mouseleave="navHover($event, false)"
      >
        <div class="dot-glow"></div>
        <div class="dot-pulse"></div>
        <span class="nav-tooltip">{{ nav }}</span>
      </div>
    </div>

    <!-- 性能监控 -->
    <div v-if="showPerfMonitor" class="performance-monitor">
      <div class="perf-header">SYSTEM STATUS</div>
      <div class="perf-item">
        <span class="perf-label">FPS:</span>
        <span class="perf-value">{{ fps }}</span>
        <div class="perf-bar" :style="{ width: (fps / 60) * 100 + '%' }"></div>
      </div>
      <div class="perf-item">
        <span class="perf-label">PARTICLES:</span>
        <span class="perf-value">{{ particleCount }}</span>
      </div>
      <div class="perf-item">
        <span class="perf-label">LOAD:</span>
        <span class="perf-value">{{ loadPercentage }}%</span>
      </div>
    </div>

    <!-- 全屏加载动画 -->
    <div v-if="isLoading" class="loading-screen">
      <div class="loading-content">
        <div class="loading-logo">
          <div class="loading-core"></div>
          <div class="loading-orbits">
            <div v-for="i in 3" :key="i" class="loading-orbit"></div>
          </div>
        </div>
        <div class="loading-text">系统初始化中...</div>
        <div class="loading-progress">
          <div class="loading-bar" :style="{ width: loadingProgress + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, nextTick } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'
import * as echarts from 'echarts'

// DOM引用
const canvasContainer = ref<HTMLElement>()
const particleCanvas = ref<HTMLCanvasElement>()
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

// 元素引用数组
const titleLines = ref<HTMLElement[]>([])
const statNumbers = ref<HTMLElement[]>([])

// 响应式数据
const scrollProgress = ref(0)
const currentSection = ref(0)
const activeEffect = ref(-1)
const fps = ref(60)
const particleCount = ref(0)
const loadPercentage = ref(0)
const showPerfMonitor = ref(false)
const isLoading = ref(true)
const loadingProgress = ref(0)
const typingComplete = ref(false)
const typedSubtitle = ref('')

// 内容数据
const heroTitle = ref(['NEXT GEN', 'CORPORATE', 'SOLUTIONS'])
const heroSubtitle = ref('引领数字化转型的下一代企业解决方案')

const stats = reactive([
  { value: 1000, label: '项目完成' },
  { value: 500, label: '满意客户' },
  { value: 50, label: '技术专家' }
])

const effects = reactive([
  {
    icon: '🚀',
    title: 'WebGL 3D渲染',
    description: '基于Three.js的高性能3D图形渲染技术，实现震撼视觉效果',
    tech: ['Three.js', 'WebGL2', 'Shader']
  },
  {
    icon: '🎨',
    title: 'GSAP动画引擎',
    description: '专业级动画库，打造电影级流畅交互体验',
    tech: ['GSAP', 'Animation', 'Timeline']
  },
  {
    icon: '📊',
    title: '数据可视化',
    description: 'ECharts驱动的实时数据展示，让数据说话',
    tech: ['ECharts', 'D3.js', 'Canvas']
  },
  {
    icon: '⚡',
    title: '性能优化',
    description: '极致的加载速度和运行效率，秒开体验',
    tech: ['Web Workers', 'Lazy Loading', 'CDN']
  },
  {
    icon: '📱',
    title: '响应式设计',
    description: '全平台适配的现代化界面，一处开发处处运行',
    tech: ['Vue3', 'SCSS', 'Flexbox']
  },
  {
    icon: '🔒',
    title: '安全保障',
    description: '企业级安全防护体系，数据安全无忧',
    tech: ['HTTPS', 'JWT', 'Encryption']
  }
])

const contactInfo = reactive([
  {
    icon: '📍',
    title: '总部地址',
    content: '上海市浦东新区陆家嘴金融中心'
  },
  {
    icon: '📞',
    title: '联系电话',
    content: '+86 400-888-8888'
  },
  {
    icon: '✉️',
    title: '商务邮箱',
    content: 'business@nextgen.com'
  },
  {
    icon: '🌐',
    title: '官方网站',
    content: 'www.nextgen-corporate.com'
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
let logoGroup: THREE.Group
let particleSystem2D: any[] = []

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
let particleCtx: CanvasRenderingContext2D

// 随机字符生成器
const getRandomChar = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*'
  return chars.charAt(Math.floor(Math.random() * chars.length))
}

// 初始化加载序列
const initLoadingSequence = () => {
  const loadingSteps = [
    { text: '加载3D引擎...', progress: 20 },
    { text: '初始化粒子系统...', progress: 40 },
    { text: '配置动画引擎...', progress: 60 },
    { text: '加载数据图表...', progress: 80 },
    { text: '系统准备就绪', progress: 100 }
  ]

  let stepIndex = 0
  const interval = setInterval(() => {
    if (stepIndex < loadingSteps.length) {
      loadingProgress.value = loadingSteps[stepIndex].progress
      stepIndex++
    } else {
      clearInterval(interval)
      setTimeout(() => {
        isLoading.value = false
        startMainAnimation()
      }, 500)
    }
  }, 800)
}

// 主动画序列
const startMainAnimation = () => {
  // 创建GSAP时间线
  const masterTimeline = gsap.timeline()

  // 1. 标题逐行出现
  titleLines.value.forEach((line, index) => {
    if (line) {
      masterTimeline.from(
        line,
        {
          y: 100,
          opacity: 0,
          scale: 0.8,
          duration: 0.8,
          ease: 'back.out(1.7)',
          delay: index * 0.2
        },
        0
      )
    }
  })

  // 2. 打字机效果副标题
  typeWriterEffect()

  // 3. 按钮动画
  masterTimeline.from(
    '.cta-button',
    {
      y: 50,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    },
    1
  )

  // 4. 数据统计动画
  stats.forEach((stat, index) => {
    setTimeout(
      () => {
        animateNumber(statNumbers.value[index], stat.value, stat.label)
      },
      2000 + index * 300
    )
  })

  // 5. 3D Logo动画
  masterTimeline.from(
    '.logo-core',
    {
      scale: 0,
      rotation: 360,
      duration: 1.5,
      ease: 'elastic.out(1, 0.5)'
    },
    1.5
  )

  masterTimeline.from(
    '.orbit',
    {
      scale: 0,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.7)'
    },
    2
  )

  masterTimeline.from(
    '.beam',
    {
      scaleY: 0,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out'
    },
    2.5
  )
}

// 打字机效果
const typeWriterEffect = () => {
  const text = heroSubtitle.value
  let i = 0

  const type = () => {
    if (i < text.length) {
      typedSubtitle.value += text.charAt(i)
      i++
      setTimeout(type, 50)
    } else {
      typingComplete.value = true
    }
  }

  setTimeout(type, 1500)
}

// 数字动画
const animateNumber = (element: HTMLElement | undefined, target: number, label: string) => {
  if (!element) return

  const obj = { value: 0 }
  gsap.to(obj, {
    value: target,
    duration: 2,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.floor(obj.value).toLocaleString()
    },
    onComplete: () => {
      // 添加后缀动画
      gsap.from(element.parentElement?.querySelector('.stat-label'), {
        y: 20,
        opacity: 0,
        duration: 0.5
      })
    }
  })
}

// 初始化3D场景
const initThreeJSScene = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000011)
  scene.fog = new THREE.Fog(0x000011, 30, 200)

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
  const ambientLight = new THREE.AmbientLight(0x222244, 0.3)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0x4488ff, 1.2)
  directionalLight.position.set(20, 30, 20)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  const rimLight = new THREE.HemisphereLight(0x444488, 0x221133, 0.4)
  scene.add(rimLight)

  // 创建粒子系统
  createParticleSystem()

  // 创建3D Logo
  createLogo3D()

  console.log('✅ 增强版3D场景初始化完成')
}

// 创建增强粒子系统
const createParticleSystem = () => {
  const particleCount = 10000
  const geometry = new THREE.BufferGeometry()

  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3

    // 复杂的球形分布
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = 60 + Math.random() * 140

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = radius * Math.cos(phi)

    // 渐变色彩
    const color = new THREE.Color()
    const hue = (Math.random() * 0.3 + 0.5) % 1
    color.setHSL(hue, 0.9, 0.6)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b

    // 随机大小
    sizes[i] = Math.random() * 3 + 1
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)

  // 修复：使用正确的响应式属性更新方式
  stats[0].value = 1000
  stats[1].value = 500
  stats[2].value = 50
}

// 创建3D Logo
const createLogo3D = () => {
  logoGroup = new THREE.Group()

  // 核心几何体
  const coreGeometry = new THREE.IcosahedronGeometry(6, 3)
  const coreMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    emissive: 0x004444,
    shininess: 100,
    transparent: true,
    opacity: 0.9
  })
  const core = new THREE.Mesh(coreGeometry, coreMaterial)
  logoGroup.add(core)

  // 能量环
  for (let i = 0; i < 3; i++) {
    const ringGeometry = new THREE.TorusGeometry(10 + i * 4, 0.5, 16, 64)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(i / 3, 1, 0.6),
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = Math.PI / 2
    logoGroup.add(ring)
  }

  logoGroup.position.set(25, 0, 0)
  scene.add(logoGroup)
}

// 初始化2D粒子背景
const initParticleBackground = () => {
  if (!particleCanvas.value) return

  particleCanvas.value.width = window.innerWidth
  particleCanvas.value.height = window.innerHeight
  particleCtx = particleCanvas.value.getContext('2d')!

  // 创建2D粒子
  for (let i = 0; i < 200; i++) {
    particleSystem2D.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      hue: Math.random() * 60 + 180
    })
  }

  animate2DParticles()
}

// 2D粒子动画
const animate2DParticles = () => {
  if (!particleCtx) return

  particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  particleSystem2D.forEach(particle => {
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
    loadPercentage.value = Math.min(100, Math.floor((fps.value / 60) * 100))
  }

  // 旋转3D粒子系统
  if (particles) {
    particles.rotation.y += 0.002
    particles.rotation.x += 0.001
  }

  // 旋转Logo组
  if (logoGroup) {
    logoGroup.rotation.x += 0.01
    logoGroup.rotation.y += 0.015
    logoGroup.children.forEach((child, index) => {
      if (index > 0) {
        // 能量环
        child.rotation.z += 0.02 * index
      }
    })
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

  let accumulatedHeight = 0
  for (let i = 0; i < sections.length; i++) {
    accumulatedHeight += sectionHeights[i]
    if (scrollTop < accumulatedHeight - window.innerHeight / 3) {
      if (currentSection.value !== i) {
        currentSection.value = i
        updateCameraPosition(i)
        triggerSectionAnimation(i)
      }
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
    duration: 2,
    ease: 'power2.inOut'
  })
}

// 触发区域动画
const triggerSectionAnimation = (sectionIndex: number) => {
  switch (sectionIndex) {
    case 1: // 特效模块
      gsap.from('.effect-card', {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
      })
      break
    case 2: // 图表模块
      gsap.from('.chart-container', {
        scale: 0.5,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'back.out(1.7)'
      })
      break
    case 3: // 联系模块
      gsap.from('.contact-form, .info-item', {
        x: -100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out'
      })
      break
  }
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
  scrollToSection(Math.min(currentSection.value + 1, 3))
}

const scrollToContact = () => {
  scrollToSection(3)
}

// 特效卡片交互
const activateEffect = (index: number) => {
  activeEffect.value = index

  // 卡片激活动画
  const card = document.querySelector(`.effect-card:nth-child(${index + 1})`)
  if (card) {
    gsap.to(card, {
      scale: 1.08,
      y: -15,
      duration: 0.4,
      ease: 'back.out(1.7)'
    })

    // 粒子效果
    gsap.from(card.querySelectorAll('.particle'), {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      stagger: 0.05
    })
  }
}

const deactivateEffect = () => {
  activeEffect.value = -1

  // 重置所有卡片
  gsap.to('.effect-card', {
    scale: 1,
    y: 0,
    duration: 0.3,
    ease: 'power2.out'
  })
}

// 按钮悬停效果
const buttonHover = (event: any, isEnter: boolean) => {
  const button = event.currentTarget
  if (isEnter) {
    gsap.to(button, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out'
    })
  } else {
    gsap.to(button, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    })
  }
}

// 按钮点击效果
const buttonClick = (event: any) => {
  const button = event.currentTarget
  gsap.to(button, {
    scale: 0.95,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: 'power1.inOut'
  })
}

// 导航悬停效果
const navHover = (event: any, isEnter: boolean) => {
  const dot = event.currentTarget
  if (isEnter) {
    gsap.to(dot, {
      scale: 1.5,
      duration: 0.3
    })
  } else {
    gsap.to(dot, {
      scale: 1,
      duration: 0.3
    })
  }
}

// 初始化ECharts图表
const initCharts = () => {
  // 图表1: 业务增长趋势
  if (chart1.value) {
    const chart = echarts.init(chart1.value)
    chart.setOption({
      backgroundColor: 'transparent',
      title: {
        text: '业务增长趋势',
        textStyle: {
          color: '#00ffff',
          fontSize: 16,
          fontWeight: 'bold'
        },
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 20, 40, 0.8)',
        borderColor: '#00ffff',
        textStyle: { color: '#fff' }
      },
      xAxis: {
        type: 'category',
        data: ['Q1', 'Q2', 'Q3', 'Q4'],
        axisLine: { lineStyle: { color: '#00ffff' } },
        axisLabel: { color: '#00ffff' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#00ffff' } },
        axisLabel: { color: '#00ffff' },
        splitLine: { lineStyle: { color: 'rgba(0, 255, 255, 0.2)' } }
      },
      series: [
        {
          data: [120, 200, 150, 300],
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#00ffff',
            width: 3
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 255, 255, 0.3)' },
                { offset: 1, color: 'rgba(0, 255, 255, 0)' }
              ]
            }
          },
          symbol: 'circle',
          symbolSize: 8
        }
      ]
    })
  }

  // 图表2: 技术栈分布
  if (chart2.value) {
    const chart = echarts.init(chart2.value)
    chart.setOption({
      backgroundColor: 'transparent',
      title: {
        text: '技术栈占比',
        textStyle: {
          color: '#ff0080',
          fontSize: 16,
          fontWeight: 'bold'
        },
        left: 'center'
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '60%'],
          data: [
            { value: 35, name: '前端技术' },
            { value: 25, name: '后端技术' },
            { value: 20, name: '数据库' },
            { value: 15, name: '运维工具' },
            { value: 5, name: '其他' }
          ],
          label: {
            color: '#fff',
            formatter: '{b}\n{d}%'
          },
          labelLine: {
            lineStyle: { color: 'rgba(255, 255, 255, 0.5)' }
          },
          itemStyle: {
            borderRadius: 5,
            borderColor: '#0a0a1a',
            borderWidth: 2
          }
        }
      ]
    })
  }
}

// 表单提交
const submitForm = () => {
  console.log('表单提交:', contactForm)

  // 成功动画
  gsap.to('.submit-button', {
    backgroundColor: '#00ff88',
    scale: 1.1,
    duration: 0.3,
    yoyo: true,
    repeat: 1,
    onComplete: () => {
      // 重置表单
      contactForm.name = ''
      contactForm.email = ''
      contactForm.message = ''
    }
  })

  // 爆炸效果
  gsap.to('.button-explosion', {
    scale: 3,
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out'
  })
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

// 组件挂载
onMounted(() => {
  initLoadingSequence()
  initThreeJSScene()
  initParticleBackground()
  animate()
  initCharts()

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
@import './EnhancedStyles.scss';
</style>
