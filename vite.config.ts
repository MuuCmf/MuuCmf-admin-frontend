import { defineConfig, loadEnv, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const pathSrc = resolve(__dirname, 'src')

const createFilterPlugin = (appName: string): Plugin => {
  return {
    name: 'filter-pages-plugin',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('router/index.ts') || id.includes('stores/modules/router.ts')) {
        const modifiedCode = code.replace(
          /import\.meta\.glob\(["']@\/pages\/\*\*\/\*\*\.vue["']\)/g,
          `import.meta.glob(["@/pages/${appName}/**/*.vue", "@/pages/error/**/*.vue", "@/pages/login.vue", "@/pages/reload.vue"])`
        )

        return modifiedCode
      }
      return null
    },
    load(id) {
      if (id.includes('/pages/') && id.includes('.vue')) {
        const normalizedId = id.replace(/\\/g, '/')
        const relativePath = normalizedId.replace(/.*\/pages\//, 'pages/')

        const allowedPaths = [
          `pages/${appName}/`,
          'pages/login.vue',
          'pages/reload.vue',
          'pages/401.vue',
          'pages/404.vue'
        ]

        const isAllowed = allowedPaths.some(allowedPath => {
          if (allowedPath.endsWith('/')) {
            return relativePath.startsWith(allowedPath)
          } else {
            const basePath = relativePath.split('?')[0]
            return basePath === allowedPath
          }
        })

        if (!isAllowed) {
          console.log(`[FilterPlugin] Excluding: ${relativePath}`)
          return ''
        }
      }
      return null
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: './',
    resolve: {
      alias: {
        '@': pathSrc
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    css: {
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true,
          additionalData: `@use "@/assets/styles/_variables.scss" as *;`
        }
      }
    },
    build: {
      target: 'es2015',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      },
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_NOT_FOUND' && warning.message.includes('/pages/')) {
            return
          }
          if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('element-plus')) {
            return
          }
          warn(warning)
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('element-plus')) {
                return 'element-plus'
              }
              if (id.includes('vue') || id.includes('pinia') || id.includes('@vue')) {
                return 'vue-vendor'
              }
              if (id.includes('echarts')) {
                return 'echarts'
              }
              if (id.includes('axios')) {
                return 'axios'
              }
              if (id.includes('dayjs')) {
                return 'dayjs'
              }
              if (id.includes('lodash')) {
                return 'lodash'
              }
              if (id.includes('@fortawesome')) {
                return 'fontawesome'
              }
              if (id.includes('cropperjs')) {
                return 'cropperjs'
              }
              if (id.includes('nprogress')) {
                return 'nprogress'
              }
              return 'vendor'
            }
          }
        }
      },
      chunkSizeWarningLimit: 1500,
      sourcemap: false,
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'element-plus', 'axios']
    },
    server: {
      host: true,
      port: 3000,
      strictPort: false,
      open: false,
      hmr: {
        overlay: true
      },
      proxy: {
        '/api': {
          target: env.VITE_APP_SERVER,
          changeOrigin: true,
          secure: false,
          ws: true
        },
        '^/(api|admin|activity|attachment|articles|classroom|docs|exam|forum|live|material|micro|minishop|reservation|scoreshop|static|ucenter)':
        {
          target: env.VITE_APP_SERVER,
          changeOrigin: true
        }
      }
    },
    plugins: [
      vue({
        script: {
          defineModel: true,
          propsDestructure: true
        }
      }),
      createFilterPlugin(env.VITE_APP_NAME || 'admin'),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/types/auto-imports.d.ts',
        resolvers: [ElementPlusResolver()],
        exclude: ['defineProps', 'defineEmits']
      }),
      Components({
        dirs: ['src/components'],
        dts: 'src/types/components.d.ts',
        resolvers: [ElementPlusResolver()],
        extensions: ['vue']
      })
    ]
  }
})
