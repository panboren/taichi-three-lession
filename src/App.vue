<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/modules/app'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

const { locale } = useI18n()
const appStore = useAppStore()

// Element Plus 语言包映射
const localeMap = {
  'zh-CN': zhCn,
  'en-US': en
}

// 动态设置 Element Plus 的语言
const elLocale = computed(() => localeMap[appStore.locale as keyof typeof localeMap] || zhCn)
</script>

<template>
  <el-config-provider :locale="elLocale">
    <router-view />
  </el-config-provider>
</template>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
