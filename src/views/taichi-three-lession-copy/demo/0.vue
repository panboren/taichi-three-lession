<template>
  <div class="course-index">
    <div class="header">
      <h1>Taichi.js + Three.js 课程索引</h1>
      <p class="subtitle">从基础到高级的完整学习路径</p>
    </div>

    <div class="courses-grid">
      <div v-for="(course, index) in courses" :key="index" class="course-card">
        <div class="course-number">{{ index + 1 }}</div>
        <div class="course-content">
          <h3>{{ course.title }}</h3>
          <p>{{ course.description }}</p>
          <div class="course-tags">
            <span v-for="tag in course.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="course-stats">
            <span class="stat">
              <strong>难度:</strong> {{ getDifficultyLabel(course.difficulty) }}
            </span>
            <span class="stat">
              <strong>时长:</strong> {{ course.duration }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="prerequisites">
      <h2>前置知识</h2>
      <ul>
        <li>JavaScript / TypeScript 基础</li>
        <li>Vue 3 Composition API</li>
        <li>Three.js 基础（场景、相机、渲染器）</li>
        <li>GPU 编程基础（可选）</li>
      </ul>
    </div>

    <div class="learning-path">
      <h2>学习路径</h2>
      <div class="path-steps">
        <div v-for="(step, index) in learningSteps" :key="index" class="path-step">
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <h4>{{ step.title }}</h4>
            <p>{{ step.description }}</p>
          </div>
          <div v-if="index < learningSteps.length - 1" class="step-arrow">→</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 课程数据
const courses = ref([
  {
    title: '10000粒子基础演示',
    description: '学习如何创建基础的粒子系统，使用Three.js渲染和简单的JavaScript动画。理解BufferGeometry和BufferAttribute的核心概念。',
    tags: ['Three.js基础', '粒子系统', 'BufferGeometry'],
    difficulty: 1,
    duration: '15分钟',
    file: '1.vue'
  },
  {
    title: 'GPU加速粒子物理',
    description: '深入理解Taichi.js的GPU计算能力，实现重力场、旋涡场、爆炸场等多种物理效果。学习如何编写GPU内核代码。',
    tags: ['Taichi.js', 'GPU计算', '物理模拟'],
    difficulty: 2,
    duration: '30分钟',
    file: '2.vue'
  },
  {
    title: '交互式粒子系统',
    description: '实现鼠标交互，支持吸引、排斥、拖尾等多种交互模式。学习如何将2D屏幕坐标转换为3D世界坐标。',
    tags: ['交互设计', '鼠标事件', '坐标转换'],
    difficulty: 2,
    duration: '25分钟',
    file: '3.vue'
  },
  {
    title: '数据传输与性能优化',
    description: '学习Taichi.js与Three.js之间的数据传输机制，包括Canvas模式和Data模式。理解零拷贝传输和性能优化策略。',
    tags: ['数据传输', '性能优化', 'Texture管理'],
    difficulty: 3,
    duration: '40分钟',
    file: '4.vue'
  },
  {
    title: '流体粒子模拟（SPH）',
    description: '实现平滑粒子流体动力学(SPH)算法，模拟真实的液体流动效果。学习粒子间相互作用和压力计算。',
    tags: ['流体模拟', 'SPH算法', '粒子相互作用'],
    difficulty: 4,
    duration: '50分钟',
    file: '5.vue'
  },
  {
    title: '碰撞检测与响应',
    description: '实现粒子与几何体的碰撞检测，包括球形、平面和盒子的碰撞响应。学习空间分区优化算法。',
    tags: ['碰撞检测', '空间分区', '物理响应'],
    difficulty: 3,
    duration: '35分钟',
    file: '6.vue'
  },
  {
    title: 'GPU实例化渲染',
    description: '使用THREE.InstancedMesh实现大规模粒子渲染，显著提升性能。学习实例矩阵和批量渲染技术。',
    tags: ['实例化渲染', 'GPU优化', '批量渲染'],
    difficulty: 4,
    duration: '45分钟',
    file: '7.vue'
  },
  {
    title: '性能优化与自适应控制',
    description: '实现基于FPS的自适应分辨率和质量控制，确保在不同设备上的流畅体验。学习性能监控和动态调整。',
    tags: ['自适应', '质量控制', '性能监控'],
    difficulty: 3,
    duration: '40分钟',
    file: '8.vue'
  },
  {
    title: '粒子轨迹与尾迹效果',
    description: '实现粒子运动轨迹渲染，创建流畅的尾迹效果。学习历史位置管理和线条动态更新。',
    tags: ['粒子轨迹', '尾迹效果', '线条渲染'],
    difficulty: 3,
    duration: '35分钟',
    file: '9.vue'
  },
  {
    title: '综合项目 - 完整粒子系统',
    description: '综合运用所学知识，创建一个功能完整的粒子系统展示项目。包含多种效果模式和后处理特效。',
    tags: ['综合项目', '后处理', '多模式切换'],
    difficulty: 4,
    duration: '60分钟',
    file: '10.vue'
  },
  {
    title: 'Taichi.js + Three.js 性能协作架构',
    description: '深入学习 Taichi.js 和 Three.js 的性能分工与数据共享优化。掌握 GPU 计算与 3D 渲染的最佳实践。',
    tags: ['架构设计', '数据传输', '性能优化'],
    difficulty: 5,
    duration: '90分钟',
    file: '11.vue'
  }
])

// 学习路径
const learningSteps = ref([
  {
    title: '环境搭建',
    description: '配置开发环境，安装必要的依赖，创建第一个项目'
  },
  {
    title: '基础概念',
    description: '学习Three.js和Taichi.js的核心概念和API'
  },
  {
    title: '简单粒子',
    description: '创建第一个10000粒子的基础演示'
  },
  {
    title: '物理模拟',
    description: '添加物理效果，学习GPU加速计算'
  },
  {
    title: '交互设计',
    description: '实现鼠标交互和用户控制'
  },
  {
    title: '数据传输',
    description: '理解并优化Taichi.js和Three.js之间的数据传输'
  },
  {
    title: '高级效果',
    description: '实现流体、碰撞等高级物理效果'
  },
  {
    title: '性能优化',
    description: '应用WebGPU、多线程等高级优化技术'
  },
  {
    title: '项目实践',
    description: '综合运用所学知识完成一个完整项目'
  }
])

// 难度标签
function getDifficultyLabel(level: number): string {
  const labels = ['', '入门', '初级', '中级', '高级', '专家']
  return labels[level] || '未知'
}
</script>

<style scoped lang="scss">
.course-index {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%);
  padding: 40px;
  color: white;
}

