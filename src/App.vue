<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAppStore } from '@/store/modules/app'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { ElConfigProvider } from 'element-plus'

const isReady = ref(false)
const appStore = useAppStore()

const localeMap = {
  'zh-CN': zhCn,
  'en-US': en
} as const

const currentLocale = computed(() => {
  if (!appStore || !appStore.locale) return zhCn

  const locale = appStore.locale
  if (locale && locale in localeMap) {
    return localeMap[locale as keyof typeof localeMap]
  }

  return zhCn
})

onMounted(() => {
  // 等待下一帧确保所有依赖已初始化
  requestAnimationFrame(() => {
    isReady.value = true
  })
})
</script>

<template>
  <ElConfigProvider v-if="isReady" :locale="currentLocale">
    <router-view />
  </ElConfigProvider>
  <div v-else class="loading">
    <span>Loading...</span>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #333;
  font-size: 16px;
}
</style>
