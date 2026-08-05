/**
 * Render scripts/cv/cv.html to a print-ready A4 PDF.
 *
 *   node scripts/cv/render.mjs [outputPath]
 *
 * Defaults to public/cv/chamroeun-hongleng.pdf — the file the site links from
 * the header pill and the contact page. Page geometry comes from the @page rule
 * in cv.html (preferCSSPageSize), so margins are edited there, not here.
 */
import { chromium } from 'playwright'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const source = path.resolve('scripts/cv/cv.html')
const output = path.resolve(process.argv[2] ?? 'public/cv/chamroeun-hongleng.pdf')

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(pathToFileURL(source).href, { waitUntil: 'networkidle' })
await page.pdf({
  path: output,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true
})
await browser.close()
console.log(`CV rendered -> ${output}`)
