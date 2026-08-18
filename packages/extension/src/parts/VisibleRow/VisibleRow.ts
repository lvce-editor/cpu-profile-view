import type { CpuProfileNode } from '../ParseCpuProfile/ParseCpuProfile.ts'

export interface VisibleRow {
  readonly depth: number
  readonly node: CpuProfileNode
}
