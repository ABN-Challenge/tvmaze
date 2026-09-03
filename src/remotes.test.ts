import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import * as remotes from './remotes'
import { loadRemote } from './remotes'

const Remote = defineComponent({
  setup() {
    return () => h('div', { 'data-testid': 'remote' }, 'remote ok')
  },
})

/** Vue only unwraps `default` for real ES modules, so mimic one. */
function asModule(component: typeof Remote) {
  return { __esModule: true, default: component } as unknown as { default: typeof Remote }
}

/** An async component cannot be the mount root, so give it a plain parent. */
function mountRemote(component: ReturnType<typeof loadRemote>) {
  return mount(defineComponent({ render: () => h('div', [h(component)]) }))
}

/**
 * Fake timers stub out `setTimeout`, which `flushPromises` depends on, so
 * advance the clock instead to drain both timers and microtasks.
 */
async function tick(ms: number, times = 4) {
  for (let i = 0; i < times; i += 1) {
    await vi.advanceTimersByTimeAsync(ms)
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('loadRemote', () => {
  it('renders the remote component once it resolves', async () => {
    const wrapper = mountRemote(loadRemote(() => Promise.resolve(asModule(Remote)), 'test'))
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('remote ok')
    })
  })

  it('shows the loading component while the remote is pending', async () => {
    vi.useFakeTimers()
    const wrapper = mountRemote(loadRemote(() => new Promise(() => {}), 'test'))
    await tick(250)

    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading')
  })

  it('retries a failing remote and recovers', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const loader = vi
      .fn<() => Promise<{ default: typeof Remote }>>()
      .mockRejectedValueOnce(new Error('remote down'))
      .mockResolvedValue(asModule(Remote))

    const wrapper = mountRemote(loadRemote(loader, 'flaky'))
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('remote ok')
    })

    expect(loader).toHaveBeenCalledTimes(2)
    expect(warn).toHaveBeenCalledWith(
      '[federation] failed to load flaky (attempt 1)',
      expect.any(Error),
    )
  })

  it('renders the error component after exhausting retries', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const loader = vi.fn(() => Promise.reject(new Error('remote down')))
    const wrapper = mountRemote(loadRemote(loader, 'broken'))

    // Five retries with escalating backoff, then the sixth attempt gives up.
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      await tick(400 * attempt)
    }

    expect(loader).toHaveBeenCalledTimes(6)
    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Could not load broken')
  })
})

describe('remote exports', () => {
  it('wraps every federated shell component and page', () => {
    const expected = [
      'AppShell',
      'AppHeader',
      'AppFooter',
      'SearchInput',
      'ResponsiveSearch',
      'DashboardPage',
      'SearchPage',
      'ShowDetailsPage',
      'NotFoundPage',
    ]
    for (const name of expected) {
      expect(remotes[name as keyof typeof remotes]).toBeTruthy()
    }
  })
})
