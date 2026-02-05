<template>
  <div class="home-page">
    <div ref="canvasContainer" class="canvas-container"></div>

    <!-- 固定头部 - 不滚动 -->
    <header class="hud-header">
      <div class="hud-logo">
        <div class="logo-icon">
          <div class="logo-ring"></div>
          <div class="logo-dot"></div>
        </div>
        <span class="logo-text">NEXUS</span>
      </div>
      <nav class="hud-nav">
        <a href="#" class="nav-link active">首页</a>
        <a href="#" class="nav-link">产品</a>
        <a href="#" class="nav-link">技术</a>
        <a href="#" class="nav-link">关于</a>
      </nav>
      <div class="hud-status">
        <div class="status-dot online"></div>
        <span>在线</span>
      </div>
    </header>

    <!-- 滚动容器 -->
    <div ref="scrollContainer" class="scroll-container">
      <!-- 模块1: 首页 -->
      <section ref="sectionHome" class="scroll-section section-home">
        <!-- 主内容区 -->
        <main class="content-overlay">
          <div class="content-inner">
            <div class="eyebrow">
              <span class="eyebrow-line"></span>
              <span data-text="下一代数字体验">下一代数字体验</span>
              <span class="eyebrow-line"></span>
            </div>

            <h1 class="main-title">
              <span class="title-line" data-text="塑造未来">塑造未来</span>
              <span class="title-line" data-text="数字宇宙">数字宇宙</span>
            </h1>

            <p class="subtitle">
              <span data-text="基于 WebGL 与 Three.js 构建的沉浸式 3D 体验平台">
                基于 WebGL 与 Three.js 构建的沉浸式 3D 体验平台
              </span>
              <br />
              <span data-text="重新定义互联网交互范式">重新定义互联网交互范式</span>
            </p>

            <div class="cta-buttons">
              <button
                  class="btn btn-primary ua-v2-animated ua-v2-hologram"
                  @click="startExploration"
              >
                <span class="btn-text" data-text="进入探索模式">进入探索模式</span>
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                      d="M19 9l-7 7-7-7"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <!-- 数据统计 -->
            <div class="stats-grid">
              <div class="stat-item ua-v4-animated ua-v4-floatIn" style="animation-delay: 0.1s">
                <div ref="stat1" class="stat-value" data-value="0">0</div>
                <div class="stat-label" data-label="用户数量">用户数量</div>
              </div>
              <div class="stat-item ua-v4-animated ua-v4-floatIn" style="animation-delay: 0.2s">
                <div ref="stat2" class="stat-value" data-value="0">0</div>
                <div class="stat-label" data-label="3D 场景">3D 场景</div>
              </div>
              <div class="stat-item ua-v4-animated ua-v4-floatIn" style="animation-delay: 0.3s">
                <div ref="stat3" class="stat-value" data-value="0">0</div>
                <div class="stat-label" data-label="交互次数">交互次数</div>
              </div>
            </div>
          </div>
        </main>
      </section>

      <!-- 模块2: 动画特效展示 -->
      <section ref="sectionFeatures" class="scroll-section section-features">
        <div class="section-content">
          <div class="section-header">
            <h2 class="section-title ua-v3-animated ua-v3-wormhole">动画特效</h2>
            <p class="section-subtitle">105+ 精心设计的动画效果</p>
          </div>

          <div class="features-grid">
            <div class="feature-card ua-v2-animated ua-v2-hologram">
              <div class="feature-icon">🌀</div>
              <h3>V2 超级动画</h3>
              <p>全息投影、涡旋进入、星云爆炸</p>
              <div class="feature-demo">
                <button class="demo-btn" @click="triggerDemo('hologram')">试一试</button>
              </div>
            </div>

            <div class="feature-card ua-v3-animated ua-v3-wormhole">
              <div class="feature-icon">🌌</div>
              <h3>V3 超现实</h3>
              <p>虫洞穿越、量子纠缠、神经网络</p>
              <div class="feature-demo">
                <button class="demo-btn" @click="triggerDemo('wormhole')">试一试</button>
              </div>
            </div>

            <div class="feature-card ua-v4-animated ua-v4-floatIn">
              <div class="feature-icon">🎨</div>
              <h3>V4 创意互动</h3>
              <p>磁吸进入、浮动效果、弹性弹出</p>
              <div class="feature-demo">
                <button class="demo-btn" @click="triggerDemo('floatIn')">试一试</button>
              </div>
            </div>

            <div class="feature-card ua-v5-animated ua-v5-extremeVortex">
              <div class="feature-icon">💥</div>
              <h3>V5 极限突破</h3>
              <p>极限涡流、维度穿越、粒子重组</p>
              <div class="feature-demo">
                <button class="demo-btn" @click="triggerDemo('vortex')">试一试</button>
              </div>
            </div>

            <div class="feature-card ua-v6-animated ua-v6-singularityExplosion">
              <div class="feature-icon">✨</div>
              <h3>V6 传奇动画</h3>
              <p>光影穿梭、空间折叠、奇点爆炸</p>
              <div class="feature-demo">
                <button class="demo-btn" @click="triggerDemo('singularity')">试一试</button>
              </div>
            </div>

            <div class="feature-card ua-v7-liquidIn">
              <div class="feature-icon">💧</div>
              <h3>V7 终极动画</h3>
              <p>液态流动、晶体生长、分形展开</p>
              <div class="feature-demo">
                <button class="demo-btn" @click="triggerDemo('liquid')">试一试</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 模块3: ECharts 数据可视化 -->
      <section ref="sectionCharts" class="scroll-section section-charts">
        <div class="section-content">
          <div class="section-header">
            <h2 class="section-title ua-v6-animated ua-v6-lightShadow">数据洞察</h2>
            <p class="section-subtitle">实时数据监控与分析</p>
          </div>

          <div class="charts-grid">
            <div class="chart-card">
              <div class="chart-header">
                <h3>用户增长趋势</h3>
                <div class="chart-badge">实时</div>
              </div>
              <div ref="chart1" class="chart-container"></div>
            </div>

            <div class="chart-card">
              <div class="chart-header">
                <h3>活跃度分布</h3>
                <div class="chart-badge">7天</div>
              </div>
              <div ref="chart2" class="chart-container"></div>
            </div>

            <div class="chart-card chart-large">
              <div class="chart-header">
                <h3>系统性能监控</h3>
                <div class="chart-badge">CPU/内存</div>
              </div>
              <div ref="chart3" class="chart-container"></div>
            </div>

            <div class="chart-card">
              <div class="chart-header">
                <h3>访问来源</h3>
                <div class="chart-badge">TOP 5</div>
              </div>
              <div ref="chart4" class="chart-container"></div>
            </div>

            <div class="chart-card">
              <div class="chart-header">
                <h3>功能使用率</h3>
                <div class="chart-badge">本月</div>
              </div>
              <div ref="chart5" class="chart-container"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 模块4: 页脚 -->
      <section ref="sectionFooter" class="scroll-section section-footer">
        <footer class="footer-content">
          <div class="footer-logo">NEXUS</div>
          <p class="footer-text">下一代数字体验平台</p>
          <div class="footer-links">
            <a href="#">关于我们</a>
            <a href="#">联系我们</a>
            <a href="#">隐私政策</a>
            <a href="#">服务条款</a>
          </div>
          <p class="footer-copyright">© 2026 NEXUS. All rights reserved.</p>
        </footer>
      </section>
    </div>

    <!-- HUD 面板 - 始终显示 -->
    <!-- 探索模式 UI -->
    <div class="exploration-ui" :class="{ 'fade-in': isExploring }">
      <div class="hud-bottom">
        <div class="coordinates-panel ua-v5-animated ua-v5-extremeVortex">
          <div class="coord-row">
            <span class="coord-label">X</span>
            <span class="coord-value">{{ cameraPosition.x.toFixed(2) }}</span>
            <div class="coord-bar" :style="{ width: Math.abs(cameraPosition.x / 2) + '%' }"></div>
          </div>
          <div class="coord-row">
            <span class="coord-label">Y</span>
            <span class="coord-value">{{ cameraPosition.y.toFixed(2) }}</span>
            <div class="coord-bar" :style="{ width: Math.abs(cameraPosition.y / 2) + '%' }"></div>
          </div>
          <div class="coord-row">
            <span class="coord-label">Z</span>
            <span class="coord-value">{{ cameraPosition.z.toFixed(2) }}</span>
            <div class="coord-bar" :style="{ width: Math.abs(cameraPosition.z / 2) + '%' }"></div>
          </div>
        </div>

        <button
            v-if="isExploring"
            class="btn-exit ua-v6-animated ua-v6-singularityExplosion"
            @click="backToHome"
        >
          <svg class="exit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
          </svg>
          <span>返回首页</span>
        </button>
      </div>
    </div>

    <!-- 滚动提示 -->
    <div class="scroll-indicator" :class="{ 'fade-out': isExploring }">
      <div class="scroll-mouse">
        <div class="scroll-wheel"></div>
      </div>
      <span>向下滚动探索</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 注册 GSAP ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger)

