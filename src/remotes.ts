import { defineAsyncComponent, type Component, h, defineComponent } from 'vue'

const MAX_ATTEMPTS = 5
const RETRY_BASE_DELAY_MS = 400

/**
 * Wraps a federated import so a slow or missing remote degrades to a plain
 * message instead of an unmounted route. Exported for testing.
 */
export function loadRemote(loader: () => Promise<{ default: Component }>, label: string) {
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
      if (attempts <= MAX_ATTEMPTS) {
        window.setTimeout(() => retry(), RETRY_BASE_DELAY_MS * attempts)
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
export const NotFoundPage = loadRemote(
  () => import('tvmaze_catalog/NotFoundPage'),
  'tvmaze-catalog NotFoundPage',
)
