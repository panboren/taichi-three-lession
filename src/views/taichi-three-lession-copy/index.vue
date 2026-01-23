<template>
  <div class="lession-page">
    <div class="header">
      <h1>Taichi.js + Three.js 学习课程</h1>
      <p class="subtitle">从基础到高级的完整学习路径</p>
    </div>

    <!-- 课程选择器 -->
    <div class="course-selector">
      <div
        v-for="(course, index) in courses"
        :key="index"
        class="course-item"
        :class="{ active: currentCourseIndex === index }"
        @click="selectCourse(index)"
      >
        <span class="course-number">{{ index + 1 }}</span>
        <span class="course-title">{{ course.title }}</span>
        <span class="course-difficulty" :class="'diff-' + course.difficulty">
          {{ getDifficultyLabel(course.difficulty) }}
        </span>
      </div>
    </div>

    <!-- 课程预览区域 -->
    <div class="preview-container">
      <div class="preview-header">
        <h2>{{ courses[currentCourseIndex].title }}</h2>
        <p class="description">{{ courses[currentCourseIndex].description }}</p>
      </div>

      <!-- 动态组件加载 -->
      <component :is="currentComponent" v-if="currentComponent" />

      <!-- 课程信息面板 -->
      <div class="course-info">
        <div class="info-tags">
          <span v-for="tag in courses[currentCourseIndex].tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <div class="info-meta">
          <span>难度: {{ getDifficultyLabel(courses[currentCourseIndex].difficulty) }}</span>
          <span>时长: {{ courses[currentCourseIndex].duration }}</span>
        </div>
      </div>
    </div>

    <!-- 学习提示 -->
    <div class="info-box">
      <h3>💡 学习提示</h3>
      <ul>
        <li>点击上方课程卡片切换不同课程</li>
        <li>每个课程都是独立的演示，可以交互操作</li>
        <li>建议按顺序学习，从基础到进阶</li>
        <li>遇到问题时可以查看控制台的调试信息</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onUnmounted } from 'vue'

// 导入课程组件
import Course0 from './demo/0.vue'
import Course1 from './demo/1.vue'
import Course2 from './demo/2.vue'
import Course3 from './demo/3.vue'
import Course4 from './demo/4.vue'
import Course5 from './demo/5.vue'
import Course6 from './demo/6.vue'
import Course7 from './demo/7.vue'
import Course8 from './demo/8.vue'
import Course9 from './demo/9.vue'
import Course10 from './demo/10.vue'
import Course11 from './demo/11.vue'
import CourseTest from './demo/test-taichi.vue'

// 当前课程索引
const currentCourseIndex = ref(1)

// 课程数据
const courses = ref([
  {
    title: '课程索引',
    description: '查看所有课程的完整大纲和学习路径，包括11个从基础到高级的详细课程介绍。',
    tags: ['课程概览', '学习路径', '难度分级'],
    difficulty: 0,
    duration: '5分钟'
  },
  {
    title: '10000粒子基础演示',
    description: '学习如何创建基础的粒子系统，使用Three.js渲染和简单的JavaScript动画。理解BufferGeometry和BufferAttribute的核心概念。',
    tags: ['Three.js基础', '粒子系统', 'BufferGeometry'],
    difficulty: 1,
    duration: '15分钟'
  },
  {
    title: 'GPU加速粒子物理',
    description: '深入理解Taichi.js的GPU计算能力，实现重力场、旋涡场、爆炸场等多种物理效果。学习如何编写GPU内核代码。',
    tags: ['Taichi.js', 'GPU计算', '物理模拟'],
    difficulty: 2,
    duration: '30分钟'
  },
  {
    title: '交互式粒子系统',
    description: '实现鼠标交互，支持吸引、排斥、拖尾等多种交互模式。学习如何将2D屏幕坐标转换为3D世界坐标。',
    tags: ['交互设计', '鼠标事件', '坐标转换'],
    difficulty: 2,
    duration: '25分钟'
  },
  {
    title: '数据传输与性能优化',
    description: '学习Taichi.js与Three.js之间的数据传输机制，包括Canvas模式和Data模式。理解零拷贝传输和性能优化策略。',
    tags: ['数据传输', '性能优化', 'Texture管理'],
    difficulty: 3,
    duration: '40分钟'
  },
  {
    title: '流体粒子模拟（SPH）',
    description: '实现平滑粒子流体动力学(SPH)算法，模拟真实的液体流动效果。学习粒子间相互作用和压力计算。',
    tags: ['流体模拟', 'SPH算法', '粒子相互作用'],
    difficulty: 4,
    duration: '50分钟'
  },
  {
    title: '碰撞检测与响应',
    description: '实现粒子与几何体的碰撞检测，包括球形、平面和盒子的碰撞响应。学习空间分区优化算法。',
    tags: ['碰撞检测', '空间分区', '物理响应'],
    difficulty: 3,
    duration: '35分钟'
  },
  {
    title: 'GPU实例化渲染',
    description: '使用THREE.InstancedMesh实现大规模粒子渲染，显著提升性能。学习实例矩阵和批量渲染技术。',
    tags: ['实例化渲染', 'GPU优化', '批量渲染'],
    difficulty: 4,
    duration: '45分钟'
  },
  {
    title: '性能优化与自适应控制',
    description: '实现基于FPS的自适应分辨率和质量控制，确保在不同设备上的流畅体验。学习性能监控和动态调整。',
    tags: ['自适应', '质量控制', '性能监控'],
    difficulty: 3,
    duration: '40分钟'
  },
  {
    title: '粒子轨迹与尾迹效果',
    description: '实现粒子运动轨迹渲染，创建流畅的尾迹效果。学习历史位置管理和线条动态更新。',
    tags: ['粒子轨迹', '尾迹效果', '线条渲染'],
    difficulty: 3,
    duration: '35分钟'
  },
  {
    title: '综合项目 - 完整粒子系统',
    description: '综合运用所学知识，创建一个功能完整的粒子系统展示项目。包含多种效果模式和后处理特效。',
    tags: ['综合项目', '后处理', '多模式切换'],
    difficulty: 4,
    duration: '60分钟'
  },
  {
    title: 'Taichi.js + Three.js 性能协作架构',
    description: '深入学习 Taichi.js 和 Three.js 的性能分工与数据共享优化。掌握 GPU 计算与 3D 渲染的最佳实践。',
    tags: ['架构设计', '数据传输', '性能优化'],
    difficulty: 5,
    duration: '90分钟'
  },
  {
    title: 'Taichi.js 功能测试',
    description: '测试 taichi.js 模块的导入、初始化、字段创建和内核编译等功能。验证 WebGPU 环境是否可用。',
    tags: ['功能测试', 'WebGPU', '环境验证'],
    difficulty: 1,
    duration: '10分钟'
  }
])

