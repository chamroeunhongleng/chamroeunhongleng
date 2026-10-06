// `vercel build` (VERCEL=1 selects the vercel-static preset) writes .vercel/output/static;
// every other build writes .output/public.
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const VERCEL_STATIC = ['.vercel', 'output', 'static']
const NUXT_STATIC = ['.output', 'public']

/** From the environment, never by probing: a stale .output/public would otherwise absorb the injection. */
export function isVercelBuild(): boolean {
  return Boolean(process.env.VERCEL) || /vercel/i.test(process.env.NITRO_PRESET ?? '')
}

export function outputDir(root: string): string {
  return join(root, ...(isVercelBuild() ? VERCEL_STATIC : NUXT_STATIC))
}

export function outputDirLabel(): string {
  return (isVercelBuild() ? VERCEL_STATIC : NUXT_STATIC).join('/')
}

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
