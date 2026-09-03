import { describe, expect, it } from 'vitest'
import type { RouteLocationNormalizedGeneric } from 'vue-router'
import { routeDefs } from './routeDefs'
import { router, routes } from './router'

describe('host routes', () => {
  it('exposes dashboard, search, details and catch-all routes', () => {
    expect(routeDefs.map((route) => route.path)).toEqual([
      '/',
      '/search',
      '/shows/:id',
      '/:pathMatch(.*)*',
    ])
    expect(routeDefs.map((route) => route.name)).toEqual([
      'dashboard',
      'search',
      'show',
      'not-found',
    ])
  })

  it('pairs every route definition with a component', () => {
    expect(routes).toHaveLength(routeDefs.length)
    for (const route of routes) {
      expect(route.component).toBeTruthy()
    }
  })

  it('resolves a show id into route params', () => {
    const resolved = router.resolve('/shows/42')
    expect(resolved.name).toBe('show')
    expect(resolved.params.id).toBe('42')
  })

  it('routes unknown paths to the catch-all', () => {
    expect(router.resolve('/does-not-exist').name).toBe('not-found')
    // A skip-link style fragment must not fall through to a blank view.
    expect(router.resolve('/main').name).toBe('not-found')
  })

  it('scrolls to the top on navigation', () => {
    const scrollBehavior = router.options.scrollBehavior
    expect(scrollBehavior).toBeTypeOf('function')

    const to = router.resolve('/') as unknown as RouteLocationNormalizedGeneric
    expect(scrollBehavior?.(to, to, null)).toEqual({ top: 0 })
  })
})
