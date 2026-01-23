<template>
  <div class="taichi-test-page">
    <div class="test-container">
      <h2>Taichi.js 功能测试</h2>
      <div class="status" :class="{ success: testPassed, error: testFailed }">
        {{ testStatus }}
      </div>
      
      <div class="test-section">
        <h3>1. Taichi.js 模块导入测试</h3>
        <div class="result">{{ importResult }}</div>
      </div>
      
      <div class="test-section">
        <h3>2. Taichi.js 初始化测试</h3>
        <div class="result">{{ initResult }}</div>
      </div>
      
      <div class="test-section">
        <h3>3. 字段创建测试</h3>
        <div class="result">{{ fieldResult }}</div>
      </div>
      
      <div class="test-section">
        <h3>4. 内核创建测试</h3>
        <div class="result">{{ kernelResult }}</div>
      </div>

      <div class="test-section">
        <h3>控制台日志</h3>
        <div class="console">{{ consoleLog }}</div>
      </div>

      <div class="controls">
        <button @click="runTests">运行测试</button>
        <button @click="clearLog">清除日志</button>
      </div>
    </div>

    <canvas id="test-canvas" class="hidden"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 测试状态
const testStatus = ref('等待测试...')
const testPassed = ref(false)
const testFailed = ref(false)

// 测试结果
const importResult = ref('未测试')
const initResult = ref('未测试')
const fieldResult = ref('未测试')
const kernelResult = ref('未测试')
const consoleLog = ref('')

let logs: string[] = []

function addLog(message: string) {
  logs.push(`[${new Date().toLocaleTimeString()}] ${message}`)
  consoleLog.value = logs.slice(-20).join('\n')
  console.log(message)
}

async function runTests() {
  testStatus.value = '测试中...'
  testPassed.value = false
  testFailed.value = false
  logs = []

  addLog('=== 开始 Taichi.js 测试 ===')

  // 测试 1: 模块导入
  addLog('测试 1: 检查 taichi.js 模块导入...')
  try {
    const taichi = await import('taichi.js')
    addLog('✓ taichi.js 模块导入成功')
    addLog(`  可用 API: ${Object.keys(taichi).join(', ')}`)
    importResult.value = '✓ 成功'
  } catch (error) {
    addLog(`✗ 模块导入失败: ${error}`)
    importResult.value = `✗ 失败: ${error}`
    testStatus.value = '测试失败'
    testFailed.value = true
    return
  }

  // 测试 2: 初始化
  addLog('测试 2: 初始化 Taichi.js...')
  try {
    const ti = await (window as any).ti?.init()
    if (ti) {
      addLog('✓ Taichi.js 初始化成功 (全局 ti)')
      initResult.value = '✓ 成功'
    } else {
      addLog('ℹ 全局 ti 不存在，尝试直接导入...')
      const taichi = await import('taichi.js')
      await taichi.init()
      addLog('✓ Taichi.js 初始化成功 (直接导入)')
      initResult.value = '✓ 成功'
    }
  } catch (error) {
    addLog(`✗ 初始化失败: ${error}`)
    initResult.value = `✗ 失败: ${error}`
    testStatus.value = '部分失败'
  }

  // 测试 3: 字段创建
  addLog('测试 3: 创建 Taichi 字段...')
  try {
    const taichi = await import('taichi.js')
    const field = taichi.Vector.field(3, taichi.f32, [1000])
    addLog('✓ 字段创建成功')
    addLog(`  字段类型: Vector(3, f32)`)
    addLog(`  维度: [1000]`)
    fieldResult.value = '✓ 成功'
  } catch (error) {
    addLog(`✗ 字段创建失败: ${error}`)
    fieldResult.value = `✗ 失败: ${error}`
    testStatus.value = '部分失败'
  }

  // 测试 4: 内核创建
  addLog('测试 4: 创建计算内核...')
  try {
    const taichi = await import('taichi.js')
    const positions = taichi.Vector.field(3, taichi.f32, [1000])
    
    taichi.addToKernelScope({ positions })
    
    const kernel = taichi.kernel((dt: number) => {
      for (let i = 0; i < 1000; i++) {
        positions[i][0] += dt
      }
    })
    
    addLog('✓ 内核创建成功')
    addLog(`  内核函数: ${typeof kernel}`)
    kernelResult.value = '✓ 成功'
  } catch (error) {
    addLog(`✗ 内核创建失败: ${error}`)
    kernelResult.value = `✗ 失败: ${error}`
    testStatus.value = '部分失败'
  }

  addLog('=== 测试完成 ===')
  
  if (!testFailed.value) {
    testStatus.value = '测试通过'
    testPassed.value = true
  }
}

function clearLog() {
  logs = []
  consoleLog.value = ''
}

onMounted(() => {
  addLog('页面加载完成，点击"运行测试"开始测试')
})
</script>

<style scoped lang="scss">
.taichi-test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%);
  padding: 40px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.test-container {
  width: 100%;
  max-width: 700px;
  background: rgba(0, 5, 16, 0.95);
  border-radius: 16px;
  padding: 30px;
  border: 1px solid rgba(0, 170, 255, 0.3);

  h2 {
    margin: 0 0 20px 0;
    font-size: 24px;
    color: #00aaff;
    text-align: center;
  }

  .status {
    text-align: center;
    padding: 15px;
    margin-bottom: 20px;
    background: rgba(100, 100, 100, 0.2);
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;

    &.success {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
      border: 1px solid rgba(0, 255, 136, 0.3);
    }

    &.error {
      background: rgba(255, 68, 68, 0.2);
      color: #ff4444;
      border: 1px solid rgba(255, 68, 68, 0.3);
    }
  }

  .test-section {
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(0, 50, 100, 0.15);
    border-radius: 8px;
    border-left: 3px solid #00aaff;

    h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #88ccff;
    }

    .result {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);
      font-family: 'Courier New', monospace;
    }
  }

  .console {
    background: rgba(0, 0, 0, 0.6);
    border-radius: 8px;
    padding: 15px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #00ff88;
    min-height: 200px;
    max-height: 300px;
    overflow-y: auto;
    white-space: pre-wrap;
    line-height: 1.6;
  }

  .controls {
    display: flex;
    gap: 10px;
    margin-top: 20px;

    button {
      flex: 1;
      padding: 12px 20px;
      background: linear-gradient(135deg, #00aaff 0%, #0088cc 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 170, 255, 0.3);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  .hidden {
    display: none;
  }
}
</style>
