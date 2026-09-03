import { defineAsyncComponent, type Component, h, defineComponent } from 'vue'

function loadRemote(loader: () => Promise<{ default: Component }>, label: string) {
  const PlainError = defineComponent({
    setup() {
      return () =>
        h(
          'div',
          { role: 'alert' },
          `Could not load ${label}. Start the remote apps (ports 5001 and 5002) for local development.`,
        )
    },
  })

  const PlainLoading = defineComponent({
    setup() {
      return () => h('div', { 'aria-busy': 'true' }, 'Loading…')
    },
  })

  return defineAsyncComponent({
    loader,
    delay: 200,
    timeout: 30000,
    onError(error, retry, fail, attempts) {
      console.warn(`[federation] failed to load ${label} (attempt ${attempts})`, error)
      if (attempts <= 5) {
        window.setTimeout(() => retry(), 400 * attempts)
      } else {
        fail()
      }
    },
    errorComponent: PlainError,
    loadingComponent: PlainLoading,
  })
}

export const AppShell = loadRemote(() => import('tvmaze_ui/AppShell'), 'tvmaze-ui AppShell')
export const AppHeader = loadRemote(() => import('tvmaze_ui/AppHeader'), 'tvmaze-ui AppHeader')
export const AppFooter = loadRemote(() => import('tvmaze_ui/AppFooter'), 'tvmaze-ui AppFooter')
export const SearchInput = loadRemote(() => import('tvmaze_ui/SearchInput'), 'tvmaze-ui SearchInput')
export const ResponsiveSearch = loadRemote(
  () => import('tvmaze_ui/ResponsiveSearch'),
  'tvmaze-ui ResponsiveSearch',
)
export const DashboardPage = loadRemote(
  () => import('tvmaze_catalog/DashboardPage'),
  'tvmaze-catalog DashboardPage',
)
export const SearchPage = loadRemote(
  () => import('tvmaze_catalog/SearchPage'),
  'tvmaze-catalog SearchPage',
)
export const ShowDetailsPage = loadRemote(
  () => import('tvmaze_catalog/ShowDetailsPage'),
  'tvmaze-catalog ShowDetailsPage',
)
