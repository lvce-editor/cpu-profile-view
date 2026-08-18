import * as esbuild from 'esbuild'
import fs from 'node:fs'
import path from 'node:path'
import { root } from './root.ts'

const extension = path.join(root, 'packages', 'extension')
const outDirectory = path.join(extension, 'dist')

fs.rmSync(outDirectory, { force: true, recursive: true })
fs.mkdirSync(outDirectory, { recursive: true })

await esbuild.build({
  bundle: true,
  entryPoints: [path.join(extension, 'src', 'cpuProfileViewMain.ts')],
  external: ['electron', 'node:*'],
  format: 'esm',
  outfile: path.join(outDirectory, 'cpuProfileViewMain.js'),
  platform: 'browser',
  sourcemap: true,
  target: 'esnext',
})
