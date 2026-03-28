// Generate Vue icon components from fluentui-system-icons SVG assets
// Usage: node scripts/generate.js [--assets-path <path>]

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ASSETS_PATH = process.argv[3] || path.resolve(__dirname, '../../fluentui-system-icons-ref/assets')
const OUT_DIR = path.resolve(__dirname, '../src/icons')
const CHUNK_SIZE = 500 // icons per chunk file

function toPascalCase(str) {
  return str
    .replace(/ic_fluent_/, '')
    .replace(/[_-](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^(\w)/, (_, c) => c.toUpperCase())
}

function parseIconSvg(svgContent) {
  // Check if it's a color icon (has multiple fills or non-currentColor fills)
  const isColor = (svgContent.match(/fill="(?!none|currentColor)/g) || []).length > 1

  if (isColor) {
    // Extract inner SVG content
    const inner = svgContent
      .replace(/^[\s\S]*?<svg[^>]*>/, '')
      .replace(/<\/svg>[\s\S]*$/, '')
      .trim()
    return { type: 'color', rawSvg: inner }
  }

  // Extract path d attributes
  const paths = []
  const pathRegex = /\bd="([^"]+)"/g
  let match
  while ((match = pathRegex.exec(svgContent)) !== null) {
    paths.push(match[1])
  }
  return { type: 'paths', paths }
}

function getWidth(svgContent, fileName) {
  // Try to get width from SVG attributes
  const widthMatch = svgContent.match(/\bwidth="(\d+)"/)
  if (widthMatch) return widthMatch[1]

  // Fall back to filename pattern
  const sizeMatch = fileName.match(/_(\d+)_(filled|regular|light|color)/)
  if (sizeMatch) return sizeMatch[1]

  return '20'
}

function processAssetsDir(assetsPath) {
  const icons = []
  const seen = new Set()
  const categories = fs.readdirSync(assetsPath, { withFileTypes: true })

  for (const cat of categories) {
    if (!cat.isDirectory()) continue
    const svgDir = path.join(assetsPath, cat.name, 'SVG')
    if (!fs.existsSync(svgDir)) continue

    const svgFiles = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'))

    for (const file of svgFiles) {
      const svgPath = path.join(svgDir, file)
      const svgContent = fs.readFileSync(svgPath, 'utf8')
      const fileName = file.slice(0, -4) // remove .svg

      const exportName = toPascalCase(fileName)
      // Skip duplicates (some icon folders have overlapping filenames)
      if (seen.has(exportName)) continue
      seen.add(exportName)

      const width = getWidth(svgContent, fileName)
      const parsed = parseIconSvg(svgContent)

      icons.push({ exportName, width, parsed, fileName })
    }
  }

  // Sort for deterministic output
  icons.sort((a, b) => a.exportName.localeCompare(b.exportName))
  return icons
}

function generateChunkFile(icons, chunkIndex) {
  const lines = [
    '// Auto-generated - do not edit',
    'import { createFluentIcon } from "../utils/createFluentIcon"',
    'import type { FluentIcon } from "../utils/createFluentIcon"',
    '',
  ]

  for (const icon of icons) {
    const { exportName, width, parsed } = icon

    if (parsed.type === 'color') {
      const escaped = parsed.rawSvg.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
      lines.push(`export const ${exportName}: FluentIcon = /*#__PURE__*/createFluentIcon("${exportName}", "${width}", \`${escaped}\`, { color: true })`)
    } else {
      const pathsStr = parsed.paths.map(p => `"${p}"`).join(',')
      lines.push(`export const ${exportName}: FluentIcon = /*#__PURE__*/createFluentIcon("${exportName}", "${width}", [${pathsStr}])`)
    }
  }

  return lines.join('\n') + '\n'
}

function main() {
  console.log(`Reading SVG assets from: ${ASSETS_PATH}`)

  if (!fs.existsSync(ASSETS_PATH)) {
    console.error(`Assets path does not exist: ${ASSETS_PATH}`)
    process.exit(1)
  }

  const icons = processAssetsDir(ASSETS_PATH)
  console.log(`Found ${icons.length} icons`)

  // Clean output dir
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true })
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })

  // Split into chunks
  const chunks = []
  for (let i = 0; i < icons.length; i += CHUNK_SIZE) {
    chunks.push(icons.slice(i, i + CHUNK_SIZE))
  }

  console.log(`Generating ${chunks.length} chunk files...`)

  const indexLines = [
    '// Auto-generated - do not edit',
    '// Re-exports all icon chunks',
    '',
  ]

  for (let i = 0; i < chunks.length; i++) {
    const chunkFileName = `chunk${i}.ts`
    const content = generateChunkFile(chunks[i], i)
    fs.writeFileSync(path.join(OUT_DIR, chunkFileName), content)
    indexLines.push(`export * from "./chunk${i}"`)
    process.stdout.write(`  chunk${i}: ${chunks[i].length} icons\n`)
  }

  // Write icons index
  fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), indexLines.join('\n') + '\n')

  console.log(`Done! Generated ${icons.length} icons in ${chunks.length} chunks.`)
}

main()