// 组件映射
const componentMap: Record<number, any> = {
  0: Course0,
  1: Course1,
  2: Course2,
  3: Course3,
  4: Course4,
  5: Course5,
  6: Course6,
  7: Course7,
  8: Course8,
  9: Course9,
  10: Course10,
  11: Course11,
  12: CourseTest
}

// 当前组件（使用shallowRef避免深度响应）
const currentComponent = shallowRef(componentMap[1])

// 选择课程
function selectCourse(index: number) {
  currentCourseIndex.value = index
  currentComponent.value = componentMap[index as keyof typeof componentMap]
}

// 难度标签
function getDifficultyLabel(level: number): string {
  const labels = ['概览', '入门', '初级', '中级', '高级', '专家']
  return labels[level] || '未知'
}

// 键盘导航
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    const newIndex = Math.max(0, currentCourseIndex.value - 1)
    selectCourse(newIndex)
  } else if (event.key === 'ArrowRight') {
    const newIndex = Math.min(courses.value.length - 1, currentCourseIndex.value + 1)
    selectCourse(newIndex)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.lession-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%);
  padding: 30px;
  color: white;
}

.header {
  text-align: center;
  margin-bottom: 30px;

  h1 {
    font-size: 40px;
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
}

// 课程选择器
.course-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;

  .course-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    flex: 1;
    min-width: 180px;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(102, 126, 234, 0.5);
      transform: translateY(-2px);
    }

    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: transparent;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

      .course-number {
        background: rgba(255, 255, 255, 0.3);
      }

      .course-title {
        color: white;
      }

      .course-difficulty {
        color: white;
        background: rgba(255, 255, 255, 0.2);
      }
    }

    .course-number {
      width: 30px;
      height: 30px;
      background: rgba(102, 126, 234, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      color: #a0a0ff;
      flex-shrink: 0;
    }

    .course-title {
      flex: 1;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
    }

    .course-difficulty {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 4px;
      color: #a0a0ff;

      &.diff-0 {
        background: rgba(255, 255, 255, 0.1);
      }

      &.diff-1 {
        background: rgba(0, 255, 136, 0.2);
        color: #00ff88;
      }

      &.diff-2 {
        background: rgba(102, 126, 234, 0.2);
        color: #667eea;
      }

      &.diff-3 {
        background: rgba(255, 183, 77, 0.2);
        color: #ffb74d;
      }

      &.diff-4 {
        background: rgba(255, 107, 107, 0.2);
        color: #ff6b6b;
      }

      &.diff-5 {
        background: rgba(255, 0, 128, 0.2);
        color: #ff0080;
      }
    }
  }
}

// 预览容器
.preview-container {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;

  .preview-header {
    padding: 20px 25px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    h2 {
      margin: 0 0 8px 0;
      font-size: 22px;
      color: #00ff88;
    }

    .description {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.5;
    }
  }

  // 课程组件内容区域
  :deep(.particle-page),
  :deep(.bridge-demo-page),
  :deep(.course-index) {
    border-radius: 0;
  }
}

// 课程信息
.course-info {
  padding: 20px 25px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .info-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;

    .tag {
      padding: 4px 12px;
      background: rgba(102, 126, 234, 0.2);
      border-radius: 12px;
      font-size: 12px;
      color: #a0a0ff;
    }
  }

  .info-meta {
    display: flex;
    gap: 20px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);

    span {
      display: flex;
      align-items: center;
      gap: 6px;

      &:before {
        content: '';
        width: 4px;
        height: 4px;
        background: #00ff88;
        border-radius: 50%;
      }
    }
  }
}

// 信息提示框
.info-box {
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 12px;
  padding: 20px 25px;

  h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #00ff88;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.8);

      &:before {
        content: '💡';
        margin-right: 10px;
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .lession-page {
    padding: 15px;
  }

  .header h1 {
    font-size: 28px;
  }

  .course-selector {
    .course-item {
      min-width: 140px;
      padding: 10px 15px;

      .course-title {
        font-size: 12px;
      }
    }
  }

  .preview-container .preview-header {
    padding: 15px 20px;

    h2 {
      font-size: 18px;
    }

    .description {
      font-size: 13px;
    }
  }
}
</style>
