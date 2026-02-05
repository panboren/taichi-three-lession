// vite.config.ts
import { loadEnv } from "file:///E:/my-work2025/taichi-three-lession/taichi-three-lession/node_modules/vite/dist/node/index.js";
import Vue from "file:///E:/my-work2025/taichi-three-lession/taichi-three-lession/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import VueJsx from "file:///E:/my-work2025/taichi-three-lession/taichi-three-lession/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import UnoCSS from "file:///E:/my-work2025/taichi-three-lession/taichi-three-lession/node_modules/unocss/dist/vite.mjs";
import AutoImport from "file:///E:/my-work2025/taichi-three-lession/taichi-three-lession/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///E:/my-work2025/taichi-three-lession/taichi-three-lession/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///E:/my-work2025/taichi-three-lession/taichi-three-lession/node_modules/unplugin-vue-components/dist/resolvers.js";
import { createHtmlPlugin } from "file:///E:/my-work2025/taichi-three-lession/taichi-three-lession/node_modules/vite-plugin-html/dist/index.mjs";
import { visualizer } from "file:///E:/my-work2025/taichi-three-lession/taichi-three-lession/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import viteCompression from "file:///E:/my-work2025/taichi-three-lession/taichi-three-lession/node_modules/vite-plugin-compression/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "E:\\my-work2025\\taichi-three-lession\\taichi-three-lession";
var vite_config_default = ({ mode }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const isBuild = mode === "production" || mode === "prod";
  return {
    base: env.VITE_BASE_PATH,
    plugins: [
      Vue(),
      VueJsx(),
      UnoCSS(),
      AutoImport({
        imports: [
          "vue",
          "vue-router",
          "pinia",
          {
            "vue-i18n": ["useI18n"]
          }
        ],
        dts: "src/types/auto-imports.d.ts",
        eslintrc: {
          enabled: false
        }
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: "src/types/components.d.ts",
        extensions: ["vue", "tsx"],
        include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
        exclude: [/[\\/]node_modules[\\/]/, /[\\/]\\.git[\\/]/, /[\\/]\\.nuxt[\\/]/]
      }),
      createHtmlPlugin({
        minify: true,
        template: "index.html"
      }),
      // Gzip 压缩
      viteCompression({
        verbose: true,
        disable: !isBuild,
        threshold: 10240,
        algorithm: "gzip",
        ext: ".gz"
      }),
      // 打包体积分析
      isBuild && visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: "dist/stats.html"
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        "vue-i18n": "vue-i18n/dist/vue-i18n.cjs.js"
      },
      optimizeDeps: {
        include: ["vue", "vue-router", "pinia", "element-plus", "axios", "dayjs"]
      }
    },
    server: {
      host: "0.0.0.0",
      port: Number(env.VITE_PORT) || 5173,
      open: env.VITE_OPEN === "true",
      hmr: {
        overlay: true
      },
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8080",
          changeOrigin: true,
          rewrite: (path2) => path2.replace(/^\/api/, ""),
          ws: true
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/styles/variables.scss" as *;',
          javascriptEnabled: true
        }
      }
    },
    build: {
      target: "es2022",
      outDir: env.VITE_OUT_DIR || "dist",
      assetsDir: "assets",
      sourcemap: env.VITE_SOURCEMAP === "true",
      minify: "terser",
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          chunkFileNames: "js/[name]-[hash].js",
          entryFileNames: "js/[name]-[hash].js",
          assetFileNames: "[ext]/[name]-[hash].[ext]",
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (id.includes("vue")) {
                return "vue-vendor";
              }
              if (id.includes("vue-router")) {
                return "vue-router";
              }
              if (id.includes("pinia")) {
                return "pinia";
              }
              if (id.includes("element-plus") || id.includes("@element-plus")) {
                return "element-plus";
              }
              if (id.includes("vue-i18n") || id.includes("@intlify")) {
                return "i18n";
              }
              return "vendor";
            }
          }
        }
      },
      chunkSizeWarningLimit: 1e3
    }
  };
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxteS13b3JrMjAyNVxcXFx0YWljaGktdGhyZWUtbGVzc2lvblxcXFx0YWljaGktdGhyZWUtbGVzc2lvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcbXktd29yazIwMjVcXFxcdGFpY2hpLXRocmVlLWxlc3Npb25cXFxcdGFpY2hpLXRocmVlLWxlc3Npb25cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L215LXdvcmsyMDI1L3RhaWNoaS10aHJlZS1sZXNzaW9uL3RhaWNoaS10aHJlZS1sZXNzaW9uL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgbG9hZEVudiwgdHlwZSBQbHVnaW5PcHRpb24gfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgVnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcclxuaW1wb3J0IFZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4J1xyXG5pbXBvcnQgVW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJ1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xyXG5pbXBvcnQgeyBFbGVtZW50UGx1c1Jlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJ1xyXG5pbXBvcnQgeyBjcmVhdGVIdG1sUGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4taHRtbCdcclxuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcidcclxuaW1wb3J0IHZpdGVDb21wcmVzc2lvbiBmcm9tICd2aXRlLXBsdWdpbi1jb21wcmVzc2lvbidcclxuaW1wb3J0IHsgQ29uZmlnRW52IH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0ICh7IG1vZGUgfTogQ29uZmlnRW52KSA9PiB7XHJcbiAgY29uc3Qgcm9vdCA9IHByb2Nlc3MuY3dkKClcclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHJvb3QpXHJcbiAgY29uc3QgaXNCdWlsZCA9IG1vZGUgPT09ICdwcm9kdWN0aW9uJyB8fCBtb2RlID09PSAncHJvZCdcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGJhc2U6IGVudi5WSVRFX0JBU0VfUEFUSCxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgVnVlKCksXHJcbiAgICAgIFZ1ZUpzeCgpLFxyXG4gICAgICBVbm9DU1MoKSxcclxuICAgICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgICAgaW1wb3J0czogW1xyXG4gICAgICAgICAgJ3Z1ZScsXHJcbiAgICAgICAgICAndnVlLXJvdXRlcicsXHJcbiAgICAgICAgICAncGluaWEnLFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAndnVlLWkxOG4nOiBbJ3VzZUkxOG4nXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgZHRzOiAnc3JjL3R5cGVzL2F1dG8taW1wb3J0cy5kLnRzJyxcclxuICAgICAgICBlc2xpbnRyYzoge1xyXG4gICAgICAgICAgZW5hYmxlZDogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0pLFxyXG4gICAgICBDb21wb25lbnRzKHtcclxuICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCldLFxyXG4gICAgICAgIGR0czogJ3NyYy90eXBlcy9jb21wb25lbnRzLmQudHMnLFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsndnVlJywgJ3RzeCddLFxyXG4gICAgICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC52dWVcXD92dWUvLCAvXFwudHN4JC9dLFxyXG4gICAgICAgIGV4Y2x1ZGU6IFsvW1xcXFwvXW5vZGVfbW9kdWxlc1tcXFxcL10vLCAvW1xcXFwvXVxcXFwuZ2l0W1xcXFwvXS8sIC9bXFxcXC9dXFxcXC5udXh0W1xcXFwvXS9dXHJcbiAgICAgIH0pLFxyXG4gICAgICBjcmVhdGVIdG1sUGx1Z2luKHtcclxuICAgICAgICBtaW5pZnk6IHRydWUsXHJcbiAgICAgICAgdGVtcGxhdGU6ICdpbmRleC5odG1sJ1xyXG4gICAgICB9KSxcclxuICAgICAgLy8gR3ppcCBcdTUzOEJcdTdGMjlcclxuICAgICAgdml0ZUNvbXByZXNzaW9uKHtcclxuICAgICAgICB2ZXJib3NlOiB0cnVlLFxyXG4gICAgICAgIGRpc2FibGU6ICFpc0J1aWxkLFxyXG4gICAgICAgIHRocmVzaG9sZDogMTAyNDAsXHJcbiAgICAgICAgYWxnb3JpdGhtOiAnZ3ppcCcsXHJcbiAgICAgICAgZXh0OiAnLmd6J1xyXG4gICAgICB9KSxcclxuICAgICAgLy8gXHU2MjUzXHU1MzA1XHU0RjUzXHU3OUVGXHU1MjA2XHU2NzkwXHJcbiAgICAgIGlzQnVpbGQgJiZcclxuICAgICAgICB2aXN1YWxpemVyKHtcclxuICAgICAgICAgIG9wZW46IGZhbHNlLFxyXG4gICAgICAgICAgZ3ppcFNpemU6IHRydWUsXHJcbiAgICAgICAgICBicm90bGlTaXplOiB0cnVlLFxyXG4gICAgICAgICAgZmlsZW5hbWU6ICdkaXN0L3N0YXRzLmh0bWwnXHJcbiAgICAgICAgfSlcclxuICAgIF0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuICAgICAgICAndnVlLWkxOG4nOiAndnVlLWkxOG4vZGlzdC92dWUtaTE4bi5janMuanMnXHJcbiAgICAgIH0sXHJcbiAgICAgIG9wdGltaXplRGVwczoge1xyXG4gICAgICAgIGluY2x1ZGU6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInLCAncGluaWEnLCAnZWxlbWVudC1wbHVzJywgJ2F4aW9zJywgJ2RheWpzJ11cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBob3N0OiAnMC4wLjAuMCcsXHJcbiAgICAgIHBvcnQ6IE51bWJlcihlbnYuVklURV9QT1JUKSB8fCA1MTczLFxyXG4gICAgICBvcGVuOiBlbnYuVklURV9PUEVOID09PSAndHJ1ZScsXHJcbiAgICAgIGhtcjoge1xyXG4gICAgICAgIG92ZXJsYXk6IHRydWVcclxuICAgICAgfSxcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICAnL2FwaSc6IHtcclxuICAgICAgICAgIHRhcmdldDogZW52LlZJVEVfQVBJX1VSTCB8fCAnaHR0cDovL2xvY2FsaG9zdDo4MDgwJyxcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXHJcbiAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNzczoge1xyXG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgICAgc2Nzczoge1xyXG4gICAgICAgICAgYWRkaXRpb25hbERhdGE6ICdAdXNlIFwiQC9zdHlsZXMvdmFyaWFibGVzLnNjc3NcIiBhcyAqOycsXHJcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIHRhcmdldDogJ2VzMjAyMicsXHJcbiAgICAgIG91dERpcjogZW52LlZJVEVfT1VUX0RJUiB8fCAnZGlzdCcsXHJcbiAgICAgIGFzc2V0c0RpcjogJ2Fzc2V0cycsXHJcbiAgICAgIHNvdXJjZW1hcDogZW52LlZJVEVfU09VUkNFTUFQID09PSAndHJ1ZScsXHJcbiAgICAgIG1pbmlmeTogJ3RlcnNlcicsXHJcbiAgICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdqcy9bbmFtZV0tW2hhc2hdLmpzJyxcclxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnanMvW25hbWVdLVtoYXNoXS5qcycsXHJcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogJ1tleHRdL1tuYW1lXS1baGFzaF0uW2V4dF0nLFxyXG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiAoaWQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xyXG4gICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygndnVlJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAndnVlLXZlbmRvcidcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCd2dWUtcm91dGVyJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAndnVlLXJvdXRlcidcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdwaW5pYScpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3BpbmlhJ1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2VsZW1lbnQtcGx1cycpIHx8IGlkLmluY2x1ZGVzKCdAZWxlbWVudC1wbHVzJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnZWxlbWVudC1wbHVzJ1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3Z1ZS1pMThuJykgfHwgaWQuaW5jbHVkZXMoJ0BpbnRsaWZ5JykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnaTE4bidcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMFxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtXLFNBQVMsZUFBa0M7QUFDN1ksT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQUNuQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUywyQkFBMkI7QUFDcEMsU0FBUyx3QkFBd0I7QUFDakMsU0FBUyxrQkFBa0I7QUFDM0IsT0FBTyxxQkFBcUI7QUFFNUIsT0FBTyxVQUFVO0FBWGpCLElBQU0sbUNBQW1DO0FBY3pDLElBQU8sc0JBQVEsQ0FBQyxFQUFFLEtBQUssTUFBaUI7QUFDdEMsUUFBTSxPQUFPLFFBQVEsSUFBSTtBQUN6QixRQUFNLE1BQU0sUUFBUSxNQUFNLElBQUk7QUFDOUIsUUFBTSxVQUFVLFNBQVMsZ0JBQWdCLFNBQVM7QUFFbEQsU0FBTztBQUFBLElBQ0wsTUFBTSxJQUFJO0FBQUEsSUFDVixTQUFTO0FBQUEsTUFDUCxJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxPQUFPO0FBQUEsTUFDUCxXQUFXO0FBQUEsUUFDVCxTQUFTO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFlBQ0UsWUFBWSxDQUFDLFNBQVM7QUFBQSxVQUN4QjtBQUFBLFFBQ0Y7QUFBQSxRQUNBLEtBQUs7QUFBQSxRQUNMLFVBQVU7QUFBQSxVQUNSLFNBQVM7QUFBQSxRQUNYO0FBQUEsTUFDRixDQUFDO0FBQUEsTUFDRCxXQUFXO0FBQUEsUUFDVCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxRQUNqQyxLQUFLO0FBQUEsUUFDTCxZQUFZLENBQUMsT0FBTyxLQUFLO0FBQUEsUUFDekIsU0FBUyxDQUFDLFVBQVUsY0FBYyxRQUFRO0FBQUEsUUFDMUMsU0FBUyxDQUFDLDBCQUEwQixvQkFBb0IsbUJBQW1CO0FBQUEsTUFDN0UsQ0FBQztBQUFBLE1BQ0QsaUJBQWlCO0FBQUEsUUFDZixRQUFRO0FBQUEsUUFDUixVQUFVO0FBQUEsTUFDWixDQUFDO0FBQUE7QUFBQSxNQUVELGdCQUFnQjtBQUFBLFFBQ2QsU0FBUztBQUFBLFFBQ1QsU0FBUyxDQUFDO0FBQUEsUUFDVixXQUFXO0FBQUEsUUFDWCxXQUFXO0FBQUEsUUFDWCxLQUFLO0FBQUEsTUFDUCxDQUFDO0FBQUE7QUFBQSxNQUVELFdBQ0UsV0FBVztBQUFBLFFBQ1QsTUFBTTtBQUFBLFFBQ04sVUFBVTtBQUFBLFFBQ1YsWUFBWTtBQUFBLFFBQ1osVUFBVTtBQUFBLE1BQ1osQ0FBQztBQUFBLElBQ0w7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxRQUNwQyxZQUFZO0FBQUEsTUFDZDtBQUFBLE1BQ0EsY0FBYztBQUFBLFFBQ1osU0FBUyxDQUFDLE9BQU8sY0FBYyxTQUFTLGdCQUFnQixTQUFTLE9BQU87QUFBQSxNQUMxRTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU0sT0FBTyxJQUFJLFNBQVMsS0FBSztBQUFBLE1BQy9CLE1BQU0sSUFBSSxjQUFjO0FBQUEsTUFDeEIsS0FBSztBQUFBLFFBQ0gsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVEsSUFBSSxnQkFBZ0I7QUFBQSxVQUM1QixjQUFjO0FBQUEsVUFDZCxTQUFTLENBQUNBLFVBQVNBLE1BQUssUUFBUSxVQUFVLEVBQUU7QUFBQSxVQUM1QyxJQUFJO0FBQUEsUUFDTjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxxQkFBcUI7QUFBQSxRQUNuQixNQUFNO0FBQUEsVUFDSixnQkFBZ0I7QUFBQSxVQUNoQixtQkFBbUI7QUFBQSxRQUNyQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixRQUFRLElBQUksZ0JBQWdCO0FBQUEsTUFDNUIsV0FBVztBQUFBLE1BQ1gsV0FBVyxJQUFJLG1CQUFtQjtBQUFBLE1BQ2xDLFFBQVE7QUFBQSxNQUNSLGNBQWM7QUFBQSxNQUNkLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLGdCQUFnQjtBQUFBLFVBQ2hCLGdCQUFnQjtBQUFBLFVBQ2hCLGdCQUFnQjtBQUFBLFVBQ2hCLGNBQWMsQ0FBQyxPQUFPO0FBQ3BCLGdCQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDL0Isa0JBQUksR0FBRyxTQUFTLEtBQUssR0FBRztBQUN0Qix1QkFBTztBQUFBLGNBQ1Q7QUFDQSxrQkFBSSxHQUFHLFNBQVMsWUFBWSxHQUFHO0FBQzdCLHVCQUFPO0FBQUEsY0FDVDtBQUNBLGtCQUFJLEdBQUcsU0FBUyxPQUFPLEdBQUc7QUFDeEIsdUJBQU87QUFBQSxjQUNUO0FBQ0Esa0JBQUksR0FBRyxTQUFTLGNBQWMsS0FBSyxHQUFHLFNBQVMsZUFBZSxHQUFHO0FBQy9ELHVCQUFPO0FBQUEsY0FDVDtBQUNBLGtCQUFJLEdBQUcsU0FBUyxVQUFVLEtBQUssR0FBRyxTQUFTLFVBQVUsR0FBRztBQUN0RCx1QkFBTztBQUFBLGNBQ1Q7QUFDQSxxQkFBTztBQUFBLFlBQ1Q7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLHVCQUF1QjtBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
