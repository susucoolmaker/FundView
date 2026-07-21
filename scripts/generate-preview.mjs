import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(rootDir, 'dist')
const sourceHtmlPath = join(distDir, 'index.html')
const previewHtmlPath = join(rootDir, '打开预览.html')

let html = await readFile(sourceHtmlPath, 'utf8')

html = await inlineStylesheets(html)
html = await inlineModuleScripts(html)
html = html.replace(/^\s*<link rel="modulepreload"[^>]*>\s*$/gm, '')
html = await inlineAssetReferences(html)

await writeFile(previewHtmlPath, html, 'utf8')

async function inlineStylesheets(source) {
  const stylesheetPattern = /<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g

  return replaceAsync(source, stylesheetPattern, async (_match, href) => {
    const cssPath = assetPath(href)
    const css = await readFile(cssPath, 'utf8')
    return `<style>\n${css}\n</style>`
  })
}

async function inlineModuleScripts(source) {
  const scriptPattern = /<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g

  return replaceAsync(source, scriptPattern, async (_match, src) => {
    const jsPath = assetPath(src)
    const js = await readFile(jsPath, 'utf8')
    return `<script type="module">\n${js}\n</script>`
  })
}

function assetPath(url) {
  const cleanUrl = url.split(/[?#]/)[0].replace(/^\.\//, '').replace(/^\//, '')
  return cleanUrl.startsWith('assets/') ? join(distDir, cleanUrl) : join(distDir, 'assets', cleanUrl)
}

async function replaceAsync(source, pattern, replacer) {
  const matches = [...source.matchAll(pattern)]
  let result = source

  for (const match of matches.reverse()) {
    const replacement = await replacer(...match)
    result = result.slice(0, match.index) + replacement + result.slice(match.index + match[0].length)
  }

  return result
}

async function inlineAssetReferences(source) {
  const assetReferencePattern =
    /(?:\.\/|\/)?assets\/[^"'`)<>\s]+\.(?:png|jpe?g|webp|gif|svg)/g
  const emittedImageFiles = (await readdir(join(distDir, 'assets'))).filter((file) =>
    /\.(?:png|jpe?g|webp|gif|svg)$/i.test(file),
  )
  const assetUrls = [
    ...new Set([
      ...(source.match(assetReferencePattern) ?? []),
      ...emittedImageFiles.filter((file) => source.includes(file)),
    ]),
  ]
  let result = source

  for (const assetUrl of assetUrls) {
    const dataUrl = await assetDataUrl(assetUrl)
    result = result.split(assetUrl).join(dataUrl)
  }

  return result
}

async function assetDataUrl(url) {
  const filePath = assetPath(url)
  const buffer = await readFile(filePath)
  const extension = filePath.split('.').pop()?.toLowerCase()
  const mimeType =
    {
      gif: 'image/gif',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      svg: 'image/svg+xml',
      webp: 'image/webp',
    }[extension ?? ''] ?? 'application/octet-stream'

  return `data:${mimeType};base64,${buffer.toString('base64')}`
}
