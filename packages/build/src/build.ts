import { packageExtension } from '@lvce-editor/package-extension'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { type Plugin, rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { root } from './root.ts'

const extension = path.join(root, 'packages', 'extension')
const output = path.join(root, 'dist')
const require = createRequire(import.meta.url)
const commonjs = require('@rollup/plugin-commonjs') as () => Plugin

fs.rmSync(output, { force: true, recursive: true })
fs.mkdirSync(path.join(output, 'dist'), { recursive: true })
fs.mkdirSync(path.join(output, 'media'), { recursive: true })
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(output, 'LICENSE'))
fs.copyFileSync(path.join(root, 'README.md'), path.join(output, 'README.md'))
fs.copyFileSync(path.join(extension, 'extension.json'), path.join(output, 'extension.json'))
fs.copyFileSync(path.join(extension, 'media', 'index.css'), path.join(output, 'media', 'index.css'))

const bundle = await rollup({
  external: ['electron', 'node:*'],
  input: path.join(extension, 'src', 'cpuProfileViewMain.ts'),
  plugins: [nodeResolve({ browser: true }), commonjs(), esbuild({ target: 'esnext' })],
  treeshake: { moduleSideEffects: false },
})

await bundle.write({
  file: path.join(output, 'dist', 'cpuProfileViewMain.js'),
  format: 'esm',
})
await bundle.close()

await packageExtension({
  highestCompression: true,
  inDir: output,
  outFile: path.join(root, 'extension.tar.br'),
})