const canvasContainer = ref<HTMLElement>()
const scrollContainer = ref<HTMLElement>()

// 滚动相关
const currentSection = ref(0)
const scrollProgress = ref(0)
const sections = ['首页', '动画特效', '数据洞察', '页脚']

// 滚动区域 refs
const sectionHome = ref<HTMLElement>()
const sectionFeatures = ref<HTMLElement>()
const sectionCharts = ref<HTMLElement>()
const sectionFooter = ref<HTMLElement>()

// 图表 refs
const chart1 = ref<HTMLElement>()
const chart2 = ref<HTMLElement>()
const chart3 = ref<HTMLElement>()
const chart4 = ref<HTMLElement>()
const chart5 = ref<HTMLElement>()

const isExploring = ref(false)
const cameraPosition = ref({ x: 0, y: 0, z: 50 })
const fps = ref(60)
const objectCount = ref(0)

// 统计数字动画 refs
const stat1 = ref<HTMLElement>()
const stat2 = ref<HTMLElement>()
const stat3 = ref<HTMLElement>()

// Three.js 核心变量
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let particles: THREE.Points
let sphere: THREE.Mesh
let torus: THREE.Mesh
let clock: THREE.Clock
let mouseX = 0
let mouseY = 0
let targetX = 0
let targetY = 0

// 轨道控制相关
let isDragging = false
let previousMousePosition = { x: 0, y: 0 }
let orbitAngle = 0
let orbitRadius = 60
let orbitHeight = 0
let targetOrbitRadius = 60
let targetOrbitHeight = 0

// 优化：使用 InstancedMesh 替代普通 Mesh
let floatingCubes: THREE.InstancedMesh | null = null
let energyRings: THREE.InstancedMesh | null = null
let nebulaClouds: THREE.Points[] = []
let helixLines: THREE.Line[] = []

// 实例化相关数据
const FLOATING_CUBE_COUNT = 50
const ENERGY_RING_COUNT = 5
let cubeDummy = new THREE.Object3D()
let ringDummy = new THREE.Object3D()

// FPS 计算
let frameCount = 0
let lastFpsTime = 0

// 性能优化：节流
let updateCount = 0
const UPDATE_INTERVAL = 2

// 数字动画函数 - 使用 GSAP
const animateNumber = (element: HTMLElement | undefined, target: number, suffix: string = '') => {
  if (!element) return

  const obj = { value: 0 }
  gsap.to(obj, {
    value: target,
    duration: 2.5,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.floor(obj.value).toLocaleString() + suffix
    }
  })
}

// 入场动画 - 使用 GSAP Timeline
const initEntranceAnimations = () => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // 头部动画
  tl.from('.hud-header', {
    y: -100,
    opacity: 0,
    duration: 1,
    delay: 0.5
  })

  // 眉毛动画
  tl.from(
      '.eyebrow',
      {
        y: 30,
        opacity: 0,
        duration: 0.8
      },
      '-=0.5'
  )

  // 标题逐行动画
  tl.from(
      '.title-line',
      {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2
      },
      '-=0.4'
  )

  // 副标题动画
  tl.from(
      '.subtitle',
      {
        y: 30,
        opacity: 0,
        duration: 0.8
      },
      '-=0.4'
  )

  // 按钮动画
  tl.from(
      '.btn',
      {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15
      },
      '-=0.4'
  )

  // 统计数据动画
  tl.from(
      '.stat-item',
      {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15
      },
      '-=0.4'
  )
}

