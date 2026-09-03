export const routeDefs = [
  { path: '/', name: 'dashboard' },
  { path: '/search', name: 'search' },
  { path: '/shows/:id', name: 'show' },
  { path: '/:pathMatch(.*)*', name: 'not-found' },
] as const
