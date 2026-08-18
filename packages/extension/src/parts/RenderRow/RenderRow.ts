import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { TreeNode } from '../TreeNode/TreeNode.ts'
import type { VisibleRow } from '../VisibleRow/VisibleRow.ts'
import { element } from '../Element/Element.ts'
import { renderFunctionCell } from '../RenderFunctionCell/RenderFunctionCell.ts'
import { renderTimeCell } from '../RenderTimeCell/RenderTimeCell.ts'
import { textNode } from '../TextNode/TextNode.ts'

export const renderRow = (row: VisibleRow, expandedNodeIds: ReadonlySet<number>): TreeNode => {
  const { node } = row
  return element(VirtualDomElements.Tr, { className: 'CpuProfileTableRow', name: `node:${node.id}` }, [
    renderTimeCell('CpuProfileSelfTimeCell', node.selfTime, node.selfPercentage),
    renderTimeCell('CpuProfileTotalTimeCell', node.totalTime, node.totalPercentage),
    renderFunctionCell(row, expandedNodeIds.has(node.id)),
    element(VirtualDomElements.Td, { className: 'CpuProfileLocationCell' }, [textNode(node.location)]),
  ])
}