// 初始化 GSAP 滚动触发器
const initScrollAnimations = () => {
  // 确保 DOM 元素已经挂载
  const featuresElement = sectionFeatures.value
  const chartsElement = sectionCharts.value
  const footerElement = sectionFooter.value

  if (!featuresElement || !chartsElement || !footerElement) {
    console.warn('Scroll sections not ready yet')
    return
  }

  // 首页内容淡出动画 - 当滚动离开首页时
  gsap.to('.section-home .content-inner', {
    scrollTrigger: {
      trigger: featuresElement,
      start: 'top 80%',
      end: 'top 20%',
      scrub: 1
    },
    y: -50,
    opacity: 0,
    scale: 0.9,
    duration: 1
  })

  // 首页 HUD 头部淡出动画
  gsap.to('.hud-header', {
    scrollTrigger: {
      trigger: featuresElement,
      start: 'top 70%',
      end: 'top 10%',
      scrub: 1
    },
    y: -100,
    opacity: 0,
    duration: 1
  })

  // 首页 -> 动画特效：相机向下移动
  gsap.to(camera.position, {
    scrollTrigger: {
      trigger: featuresElement,
      start: 'top center',
      end: 'top top',
      scrub: 1,
      onUpdate: self => {
        scrollProgress.value = self.progress * 33
        currentSection.value = 1
      }
    },
    y: -30,
    z: 40,
    duration: 2
  })

  // 动画特效 -> 数据洞察：相机继续向下
  gsap.to(camera.position, {
    scrollTrigger: {
      trigger: chartsElement,
      start: 'top center',
      end: 'top top',
      scrub: 1,
      onUpdate: self => {
        scrollProgress.value = 33 + self.progress * 33
        currentSection.value = 2
      }
    },
    y: -60,
    z: 30,
    duration: 2
  })

  // 数据洞察 -> 页脚：相机继续向下
  gsap.to(camera.position, {
    scrollTrigger: {
      trigger: footerElement,
      start: 'top center',
      end: 'top top',
      scrub: 1,
      onUpdate: self => {
        scrollProgress.value = 66 + self.progress * 34
        currentSection.value = 3
      }
    },
    y: -90,
    z: 20,
    duration: 2
  })

  // 3D 对象动画 - 首页区域
  gsap.to(sphere?.scale, {
    scrollTrigger: {
      trigger: featuresElement,
      start: 'top bottom',
      end: 'top center',
      scrub: 1
    },
    x: 0.5,
    y: 0.5,
    z: 0.5
  })

  // 粒子爆炸效果 - 进入动画特效区
  gsap.to(particles?.rotation, {
    scrollTrigger: {
      trigger: featuresElement,
      start: 'top bottom',
      end: 'top center',
      scrub: 1
    },
    y: Math.PI * 2
  })

  // 特性卡片进入动画
  gsap.from('.feature-card', {
    scrollTrigger: {
      trigger: featuresElement,
      start: 'top 70%',
      end: 'bottom 30%'
    },
    y: 100,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  })

  // 特性标题和副标题进入动画
  gsap.from('.section-features .section-header', {
    scrollTrigger: {
      trigger: featuresElement,
      start: 'top 80%',
      end: 'top 40%'
    },
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  })

  // 图表进入动画
  gsap.from('.chart-card', {
    scrollTrigger: {
      trigger: chartsElement,
      start: 'top 70%',
      end: 'bottom 30%'
    },
    y: 80,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    onComplete: () => {
      initCharts()
    }
  })

  // 图表标题和副标题进入动画
  gsap.from('.section-charts .section-header', {
    scrollTrigger: {
      trigger: chartsElement,
      start: 'top 80%',
      end: 'top 40%'
    },
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  })

  // 页脚内容进入动画
  gsap.from('.footer-content > *', {
    scrollTrigger: {
      trigger: footerElement,
      start: 'top 80%',
      end: 'top 50%'
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out'
  })
}

// 滚动到指定区域
const scrollToSection = (index: number) => {
  const sectionsElements = [
    sectionHome.value,
    sectionFeatures.value,
    sectionCharts.value,
    sectionFooter.value
  ]

  if (sectionsElements[index]) {
    gsap.to(scrollContainer.value, {
      scrollTo: { y: sectionsElements[index] },
      duration: 1.5,
      ease: 'power3.inOut'
    })
  }
}

// 触发演示动画
const triggerDemo = (type: string) => {
  const tl = gsap.timeline()

  switch (type) {
    case 'hologram':
      // 全息投影效果
      tl.fromTo(
          document.querySelector('.feature-card'),
          { filter: 'blur(0px) brightness(1)' },
          {
            filter: 'blur(10px) brightness(1.5)',
            duration: 0.3,
            yoyo: true,
            repeat: 1
          }
      )
      break
    case 'wormhole':
      // 虫洞效果
      gsap.to(document.body, {
        scale: 0.95,
        duration: 0.5,
        ease: 'power2.in',
        yoyo: true,
        repeat: 1
      })
      break
    case 'floatIn':
      // 浮动效果
      gsap.fromTo(
          document.querySelector('.feature-card'),
          { y: -20 },
          {
            y: 20,
            duration: 1,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: 2
          }
      )
      break
    case 'vortex':
      // 涡流效果
      gsap.to(document.querySelector('.feature-card'), {
        rotation: 360,
        scale: 1.1,
        duration: 1,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1
      })
      break
    case 'singularity':
      // 奇点效果
      gsap.to(document.querySelector('.feature-card'), {
        scale: 0.1,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        yoyo: true,
        repeat: 1
      })
      break
    case 'liquid':
      // 液态效果
      gsap.to(document.querySelector('.feature-card'), {
        borderRadius: ['50%', '0%'],
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)',
        repeat: 1
      })
      break
  }
}

// 初始化 ECharts 图表
const initCharts = () => {
  // 注意：实际使用需要安装 echarts: npm install echarts
  // 这里创建模拟数据展示

  const createChart = (container: HTMLElement | undefined, type: string, data: any) => {
    if (!container) return
    // 这里应该使用 ECharts，由于未安装，使用 CSS 模拟
    console.log(`Chart initialized: ${type}`, data)
  }

  // 模拟数据
  const chartData = {
    trend: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      values: [1200, 1900, 3000, 5000, 8000, 12000]
    },
    activity: [
      { name: '周一', value: 65 },
      { name: '周二', value: 78 },
      { name: '周三', value: 92 },
      { name: '周四', value: 85 },
      { name: '周五', value: 98 },
      { name: '周六', value: 72 },
      { name: '周日', value: 68 }
    ],
    performance: {
      cpu: [45, 52, 48, 55, 62, 58, 50, 48, 55, 60, 52, 48],
      memory: [30, 35, 40, 38, 42, 45, 40, 35, 38, 40, 42, 38]
    }
  }

  // 初始化图表
  createChart(chart1.value, 'line', chartData.trend)
  createChart(chart2.value, 'bar', chartData.activity)
  createChart(chart3.value, 'mixed', chartData.performance)
  createChart(chart4.value, 'pie', null)
  createChart(chart5.value, 'radar', null)
}

// 探索模式动画
const animateToExploration = () => {
  const tl = gsap.timeline()

  // 隐藏主内容
  tl.to('.content-overlay', {
    opacity: 0,
    scale: 1.1,
    duration: 0.8,
    ease: 'power2.inOut'
  })

  // 显示探索 UI
  tl.to(
      '.exploration-ui',
      {
        opacity: 1,
        duration: 0.8
      },
      '-=0.4'
  )

  // 面板依次出现
  tl.from(
      '.hud-panel',
      {
        x: -50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15
      },
      '-=0.4'
  )

  // 相机推进动画 - 通过修改 orbitRadius
  gsap.to(
      { radius: orbitRadius },
      {
        radius: 90,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
          targetOrbitRadius = 90
        }
      }
  )
}

// 返回首页动画
const animateToHome = () => {
  const tl = gsap.timeline()

  // 隐藏探索 UI
  tl.to('.exploration-ui', {
    opacity: 0,
    duration: 0.8
  })

  // 显示主内容
  tl.to(
      '.content-overlay',
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power2.inOut'
      },
      '-=0.4'
  )

  // 相机返回
  gsap.to(
      { radius: orbitRadius },
      {
        radius: 60,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
          targetOrbitRadius = 60
        }
      }
  )
}

// 粒子爆炸效果 - 优化版本
const createParticleExplosion = () => {
  if (!particles) return

  // 优化：使用整体旋转和缩放代替逐粒子更新
  const originalScale = particles.scale.clone()

  gsap.to(particles.scale, {
    x: 1.5,
    y: 1.5,
    z: 1.5,
    duration: 0.3,
    ease: 'power2.out',
    onComplete: () => {
      gsap.to(particles.scale, {
        x: originalScale.x,
        y: originalScale.y,
        z: originalScale.z,
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)'
      })
    }
  })
}

// 鼠标悬停视差效果
const createParallaxEffect = () => {
  gsap.to(camera.position, {
    x: targetX * 15,
    y: targetY * 15,
    duration: 1,
    ease: 'power2.out'
  })
}

// 鼠标移动事件处理 - 优化版本
const handleMouseMove = (event: MouseEvent) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1

  // GSAP 鼠标跟随视差效果 - 优化：减少GSAP调用
  if (!isExploring.value && updateCount % 5 === 0) {
    gsap.to(camera.position, {
      x: mouseX * 10,
      y: mouseY * 10,
      duration: 1,
      ease: 'power2.out'
    })

    // 标题视差效果
    gsap.to('.main-title', {
      x: mouseX * 20,
      y: mouseY * 20,
      duration: 0.5,
      ease: 'power2.out'
    })
  }

  if (isDragging && isExploring.value) {
    const deltaX = event.clientX - previousMousePosition.x
    const deltaY = event.clientY - previousMousePosition.y

    orbitAngle -= deltaX * 0.003
    orbitHeight += deltaY * 0.3
    orbitHeight = Math.max(-50, Math.min(50, orbitHeight))

    previousMousePosition = { x: event.clientX, y: event.clientY }
  }
}

