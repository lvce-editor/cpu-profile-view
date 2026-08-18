import type { CpuProfileNode } from '../ParseCpuProfile/ParseCpuProfile.ts'
import type { VisibleRow } from '../VisibleRow/VisibleRow.ts'

export const visit = (
  id: number,
  depth: number,
  nodeById: ReadonlyMap<number, CpuProfileNode>,
  expandedNodeIds: ReadonlySet<number>,
  visited: Set<number>,
  rows: VisibleRow[],
): void => {
  if (visited.has(id)) {
    return
  }
  const node = nodeById.get(id)
  if (!node) {
    return
  }
  visited.add(id)
  rows.push({ depth, node })
  if (expandedNodeIds.has(id)) {
    for (const childId of node.children) {
      visit(childId, depth + 1, nodeById, expandedNodeIds, visited, rows)
    }
  }
}
