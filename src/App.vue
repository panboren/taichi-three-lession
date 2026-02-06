<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { ElConfigProvider } from 'element-plus'

const appStore = useAppStore()

const localeMap = {
  'zh-CN': zhCn,
  'en-US': en
} as const

const currentLocale = computed(() => {
  const locale = appStore?.locale
  return locale && locale in localeMap ? localeMap[locale as keyof typeof localeMap] : zhCn
})
</script>

<template>
  <ElConfigProvider :locale="currentLocale">
    <Suspense>
      <router-view />
    </Suspense>
  </ElConfigProvider>
</template>

<style>
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
