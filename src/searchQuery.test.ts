import { describe, expect, it } from 'vitest'
import { queryFromRoute } from './searchQuery'

describe('queryFromRoute', () => {
  it('returns a plain string query unchanged', () => {
    expect(queryFromRoute('girls')).toBe('girls')
  })

  it('returns an empty string when the query is missing', () => {
    expect(queryFromRoute(undefined)).toBe('')
    expect(queryFromRoute(null)).toBe('')
  })

  it('takes the first value when the query repeats', () => {
    expect(queryFromRoute(['girls', 'boys'])).toBe('girls')
  })

  it('returns an empty string for an empty array', () => {
    expect(queryFromRoute([])).toBe('')
    expect(queryFromRoute([null])).toBe('')
  })
})