// 按钮 GSAP 交互效果
const setupButtonInteractions = () => {
  const buttons = document.querySelectorAll('.btn')

  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {
        scale: 1.05,
        duration: 0.3,
        ease: 'back.out(1.7)'
      })

      // 按钮光效
      gsap.to(btn, {
        boxShadow: '0 0 40px rgba(0, 212, 255, 0.6)',
        duration: 0.3
      })
    })

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })

      gsap.to(btn, {
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)',
        duration: 0.3
      })
    })

    btn.addEventListener('mousedown', () => {
      gsap.to(btn, {
        scale: 0.95,
        duration: 0.1
      })
    })

    btn.addEventListener('mouseup', () => {
      gsap.to(btn, {
        scale: 1.05,
        duration: 0.2,
        ease: 'elastic.out(1, 0.5)'
      })
    })
  })
}

// 导航链接 GSAP 交互
const setupNavInteractions = () => {
  const navLinks = document.querySelectorAll('.nav-link')

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      gsap.to(link, {
        x: 5,
        color: '#00d4ff',
        duration: 0.3,
        ease: 'power2.out'
      })
    })

    link.addEventListener('mouseleave', () => {
      gsap.to(link, {
        x: 0,
        color: link.classList.contains('active') ? '#fff' : 'rgba(255, 255, 255, 0.7)',
        duration: 0.3,
        ease: 'power2.out'
      })
    })
  })
}

// 统计卡片 GSAP 交互
const setupStatInteractions = () => {
  const statItems = document.querySelectorAll('.stat-item')

  statItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, {
        scale: 1.1,
        duration: 0.3,
        ease: 'back.out(1.7)'
      })

      // 脉冲效果
      gsap.to(item.querySelector('.stat-value'), {
        scale: 1.2,
        duration: 0.3,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      })
    })

    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })

      gsap.to(item.querySelector('.stat-value'), {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    })
  })
}

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (!isExploring.value) return
  const moveSpeed = 2
  switch (event.key.toLowerCase()) {
    case 'w':
      orbitRadius = Math.max(20, orbitRadius - moveSpeed)
      targetOrbitRadius = orbitRadius
      break
    case 's':
      orbitRadius = Math.min(150, orbitRadius + moveSpeed)
      targetOrbitRadius = orbitRadius
      break
    case 'a':
      orbitAngle -= 0.05
      break
    case 'd':
      orbitAngle += 0.05
      break
  }
}

// 鼠标按下事件
const handleMouseDown = (event: MouseEvent) => {
  if (isExploring.value) {
    isDragging = true
    previousMousePosition = { x: event.clientX, y: event.clientY }
  }
}

// 鼠标释放事件
const handleMouseUp = () => {
  isDragging = false
}

// 滚轮事件
const handleWheel = (event: WheelEvent) => {
  if (isExploring.value) {
    targetOrbitRadius += event.deltaY * 0.03
    targetOrbitRadius = Math.max(20, Math.min(150, targetOrbitRadius))
  }
}

// 开始探索
const startExploration = () => {
  isExploring.value = true
  orbitAngle = 0
  animateToExploration()
  createParticleExplosion()
}

// 返回首页
const backToHome = () => {
  isExploring.value = false
  orbitHeight = 0
  orbitAngle = 0
  animateToHome()
}

// 初始化Three.js场景
const initThree = () => {
  // 创建场景 - 深空紫蓝色
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x030510)
  scene.fog = new THREE.FogExp2(0x030510, 0.006) // 添加雾效

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 60

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.toneMapping = THREE.ACESFilmicToneMapping // 添加 ACES 色调映射
  renderer.toneMappingExposure = 1.2
  canvasContainer.value?.appendChild(renderer.domElement)

  clock = new THREE.Clock()
  lastFpsTime = performance.now()

  // 延迟创建场景元素，避免阻塞初始化
  requestAnimationFrame(() => {
    createParticles()
    createSphere()
    createTorus()
    createFloatingCubesInstanced()
    createEnergyRingsInstanced()
    createStarField()
    setupLighting()

    // 计算对象总数
    objectCount.value = 1 + FLOATING_CUBE_COUNT + ENERGY_RING_COUNT

    // 延迟加载装饰性特效，等待页面加载完成
    setTimeout(() => {
      createNebulaClouds()
      createHelixLines()
      createGlowingOrbs()
      objectCount.value =
          1 + FLOATING_CUBE_COUNT + ENERGY_RING_COUNT + nebulaClouds.length + helixLines.length
    }, 1000)
  })

  // 事件监听
  window.addEventListener('resize', onWindowResize, { passive: true })
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  window.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('wheel', handleWheel, { passive: true })
  window.addEventListener('keydown', handleKeyDown)

  // 开始动画循环
  animate()

  // 启动数字动画
  setTimeout(() => {
    animateNumber(stat1.value, 2847000, '+')
    animateNumber(stat2.value, 15680)
    animateNumber(stat3.value, 98540000, '+')
  }, 500)
}

// 创建粒子效果 - 极致优化版本
const createParticles = () => {
  const particleCount = 5000 // 优化到5000
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  // 使用单色系减少渲染开销
  const baseColor = new THREE.Color(0x00d4ff)

  for (let i = 0; i < particleCount; i++) {
    const radius = Math.random() * 300 + 80 // 减小分布范围
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    // 简化颜色计算
    const colorVariation = Math.random() * 0.3
    colors[i * 3] = baseColor.r + colorVariation
    colors[i * 3 + 1] = baseColor.g + colorVariation
    colors[i * 3 + 2] = baseColor.b + colorVariation * 0.5
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.7, // 降低不透明度
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)
}

// 创建中心球体 - 优化版本
const createSphere = () => {
  const geometry = new THREE.IcosahedronGeometry(12, 2) // 降低细分级别
  const material = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  })
  sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)

  // 添加内部发光球体 - 减少细分
  const innerGeometry = new THREE.IcosahedronGeometry(8, 2)
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0x0099ff,
    transparent: true,
    opacity: 0.5
  })
  const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial)
  sphere.add(innerSphere)

  // 添加核心光点 - 减少细分
  const coreGeometry = new THREE.SphereGeometry(3, 16, 16)
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9
  })
  const core = new THREE.Mesh(coreGeometry, coreMaterial)
  sphere.add(core)
}

// 创建环绕圆环 - 优化版本
const createTorus = () => {
  const geometry = new THREE.TorusGeometry(25, 1.2, 16, 64) // 降低细分
  const material = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    wireframe: true,
    transparent: true,
    opacity: 0.6
  })
  torus = new THREE.Mesh(geometry, material)
  scene.add(torus)

  // 添加第二个斜向圆环 - 降低细分
  const torus2Geometry = new THREE.TorusGeometry(32, 0.8, 16, 64)
  const torus2Material = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  })
  const torus2 = new THREE.Mesh(torus2Geometry, torus2Material)
  torus2.rotation.x = Math.PI / 3
  torus2.rotation.y = Math.PI / 6
  torus.add(torus2)
}

