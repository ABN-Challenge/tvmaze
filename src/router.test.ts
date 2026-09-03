import { describe, expect, it } from 'vitest'
import { routeDefs } from './routeDefs'

describe('host routes', () => {
  it('exposes dashboard, search and details routes', () => {
    expect(routeDefs.map((route) => route.path)).toEqual(['/', '/search', '/shows/:id'])
    expect(routeDefs.map((route) => route.name)).toEqual(['dashboard', 'search', 'show'])
  })
})
