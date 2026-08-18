import type { CpuProfileViewState } from '../CpuProfileViewInstance/CpuProfileViewInstance.ts'
import type { VisibleRow } from '../VisibleRow/VisibleRow.ts'
import { visit } from '../Visit/Visit.ts'

export const getVisibleRows = (state: Readonly<CpuProfileViewState>): readonly VisibleRow[] => {
  const nodeById = new Map(state.profile.nodes.map((node) => [node.id, node]))
  const visited = new Set<number>()
  const rows: VisibleRow[] = []

  for (const rootId of state.profile.rootIds) {
    visit(rootId, 0, nodeById, state.expandedNodeIds, visited, rows)
  }
  return rows
}
