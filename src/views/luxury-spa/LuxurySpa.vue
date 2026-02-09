<template>
  <div class="luxury-spa">
    <!-- 3D 背景 -->
    <div ref="canvasContainer" class="canvas-container"></div>

    <!-- 导航栏 -->
    <header class="navbar" :class="{ scrolled: isScrolled }">
      <div class="nav-container">
        <div class="logo">
          <span class="logo-text">AURA</span>
          <span class="logo-sub">Spa & Wellness</span>
        </div>

        <nav class="nav-menu">
          <a v-for="item in navItems" :key="item.id" :href="item.href" class="nav-link" :class="{ active: activeSection === item.id }" @click.prevent="scrollToSection(item.id)">
            {{ item.text }}
          </a>
        </nav>

        <button class="nav-cta" @click="openBooking">
          <span>Book Now</span>
          <div class="btn-shine"></div>
        </button>

        <button class="mobile-menu-toggle" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>

    <!-- 移动端菜单 -->
    <div class="mobile-menu" :class="{ active: mobileMenuOpen }">
      <a v-for="item in navItems" :key="item.id" :href="item.href" class="mobile-nav-link" @click="scrollToSection(item.id); mobileMenuOpen = false">
        {{ item.text }}
      </a>
    </div>

    <!-- Hero 区域 -->
    <section ref="heroSection" class="hero-section">
      <div class="hero-content">
        <div class="hero-tagline">
          <span class="tagline-dot"></span>
          <span>Premium Wellness Experience</span>
        </div>
        <h1 class="hero-title">
          <span class="title-word fade-in" style="animation-delay: 0.2s">WHERE</span>
          <span class="title-word fade-in" style="animation-delay: 0.4s">LUXURY</span>
          <span class="title-word fade-in accent" style="animation-delay: 0.6s">MEETS</span>
          <span class="title-word fade-in" style="animation-delay: 0.8s">SERENITY</span>
        </h1>
        <p class="hero-desc">
          Rediscover your radiance at Aura Spa. We blend cutting-edge aesthetics with timeless tranquility,
          creating a sanctuary where every detail is designed for your comfort and transformation.
        </p>
        <div class="hero-actions">
          <button class="hero-btn primary" @click="openBooking">
            <span>Book Your Experience</span>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <button class="hero-btn secondary" @click="scrollToSection('services')">
            <span>Explore Treatments</span>
          </button>
        </div>

        <!-- 滚动提示 -->
        <div class="scroll-indicator">
          <span class="scroll-text">Scroll to explore</span>
          <div class="scroll-line"></div>
        </div>
      </div>

      <!-- 浮动元素 -->
      <div class="floating-elements">
        <div class="float-circle circle-1"></div>
        <div class="float-circle circle-2"></div>
        <div class="float-circle circle-3"></div>
      </div>
    </section>

    <!-- 关于我们 -->
    <section ref="aboutSection" class="about-section">
      <div class="container">
        <div class="about-grid">
          <div class="about-image">
            <div class="image-frame">
              <div class="image-overlay"></div>
            </div>
            <div class="experience-badge">
              <div class="badge-number">15+</div>
              <div class="badge-text">Years of<br/>Excellence</div>
            </div>
          </div>

          <div class="about-content">
            <span class="section-tag">About Us</span>
            <h2 class="section-title">
              Crafting Moments of
              <span class="accent">Pure Tranquility</span>
            </h2>
            <p class="about-text">
              At Aura Spa, we believe that true beauty comes from within. Our expert team of licensed aestheticians
              and wellness professionals is dedicated to providing personalized treatments that nourish both body and soul.
            </p>
            <p class="about-text">
              Using FDA-approved technologies and premium organic products, we deliver visible results while maintaining
              the highest standards of hygiene and safety. Every visit to our spa is designed to be a transformative
              experience that leaves you feeling rejuvenated, refreshed, and radiantly confident.
            </p>
            <div class="about-stats">
              <div class="stat-item">
                <div class="stat-number">5000+</div>
                <div class="stat-label">Happy Clients</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">98%</div>
                <div class="stat-label">Satisfaction Rate</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">50+</div>
                <div class="stat-label">Expert Treatments</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 服务项目 -->
    <section ref="servicesSection" class="services-section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Our Services</span>
          <h2 class="section-title">
            Signature <span class="accent">Treatments</span>
          </h2>
          <p class="section-desc">
            Discover our range of premium treatments designed to rejuvenate your skin and restore your natural glow.
          </p>
        </div>

        <div class="services-grid">
          <div v-for="service in services" :key="service.id" class="service-card" @mouseenter="onServiceHover(service.id)">
            <div class="service-icon">
              <span>{{ service.icon }}</span>
            </div>
            <h3 class="service-title">{{ service.title }}</h3>
            <p class="service-desc">{{ service.desc }}</p>
            <div class="service-price">
              <span class="price-label">Starting at</span>
              <span class="price-value">{{ service.price }}</span>
            </div>
            <button class="service-btn" @click="openBooking">
              Book Now
              <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <div class="service-glow"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色优势 -->
    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.id" class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path :d="feature.icon"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 评价区域 -->
    <section ref="testimonialsSection" class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Testimonials</span>
          <h2 class="section-title">
            Loved by <span class="accent">Our Clients</span>
          </h2>
          <p class="section-desc">
            Real stories from real clients who have experienced the Aura difference.
          </p>
        </div>

        <div class="testimonials-carousel">
          <div v-for="(testimonial, index) in testimonials" :key="testimonial.id"
               class="testimonial-card"
               :class="{ active: activeTestimonial === index }">
            <div class="testimonial-content">
              <div class="quote-icon">"</div>
              <p class="testimonial-text">{{ testimonial.text }}</p>
              <div class="testimonial-author">
                <div class="author-avatar">{{ testimonial.initials }}</div>
                <div class="author-info">
                  <div class="author-name">{{ testimonial.name }}</div>
                  <div class="author-title">{{ testimonial.title }}</div>
                </div>
              </div>
              <div class="testimonial-rating">
                <span v-for="n in 5" :key="n" class="star">★</span>
              </div>
            </div>
          </div>
        </div>

        <div class="testimonial-dots">
          <button v-for="(testimonial, index) in testimonials"
                  :key="testimonial.id"
                  class="dot"
                  :class="{ active: activeTestimonial === index }"
                  @click="activeTestimonial = index">
          </button>
        </div>
      </div>
    </section>

    <!-- 常见问题 -->
    <section class="faq-section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">FAQ</span>
          <h2 class="section-title">
            Common <span class="accent">Questions</span>
          </h2>
          <p class="section-desc">
            Find answers to frequently asked questions about our treatments and services.
          </p>
        </div>

        <div class="faq-list">
          <div v-for="(faq, index) in faqs" :key="faq.id"
               class="faq-item"
               :class="{ active: activeFaq === index }"
               @click="toggleFaq(index)">
            <div class="faq-question">
              <span>{{ faq.question }}</span>
              <span class="faq-icon" :class="{ open: activeFaq === index }">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </span>
            </div>
            <div class="faq-answer" :style="{ maxHeight: activeFaq === index ? faqAnswerHeight[index] + 'px' : '0px' }">
              <div class="faq-answer-content" ref="faqAnswerContent">
                {{ faq.answer }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 营业时间 -->
    <section class="hours-section">
      <div class="container">
        <div class="hours-content">
          <div class="hours-info">
            <span class="section-tag">Opening Hours</span>
            <h2 class="section-title">Visit Us</h2>
            <p class="hours-subtitle">We're here to serve you seven days a week</p>
          </div>

          <div class="hours-list">
            <div v-for="day in openingHours" :key="day.id" class="hours-item">
              <span class="day-name">{{ day.day }}</span>
              <span class="day-time">{{ day.time }}</span>
            </div>
          </div>

          <button class="hours-cta" @click="openBooking">
            Book Appointment
          </button>
        </div>
      </div>
    </section>

    <!-- 预约弹窗 -->
    <div v-if="showBookingModal" class="modal-overlay" @click.self="showBookingModal = false">
      <div class="booking-modal">
        <button class="modal-close" @click="showBookingModal = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <h2>Book Your Treatment</h2>
        <form class="booking-form" @submit.prevent="submitBooking">
          <div class="form-row">
            <input type="text" placeholder="Full Name" required />
            <input type="tel" placeholder="Phone Number" required />
          </div>
          <input type="email" placeholder="Email Address" required />
          <select required>
            <option value="">Select Service</option>
            <option v-for="service in services" :key="service.id" :value="service.id">
              {{ service.title }}
            </option>
          </select>
          <input type="date" required />
          <textarea placeholder="Additional Notes (optional)" rows="3"></textarea>
          <button type="submit" class="submit-btn">
            <span>Confirm Booking</span>
          </button>
        </form>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="site-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="footer-logo">
              <span class="logo-text">AURA</span>
              <span class="logo-sub">Spa & Wellness</span>
            </div>
            <p class="footer-desc">
              Where luxury meets serenity. Your journey to radiant skin begins here.
            </p>
            <div class="social-links">
              <a href="#" class="social-link">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" class="social-link">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="#" class="social-link">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          <div class="footer-links">
            <div class="links-column">
              <h4>Quick Links</h4>
              <a href="#">About Us</a>
              <a href="#">Services</a>
              <a href="#">Gallery</a>
              <a href="#">FAQ</a>
            </div>
            <div class="links-column">
              <h4>Services</h4>
              <a href="#">Laser Hair Removal</a>
              <a href="#">Facial Treatments</a>
              <a href="#">Body Contouring</a>
              <a href="#">Skincare Products</a>
            </div>
            <div class="links-column">
              <h4>Contact</h4>
              <p class="contact-info">123 Luxury Lane, Downtown</p>
              <p class="contact-info">Vancouver, BC V6B 2W3</p>
              <p class="contact-info">hello@auraspa.com</p>
              <p class="contact-info">(778) 555-0123</p>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2024 Aura Spa & Wellness. All rights reserved.</p>
          <div class="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'

// 响应式数据
const canvasContainer = ref<HTMLElement>()
const heroSection = ref<HTMLElement>()
const aboutSection = ref<HTMLElement>()
const servicesSection = ref<HTMLElement>()
const testimonialsSection = ref<HTMLElement>()
const faqAnswerContent = ref<HTMLElement[]>([])
const faqAnswerHeight = ref<number[]>([])

const isScrolled = ref(false)
const mobileMenuOpen = ref(false)
const activeSection = ref('hero')
const showBookingModal = ref(false)
const activeTestimonial = ref(0)
const activeFaq = ref(-1)

// 导航项
const navItems = [
  { id: 'hero', href: '#hero', text: 'Home' },
  { id: 'about', href: '#about', text: 'About' },
  { id: 'services', href: '#services', text: 'Services' },
  { id: 'testimonials', href: '#testimonials', text: 'Testimonials' },
  { id: 'contact', href: '#contact', text: 'Contact' }
]

// 服务项目
const services = [
  {
    id: 1,
    icon: '✨',
    title: 'Laser Hair Removal',
    desc: 'Smooth, virtually painless hair removal using state-of-the-art Soprano ICE technology.',
    price: '$99'
  },
  {
    id: 2,
    icon: '🌟',
    title: 'OxyGeneo 3-in-1 Facial',
    desc: 'The ultimate facial treatment that exfoliates, oxygenates, and infuses nutrients.',
    price: '$149'
  },
  {
    id: 3,
    icon: '❄️',
    title: 'Fire & Ice Facial',
    desc: 'Powerful resurfacing treatment combining thermal and cooling effects.',
    price: '$179'
  },
  {
    id: 4,
    icon: '🧴',
    title: 'Microneedling',
    desc: 'Collagen induction therapy for smoother, brighter, more youthful skin.',
    price: '$199'
  },
  {
    id: 5,
    icon: '🦋',
    title: 'Dermaplaning',
    desc: 'Gentle exfoliation treatment for instantly smooth and radiant skin.',
    price: '$89'
  },
  {
    id: 6,
    icon: '💆',
    title: 'LED Light Therapy',
    desc: 'Non-invasive treatment using different light wavelengths for skin rejuvenation.',
    price: '$129'
  }
]

// 特色优势
const features = [
  {
    id: 1,
    icon: 'M12 22s8-4 8-10V5l-8 7v10z',
    title: 'Expert Care',
    desc: 'Licensed aestheticians with years of experience and continuous training.'
  },
  {
    id: 2,
    icon: 'M12 22s8-4 8-10V5l-8 7v10z M9 12l2 2 4-4',
    title: 'Premium Quality',
    desc: 'FDA-approved technology and organic products for safe, effective treatments.'
  },
  {
    id: 3,
    icon: 'M12 22s8-4 8-10V5l-8 7v10z M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
    title: 'Clean Environment',
    desc: 'Spa-quality cleanliness and comfort with women-focused design.'
  },
  {
    id: 4,
    icon: 'M12 22s8-4 8-10V5l-8 7v10z M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    title: 'Personalized Approach',
    desc: 'Tailored treatments based on your unique skin needs and goals.'
  }
]

// 客户评价
const testimonials = [
  {
    id: 1,
    text: 'My skin has never looked this smooth and fresh. The aesthetician explained every step, made me feel completely comfortable, and recommended a simple routine that actually works. I\'m already excited for my next visit.',
    name: 'Sarah Johnson',
    initials: 'SJ',
    title: 'Verified Client'
  },
  {
    id: 2,
    text: 'Professional, hygienic, and results-driven. The difference in my skin texture and fine lines is incredible after just a few microneedling sessions. This is now the only place I trust with my skin.',
    name: 'Emily Chen',
    initials: 'EC',
    title: 'Verified Client'
  },
  {
    id: 3,
    text: 'Painless laser hair removal with amazing long-term results. After a few sessions, the reduction in hair growth is dramatic. The staff is friendly, respectful, and very knowledgeable.',
    name: 'Maria Rodriguez',
    initials: 'MR',
    title: 'Verified Client'
  }
]

// 常见问题
const faqs = [
  {
    id: 1,
    question: 'Is laser hair removal safe for all skin types?',
    answer: 'Yes, we use advanced Soprano ICE technology that is safe and effective for all skin tones, with minimal discomfort and no downtime. The treatment is FDA-approved and suitable for all Fitzpatrick skin types.'
  },
  {
    id: 2,
    question: 'How many sessions are needed for results?',
    answer: 'Most clients see significant results after 6-8 sessions, spaced 4-6 weeks apart. The exact number varies based on your hair type, skin type, and treatment area. Our experts will create a personalized plan for you.'
  },
  {
    id: 3,
    question: 'Is there any downtime after facial treatments?',
    answer: 'Most of our facial treatments have little to no downtime. You can return to your daily activities immediately after treatment. Some treatments may cause mild redness that typically subsides within a few hours.'
  },
  {
    id: 4,
    question: 'How long does each treatment take?',
    answer: 'Treatment times vary by service: Laser hair removal sessions typically take 15-60 minutes depending on the area, facial treatments range from 45-90 minutes, and body treatments take 60-120 minutes.'
  },
  {
    id: 5,
    question: 'What should I do before my appointment?',
    answer: 'For laser hair removal, shave the treatment area 24-48 hours before and avoid sun exposure. For facials, arrive with a clean face. We recommend avoiding alcohol and caffeine before any treatment.'
  }
]

// 营业时间
const openingHours = [
  { id: 1, day: 'Monday', time: '9:00 AM - 9:00 PM' },
  { id: 2, day: 'Tuesday', time: '9:00 AM - 9:00 PM' },
  { id: 3, day: 'Wednesday', time: '9:00 AM - 9:00 PM' },
  { id: 4, day: 'Thursday', time: '9:00 AM - 9:00 PM' },
  { id: 5, day: 'Friday', time: '9:00 AM - 9:00 PM' },
  { id: 6, day: 'Saturday', time: '10:00 AM - 7:00 PM' },
  { id: 7, day: 'Sunday', time: '10:00 AM - 6:00 PM' }
]

// Three.js 对象
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let particles: THREE.Points
let torus: THREE.Mesh
let animationId: number

// 初始化 3D 场景
const init3DScene = () => {
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 50

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  if (canvasContainer.value) {
    canvasContainer.value.appendChild(renderer.domElement)
  }

  // 创建粒子
  createParticles()

  // 创建环面
  createTorus()

  animate3D()
}

// 创建粒子
const createParticles = () => {
  const particleCount = 2000
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    const radius = Math.random() * 100
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = radius * Math.cos(phi)

    // 柔和的颜色
    const hue = 0.55 + Math.random() * 0.1 // 青色到浅紫色
    const color = new THREE.Color().setHSL(hue, 0.6, 0.8)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.6
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)
}

