# Demo Admin

基于 Vue 3 + TypeScript + Vite 的现代化管理系统，兼容 Node 18.17.1

## 技术栈

- **核心框架**: Vue 3.4.21 + Vue Router 4.3.0 + Pinia 2.1.7
- **开发语言**: TypeScript 5.4.5
- **构建工具**: Vite 5.2.8
- **UI 框架**: Element Plus 2.7.0
- **原子化 CSS**: UnoCSS 0.58.5
- **HTTP 客户端**: Axios 1.6.8
- **国际化**: vue-i18n 9.13.1

## 特性

- ✅ 完整的 TypeScript 类型支持
- ✅ 暗黑模式支持
- ✅ 国际化支持 (中文/英文)
- ✅ 响应式布局
- ✅ 状态持久化
- ✅ 路由懒加载
- ✅ 请求拦截封装

## 开始使用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 项目结构

```
demo/
├── public/              # 静态资源
├── src/
│   ├── api/            # API 接口
│   ├── assets/         # 资源文件
│   ├── components/     # 公共组件
│   ├── config/         # 配置文件
│   ├── hooks/          # 自定义 Hooks
│   ├── i18n/           # 国际化
│   ├── layout/         # 布局组件
│   ├── router/         # 路由配置
│   ├── store/          # 状态管理
│   ├── styles/         # 样式文件
│   ├── types/          # 类型定义
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图
│   ├── App.vue         # 根组件
│   ├── main.ts         # 入口文件
│   ├── permission.ts   # 路由守卫
│   └── env.d.ts        # 环境类型
├── .env                # 环境变量
├── .eslintrc.cjs       # ESLint 配置
├── .prettierrc         # Prettier 配置
├── index.html          # HTML 模板
├── package.json        # 依赖配置
├── tsconfig.json       # TypeScript 配置
├── uno.config.ts       # UnoCSS 配置
└── vite.config.ts      # Vite 配置
```

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## License

MIT
