/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'
import { fileURLToPath, URL } from 'node:url'

const stub = (file: string) =>
  fileURLToPath(new URL(`./src/testing/stubs/${file}`, import.meta.url))

/**
 * Host CI checks out this repo only, so unit tests resolve the federated
 * specifiers to local stubs instead of the sibling remotes.
 */
const remoteStubs = {
  'tvmaze_ui/styles': stub('noop.ts'),
  'tvmaze_catalog/styles': stub('noop.ts'),
  'tvmaze_ui/AppShell': stub('PassThrough.vue'),
  'tvmaze_ui/AppHeader': stub('PassThrough.vue'),
  'tvmaze_ui/AppFooter': stub('PassThrough.vue'),
  'tvmaze_ui/SearchInput': stub('SearchStub.vue'),
  'tvmaze_ui/ResponsiveSearch': stub('SearchStub.vue'),
  'tvmaze_catalog/DashboardPage': stub('PageStub.vue'),
  'tvmaze_catalog/SearchPage': stub('PageStub.vue'),
  'tvmaze_catalog/ShowDetailsPage': stub('PageStub.vue'),
  'tvmaze_catalog/NotFoundPage': stub('PageStub.vue'),
}

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
      alias: remoteStubs,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,vue}'],
        exclude: ['src/testing/**', 'src/vite-env.d.ts'],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  }
})
