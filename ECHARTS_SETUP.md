# ECharts 集成说明

## 安装 ECharts

由于项目中尚未安装 ECharts，需要先安装：

```bash
npm install echarts
# 或
pnpm add echarts
# 或
yarn add echarts
```

## 使用方法

安装完成后，在 `src/views/three-effice/index.vue` 中更新图表初始化函数：

### 完整的 ECharts 示例代码

```typescript
import * as echarts from 'echarts'

// 在 initCharts 函数中替换 createChart 调用

const initCharts = () => {
  // 图表1: 用户增长趋势 (折线图)
  if (chart1.value) {
    const myChart = echarts.init(chart1.value)
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(3, 5, 16, 0.9)',
        borderColor: '#00d4ff',
        textStyle: { color: '#fff' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['1月', '2月', '3月', '4月', '5月', '6月'],
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
        axisLabel: { color: 'rgba(255,255,255,0.7)' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
        axisLabel: { color: 'rgba(255,255,255,0.7)' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
      },
      series: [{
        name: '用户数',
        type: 'line',
        smooth: true,
        data: [1200, 1900, 3000, 5000, 8000, 12000],
        lineStyle: {
          color: '#00d4ff',
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 212, 255, 0.5)' },
            { offset: 1, color: 'rgba(0, 212, 255, 0)' }
          ])
        }
      }]
    }
    myChart.setOption(option)
  }

  // 图表2: 活跃度分布 (柱状图)
  if (chart2.value) {
    const myChart = echarts.init(chart2.value)
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(3, 5, 16, 0.9)',
        borderColor: '#ff00ff',
        textStyle: { color: '#fff' }
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
        axisLabel: { color: 'rgba(255,255,255,0.7)' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
        axisLabel: { color: 'rgba(255,255,255,0.7)' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
      },
      series: [{
        type: 'bar',
        data: [65, 78, 92, 85, 98, 72, 68],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ff00ff' },
            { offset: 1, color: '#00d4ff' }
          ]),
          borderRadius: [5, 5, 0, 0]
        }
      }]
    }
    myChart.setOption(option)
  }

  // 图表3: 系统性能监控 (混合图)
  if (chart3.value) {
    const myChart = echarts.init(chart3.value)
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(3, 5, 16, 0.9)',
        borderColor: '#00ff88',
        textStyle: { color: '#fff' }
      },
      legend: {
        data: ['CPU', '内存'],
        textStyle: { color: 'rgba(255,255,255,0.7)' }
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 12 }, (_, i) => `${i * 5}m`),
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
        axisLabel: { color: 'rgba(255,255,255,0.7)' }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
        axisLabel: { color: 'rgba(255,255,255,0.7)', formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
      },
      series: [
        {
          name: 'CPU',
          type: 'line',
          smooth: true,
          data: [45, 52, 48, 55, 62, 58, 50, 48, 55, 60, 52, 48],
          lineStyle: { color: '#00ff88', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 255, 136, 0.3)' },
              { offset: 1, color: 'rgba(0, 255, 136, 0)' }
            ])
          }
        },
        {
          name: '内存',
          type: 'line',
          smooth: true,
          data: [30, 35, 40, 38, 42, 45, 40, 35, 38, 40, 42, 38],
          lineStyle: { color: '#ff6b6b', width: 2 }
        }
      ]
    }
    myChart.setOption(option)
  }

  // 图表4: 访问来源 (饼图)
  if (chart4.value) {
    const myChart = echarts.init(chart4.value)
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(3, 5, 16, 0.9)',
        borderColor: '#00d4ff',
        textStyle: { color: '#fff' }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { color: 'rgba(255,255,255,0.7)' }
      },
      series: [{
        name: '访问来源',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#030510',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
            color: '#fff'
          }
        },
        data: [
          { value: 1048, name: '直接访问', itemStyle: { color: '#00d4ff' } },
          { value: 735, name: '邮件营销', itemStyle: { color: '#00ff88' } },
          { value: 580, name: '联盟广告', itemStyle: { color: '#ff00ff' } },
          { value: 484, name: '视频广告', itemStyle: { color: '#ff6b6b' } },
          { value: 300, name: '搜索引擎', itemStyle: { color: '#ffa500' } }
        ]
      }]
    }
    myChart.setOption(option)
  }

  // 图表5: 功能使用率 (雷达图)
  if (chart5.value) {
    const myChart = echarts.init(chart5.value)
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: 'rgba(3, 5, 16, 0.9)',
        borderColor: '#ff00ff',
        textStyle: { color: '#fff' }
      },
      radar: {
        indicator: [
          { name: '3D场景', max: 100 },
          { name: '动画效果', max: 100 },
          { name: '数据分析', max: 100 },
          { name: '用户交互', max: 100 },
          { name: '系统性能', max: 100 }
        ],
        axisName: {
          color: 'rgba(255,255,255,0.7)'
        },
        splitLine: {
          lineStyle: { color: 'rgba(255,255,255,0.1)' }
        },
        splitArea: {
          areaStyle: { color: ['rgba(0, 212, 255, 0.05)', 'transparent'] }
        }
      },
      series: [{
        type: 'radar',
        data: [{
          value: [85, 92, 78, 88, 75],
          name: '本月',
          lineStyle: { color: '#ff00ff', width: 2 },
          areaStyle: {
            color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
              { offset: 0, color: 'rgba(255, 0, 255, 0.5)' },
              { offset: 1, color: 'rgba(255, 0, 255, 0.1)' }
            ])
          },
          itemStyle: { color: '#ff00ff' }
        }],
        symbol: 'circle',
        symbolSize: 6
      }]
    }
    myChart.setOption(option)
  }

  // 响应式处理
  window.addEventListener('resize', () => {
    if (chart1.value) echarts.init(chart1.value).resize()
    if (chart2.value) echarts.init(chart2.value).resize()
    if (chart3.value) echarts.init(chart3.value).resize()
    if (chart4.value) echarts.init(chart4.value).resize()
    if (chart5.value) echarts.init(chart5.value).resize()
  })
}
```

