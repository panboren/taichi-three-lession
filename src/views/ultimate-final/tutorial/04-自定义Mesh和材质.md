# 教程4: 自定义 Mesh 和材质 - 丰富的视觉效果

## 概述

本教程讲解如何自定义 Three.js 的 Mesh 和材质,将 Taichi 生成的纹理应用到各种几何体上,创建更丰富的视觉效果。

## 默认 Mesh

桥接器默认创建一个平面 Mesh:

```typescript
// 默认创建的 Mesh
private createDefaultMesh(): void {
  const material = new THREE.MeshBasicMaterial({
    map: this.texture,
    transparent: true,
    side: THREE.DoubleSide
  })

  const geometry = new THREE.PlaneGeometry(2, 2)
  this.mesh = new THREE.Mesh(geometry, material)
  this.scene.add(this.mesh)
}
```

## 实例1: 替换为球体

```typescript
import * as THREE from 'three'
import { UltimateTaichiThreeBridge } from '../js/UltimateTaichiThreeBridge'

// 创建场景
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

camera.position.z = 3

// 创建 Taichi 引擎
const taichiEngine = {
  async getPixelData() {
    const width = 512
    const height = 512
    const data = new Uint8Array(width * height * 4)
    const time = performance.now() * 0.001

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        const nx = (x / width) - 0.5
        const ny = (y / height) - 0.5
        const dist = Math.sqrt(nx * nx + ny * ny)

        const pattern = Math.sin(dist * 20 - time * 3)
        data[i] = Math.floor(127 + 127 * pattern)
        data[i + 1] = Math.floor(100 + 100 * Math.cos(time * 2))
        data[i + 2] = Math.floor(200 - 100 * pattern)
        data[i + 3] = 255
      }
    }
    return data.buffer
  }
}

// 创建桥接器
const bridge = new UltimateTaichiThreeBridge({
  renderer,
  scene,
  camera,
  width: 512,
  height: 512,
  mode: 'canvas-texture'
})

await bridge.init(taichiEngine)

// 创建自定义球体 Mesh
const sphereGeometry = new THREE.SphereGeometry(1, 64, 64)
const sphereMaterial = new THREE.MeshBasicMaterial({
  map: bridge.texture,  // 使用桥接器的纹理
  transparent: true
})

const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
scene.add(sphere)

// 替换桥接器的默认 Mesh
bridge.setMesh(sphere)

// 渲染循环
function animate(time: number) {
  requestAnimationFrame(animate)

  // 旋转球体
  sphere.rotation.y += 0.005
  sphere.rotation.x += 0.002

  bridge.step(time)
  renderer.render(scene, camera)
}

animate(0)
```

## 实例2: 多个 Mesh 共享纹理

```typescript
// 创建多个不同形状的 Mesh
const shapes = []

// 1. 立方体
const cubeGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8)
const cubeMaterial = new THREE.MeshBasicMaterial({ map: bridge.texture })
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
cube.position.set(-2, 0, 0)
shapes.push(cube)
scene.add(cube)

// 2. 圆锥体
const coneGeometry = new THREE.ConeGeometry(0.5, 1, 32)
const coneMaterial = new THREE.MeshBasicMaterial({ map: bridge.texture })
const cone = new THREE.Mesh(coneGeometry, coneMaterial)
cone.position.set(0, 0, 0)
shapes.push(cone)
scene.add(cone)

// 3. 环形结
const torusGeometry = new THREE.TorusKnotGeometry(0.4, 0.15, 100, 16)
const torusMaterial = new THREE.MeshBasicMaterial({ map: bridge.texture })
const torus = new THREE.Mesh(torusGeometry, torusMaterial)
torus.position.set(2, 0, 0)
shapes.push(torus)
scene.add(torus)

// 渲染循环
function animate(time: number) {
  requestAnimationFrame(animate)

  // 不同的旋转速度
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01

  cone.rotation.y += 0.02

  torus.rotation.x += 0.005
  torus.rotation.z += 0.01

  bridge.step(time)
  renderer.render(scene, camera)
}

animate(0)
```

## 实例3: 使用 Shader 材质

