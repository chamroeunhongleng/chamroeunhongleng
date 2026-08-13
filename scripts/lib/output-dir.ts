/**
 * output-dir — where the static build actually landed.
 *
 * Nitro's preset decides this, and the preset follows the environment:
 * `vercel build` runs with VERCEL=1, which selects `vercel-static` and writes
 * `.vercel/output/static` (the Build Output API layout); every other build —
 * `npm run generate`, `npm run verify`, the e2e and CV renders — writes
 * `.output/public`.
 *
 * Scripts that run ONLY after a local generate (check-links, check-a11y,
 * check-seo) can keep hardcoding `.output/public`. The CSP scripts cannot:
 * inject-csp runs inside `vercel build`, where the hardcoded path does not
 * exist. It aborted the first production build for exactly that reason, which
 * was the right failure — an injector that writes to the wrong tree and
 * reports OK would ship an artifact with no policy at all.
 *
 * The choice is made from the environment, never by probing for whichever
 * directory happens to exist: a stale `.output/public` left over from an
 * earlier verify would otherwise absorb the injection while the artifact
 * heading for production went out bare.
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const VERCEL_STATIC = ['.vercel', 'output', 'static']
const NUXT_STATIC = ['.output', 'public']

/** True when this process is the one `vercel build` spawned. */
export function isVercelBuild(): boolean {
  return Boolean(process.env.VERCEL) || /vercel/i.test(process.env.NITRO_PRESET ?? '')
}

/** Absolute path to the generated site, whether or not it exists yet. */
export function outputDir(root: string): string {
  return join(root, ...(isVercelBuild() ? VERCEL_STATIC : NUXT_STATIC))
}

/** Repo-relative label for error messages, in the separator style of the OS. */
export function outputDirLabel(): string {
  return (isVercelBuild() ? VERCEL_STATIC : NUXT_STATIC).join('/')
}

/**
 * The generated site, or a loud exit. `hint` names the command that would
 * produce it — different for a local run than for a Vercel build.
 */
export function requireOutputDir(root: string, scriptName: string): string {
  const directory = outputDir(root)
  if (!existsSync(directory)) {
    const hint = isVercelBuild()
      ? 'the Nitro build did not produce it — check the build log above'
      : 'run `npm run generate` first'
    console.error(`${scriptName} — FAILED: ${outputDirLabel()} does not exist. ${hint}.`)
    process.exit(1)
  }
  return directory
}
