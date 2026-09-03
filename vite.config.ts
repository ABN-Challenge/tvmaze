/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'
  const isTest = Boolean(process.env.VITEST)
  const base = isProd ? '/tvmaze/' : '/'
  const uiRemote =
    env.VITE_UI_REMOTE_URL ||
    (isProd
      ? 'https://abn-challenge.github.io/tvmaze-ui/remoteEntry.js'
      : 'http://localhost:5001/remoteEntry.js')
  const catalogRemote =
    env.VITE_CATALOG_REMOTE_URL ||
    (isProd
      ? 'https://abn-challenge.github.io/tvmaze-catalog/remoteEntry.js'
      : 'http://localhost:5002/remoteEntry.js')

  return {
    base,
    plugins: [
      vue(),
      tailwindcss(),
      !isTest &&
        federation({
          name: 'tvmaze_host',
          remotes: {
            tvmaze_ui: {
              type: 'module',
              name: 'tvmaze_ui',
              entry: uiRemote,
              entryGlobalName: 'tvmaze_ui',
              shareScope: 'default',
            },
            tvmaze_catalog: {
              type: 'module',
              name: 'tvmaze_catalog',
              entry: catalogRemote,
              entryGlobalName: 'tvmaze_catalog',
              shareScope: 'default',
            },
          },
          shared: {
            vue: { singleton: true, requiredVersion: '3.5.13' },
            'vue-router': { singleton: true, requiredVersion: '4.5.0' },
            pinia: { singleton: true, requiredVersion: '2.3.1' },
          },
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      origin: 'http://localhost:5173',
    },
    preview: {
      port: 5173,
      strictPort: true,
    },
    build: {
      target: 'esnext',
      modulePreload: false,
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      },
    },
    esbuild: {
      target: 'esnext',
    },
    test: {
      environment: 'jsdom',
      globals: true,
    },
  }
})