```typescript
// 创建自定义 Shader 材质
const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: bridge.texture },
    uColor: { value: new THREE.Color(0xffffff) }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform sampler2D uTexture;
    uniform vec3 uColor;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      // 获取纹理颜色
      vec4 texColor = texture2D(uTexture, vUv);

      // 添加法线光照
      float light = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))) * 0.5 + 0.5;

      // 添加边缘光效果
      float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
      rim = pow(rim, 3.0);

      // 组合效果
      vec3 finalColor = texColor.rgb * uColor * light + rim * vec3(0.5, 0.5, 1.0);

      gl_FragColor = vec4(finalColor, texColor.a);
    }
  `,
  transparent: true
})

// 创建球体
const sphereGeometry = new THREE.SphereGeometry(1, 64, 64)
const sphere = new THREE.Mesh(sphereGeometry, shaderMaterial)
scene.add(sphere)

// 在渲染循环中更新 Uniforms
function animate(time: number) {
  requestAnimationFrame(animate)

  // 更新时间
  shaderMaterial.uniforms.uTime.value = time * 0.001

  // 旋转球体
  sphere.rotation.y += 0.005

  bridge.step(time)
  renderer.render(scene, camera)
}

animate(0)
```

## 实例4: 物理材质 (PBR)

```typescript
// 创建物理材质
const pbrMaterial = new THREE.MeshStandardMaterial({
  map: bridge.texture,           // 基础颜色贴图
  roughness: 0.3,                 // 粗糙度
  metalness: 0.5,                 // 金属度
  emissive: bridge.texture,       // 自发光
  emissiveIntensity: 0.2,         // 自发光强度
  transparent: true,
  side: THREE.DoubleSide
})

// 创建几何体
const geometry = new THREE.TorusGeometry(1, 0.3, 32, 100)
const mesh = new THREE.Mesh(geometry, pbrMaterial)
scene.add(mesh)

// 添加灯光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

const pointLight1 = new THREE.PointLight(0x00ff88, 1, 100)
pointLight1.position.set(5, 5, 5)
scene.add(pointLight1)

const pointLight2 = new THREE.PointLight(0x0088ff, 1, 100)
pointLight2.position.set(-5, -5, 5)
scene.add(pointLight2)

// 渲染循环
function animate(time: number) {
  requestAnimationFrame(animate)

  mesh.rotation.x += 0.01
  mesh.rotation.y += 0.01

  bridge.step(time)
  renderer.render(scene, camera)
}

animate(0)
```

## 实例5: 粒子系统纹理

```typescript
// 创建粒子系统
const particleCount = 10000
const positions = new Float32Array(particleCount * 3)
const colors = new Float32Array(particleCount * 3)

// 随机分布粒子
for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  const r = 2 + Math.random() * 1

  positions[i3] = r * Math.sin(phi) * Math.cos(theta)
  positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
  positions[i3 + 2] = r * Math.cos(phi)

  colors[i3] = Math.random()
  colors[i3 + 1] = Math.random()
  colors[i3 + 2] = Math.random()
}

const particleGeometry = new THREE.BufferGeometry()
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

// 使用 Taichi 纹理作为粒子贴图
const particleMaterial = new THREE.PointsMaterial({
  size: 0.05,
  map: bridge.texture,        // 应用桥接器纹理
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  depthWrite: false
})

const particles = new THREE.Points(particleGeometry, particleMaterial)
scene.add(particles)

// 渲染循环
function animate(time: number) {
  requestAnimationFrame(animate)

  // 旋转粒子系统
  particles.rotation.y += 0.002
  particles.rotation.x += 0.001

  bridge.step(time)
  renderer.render(scene, camera)
}

animate(0)
```

## 实例6: 动态纹理更新

```typescript
// 创建多个 Mesh,动态切换纹理
const mesh1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ map: bridge.texture })
)
mesh1.position.set(-1.5, 0, 0)
scene.add(mesh1)

const mesh2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.7, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
)
mesh2.position.set(0, 0, 0)
scene.add(mesh2)

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.5, 0.2, 64, 8),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
)
mesh3.position.set(1.5, 0, 0)
scene.add(mesh3)

// 定期切换哪个 Mesh 使用桥接器纹理
let currentMesh = 0
const meshes = [mesh1, mesh2, mesh3]

setInterval(() => {
  // 重置所有 Mesh 的材质
  meshes.forEach((mesh, i) => {
    if (i !== currentMesh) {
      ;(mesh.material as THREE.MeshBasicMaterial).map = null
      mesh.material.needsUpdate = true
    }
  })

  // 设置当前 Mesh 的材质
  const activeMesh = meshes[currentMesh]
  if ('map' in activeMesh.material) {
    ;(activeMesh.material as THREE.MeshBasicMaterial).map = bridge.texture
    activeMesh.material.needsUpdate = true
  }

  currentMesh = (currentMesh + 1) % meshes.length
  console.log(`切换到 Mesh ${currentMesh}`)
}, 2000)

