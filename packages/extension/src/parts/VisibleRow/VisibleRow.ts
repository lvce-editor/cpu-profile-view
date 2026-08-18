import type { CpuProfileNode } from '../CpuProfile/CpuProfile.ts'

export interface VisibleRow {
  readonly depth: number
  readonly node: CpuProfileNode
}