## GSAP ScrollTrigger 插件

项目已集成 GSAP ScrollTrigger，实现滚动触发的动画效果：

### 主要功能

1. **相机跟随滚动**
   - 首页 → 动画特效：相机向下移动 (y: -30, z: 40)
   - 动画特效 → 数据洞察：相机继续向下 (y: -60, z: 30)
   - 数据洞察 → 页脚：相机继续向下 (y: -90, z: 20)

2. **3D 对象动画**
   - 球体缩放变化
   - 粒子旋转 360 度
   - 特性卡片依次进入
   - 图表卡片依次进入

3. **滚动进度指示**
   - 顶部进度条显示滚动位置
   - 右侧圆点指示当前区域
   - 点击圆点快速跳转

## 使用技巧

### 自定义滚动动画

```typescript
// 添加新的滚动触发动画
gsap.to(element, {
  scrollTrigger: {
    trigger: '.section-name',
    start: 'top center',
    end: 'bottom center',
    scrub: 1
  },
  // 动画属性
  opacity: 1,
  y: 0
})
```

### ScrollTrigger 参数说明

- `trigger`: 触发滚动的元素
- `start`: 开始滚动的位置
- `end`: 结束滚动的位置
- `scrub`: 绑定到滚动条（true/false/数字）
- `onUpdate`: 滚动时回调
- `onEnter/onLeave`: 进入/离开视口回调

## 注意事项

1. 确保已安装 ECharts：`pnpm add echarts`
2. 响应式处理：使用 `resize` 事件监听
3. 性能优化：避免在滚动动画中使用复杂计算
4. 内存管理：组件卸载时清理 ECharts 实例

## 下一步

1. 安装 ECharts
2. 替换 `initCharts` 函数中的模拟代码
3. 根据实际需求调整图表配置
4. 添加真实数据源
