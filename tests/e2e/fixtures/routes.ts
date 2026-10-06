import { publishedProjects } from './projects'

// Mirrors the staticRoutes + projectRoutes split in nuxt.config.ts; shared by
// global-setup.ts and site.spec.ts so the two can never drift apart.
export const STATIC_ROUTES = [
  '/',
  '/about',
  '/projects',
  '/journey',
  '/learning',
  '/contact',
  '/colophon',
  '/cv'
] as const

export const PROJECT_ROUTES = publishedProjects.map((p) => `/projects/${p.slug}`)

export const ALL_ROUTES: string[] = [...STATIC_ROUTES, ...PROJECT_ROUTES]

/** A readable test name for a route ("/" -> "home"). */
export function routeLabel(route: string): string {
  return route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-')
}
