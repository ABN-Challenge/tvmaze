import { describe, expect, it, beforeEach, vi } from 'vitest'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory, type Router } from 'vue-router'
import { flushPromises, mount } from '@vue/test-utils'
import { h } from 'vue'
import App from './App.vue'
import { routeDefs } from './routeDefs'

const Blank = { render: () => h('div', { 'data-testid': 'view' }) }

function createTestRouter(): Router {
  return createRouter({
    history: createWebHashHistory(),
    routes: routeDefs.map((def) => ({ ...def, component: Blank })),
  })
}

async function mountApp(initialPath: string) {
  const router = createTestRouter()
  await router.push(initialPath)
  await router.isReady()

  const wrapper = mount(App, {
    global: { plugins: [router, createPinia()] },
  })

  // AppShell, AppHeader and ResponsiveSearch are nested async remotes.
  await vi.waitFor(() => {
    expect(wrapper.find('[data-testid="search-stub-input"]').exists()).toBe(true)
  })
  return { wrapper, router }
}

beforeEach(() => {
  window.location.hash = ''
})

describe('App shell', () => {
  it('renders the header search and the routed view', async () => {
    const { wrapper } = await mountApp('/')
    expect(wrapper.find('[data-testid="search-stub"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="view"]').exists()).toBe(true)
  })

  it('hydrates the header field from the search query param', async () => {
    const { wrapper } = await mountApp('/search?q=girls')
    const input = wrapper.get<HTMLInputElement>('[data-testid="search-stub-input"]')
    expect(input.element.value).toBe('girls')
  })

  it('pushes the typed query to /search on submit', async () => {
    const { wrapper, router } = await mountApp('/')
    await wrapper.get('[data-testid="search-stub-input"]').setValue('  dome  ')
    await wrapper.get('[data-testid="search-stub"]').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/search')
    expect(router.currentRoute.value.query.q).toBe('dome')
  })

  it('pushes /search without a query when the field is blank', async () => {
    const { wrapper, router } = await mountApp('/')
    await wrapper.get('[data-testid="search-stub"]').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/search')
    expect(router.currentRoute.value.query.q).toBeUndefined()
  })

  it('replaces the query param while typing on /search', async () => {
    const { wrapper, router } = await mountApp('/search?q=girls')
    await wrapper.get('[data-testid="search-stub-input"]').setValue('boys')
    await flushPromises()

    expect(router.currentRoute.value.query.q).toBe('boys')
  })

  it('clears the query param when the field is emptied on /search', async () => {
    const { wrapper, router } = await mountApp('/search?q=girls')
    await wrapper.get('[data-testid="search-stub-input"]').setValue('')
    await flushPromises()

    expect(router.currentRoute.value.query.q).toBeUndefined()
  })

  it('leaves the route alone when typing outside /search', async () => {
    const { wrapper, router } = await mountApp('/')
    await wrapper.get('[data-testid="search-stub-input"]').setValue('typed')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('syncs the field when the search query changes externally', async () => {
    const { wrapper, router } = await mountApp('/search?q=girls')
    await router.replace('/search?q=external')
    await flushPromises()

    const input = wrapper.get<HTMLInputElement>('[data-testid="search-stub-input"]')
    expect(input.element.value).toBe('external')
  })

  it('ignores route changes away from /search', async () => {
    const { wrapper, router } = await mountApp('/search?q=girls')
    await router.push('/shows/1')
    await flushPromises()

    const input = wrapper.get<HTMLInputElement>('[data-testid="search-stub-input"]')
    expect(input.element.value).toBe('girls')
  })

  it('does not renavigate when the typed value already matches the query', async () => {
    const { wrapper, router } = await mountApp('/search?q=girls')
    const before = router.currentRoute.value.fullPath
    await wrapper.get('[data-testid="search-stub-input"]').setValue('girls')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe(before)
  })
})
