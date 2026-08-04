/**
 * generate-assets — renders the authored SVGs into the PNG assets the site
 * ships (OG image + PNG favicons). Outputs are committed; rerun only when
 * assets/og.svg or public/icon.svg change:  npm run assets:generate
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const root = process.cwd()

function render(svgPath: string, outPath: string, width: number) {
  const svg = readFileSync(join(root, svgPath), 'utf8')
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true }
  })
  const png = resvg.render().asPng()
  writeFileSync(join(root, outPath), png)
  console.log(`  wrote ${outPath} (${width}px wide, ${png.length} bytes)`)
}

console.log('generate-assets:')
render('assets/og.svg', 'public/og.png', 1200)
render('public/icon.svg', 'public/apple-touch-icon.png', 180)
render('public/icon.svg', 'public/favicon-32.png', 32)
console.log('generate-assets — OK')