// 创建环面
const createTorus = () => {
  const geometry = new THREE.TorusGeometry(15, 0.5, 16, 100)
  const material = new THREE.MeshBasicMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.3
  })
  torus = new THREE.Mesh(geometry, material)
  torus.rotation.x = Math.PI / 2
  scene.add(torus)

  // 添加第二个环面
  const torus2 = new THREE.Mesh(geometry, material)
  torus2.rotation.x = Math.PI / 2
  torus2.rotation.y = Math.PI / 4
  torus2.scale.set(1.2, 1.2, 1.2)
  scene.add(torus2)
}

// 3D 动画
const animate3D = () => {
  animationId = requestAnimationFrame(animate3D)

  // 缓慢旋转粒子
  particles.rotation.y += 0.0002
  particles.rotation.x += 0.0001

  // 旋转环面
  torus.rotation.z += 0.002

  renderer.render(scene, camera)
}

// 初始化 GSAP 动画
const initAnimations = () => {
  // 导航进入动画
  gsap.from('.navbar', {
    y: -100,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  })

  // Hero 标题动画
  gsap.from('.hero-title .title-word', {
    y: 60,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    delay: 0.5,
    ease: 'power3.out'
  })

  gsap.from('.hero-desc', {
    y: 40,
    opacity: 0,
    duration: 1,
    delay: 1.3,
    ease: 'power3.out'
  })

  gsap.from('.hero-actions', {
    y: 40,
    opacity: 0,
    duration: 1,
    delay: 1.5,
    ease: 'power3.out'
  })

  // 浮动圆圈动画
  gsap.to('.float-circle', {
    y: -30,
    duration: 3,
    repeat: -1,
    yoyo: true,
    stagger: 0.5,
    ease: 'sine.inOut'
  })

  // 滚动触发动画 - 关于我们
  gsap.from('.about-image', {
    scrollTrigger: {
      trigger: aboutSection.value,
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    x: -100,
    opacity: 0,
    duration: 1
  })

  gsap.from('.about-content', {
    scrollTrigger: {
      trigger: aboutSection.value,
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    x: 100,
    opacity: 0,
    duration: 1
  })

  // 服务卡片动画
  gsap.from('.service-card', {
    scrollTrigger: {
      trigger: servicesSection.value,
      start: 'top 70%',
      toggleActions: 'play none none reverse'
    },
    y: 80,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15
  })
}

// 滚动到指定区域
const scrollToSection = (sectionId: string) => {
  activeSection.value = sectionId
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// 打开预约
const openBooking = () => {
  showBookingModal.value = true
}

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// 服务悬停
const onServiceHover = (id: number) => {
  // 可以添加更复杂的悬停效果
}

// 切换 FAQ
const toggleFaq = (index: number) => {
  if (activeFaq.value === index) {
    activeFaq.value = -1
  } else {
    activeFaq.value = index
    // 计算答案高度
    setTimeout(() => {
      if (faqAnswerContent.value[index]) {
        faqAnswerHeight.value[index] = faqAnswerContent.value[index].scrollHeight + 40
      }
    }, 0)
  }
}

// 提交预约
const submitBooking = (event: Event) => {
  event.preventDefault()
  // 这里添加提交逻辑
  alert('Thank you for booking! We will contact you shortly.')
  showBookingModal.value = false
}

// 监听滚动
const handleScroll = () => {
  isScrolled.value = window.pageYOffset > 50

  // 更新活动区域
  const sections = ['hero', 'about', 'services', 'testimonials', 'contact']
  for (const section of sections) {
    const element = document.getElementById(section)
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top <= 200 && rect.bottom >= 200) {
        activeSection.value = section
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

// 组件挂载
onMounted(() => {
  init3DScene()
  initAnimations()

  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)

  // 自动轮播评价
  setInterval(() => {
    activeTestimonial.value = (activeTestimonial.value + 1) % testimonials.length
  }, 5000)
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
.luxury-spa {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #faf9f7 0%, #f5f3f0 50%, #e8e4df 100%);
  font-family: 'Playfair Display', Georgia, serif;
  color: #2c2c2c;
  overflow-x: hidden;
}

// 3D 画布
.canvas-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

// 导航栏
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 20px 40px;
  transition: all 0.3s ease;

  &.scrolled {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 30px rgba(0, 0, 0, 0.1);
    padding: 15px 40px;
  }
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  flex-direction: column;

  .logo-text {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 4px;
    color: #2c2c2c;
  }

  .logo-sub {
    font-size: 10px;
    letter-spacing: 2px;
    color: #888;
    text-transform: uppercase;
  }
}

.nav-menu {
  display: flex;
  gap: 40px;

  .nav-link {
    position: relative;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #666;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover,
    &.active {
      color: #2c2c2c;

      &::after {
        width: 100%;
      }
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #c9a87c, #d4b896);
      transition: width 0.3s ease;
    }
  }
}

.nav-cta {
  position: relative;
  padding: 12px 32px;
  background: linear-gradient(135deg, #c9a87c, #b89a7a);
  border: none;
  border-radius: 30px;
  color: #fff;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(201, 168, 124, 0.4);
  }

  .btn-shine {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transform: rotate(45deg);
    animation: shine 3s infinite;
  }
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;

  span {
    width: 25px;
    height: 2px;
    background: #2c2c2c;
    transition: all 0.3s ease;
  }
}

// 移动端菜单
.mobile-menu {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  z-index: 999;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  transform: translateX(100%);
  transition: transform 0.3s ease;

  &.active {
    transform: translateX(0);
  }

  .mobile-nav-link {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 24px;
    color: #2c2c2c;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #c9a87c;
    }
  }
}

// Hero 区域
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 40px;
  z-index: 1;
}

.hero-content {
  max-width: 900px;
  text-align: center;
}

.hero-tagline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  background: rgba(201, 168, 124, 0.1);
  border: 1px solid rgba(201, 168, 124, 0.3);
  border-radius: 30px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #c9a87c;
  margin-bottom: 40px;

  .tagline-dot {
    width: 8px;
    height: 8px;
    background: #c9a87c;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
}

.hero-title {
  font-size: clamp(48px, 8vw, 72px);
  font-weight: 400;
  line-height: 1.1;
  margin-bottom: 30px;
  letter-spacing: -1px;

  .title-word {
    display: block;
    opacity: 0;

    &.accent {
      color: #c9a87c;
      font-style: italic;
    }
  }
}

.hero-desc {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 18px;
  line-height: 1.8;
  color: #666;
  max-width: 600px;
  margin: 0 auto 40px;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 60px;
}

.hero-btn {
  position: relative;
  padding: 16px 40px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &.primary {
    background: linear-gradient(135deg, #c9a87c, #b89a7a);
    border: none;
    color: #fff;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(201, 168, 124, 0.4);
    }
  }

  &.secondary {
    background: transparent;
    border: 2px solid #c9a87c;
    color: #c9a87c;

    &:hover {
      background: rgba(201, 168, 124, 0.1);
      transform: translateY(-3px);
    }
  }

  .arrow-icon {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
  }

  &:hover .arrow-icon {
    transform: translateX(5px);
  }
}

.scroll-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  .scroll-text {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #888;
  }

  .scroll-line {
    width: 1px;
    height: 60px;
    background: linear-gradient(to bottom, #c9a87c, transparent);
    animation: scrollPulse 2s infinite;
  }
}

// 浮动元素
.floating-elements {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;

  .float-circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;

    &.circle-1 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, #c9a87c, transparent);
      top: 10%;
      left: 5%;
    }

    &.circle-2 {
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, #d4b896, transparent);
      top: 60%;
      right: 10%;
    }

    &.circle-3 {
      width: 150px;
      height: 150px;
      background: radial-gradient(circle, #e8d4c4, transparent);
      bottom: 20%;
      left: 30%;
    }
  }
}

// 容器
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

// 通用部分样式
section {
  position: relative;
  padding: 100px 0;
  z-index: 1;
}

.section-tag {
  display: inline-block;
  padding: 8px 20px;
  background: rgba(201, 168, 124, 0.1);
  border: 1px solid rgba(201, 168, 124, 0.3);
  border-radius: 30px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #c9a87c;
  margin-bottom: 20px;
}

.section-title {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 400;
  margin-bottom: 20px;

  .accent {
    color: #c9a87c;
    font-style: italic;
  }
}

.section-desc {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #666;
  max-width: 600px;
  margin: 0 auto 60px;
}

// 关于我们
.about-section {
  background: #fff;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.about-image {
  position: relative;

  .image-frame {
    position: relative;
    aspect-ratio: 4/5;
    background: linear-gradient(135deg, #f5f3f0, #e8e4df);
    border-radius: 20px;
    overflow: hidden;

    .image-overlay {
      position: absolute;
      inset: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50%" x="50%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="12" fill="%23c9a87c">Luxury Spa</text></svg>') center/cover no-repeat;
    }
  }

  .experience-badge {
    position: absolute;
    bottom: 40px;
    right: -40px;
    width: 140px;
    height: 140px;
    background: #c9a87c;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    text-align: center;

    .badge-number {
      font-size: 36px;
      font-weight: 700;
      line-height: 1;
    }

    .badge-text {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
}

.about-content {
  .section-tag {
    margin-bottom: 30px;
  }

  .about-text {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.8;
    color: #666;
    margin-bottom: 20px;
  }

  .about-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    margin-top: 50px;

    .stat-item {
      text-align: center;

      .stat-number {
        font-size: 42px;
        font-weight: 700;
        color: #c9a87c;
        line-height: 1;
        margin-bottom: 10px;
      }

      .stat-label {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-size: 13px;
        color: #888;
      }
    }
  }
}

// 服务项目
.services-section {
  background: linear-gradient(135deg, #faf9f7, #f5f3f0);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.service-card {
  position: relative;
  padding: 50px 40px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(201, 168, 124, 0.2);

    .service-glow {
      opacity: 1;
    }
  }

  .service-icon {
    font-size: 48px;
    margin-bottom: 25px;
  }

  .service-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 15px;
  }

  .service-desc {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.7;
    color: #666;
    margin-bottom: 25px;
  }

  .service-price {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 25px;
    font-family: 'Helvetica Neue', Arial, sans-serif;

    .price-label {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
    }

    .price-value {
      font-size: 24px;
      font-weight: 700;
      color: #c9a87c;
    }
  }

  .service-btn {
    position: relative;
    padding: 12px 24px;
    background: transparent;
    border: 2px solid #c9a87c;
    border-radius: 30px;
    color: #c9a87c;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    .btn-arrow {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: #c9a87c;
      color: #fff;
    }
  }

  .service-glow {
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, #c9a87c, #d4b896);
    border-radius: 22px;
    z-index: -1;
    filter: blur(20px);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
}

// 特色优势
.features-section {
  padding: 80px 0;
  background: #fff;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
}

.feature-item {
  text-align: center;
  padding: 40px 20px;

  .feature-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 25px;
    background: rgba(201, 168, 124, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 40px;
      height: 40px;
      stroke: #c9a87c;
      stroke-width: 2;
    }
  }

  .feature-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 15px;
  }

  .feature-desc {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.7;
    color: #666;
  }
}

// 评价区域
.testimonials-section {
  background: linear-gradient(135deg, #faf9f7, #f5f3f0);
}

.testimonials-carousel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 40px;
}

.testimonial-card {
  background: #fff;
  border-radius: 20px;
  padding: 50px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
  opacity: 0.5;
  transform: scale(0.95);

  &.active {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 20px 60px rgba(201, 168, 124, 0.2);
  }

  .testimonial-content {
    position: relative;
  }

  .quote-icon {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 80px;
    font-family: Georgia, serif;
    color: #f0ebe8;
    line-height: 1;
  }

  .testimonial-text {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    line-height: 1.8;
    color: #555;
    margin-bottom: 30px;
    padding-left: 20px;
  }

  .testimonial-author {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;

    .author-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c9a87c, #d4b896);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 600;
      font-size: 18px;
    }

    .author-info {
      .author-name {
        font-weight: 600;
        font-size: 16px;
      }

      .author-title {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-size: 12px;
        color: #888;
      }
    }
  }

  .testimonial-rating {
    color: #ffd700;
    font-size: 20px;
    letter-spacing: 2px;
  }
}

