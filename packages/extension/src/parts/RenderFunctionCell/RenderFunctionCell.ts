import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { TreeNode } from '../TreeNode/TreeNode.ts'
import type { VisibleRow } from '../VisibleRow/VisibleRow.ts'
import { element } from '../Element/Element.ts'
import { renderDisclosure } from '../RenderDisclosure/RenderDisclosure.ts'
import { span } from '../Span/Span.ts'

export const renderFunctionCell = (row: VisibleRow, expanded: boolean): TreeNode => {
  const indentation = Array.from({ length: row.depth }, () =>
    element(VirtualDomElements.Span, { className: 'CpuProfileIndent' }),
  )
  return element(VirtualDomElements.Td, { className: 'CpuProfileFunctionCell' }, [
    ...indentation,
    renderDisclosure(row.node, expanded),
    span('CpuProfileFunctionName', row.node.functionName),
  ])
}