// 创建悬浮立方体 - 使用 InstancedMesh 优化
const createFloatingCubesInstanced = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  })

  floatingCubes = new THREE.InstancedMesh(geometry, material, FLOATING_CUBE_COUNT)

  const cubeData: Array<{
    rotationSpeed: number
    floatSpeed: number
    floatOffset: number
    orbitSpeed: number
    orbitRadius: number
    orbitAngle: number
    orbitHeight: number
    scale: THREE.Vector3
    position: THREE.Vector3
    rotation: THREE.Euler
  }> = []

  for (let i = 0; i < FLOATING_CUBE_COUNT; i++) {
    const size = Math.random() * 5 + 3
    const scale = new THREE.Vector3(size, size, size)
    const rotation = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    )

    const radius = Math.random() * 100 + 60
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    const position = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
    )

    cubeData.push({
      rotationSpeed: Math.random() * 0.03 + 0.01,
      floatSpeed: Math.random() * 0.8 + 0.6,
      floatOffset: Math.random() * Math.PI * 2,
      orbitSpeed: Math.random() * 0.002 + 0.001,
      orbitRadius: radius,
      orbitAngle: theta,
      orbitHeight: phi,
      scale,
      position,
      rotation
    })

    // 设置初始变换
    cubeDummy.scale.copy(scale)
    cubeDummy.position.copy(position)
    cubeDummy.rotation.copy(rotation)
    cubeDummy.updateMatrix()
    floatingCubes.setMatrixAt(i, cubeDummy.matrix)

    // 设置颜色
    const color = new THREE.Color()
    color.setHSL(Math.random() * 0.3 + 0.55, 1, 0.6)
    floatingCubes.setColorAt(i, color)
  }

  // 存储动画数据到 userData
  floatingCubes.userData = { cubeData }
  scene.add(floatingCubes)
}

// 创建能量环 - 使用 InstancedMesh 优化
const createEnergyRingsInstanced = () => {
  const geometry = new THREE.TorusGeometry(1, 0.02, 16, 64)
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4
  })

  energyRings = new THREE.InstancedMesh(geometry, material, ENERGY_RING_COUNT)

  const ringData: Array<{
    rotationSpeed: number
    radius: number
    rotationX: number
    position: THREE.Vector3
  }> = []

  for (let i = 0; i < ENERGY_RING_COUNT; i++) {
    const radius = 40 + i * 12
    const rotationX = Math.PI / 2 + (i % 2) * 0.3

    const position = new THREE.Vector3(0, 0, 0)

    ringData.push({
      rotationSpeed: (Math.random() - 0.5) * 0.015,
      radius,
      rotationX,
      position
    })

    // 设置初始变换
    ringDummy.scale.set(radius, radius, radius)
    ringDummy.position.copy(position)
    ringDummy.rotation.x = rotationX
    ringDummy.updateMatrix()
    energyRings.setMatrixAt(i, ringDummy.matrix)

    // 设置颜色
    const color = new THREE.Color()
    color.setHSL(i * 0.08 + 0.5, 1, 0.6)
    energyRings.setColorAt(i, color)
  }

  // 存储动画数据到 userData
  energyRings.userData = { ringData }
  scene.add(energyRings)
}

// 创建星空背景 - 极致优化版本
const createStarField = () => {
  const starCount = 3000
  const positions = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount; i++) {
    const radius = Math.random() * 500 + 200
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    size: 1.5,
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: false
  })

  const stars = new THREE.Points(geometry, material)
  scene.add(stars)
}

// 创建星云云 - 优化版本 + 五颜六色半透明
const createNebulaClouds = () => {
  for (let j = 0; j < 6; j++) {
    const particleCount = 1500
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const centerX = (Math.random() - 0.5) * 250
    const centerY = (Math.random() - 0.5) * 250
    const centerZ = (Math.random() - 0.5) * 250

    // 每个云团的基础色相，使用全色相范围实现五颜六色
    const baseHue = Math.random()

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 50

      positions[i * 3] = centerX + Math.cos(angle) * radius
      positions[i * 3 + 1] = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 30
      positions[i * 3 + 2] = centerZ + (Math.random() - 0.5) * 50

      // 五颜六色：根据距离中心的远近计算色相偏移，颜色更鲜艳
      const distance = Math.sqrt(
          Math.pow(positions[i * 3] - centerX, 2) +
          Math.pow(positions[i * 3 + 1] - centerY, 2) +
          Math.pow(positions[i * 3 + 2] - centerZ, 2)
      )
      const normalizedDistance = distance / 50
      const hueOffset = normalizedDistance * 0.4

      const color = new THREE.Color()
      color.setHSL((baseHue + hueOffset) % 1, 1.0, 0.6)

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    })

    const cloud = new THREE.Points(geometry, material)
    cloud.userData = {
      rotationSpeed: Math.random() * 0.002 + 0.001
    }

    scene.add(cloud)
    nebulaClouds.push(cloud)
  }
}

// 创建螺旋线 - 优化版本 + 鲜艳颜色
const createHelixLines = () => {
  for (let i = 0; i < 3; i++) {
    const points = []
    const colors = []
    const radius = 50 + i * 20
    const turns = 2
    const segments = 100

    // 每条线的起始色相，鲜艳的颜色
    const baseHue = i * 0.25 // 0, 0.25, 0.5 (红、绿、蓝)

    for (let j = 0; j <= segments; j++) {
      const t = (j / segments) * turns * Math.PI * 2
      const height = (j / segments) * 150 - 75
      const x = radius * Math.cos(t + (i * Math.PI) / 3)
      const z = radius * Math.sin(t + (i * Math.PI) / 3)
      points.push(new THREE.Vector3(x, height, z))

      // 鲜艳渐变颜色：根据高度计算色相偏移
      const normalizedHeight = (height + 75) / 150
      const hueOffset = normalizedHeight * 0.25

      const color = new THREE.Color()
      color.setHSL((baseHue + hueOffset) % 1, 1.0, 0.6)
      colors.push(color.r, color.g, color.b)
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      linewidth: 2
    })

    const helix = new THREE.Line(geometry, material)
    scene.add(helix)
    helixLines.push(helix)
  }
}

// 创建发光球体 - 优化版本 + 半透明好看颜色
const createGlowingOrbs = () => {
  for (let i = 0; i < 15; i++) {
    const radius = Math.random() * 2 + 1
    const geometry = new THREE.SphereGeometry(radius, 8, 8)

    // 每个球体的基础色相，使用好看的颜色
    const baseHue = Math.random()

    // 使用顶点颜色实现渐变
    const count = geometry.attributes.position.count
    const colors = new Float32Array(count * 3)
    const positions = geometry.attributes.position.array as Float32Array

    for (let j = 0; j < count; j++) {
      const px = positions[j * 3]
      const py = positions[j * 3 + 1]
      const pz = positions[j * 3 + 2]

      // 根据顶点位置计算渐变：Y轴顶部到底部的颜色变化
      const normalizedY = (py / radius + 1) / 2
      const hue = baseHue + normalizedY * 0.15

      const color = new THREE.Color()
      color.setHSL(hue % 1, 0.95, 0.5 + normalizedY * 0.2)

      colors[j * 3] = color.r
      colors[j * 3 + 1] = color.g
      colors[j * 3 + 2] = color.b
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    })

    const orb = new THREE.Mesh(geometry, material)
    const distance = Math.random() * 120 + 50
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    orb.position.x = distance * Math.sin(phi) * Math.cos(theta)
    orb.position.y = distance * Math.sin(phi) * Math.sin(theta)
    orb.position.z = distance * Math.cos(phi)

    orb.userData = {
      pulseSpeed: Math.random() * 2 + 1,
      pulseOffset: Math.random() * Math.PI * 2
    }

    scene.add(orb)
  }
}

// 设置灯光
const setupLighting = () => {
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
  scene.add(ambientLight)

  const pointLight1 = new THREE.PointLight(0x00d4ff, 3, 300)
  pointLight1.position.set(30, 30, 30)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0xff00ff, 3, 300)
  pointLight2.position.set(-30, -30, 30)
  scene.add(pointLight2)

  const pointLight3 = new THREE.PointLight(0x00ff88, 2, 300)
  pointLight3.position.set(0, 40, -40)
  scene.add(pointLight3)
}