.testimonial-dots {
  display: flex;
  justify-content: center;
  gap: 10px;

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ddd;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      background: #c9a87c;
      transform: scale(1.2);
    }
  }
}

// 常见问题
.faq-section {
  background: #fff;
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.3s ease;

  &.active {
    .faq-icon {
      transform: rotate(180deg);
    }
  }

  .faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px 0;
    font-size: 18px;
    font-weight: 600;
    font-family: 'Helvetica Neue', Arial, sans-serif;

    .faq-icon {
      width: 24px;
      height: 24px;
      transition: transform 0.3s ease;

      svg {
        width: 24px;
        height: 24px;
        stroke: #c9a87c;
      }
    }
  }

  .faq-answer {
    overflow: hidden;
    transition: max-height 0.3s ease;

    .faq-answer-content {
      padding-bottom: 25px;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 15px;
      line-height: 1.8;
      color: #666;
    }
  }
}

// 营业时间
.hours-section {
  background: linear-gradient(135deg, #c9a87c, #d4b896);
  color: #fff;

  .section-tag {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
  }

  .section-title {
    color: #fff;
  }

  .hours-subtitle {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    opacity: 0.9;
  }
}

.hours-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;

  .hours-info {
    margin-bottom: 50px;
  }

  .hours-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 50px;

    .hours-item {
      display: flex;
      justify-content: space-between;
      padding: 15px 25px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      font-family: 'Helvetica Neue', Arial, sans-serif;

      .day-name {
        font-weight: 600;
      }
    }
  }

  .hours-cta {
    padding: 16px 48px;
    background: #fff;
    border: none;
    border-radius: 30px;
    color: #c9a87c;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
    }
  }
}

