import { ALL_ROUTES } from './fixtures/routes'

/**
 * Warm every route once, sequentially, before the test workers start.
 *
 * The Nuxt DEV server compiles a route on its first request. Without this,
 * parallel workers all trigger first-compiles at once and the server drops
 * requests — tests die with "net::ERR_ABORTED; maybe frame was detached?"
 * while passing fine in isolation. One serial pass primes the compile cache so
 * the parallel run only ever hits warm routes.
 *
 * Route list derives from content (CLAUDE.md rule 4) — see fixtures/routes.ts.
 */
export default async function globalSetup() {
  const baseURL = 'http://127.0.0.1:3000'
  const routes = ALL_ROUTES

  const started = Date.now()
  let warmed = 0

  for (const route of routes) {
    try {
      const res = await fetch(new URL(route, baseURL), { signal: AbortSignal.timeout(120_000) })
      // Drain the body so the server finishes the response before the next one.
      await res.arrayBuffer()
      warmed++
    } catch (error) {
      // Never fail the run on a warmup miss — the route may legitimately 404,
      // or the server may not be reachable yet. Tests will surface real issues.
      console.warn(`[warmup] ${route} failed: ${(error as Error).message}`)
    }
  }

  console.log(`[warmup] primed ${warmed}/${routes.length} routes in ${Date.now() - started}ms`)
}