// 窗口大小调整处理
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 动画循环 - 极致优化版本
const animate = () => {
  requestAnimationFrame(animate)

  const elapsedTime = clock.getElapsedTime()
  const currentTime = performance.now()

  // FPS 计算
  frameCount++
  if (currentTime - lastFpsTime >= 1000) {
    fps.value = frameCount
    frameCount = 0
    lastFpsTime = currentTime
  }

  updateCount++

  // 平滑鼠标移动 - 降低更新频率
  if (updateCount % 2 === 0) {
    targetX += (mouseX - targetX) * 0.05
    targetY += (mouseY - targetY) * 0.05
  }

  // 平滑轨道半径和高度
  orbitRadius += (targetOrbitRadius - orbitRadius) * 0.03

  // 相机轨道运动
  if (isExploring.value) {
    orbitAngle += 0.001
    camera.position.x = orbitRadius * Math.cos(orbitAngle)
    camera.position.z = orbitRadius * Math.sin(orbitAngle)
    camera.position.y = orbitHeight
    camera.lookAt(0, 0, 0)
  } else {
    camera.lookAt(scene.position)
  }

  // 更新坐标显示 - 降低更新频率
  if (updateCount % 10 === 0) {
    cameraPosition.value.x = camera.position.x
    cameraPosition.value.y = camera.position.y
    cameraPosition.value.z = camera.position.z
  }

  // 粒子动画 - 简化计算
  if (particles && updateCount % 2 === 0) {
    particles.rotation.y = elapsedTime * 0.015
    particles.rotation.x = targetY * 0.05
    particles.rotation.z = targetX * 0.05
  }

  // 球体动画 - 降低更新频率
  if (sphere && updateCount % 2 === 0) {
    sphere.rotation.x += 0.01
    sphere.rotation.y += 0.015
    const scale = 1 + Math.sin(elapsedTime * 1.5) * 0.04
    sphere.scale.set(scale, scale, scale)
  }

  // 圆环动画 - 降低更新频率
  if (torus && updateCount % 3 === 0) {
    torus.rotation.x = elapsedTime * 0.05
    torus.rotation.y = elapsedTime * 0.08
  }

  // 悬浮立方体动画 - 节流更新
  if (floatingCubes && floatingCubes.userData.cubeData && updateCount % UPDATE_INTERVAL === 0) {
    const cubeData = floatingCubes.userData.cubeData as Array<any>

    for (let i = 0; i < FLOATING_CUBE_COUNT; i++) {
      const data = cubeData[i]

      data.rotation.x += data.rotationSpeed
      data.rotation.y += data.rotationSpeed * 0.7

      const floatOffset = Math.sin(elapsedTime * data.floatSpeed + data.floatOffset) * 0.03
      data.orbitAngle += data.orbitSpeed

      const radius = data.orbitRadius
      const angle = data.orbitAngle
      const phi = data.orbitHeight

      data.position.x = radius * Math.sin(phi) * Math.cos(angle)
      data.position.y = radius * Math.sin(phi) * Math.sin(angle) + floatOffset
      data.position.z = radius * Math.sin(phi) * Math.sin(angle)

      cubeDummy.scale.copy(data.scale)
      cubeDummy.position.copy(data.position)
      cubeDummy.rotation.copy(data.rotation)
      cubeDummy.updateMatrix()
      floatingCubes.setMatrixAt(i, cubeDummy.matrix)
    }
    floatingCubes.instanceMatrix.needsUpdate = true
  }

  // 能量环动画 - 节流更新
  if (energyRings && energyRings.userData.ringData && updateCount % UPDATE_INTERVAL === 0) {
    const ringData = energyRings.userData.ringData as Array<any>

    for (let i = 0; i < ENERGY_RING_COUNT; i++) {
      const data = ringData[i]

      const currentRotationZ = data.rotationX + elapsedTime * data.rotationSpeed

      ringDummy.scale.set(data.radius, data.radius, data.radius)
      ringDummy.position.copy(data.position)
      ringDummy.rotation.x = data.rotationX
      ringDummy.rotation.z = currentRotationZ
      ringDummy.updateMatrix()
      energyRings.setMatrixAt(i, ringDummy.matrix)
    }
    energyRings.instanceMatrix.needsUpdate = true
  }

  // 星云动画 - 降低更新频率
  if (updateCount % 4 === 0) {
    nebulaClouds.forEach(cloud => {
      cloud.rotation.y += cloud.userData.rotationSpeed
    })
  }

  // 螺旋线动画 - 降低更新频率
  if (updateCount % 4 === 0) {
    helixLines.forEach(helix => {
      helix.rotation.y += 0.001
    })
  }

  renderer.render(scene, camera)
}

// 组件挂载
onMounted(() => {
  initThree()
  initEntranceAnimations()

  // 等待 DOM 更新后设置交互和滚动动画
  setTimeout(() => {
    initScrollAnimations()
    setupButtonInteractions()
    setupNavInteractions()
    setupStatInteractions()
  }, 300)
})

// 组件卸载清理
onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mousedown', handleMouseDown)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('wheel', handleWheel)
  window.removeEventListener('keydown', handleKeyDown)
  renderer.dispose()
})
</script>

<style lang="scss">
// 导入 Universal Animation Library
@import 'universal-animation-library/dist/index.lite.css';
@import 'universal-animation-library/dist/v2.css';
@import 'universal-animation-library/dist/v3.css';
@import 'universal-animation-library/dist/v4.css';
@import 'universal-animation-library/dist/v5.css';
@import 'universal-animation-library/dist/v6.css';
</style>

<!--
  ✨ 动画增强说明
  =================

  本页面集成了两大动画库：

  🎬 GSAP (GreenSock Animation Platform)
  - 强大的 JavaScript 动画引擎
  - 平滑的缓动函数 (ease: 'power2.out', 'elastic.out(1, 0.5)', 'back.out(1.7)')
  - Timeline 时间轴编排复杂动画序列
  - 鼠标跟随视差效果
  - 按钮交互动画
  - 探索模式转场动画
  - 粒子爆炸效果

  🎨 Universal Animation Library
  - 105+ 精心设计的 CSS 动画
  - 即插即用的动画类
  - 零依赖，纯 CSS 实现
  - 版本：V2(全息)、V3(虫洞)、V4(浮动)、V5(极限涡流)、V6(奇点爆炸)

  使用示例：
  - 按钮：ua-v2-animated ua-v2-hologram (全息投影效果)
  - 统计卡片：ua-v4-animated ua-v4-floatIn (浮动进入)
  - 面板：ua-v3-animated ua-v3-wormhole (虫洞穿越)
  - 坐标面板：ua-v5-animated ua-v5-extremeVortex (极限涡流)
  - 返回按钮：ua-v6-animated ua-v6-singularityExplosion (奇点爆炸)

  🚀 性能优化
  - GSAP 使用 requestAnimationFrame
  - 动画时长优化，避免过长动画
  - 合理使用缓动函数
  - 事件委托减少监听器
-->
<style scoped lang="scss">
.home-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #030510 0%, #0a0a2e 50%, #030510 100%);
  font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
      'Microsoft YaHei', sans-serif;
}

// 滚动容器 - 重新设计
.scroll-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  z-index: 10;
  padding-top: 100px; // 为fixed header留出空间

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #00d4ff, #ff00ff);
    border-radius: 4px;

    &:hover {
      background: linear-gradient(180deg, #00a8cc, #cc00cc);
    }
  }
}

// 滚动区域 - 重新设计
.scroll-section {
  min-height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;

  &.section-home {
    background: transparent;
    min-height: calc(100vh - 100px); // 减去header高度
  }

  &.section-features {
    background: linear-gradient(180deg, transparent, rgba(0, 212, 255, 0.05));
  }

  &.section-charts {
    background: linear-gradient(180deg, rgba(0, 212, 255, 0.05), rgba(255, 0, 255, 0.05));
  }

  &.section-footer {
    background: linear-gradient(180deg, rgba(255, 0, 255, 0.05), rgba(0, 0, 0, 0.8));
    min-height: calc(100vh - 100px);
  }
}

