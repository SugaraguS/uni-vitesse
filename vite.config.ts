/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import UniPages from '@uni-helper/vite-plugin-uni-pages'
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(async ({ mode, command }) => {
  // mode: 区分生产环境还是开发环境

  console.log('%c [mode, command]-16', 'font-size:16px; background:#d2d363; color:#ffffa7;', mode, command)
  /**
   * 为兼容 @dcloudio/vite-plugin-uni 采用 CJS ，而 UnoCSS 只支持 ESM
   * @see https://github.com/dcloudio/uni-app/issues/4815
   */
  const Unocss = await import('unocss/vite').then(i => i.default)

  const { UNI_PLATFORM } = process.env
  console.log('UNI_PLATFORM -> ', UNI_PLATFORM) // 得到 mp-weixin, h5, app 等

  const env = loadEnv(mode, process.cwd())
  const {
    VITE_APP_PORT,
    VITE_SERVER_AUTH_URL,
    VITE_SERVER_BASE_URL,
    VITE_DELETE_CONSOLE,
    VITE_SHOW_SOURCEMAP,
    VITE_APP_PROXY,
  } = env
  console.log('环境变量 env -> ', env)

  return {
    resolve: {
      alias: {
        '~/': `${resolve(__dirname, 'src')}/`,
      },
    },
    define: {
      __UNI_PLATFORM__: JSON.stringify(UNI_PLATFORM),
      __VITE_APP_PROXY__: JSON.stringify(VITE_APP_PROXY),
    },
    plugins: [
      /**
       * vite-plugin-uni-pages
       * @see https://github.com/uni-helper/vite-plugin-uni-pages
       */
      UniPages({
        subPackages: [
          'src/pages-sub',
        ],
      }),

      /**
       * vite-plugin-uni-layouts
       * @see https://github.com/uni-helper/vite-plugin-uni-layouts
       */
      UniLayouts(),

      /**
       * unocss
       * @see https://github.com/antfu/unocss
       * see unocss.config.ts for config
       */
      Unocss(),

      /**
       * unplugin-auto-import 按需 import
       * @see https://github.com/antfu/unplugin-auto-import
       */
      AutoImport({
        imports: [
          'vue',
          'uni-app',
          {
            'vue-request': ['useRequest'],
          },
        ],
        dts: 'src/types/auto-import.d.ts',
        dirs: [
          './src/composables',
          './src/services/**',
        ],
        vueTemplate: true,
      }),

      /**
       * unplugin-vue-components 按需引入组件
       * 注意：需注册至 uni 之前，否则不会生效
       * @see https://github.com/antfu/vite-plugin-components
       */
      Components({
        dts: 'src/types/components.d.ts',
      }),

      /**
       * vite-plugin-vue-devtools 增强 Vue 开发者体验
       * @see https://github.com/webfansplz/vite-plugin-vue-devtools
       */
      VueDevTools(),

      uni(),
    ],

    server: {
      host: '0.0.0.0',
      hmr: true,
      port: Number.parseInt(VITE_APP_PORT, 10),
      // 仅 H5 端生效，其他端不生效（其他端走build，不走devServer)
      proxy: JSON.parse(VITE_APP_PROXY)
        ? {
          // [VITE_APP_PROXY_PREFIX]: {
          //   target: VITE_SERVER_BASE_URL,
          //   changeOrigin: true,
          //   rewrite: (path) => path.replace(new RegExp(`^${VITE_APP_PROXY_PREFIX}`), ''),
          // },
            '/connect': {
              target: VITE_SERVER_AUTH_URL,
              changeOrigin: true,
              secure: false,
            },
            '/api': {
              target: VITE_SERVER_BASE_URL,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },

    build: {
      // 方便非h5端调试
      sourcemap: VITE_SHOW_SOURCEMAP === 'true', // 默认是false
      target: 'es6',
      terserOptions: {
        compress: {
          drop_console: VITE_DELETE_CONSOLE === 'true',
          drop_debugger: true,
        },
      },
    },

    /**
     * Vitest
     * @see https://github.com/vitest-dev/vitest
     */
    test: {
      environment: 'jsdom',
    },
  }
})
