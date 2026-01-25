/**
 * TaichiThreeBridge 完整示例
 *
 * 演示如何使用桥接器创建：
 * 1. 粒子系统
 * 2. 实例化网格
 * 3. 纹理可视化
 * 4. 性能监控
 */

import * as ti from 'taichi.js'
import * as THREE from 'three'
import TaichiThreeBridge from '@/utils/TaichiThreeBridge'

// 配置
const PARTICLE_COUNT = 10000
const INSTANCED_COUNT = 1000
const TEXTURE_SIZE = 512

export class TaichiThreeBridgeExample {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private bridge: TaichiThreeBridge

  // Taichi 字段
  private particlePositions!: ti.Field
  private particleVelocities!: ti.Field
  private particleColors!: ti.Field

  private instancedPositions!: ti.Field
  private instancedColors!: ti.Field
  private instancedScales!: ti.Field

  private densityField!: ti.Field

  // Three.js 对象
  private particleSystem!: THREE.Points
  private instancedMesh!: THREE.InstancedMesh
  private densityPlane!: THREE.Mesh
  private performanceDisplay!: HTMLElement

  // 更新 kernels
  private updateParticles!: any
  private updateInstanced!: any
  private updateDensity!: any

  constructor() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.z = 20

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    document.body.appendChild(this.renderer.domElement)