.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

// HUD 头部 - 固定不滚动
.hud-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1.5rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, rgba(3, 5, 16, 0.95), rgba(3, 5, 16, 0.8), transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  transition: all 0.5s ease;
}

.hud-logo {
  display: flex;
  align-items: center;
  gap: 1rem;

  .logo-icon {
    position: relative;
    width: 48px;
    height: 48px;

    .logo-ring {
      position: absolute;
      inset: 0;
      border: 2px solid #00d4ff;
      border-radius: 50%;
      animation: ringPulse 2s ease-in-out infinite;

      &::before {
        content: '';
        position: absolute;
        inset: 4px;
        border: 1px solid rgba(0, 212, 255, 0.5);
        border-radius: 50%;
        animation: ringPulse 2s ease-in-out infinite 0.3s;
      }
    }

    .logo-dot {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 12px;
      height: 12px;
      background: #00d4ff;
      border-radius: 50%;
      box-shadow:
          0 0 20px #00d4ff,
          0 0 40px rgba(0, 212, 255, 0.5);
      animation: dotPulse 1.5s ease-in-out infinite;
    }
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.3em;
    background: linear-gradient(90deg, #00d4ff, #ff00ff, #00d4ff);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientMove 3s linear infinite;
  }
}

@keyframes ringPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
}

@keyframes dotPulse {
  0%,
  100% {
    box-shadow:
        0 0 20px #00d4ff,
        0 0 40px rgba(0, 212, 255, 0.5);
  }
  50% {
    box-shadow:
        0 0 30px #00d4ff,
        0 0 60px rgba(0, 212, 255, 0.8);
  }
}

.hud-nav {
  display: flex;
  gap: 3rem;

  .nav-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    position: relative;
    transition: all 0.3s ease;

    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #00d4ff, #ff00ff);
      transition: width 0.3s ease;
    }

    &:hover,
    &.active {
      color: #fff;

      &::after {
        width: 100%;
      }
    }
  }
}

.hud-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 20px;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00ff88;
    box-shadow: 0 0 10px #00ff88;
    animation: statusPulse 2s ease-in-out infinite;
  }

  span {
    font-size: 0.8rem;
    font-weight: 600;
    color: #00ff88;
    letter-spacing: 0.1em;
  }
}

@keyframes statusPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 主内容区
.content-overlay {
  position: relative;
  z-index: 50;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 2rem 2rem 2rem; // 顶部留出header空间
  pointer-events: none;
  transition: all 0.8s ease;

  &.fade-out {
    opacity: 0;
    transform: translateY(-5%);
    pointer-events: none;
  }
}

.content-inner {
  text-align: center;
}

.eyebrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  perspective: 500px;
  transform-style: preserve-3d;

  span:not(.eyebrow-line) {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: #00d4ff;
    position: relative;
    transform-style: preserve-3d;
    animation: text3D 4s ease-in-out infinite;

    &::before,
    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
    }

    &::before {
      color: rgba(0, 212, 255, 0.5);
      transform: translateZ(-3px) translateX(1px);
    }

    &::after {
      color: rgba(0, 212, 255, 0.3);
      transform: translateZ(-6px) translateX(2px);
    }
  }

  .eyebrow-line {
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  }
}

.main-title {
  margin-bottom: 2rem;
  perspective: 1000px;
  transform-style: preserve-3d;

  .title-line {
    display: block;
    font-size: clamp(3rem, 10vw, 7rem);
    font-weight: 800;
    line-height: 1.1;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    position: relative;
    transform-style: preserve-3d;
    animation: title3D 6s ease-in-out infinite;

    // 3D立体层
    &::before,
    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
    }

    // 第一层 - 3D深度
    &::before {
      background: linear-gradient(135deg, #00d4ff 0%, #ff00ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(-10px) translateX(4px) translateY(2px);
      opacity: 0.6;
      filter: blur(1px);
    }

    // 第二层 - 更深3D
    &::after {
      background: linear-gradient(135deg, #0088ff 0%, #cc00cc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(-20px) translateX(8px) translateY(4px);
      opacity: 0.4;
      filter: blur(2px);
    }

    // 表面层
    background: linear-gradient(
            135deg,
            #ffffff 0%,
            #00d4ff 25%,
            #ff00ff 50%,
            #00d4ff 75%,
            #ffffff 100%
    );
    background-size: 300% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation:
        gradientMove 4s linear infinite,
        title3D 6s ease-in-out infinite;
    filter: drop-shadow(0 0 30px rgba(0, 212, 255, 0.5));

    &:first-child {
      animation-delay: 0s, 0s;
    }

    &:last-child {
      animation-delay: 2s, 0.5s;
    }
  }
}

// 3D标题动画
@keyframes title3D {
  0%,
  100% {
    transform: rotateX(0deg) rotateY(0deg);
  }
  25% {
    transform: rotateX(5deg) rotateY(-5deg);
  }
  50% {
    transform: rotateX(0deg) rotateY(0deg);
  }
  75% {
    transform: rotateX(-5deg) rotateY(5deg);
  }
}

// 通用3D文字动画
@keyframes text3D {
  0%,
  100% {
    transform: rotateX(0deg) rotateY(0deg);
  }
  50% {
    transform: rotateX(3deg) rotateY(-3deg);
  }
}

@keyframes gradientMove {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

.subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  line-height: 1.8;
  letter-spacing: 0.1em;
  perspective: 500px;
  transform-style: preserve-3d;

  span {
    display: inline-block;
    position: relative;
    transform-style: preserve-3d;
    animation: text3D 5s ease-in-out infinite;

    &::before,
    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      pointer-events: none;
    }

    &::before {
      color: rgba(255, 255, 255, 0.6);
      transform: translateZ(-2px) translateX(0.5px);
    }

    &::after {
      color: rgba(255, 255, 255, 0.4);
      transform: translateZ(-4px) translateX(1px);
    }
  }
}

.cta-buttons {
  pointer-events: auto;
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 4rem;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: transparent;
  perspective: 500px;
  transform-style: preserve-3d;

  .btn-text {
    position: relative;
    z-index: 1;
    display: inline-block;
    transform-style: preserve-3d;

    &::before,
    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      pointer-events: none;
    }

    &::before {
      transform: translateZ(-2px) translateX(0.5px);
      opacity: 0.7;
    }

    &::after {
      transform: translateZ(-4px) translateX(1px);
      opacity: 0.4;
    }
  }

  .btn-icon {
    width: 20px;
    height: 20px;
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, #00d4ff, #ff00ff);
    z-index: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #00d4ff 0%, #0088ff 100%);
  color: #030510;
  border: none;
  box-shadow:
      0 0 30px rgba(0, 212, 255, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow:
        0 0 50px rgba(0, 212, 255, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);

    .btn-icon {
      transform: translateX(4px);
    }
  }
}