.header {
  text-align: center;
  margin-bottom: 60px;

  h1 {
    font-size: 48px;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 60px;
}

.course-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 15px;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
  }

  .course-number {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    flex-shrink: 0;
  }

  .course-content {
    flex: 1;

    h3 {
      margin: 0 0 10px 0;
      font-size: 18px;
      color: #00ff88;
    }

    p {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
    }

    .course-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-bottom: 10px;

      .tag {
        padding: 3px 10px;
        background: rgba(102, 126, 234, 0.3);
        border-radius: 12px;
        font-size: 12px;
        color: #a0a0ff;
      }
    }

    .course-stats {
      display: flex;
      gap: 20px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);

      .stat {
        strong {
          color: #00ffff;
        }
      }
    }
  }
}

.prerequisites,
.learning-path {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;

  h2 {
    margin: 0 0 20px 0;
    font-size: 24px;
    color: #00ffff;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      margin-bottom: 10px;
      font-size: 16px;
      line-height: 1.8;
      color: rgba(255, 255, 255, 0.85);

      &:before {
        content: '✓';
        color: #00ff88;
        margin-right: 10px;
      }
    }
  }
}

.path-steps {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.path-step {
  display: flex;
  align-items: center;
  gap: 15px;

  .step-number {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    flex-shrink: 0;
  }

  .step-content {
    flex: 1;

    h4 {
      margin: 0 0 5px 0;
      font-size: 16px;
      color: #00ff88;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .step-arrow {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.3);
  }
}
</style>
