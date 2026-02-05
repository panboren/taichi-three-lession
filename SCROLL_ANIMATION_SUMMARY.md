# GSAP 滚动动画系统 - 完整说明

## 🎯 功能概述

本项目实现了一个基于 GSAP ScrollTrigger 的完整滚动动画系统，包含以下核心功能：

### 1. 滚动驱动的相机动画
- 随着页面滚动，3D 相机平滑移动到不同位置
- 每个区域有独特的相机视角
- 平滑的 scrub 效果

### 2. 多区域内容
- **首页**：主标题、统计数据、CTA 按钮
- **动画特效**：105+ 动画库展示（V2-V7）
- **数据洞察**：5 个 ECharts 图表
- **页脚**：品牌信息和链接

### 3. 交互式导航
- 右侧导航圆点
- 点击快速跳转
- 当前区域高亮显示
- 顶部滚动进度条

## 📐 架构设计

### 模块划分

```
home-page
├── canvas-container (Three.js 3D 背景)
├── scroll-container (可滚动容器)
│   ├── section-home (首页)
│   ├── section-features (动画特效)
│   ├── section-charts (ECharts 图表)
│   └── section-footer (页脚)
├── scroll-progress (进度条)
├── section-indicator (导航点)
└── exploration-ui (3D 探索模式)
```

### 动画触发流程

```mermaid
用户滚动
  ↓
GSAP ScrollTrigger 检测
  ↓
触发对应区域动画
  ↓
更新相机位置
  ↓
更新滚动进度条
  ↓
高亮当前导航点
```

## 🎨 动画效果详解

### 区域 1: 首页
- **相机位置**: (0, 0, 50)
- **入场动画**: GSAP Timeline 依次显示元素
- **鼠标视差**: 相机跟随鼠标轻微移动

### 区域 2: 动画特效
- **相机位置**: (0, -30, 40)
- **过渡动画**: 相机向下移动 + 3D 对象缩放
- **特性卡片**: 6 张卡片依次进入
- **演示按钮**: 点击触发动画演示

### 区域 3: 数据洞察
- **相机位置**: (0, -60, 30)
- **过渡动画**: 相机继续向下移动
- **图表动画**: 5 个图表卡片依次进入
- **ECharts 初始化**: 滚动到位后初始化图表

### 区域 4: 页脚
- **相机位置**: (0, -90, 20)
- **过渡动画**: 相机继续向下移动
- **背景渐变**: 逐渐变暗

## 🔧 技术实现

### GSAP ScrollTrigger 配置

```typescript
gsap.to(camera.position, {
  scrollTrigger: {
    trigger: sectionFeatures,
    start: 'top center',
    end: 'top top',
    scrub: 1,
    onUpdate: (self) => {
      scrollProgress.value = self.progress * 33
      currentSection.value = 1
    }
  },
  y: -30,
  z: 40,
  duration: 2
})
```

### 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `trigger` | 触发元素 | `sectionFeatures.value` |
| `start` | 开始位置 | `'top center'` |
| `end` | 结束位置 | `'top top'` |
| `scrub` | 绑定滚动 | `1` (1秒延迟) |
| `onUpdate` | 滚动回调 | 更新进度值 |

### 相机运动轨迹

```
首页 (0, 0, 50)
    ↓ 滚动
动画特效 (0, -30, 40)
    ↓ 滚动
数据洞察 (0, -60, 30)
    ↓ 滚动
页脚 (0, -90, 20)
```

## 🎮 用户交互

### 滚动导航
- 鼠标滚轮：平滑滚动
- 触摸滑动：移动端支持
- 键盘方向键：上下滚动

### 快速跳转
- 点击右侧导航点
- 快速滚动到目标区域
- GSAP 提供平滑过渡

### 动画演示
- 点击"试一试"按钮
- 触发对应的动画效果
- 全息投影、虫洞、浮动等

## 📊 ECharts 集成

### 图表类型

1. **用户增长趋势** - 折线图（面积渐变）
2. **活跃度分布** - 柱状图（渐变色）
3. **系统性能监控** - 混合图（CPU + 内存）
4. **访问来源** - 饼图（环形图）
5. **功能使用率** - 雷达图