// 预约弹窗
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.booking-modal {
  position: relative;
  width: 90%;
  max-width: 500px;
  background: #fff;
  border-radius: 20px;
  padding: 50px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);

  .modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background: #f5f3f0;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    svg {
      width: 20px;
      height: 20px;
      stroke: #666;
    }

    &:hover {
      background: #e8e4df;
    }
  }

  h2 {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 40px;
    text-align: center;
  }

  .booking-form {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    input,
    select,
    textarea {
      width: 100%;
      padding: 16px 20px;
      background: #f5f3f0;
      border: 1px solid #e8e4df;
      border-radius: 10px;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      color: #2c2c2c;
      transition: all 0.3s ease;

      &::placeholder {
        color: #888;
      }

      &:focus {
        outline: none;
        border-color: #c9a87c;
        background: #fff;
      }
    }

    .submit-btn {
      padding: 16px;
      background: linear-gradient(135deg, #c9a87c, #b89a7a);
      border: none;
      border-radius: 10px;
      color: #fff;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(201, 168, 124, 0.4);
      }
    }
  }
}

// 页脚
.site-footer {
  background: #2c2c2c;
  color: #fff;
  padding: 80px 0 30px;

  .footer-content {
    display: grid;
    grid-template-columns: 1.5fr repeat(3, 1fr);
    gap: 60px;
    margin-bottom: 60px;
  }

  .footer-brand {
    .footer-logo {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;

      .logo-text {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 4px;
      }

      .logo-sub {
        font-size: 10px;
        letter-spacing: 2px;
        color: #888;
        text-transform: uppercase;
      }
    }

    .footer-desc {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.7;
      color: #888;
      margin-bottom: 30px;
    }

    .social-links {
      display: flex;
      gap: 15px;

      .social-link {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;

        svg {
          width: 18px;
          height: 18px;
        }

        &:hover {
          background: #c9a87c;
          transform: translateY(-3px);
        }
      }
    }
  }

  .footer-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;

    .links-column {
      h4 {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 25px;
        color: #fff;
      }

      a {
        display: block;
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-size: 14px;
        color: #888;
        text-decoration: none;
        margin-bottom: 12px;
        transition: color 0.3s ease;

        &:hover {
          color: #c9a87c;
        }
      }

      .contact-info {
        font-size: 14px;
        color: #888;
        margin-bottom: 12px;
      }
    }
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 13px;
    color: #666;

    .footer-legal {
      display: flex;
      gap: 30px;

      a {
        color: #888;
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
          color: #c9a87c;
        }
      }
    }
  }
}

// 动画
@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
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

@keyframes scrollPulse {
  0%, 100% {
    opacity: 1;
    transform: scaleY(1);
  }
  50% {
    opacity: 0.5;
    transform: scaleY(0.8);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式
@media (max-width: 1200px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .testimonials-carousel {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 15px 20px;
  }

  .nav-menu {
    display: none;
  }

  .mobile-menu {
    display: flex;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .about-grid {
    grid-template-columns: 1fr;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .hours-list {
    grid-template-columns: 1fr;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .footer-links {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    flex-direction: column;
  }
}
</style>
