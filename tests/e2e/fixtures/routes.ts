import { publishedProjects } from './projects'

/**
 * Every route the site publishes. Mirrors the staticRoutes + projectRoutes
 * split in nuxt.config.ts — project routes derive from content (CLAUDE.md
 * rule 4), so adding a project JSON file extends coverage automatically.
 *
 * Shared by global-setup.ts (route warm-up) and site.spec.ts (whole-site
 * assertions) so the two can never drift apart.
 */
export const STATIC_ROUTES = [
  '/',
  '/about',
  '/projects',
  '/journey',
  '/learning',
  '/contact',
  '/colophon'
] as const

export const PROJECT_ROUTES = publishedProjects.map((p) => `/projects/${p.slug}`)

export const ALL_ROUTES: string[] = [...STATIC_ROUTES, ...PROJECT_ROUTES]

/** A readable test name for a route ("/" -> "home"). */
export function routeLabel(route: string): string {
  return route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-')
}
