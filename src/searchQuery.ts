import type { LocationQueryValue } from 'vue-router'

type RouteQueryValue = LocationQueryValue | LocationQueryValue[] | undefined

/** Normalises a `?q=` route query, which may be absent or repeated, to a string. */
export function queryFromRoute(q: RouteQueryValue): string {
  if (Array.isArray(q)) return String(q[0] ?? '')
  return String(q ?? '')
}