    this.bridge = new TaichiThreeBridge(this.renderer, {
      mode: 'auto',
      enablePerformanceMonitor: true,
      targetFps: 60
    })
  }

  async init(): Promise<void> {
    console.log('初始化 Taichi.js...')
    await ti.init()

    console.log('创建字段...')
    await this.createFields()

    console.log('创建更新 kernels...')
    this.createUpdateKernels()

    console.log('初始化字段数据...')
    await this.initializeFields()

    console.log('创建 Three.js 对象...')
    this.createThreeObjects()

    console.log('添加灯光...')
    this.setupLighting()

    console.log('创建性能显示...')
    this.createPerformanceDisplay()

    console.log('初始化完成！')
  }

  private async createFields(): Promise<void> {
    // 粒子系统字段
    this.particlePositions = ti.Vector.field(3, ti.f32, [PARTICLE_COUNT])
    this.particleVelocities = ti.Vector.field(3, ti.f32, [PARTICLE_COUNT])
    this.particleColors = ti.Vector.field(3, ti.f32, [PARTICLE_COUNT])

    // 实例化网格字段
    this.instancedPositions = ti.Vector.field(3, ti.f32, [INSTANCED_COUNT])
    this.instancedColors = ti.Vector.field(3, ti.f32, [INSTANCED_COUNT])
    this.instancedScales = ti.Vector.field(3, ti.f32, [INSTANCED_COUNT])

    // 密度场
    this.densityField = ti.field(ti.f32, [TEXTURE_SIZE, TEXTURE_SIZE])

    // 添加到 kernel 作用域
    ti.addToKernelScope({
      particlePositions: this.particlePositions,
      particleVelocities: this.particleVelocities,
      particleColors: this.particleColors,
      instancedPositions: this.instancedPositions,
      instancedColors: this.instancedColors,
      instancedScales: this.instancedScales,
      densityField: this.densityField
    })
  }

  private createUpdateKernels(): void {
    // 粒子更新 kernel
    this.updateParticles = ti.kernel((time: number) => {
      for (let i of ti.range(PARTICLE_COUNT)) {
        // 更新位置
        this.particlePositions[i] = [
          this.particlePositions[i][0] + this.particleVelocities[i][0] * 0.01,
          this.particlePositions[i][1] + this.particleVelocities[i][1] * 0.01,
          this.particlePositions[i][2] + this.particleVelocities[i][2] * 0.01
        ]

        // 边界反弹
        if (this.particlePositions[i][0] > 15) {
          this.particleVelocities[i][0] *= -1
          this.particlePositions[i] = [15, this.particlePositions[i][1], this.particlePositions[i][2]]
        }
        if (this.particlePositions[i][0] < -15) {
          this.particleVelocities[i][0] *= -1
          this.particlePositions[i] = [-15, this.particlePositions[i][1], this.particlePositions[i][2]]
        }
        if (this.particlePositions[i][1] > 15) {
          this.particleVelocities[i][1] *= -1
          this.particlePositions[i] = [this.particlePositions[i][0], 15, this.particlePositions[i][2]]
        }
        if (this.particlePositions[i][1] < -15) {
          this.particleVelocities[i][1] *= -1
          this.particlePositions[i] = [this.particlePositions[i][0], -15, this.particlePositions[i][2]]
        }
        if (this.particlePositions[i][2] > 15) {
          this.particleVelocities[i][2] *= -1
          this.particlePositions[i] = [this.particlePositions[i][0], this.particlePositions[i][1], 15]
        }
        if (this.particlePositions[i][2] < -15) {
          this.particleVelocities[i][2] *= -1
          this.particlePositions[i] = [this.particlePositions[i][0], this.particlePositions[i][1], -15]
        }

        // 根据位置更新颜色
        this.particleColors[i] = [
          (this.particlePositions[i][0] + 15) / 30,
          (this.particlePositions[i][1] + 15) / 30,
          (this.particlePositions[i][2] + 15) / 30
        ]
      }
    })

    // 实例化更新 kernel
    this.updateInstanced = ti.kernel((time: number) => {
      for (let i of ti.range(INSTANCED_COUNT)) {
        // 旋转运动
        const angle = time + i * 0.01
        const radius = 5 + i * 0.005

        this.instancedPositions[i] = [
          Math.cos(angle) * radius,
          Math.sin(angle * 2) * radius * 0.5,
          Math.sin(angle) * radius
        ]

        // 动态颜色
        this.instancedColors[i] = [
          0.5 + 0.5 * Math.sin(angle + i * 0.1),
          0.5 + 0.5 * Math.cos(angle + i * 0.1),
          0.5 + 0.5 * Math.sin(angle * 2 + i * 0.1)
        ]

        // 动态缩放
        this.instancedScales[i] = [
          1 + 0.3 * Math.sin(angle * 3),
          1 + 0.3 * Math.cos(angle * 3),
          1 + 0.3 * Math.sin(angle * 4)
        ]
      }
    })

    // 密度场更新 kernel
    this.updateDensity = ti.kernel((time: number) => {
      for (let i of ti.range(TEXTURE_SIZE)) {
        for (let j of ti.range(TEXTURE_SIZE)) {
          const x = i / TEXTURE_SIZE
          const y = j / TEXTURE_SIZE

          const value = Math.sin(x * 10 + time) * Math.cos(y * 10 + time) +
                        0.5 * Math.sin(x * 20 + time * 2) * Math.cos(y * 20 - time) +
                        0.3 * Math.sin(x * 30 - time) * Math.cos(y * 30 + time * 1.5)

          this.densityField[i, j] = (value + 1) * 0.5
        }
      }
    })
  }

  private async initializeFields(): Promise<void> {
    // 初始化粒子
    const initParticles = ti.kernel(() => {
      for (let i of ti.range(PARTICLE_COUNT)) {
        this.particlePositions[i] = [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ]
        this.particleVelocities[i] = [
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ]
        this.particleColors[i] = [1, 1, 1]
      }
    })
    await initParticles()

    // 初始化实例化
    const initInstanced = ti.kernel(() => {
      for (let i of ti.range(INSTANCED_COUNT)) {
        this.instancedPositions[i] = [0, 0, 0]
        this.instancedColors[i] = [1, 1, 1]
        this.instancedScales[i] = [1, 1, 1]
      }
    })
    await initInstanced()

    // 初始化密度场
    const initDensity = ti.kernel(() => {
      for (let i of ti.range(TEXTURE_SIZE)) {
        for (let j of ti.range(TEXTURE_SIZE)) {
          this.densityField[i, j] = 0
        }
      }
    })
    await initDensity()
  }

  private async createThreeObjects(): Promise<void> {
    // 创建粒子系统（使用桥接器）
    this.particleSystem = await this.bridge.createParticleSystem(
      this.particlePositions,
      this.particleColors,
      {
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      }
    )
    this.scene.add(this.particleSystem)

    // 创建实例化网格
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
    const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })
    this.instancedMesh = await this.bridge.createInstancedMeshSystem(
      boxGeometry,
      boxMaterial,
      this.instancedPositions,
      this.instancedColors,
      INSTANCED_COUNT
    )
    this.instancedMesh.position.x = 20
    this.scene.add(this.instancedMesh)

    // 创建密度场可视化
    const densityTexture = await this.bridge.createDataTexture(
      this.densityField,
      TEXTURE_SIZE,
      TEXTURE_SIZE,
      {
        format: THREE.RedFormat,
        type: THREE.FloatType,
        flipY: false
      }
    )

    const planeGeometry = new THREE.PlaneGeometry(10, 10)
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: densityTexture,
      side: THREE.DoubleSide
    })
    this.densityPlane = new THREE.Mesh(planeGeometry, planeMaterial)
    this.densityPlane.position.x = -20
    this.scene.add(this.densityPlane)
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0x404040)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    this.scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0xffffff, 1, 100)
    pointLight.position.set(0, 10, 0)
    this.scene.add(pointLight)
  }

  private createPerformanceDisplay(): void {
    this.performanceDisplay = document.createElement('div')
    this.performanceDisplay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
      z-index: 1000;
    `
    document.body.appendChild(this.performanceDisplay)
  }

  private updatePerformanceDisplay(): void {
    const perf = this.bridge.getPerformance()
    this.performanceDisplay.innerHTML = `
      <div><strong>性能监控</strong></div>
      <div>FPS: ${perf.fps.toFixed(1)}</div>
      <div>帧时间: ${perf.frameTime.toFixed(2)} ms</div>
      <div>传输时间: ${perf.transferTime.toFixed(2)} ms</div>
      <div>传输模式: ${perf.mode}</div>
      <div>数据大小: ${(perf.dataSize / 1024).toFixed(2)} KB</div>
    `
  }

  async animate(): Promise<void> {
    const time = Date.now() * 0.001

    // 更新 Taichi
    await this.updateParticles(time)
    await this.updateInstanced(time)
    await this.updateDensity(time)

    // 同步数据到 Three.js（使用桥接器）
    await this.bridge.updateParticleSystem(
      this.particleSystem,
      this.particlePositions,
      this.particleColors
    )

    await this.bridge.updateInstancedMeshSystem(
      this.instancedMesh,
      this.instancedPositions,
      this.instancedColors,
      this.instancedScales
    )

    await this.bridge.syncFieldToTexture(this.densityField, this.densityPlane.material.map)

    // 更新性能显示
    this.updatePerformanceDisplay()

    // 渲染
    this.renderer.render(this.scene, this.camera)

    // 下一帧
    requestAnimationFrame(() => this.animate())
  }

  start(): void {
    this.animate()
  }

  dispose(): void {
    this.bridge.dispose()
    this.renderer.dispose()
  }
}

// 使用示例
export async function startExample(): Promise<void> {
  const example = new TaichiThreeBridgeExample()
  await example.init()
  example.start()

  // 窗口大小调整
  window.addEventListener('resize', () => {
    example.camera.aspect = window.innerWidth / window.innerHeight
    example.camera.updateProjectionMatrix()
    example.renderer.setSize(window.innerWidth, window.innerHeight)
  })
}

// 导出以便在其他地方使用
export default TaichiThreeBridgeExample
