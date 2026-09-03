import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>'
  window.location.hash = '#/'
  // jsdom has no layout, so the router's scrollBehavior would log "not implemented".
  vi.stubGlobal('scrollTo', vi.fn())
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('host bootstrap', () => {
  it('mounts the app into #app', async () => {
    await import('./main')
    // Vue replaces the mount target's content once the root component renders.
    const root = document.getElementById('app')
    expect(root).not.toBeNull()
    expect(root?.getAttribute('data-v-app')).not.toBeNull()
  })
})