### 配置特点

- 深色主题适配
- 半透明背景
- 霓虹配色方案
- 响应式设计
- 悬停提示

### 初始化时机

```typescript
// 滚动到图表区域时初始化
gsap.from('.chart-card', {
  scrollTrigger: {
    trigger: sectionCharts,
    start: 'top 70%',
    end: 'bottom 30%'
  },
  y: 80,
  opacity: 0,
  duration: 0.8,
  stagger: 0.1,
  ease: 'power3.out',
  onComplete: () => {
    initCharts() // 初始化 ECharts
  }
})
```

## 🎯 性能优化

### 1. 懒加载
- ECharts 只在滚动到区域时初始化
- 避免不必要的资源加载

### 2. 动画优化
- 使用 `requestAnimationFrame`
- GPU 加速（transform, opacity）
- 避免重排重绘

### 3. 事件管理
- 组件卸载时清理监听器
- ScrollTrigger 自动销毁

### 4. 内存控制
- Three.js 对象复用
- GSAP timeline 复用
- 避免内存泄漏

## 📱 响应式设计

### 断点

```scss
@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-large {
    grid-column: span 1;
  }
}
```

### 移动端优化

- 触摸滑动支持
- 较大的触摸目标
- 简化的布局
- 横屏适配

## 🚀 使用指南

### 基本使用

1. 向下滚动浏览内容
2. 相机自动跟随滚动移动
3. 每个区域有独特的 3D 视角
4. 点击右侧导航点快速跳转

### 探索 3D 空间

1. 点击"进入元宇宙"按钮
2. 进入 3D 探索模式
3. 拖拽旋转视角
4. 滚轮缩放距离
5. WASD 移动相机

### 测试动画效果

1. 滚动到"动画特效"区域
2. 查看特性卡片进入动画
3. 点击"试一试"按钮
4. 体验不同动画效果

## 🔧 自定义开发

### 添加新区域

```vue
<section class="scroll-section section-new" ref="sectionNew">
  <div class="section-content">
    <!-- 内容 -->
  </div>
</section>
```

```typescript
// 添加相机动画
gsap.to(camera.position, {
  scrollTrigger: {
    trigger: sectionNew,
    start: 'top center',
    end: 'top top',
    scrub: 1
  },
  y: -120,
  z: 10,
  duration: 2
})

// 添加内容动画
gsap.from('.new-element', {
  scrollTrigger: {
    trigger: sectionNew,
    start: 'top 70%'
  },
  y: 100,
  opacity: 0
})
```

### 添加新图表

```vue
<div class="chart-card">
  <div ref="chart6" class="chart-container"></div>
</div>
```

```typescript
// 在 initCharts 中添加
if (chart6.value) {
  const myChart = echarts.init(chart6.value)
  // 配置图表
  myChart.setOption(option)
}
```

## 📝 注意事项

1. **ECharts 安装**
   - 运行 `pnpm add echarts`
   - 参考 `ECHARTS_SETUP.md`

2. **ScrollTrigger 注册**
   - 必须在组件挂载后使用
   - 组件卸载时自动清理

3. **相机位置**
   - 避免相机穿过 3D 对象
   - 调整位置确保最佳视角

4. **性能监控**
   - 观察 FPS 值
   - 优化复杂动画
   - 减少粒子数量

## 🎓 学习资源

- [GSAP 官方文档](https://gsap.com/docs/)
- [ScrollTrigger 文档](https://gsap.com/docs/v3/ScrollTrigger/)
- [ECharts 官方文档](https://echarts.apache.org/zh/index.html)
- [Three.js 官方文档](https://threejs.org/docs/)

## 🎉 总结

本实现展示了如何将：
- **GSAP** 强大的动画控制
- **ScrollTrigger** 滚动触发动画
- **Three.js** 3D 场景渲染
- **ECharts** 数据可视化
- **Universal Animation Library** CSS 动画

完美融合，创造一个交互丰富、视觉震撼的下一代网站体验！