// 渲染循环
function animate(time: number) {
  requestAnimationFrame(animate)

  meshes.forEach((mesh, i) => {
    mesh.rotation.x += 0.01 * (i + 1)
    mesh.rotation.y += 0.01 * (i + 1)
  })

  bridge.step(time)
  renderer.render(scene, camera)
}

animate(0)
```

## 实例7: 纹理动画与变形

```typescript
// 创建变形动画的 Mesh
class MorphingMesh {
  private geometries: THREE.BufferGeometry[]
  private currentGeometry: number = 0
  private mesh: THREE.Mesh

  constructor(bridge: UltimateTaichiThreeBridge) {
    // 创建不同的几何体
    this.geometries = [
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.TorusGeometry(0.8, 0.3, 16, 50),
      new THREE.OctahedronGeometry(1.2)
    ]

    const material = new THREE.MeshBasicMaterial({
      map: bridge.texture,
      transparent: true,
      wireframe: false
    })

    this.mesh = new THREE.Mesh(this.geometries[0], material)
  }

  // 平滑过渡到下一个几何体
  morphTo(index: number) {
    this.currentGeometry = index
    this.mesh.geometry = this.geometries[index]
  }

  // 获取 Mesh
  getMesh(): THREE.Mesh {
    return this.mesh
  }
}

const morphingMesh = new MorphingMesh(bridge)
scene.add(morphingMesh.getMesh())

// 自动变形
let morphIndex = 0
setInterval(() => {
  morphIndex = (morphIndex + 1) % 4
  morphingMesh.morphTo(morphIndex)
}, 3000)

// 渲染循环
function animate(time: number) {
  requestAnimationFrame(animate)

  const mesh = morphingMesh.getMesh()
  mesh.rotation.y += 0.01
  mesh.rotation.x += 0.005

  bridge.step(time)
  renderer.render(scene, camera)
}

animate(0)
```

## 实例8: 多层纹理混合

```typescript
// 创建多层纹理效果
const layers = []

// 第1层: 基础层
const layer1 = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.MeshBasicMaterial({
    map: bridge.texture,
    transparent: true,
    opacity: 1.0,
    blending: THREE.NormalBlending
  })
)
layer1.position.z = -2
layers.push(layer1)
scene.add(layer1)

// 第2层: 混合层
const layer2 = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2),
  new THREE.MeshBasicMaterial({
    map: bridge.texture,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
  })
)
layer2.position.z = -1.5
layers.push(layer2)
scene.add(layer2)

// 第3层: 顶层
const layer3 = new THREE.Mesh(
  new THREE.PlaneGeometry(2.4, 2.4),
  new THREE.MeshBasicMaterial({
    map: bridge.texture,
    transparent: true,
    opacity: 0.3,
    blending: THREE.ScreenBlending
  })
)
layer3.position.z = -1
layers.push(layer3)
scene.add(layer3)

// 渲染循环
function animate(time: number) {
  requestAnimationFrame(animate)

  // 不同的旋转速度
  layer1.rotation.z = time * 0.0001
  layer2.rotation.z = -time * 0.0002
  layer3.rotation.z = time * 0.0003

  bridge.step(time)
  renderer.render(scene, camera)
}

animate(0)
```

## 最佳实践

1. **材质选择**:
   - `MeshBasicMaterial`: 最简单,无光照
   - `MeshStandardMaterial`: 支持 PBR,有真实感
   - `MeshShaderMaterial`: 自定义效果,最灵活

2. **纹理参数**:
   ```typescript
   texture.minFilter = THREE.LinearFilter  // 缩小采样
   texture.magFilter = THREE.LinearFilter  // 放大采样
   texture.wrapS = THREE.ClampToEdgeWrapping  // 水平包裹
   texture.wrapT = THREE.ClampToEdgeWrapping  // 垂直包裹
   texture.generateMipmaps = false  // 禁用 Mipmap (动态纹理)
   ```

3. **性能优化**:
   - 多个 Mesh 可以共享同一个纹理
   - 减少材质切换 (使用相同材质的 Mesh 分组)
   - 使用 `instanceMesh` 渲染大量相同对象

## 下一步

- 学习教程5: 性能监控与优化
- 了解如何监控和优化性能
