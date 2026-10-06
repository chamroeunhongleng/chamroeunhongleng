import { ALL_ROUTES } from './fixtures/routes'

// Warm every route once before the workers start: the Nuxt dev server compiles a
// route on first request, and parallel first-compiles drop requests (net::ERR_ABORTED).
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
      // A warmup miss is not a failure; the tests will surface real issues.
      console.warn(`[warmup] ${route} failed: ${(error as Error).message}`)
    }
  }

  console.log(`[warmup] primed ${warmed}/${routes.length} routes in ${Date.now() - started}ms`)
}
