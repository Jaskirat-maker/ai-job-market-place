import http from 'node:http'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'frontend', 'dist')
const outDir = path.join(root, 'docs', 'screenshots')
const require = createRequire(path.join(root, 'frontend', 'package.json'))
// eslint-disable-next-line import/no-commonjs
const { chromium } = require('playwright')

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

function contentType(p) {
  if (p.endsWith('.html')) return 'text/html; charset=utf-8'
  if (p.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (p.endsWith('.css')) return 'text/css; charset=utf-8'
  if (p.endsWith('.svg')) return 'image/svg+xml'
  if (p.endsWith('.png')) return 'image/png'
  if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg'
  return 'application/octet-stream'
}

async function startServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0])
      const rel = urlPath === '/' ? '/index.html' : urlPath
      const fsPath = path.normalize(path.join(distDir, rel))
      if (!fsPath.startsWith(distDir)) {
        res.writeHead(400)
        res.end('bad request')
        return
      }
      const filePath = (await exists(fsPath)) ? fsPath : path.join(distDir, 'index.html')
      const buf = await fs.readFile(filePath)
      res.writeHead(200, { 'content-type': contentType(filePath) })
      res.end(buf)
    } catch (e) {
      res.writeHead(500)
      res.end('server error')
    }
  })
  await new Promise((resolve) => server.listen(0, resolve))
  const { port } = server.address()
  return { server, port }
}

async function main() {
  if (!(await exists(distDir))) {
    throw new Error(`Missing ${distDir}. Run: (cd frontend && VITE_DEMO_MODE=true npm run build)`)
  }
  await fs.mkdir(outDir, { recursive: true })

  const { server, port } = await startServer()
  const base = `http://127.0.0.1:${port}`

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  const shots = [
    { route: '/', file: 'dashboard.png' },
    { route: '/projects', file: 'projects.png' },
    { route: '/projects/1', file: 'project-detail.png' },
  ]

  for (const s of shots) {
    await page.goto(`${base}${s.route}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(outDir, s.file), fullPage: true })
  }

  await browser.close()
  await new Promise((resolve) => server.close(resolve))
  // eslint-disable-next-line no-console
  console.log(`Saved screenshots to ${outDir}`)
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
  process.exit(1)
})