.btn-secondary {
  color: #fff;
  border-color: rgba(0, 212, 255, 0.5);
  background: rgba(0, 212, 255, 0.1);

  &:hover {
    background: rgba(0, 212, 255, 0.2);
    border-color: #00d4ff;
    transform: translateY(-3px);
    box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);

    .btn-icon {
      transform: scale(1.1);
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  max-width: 800px;
  margin: 0 auto;

  .stat-item {
    text-align: center;

    .stat-value {
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 800;
      background: linear-gradient(135deg, #00d4ff, #ff00ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
      font-family: 'Courier New', monospace;
      filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.3));
      position: relative;
      perspective: 500px;
      transform-style: preserve-3d;

      &::before,
      &::after {
        content: attr(data-value);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #00d4ff, #ff00ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        transform-style: preserve-3d;
        pointer-events: none;
      }

      &::before {
        transform: translateZ(-5px) translateX(1px) translateY(0.5px);
        opacity: 0.5;
        filter: blur(0.5px);
      }

      &::after {
        transform: translateZ(-10px) translateX(2px) translateY(1px);
        opacity: 0.3;
        filter: blur(1px);
      }
    }

    .stat-label {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.8);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      position: relative;
      perspective: 500px;
      transform-style: preserve-3d;

      &::before,
      &::after {
        content: attr(data-label);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        pointer-events: none;
      }

      &::before {
        transform: translateZ(-2px) translateX(0.3px);
        opacity: 0.6;
      }

      &::after {
        transform: translateZ(-4px) translateX(0.6px);
        opacity: 0.4;
      }
    }
  }
}

// HUD 面板样式 - 已删除导航控制和实时数据面板
// 探索 UI
.exploration-ui {
  position: absolute;
  inset: 0;
  z-index: 80;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem;
  opacity: 0;
  transition: opacity 0.8s ease;

  &.fade-in {
    opacity: 1;
  }

  .hud-bottom {
    pointer-events: none;

    > * {
      pointer-events: auto;
    }
  }
}

.hud-bottom {
  position: absolute;
  bottom: 5rem;
  left: 2rem;
  right: 2rem;
  z-index: 90;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.hud-top > *,
.hud-bottom > * {
  pointer-events: auto;
}

.hud-top {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

.hud-panel {
  background: rgba(3, 5, 16, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .panel-icon {
      font-size: 1.25rem;
    }

    span {
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #00d4ff;
    }
  }

  .panel-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .control-key {
    font-size: 0.85rem;
    font-weight: 600;
    color: #fff;
    background: rgba(0, 212, 255, 0.2);
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    letter-spacing: 0.05em;
  }

  .control-desc {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .data-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .data-value {
    font-size: 0.9rem;
    font-weight: 700;
    font-family: 'Courier New', monospace;
    color: #00ff88;
    letter-spacing: 0.05em;
  }
}

.hud-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

.coordinates-panel {
  background: rgba(3, 5, 16, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 200px;

  .coord-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;

    &:last-child {
      margin-bottom: 0;
    }

    .coord-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #00d4ff;
      width: 20px;
    }

    .coord-value {
      font-size: 0.85rem;
      font-family: 'Courier New', monospace;
      color: #fff;
      min-width: 60px;
      text-align: right;
    }

    .coord-bar {
      flex: 1;
      height: 4px;
      background: rgba(0, 212, 255, 0.2);
      border-radius: 2px;
      overflow: hidden;

      &::after {
        content: '';
        display: block;
        height: 100%;
        background: linear-gradient(90deg, #00d4ff, #ff00ff);
        transition: width 0.1s ease;
      }
    }
  }
}

.btn-exit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.5);
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  .exit-icon {
    width: 18px;
    height: 18px;
    transition: transform 0.3s ease;
  }

  &:hover {
    background: rgba(255, 0, 0, 0.3);
    border-color: #ff4444;
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(255, 0, 0, 0.3);

    .exit-icon {
      transform: translateX(-2px);
    }
  }
}

// 滚动指示器
.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  transition: opacity 0.8s ease;

  &.fade-out {
    opacity: 0;
  }

  .scroll-mouse {
    width: 24px;
    height: 40px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-radius: 12px;
    position: relative;

    .scroll-wheel {
      position: absolute;
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 8px;
      background: #00d4ff;
      border-radius: 2px;
      animation: scrollWheel 2s ease-in-out infinite;
    }
  }
}

@keyframes scrollWheel {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) translateY(12px);
    opacity: 0.3;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .hud-header {
    padding: 1rem 2rem;
  }

  .hud-nav {
    gap: 2rem;

    .nav-link {
      font-size: 0.8rem;
    }
  }

  .stats-grid {
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .hud-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .hud-nav {
    gap: 1.5rem;
  }

  .hud-status {
    display: none;
  }

  .content-overlay {
    padding: 1rem;
  }

  .eyebrow {
    flex-direction: column;
    gap: 0.5rem;

    .eyebrow-line {
      width: 80px;
    }
  }

  .cta-buttons {
    flex-direction: column;
    gap: 1rem;

    .btn {
      width: 100%;
      justify-content: center;
    }
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .hud-top {
    grid-template-columns: 1fr;
  }

  .coordinates-panel {
    min-width: 150px;
    padding: 1rem;
  }

  .btn-exit {
    padding: 0.5rem 1rem;
  }

  .scroll-indicator {
    bottom: 4rem;
  }
}

// 扫描线效果 - 减弱
.home-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 3px,
          rgba(0, 212, 255, 0.02) 3px,
          rgba(0, 212, 255, 0.02) 6px
  );
  pointer-events: none;
  z-index: 2;
  opacity: 0.5;
}

// 光晕效果 - 减弱
.home-page::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
          ellipse at center,
          transparent 0%,
          transparent 70%,
          rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
  z-index: 3;
}

.section-content {
  width: 100%;
  max-width: 1400px;
  padding: 2rem;
  position: relative;
  z-index: 20;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;

  .section-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #00d4ff, #ff00ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .section-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
}

// 特性网格
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-10px);
    border-color: rgba(0, 212, 255, 0.6);
    box-shadow: 0 20px 40px rgba(0, 212, 255, 0.3);

    &::before {
      opacity: 1;
    }
  }

  .feature-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    display: block;
  }

  h3 {
    font-size: 1.5rem;
    color: #fff;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .feature-demo {
    margin-top: 1.5rem;
  }

  .demo-btn {
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #00d4ff, #0088ff);
    border: none;
    border-radius: 8px;
    color: #030510;
    font-weight: 700;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
    }
  }
}

// 图表网格
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;

  .chart-large {
    grid-column: span 2;
  }
}

.chart-card {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 0, 255, 0.3);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 0, 255, 0.6);
    box-shadow: 0 20px 40px rgba(255, 0, 255, 0.2);
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h3 {
      font-size: 1.25rem;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .chart-badge {
      padding: 0.25rem 0.75rem;
      background: rgba(255, 0, 255, 0.2);
      border: 1px solid rgba(255, 0, 255, 0.4);
      border-radius: 4px;
      font-size: 0.75rem;
      color: #ff00ff;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
  }

  .chart-container {
    min-height: 300px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;

    &::before {
      content: '📊 ECharts 图表区域';
    }
  }
}

// 页脚
.footer-content {
  text-align: center;
  padding: 4rem 2rem;

  .footer-logo {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #00d4ff, #ff00ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
  }

  .footer-text {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 2rem;
  }

  .footer-links {
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin-bottom: 2rem;

    a {
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      font-size: 0.9rem;
      transition: all 0.3s ease;

      &:hover {
        color: #00d4ff;
      }
    }
  }

  .footer-copyright {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.875rem;
  }
}

// 滚动进度条
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 1000;

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #00d4ff, #ff00ff);
    transition: width 0.1s ease;
  }
}

// 滚动指示器
.section-indicator {
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 100;

  .indicator-dot {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      border-color: #00d4ff;
      transform: scale(1.2);
    }

    &.active {
      background: #00d4ff;
      border-color: #00d4ff;
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
    }

    .indicator-label {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.8);
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      color: #fff;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    &:hover .indicator-label {
      opacity: 1;
    }
  }
}
</style>
