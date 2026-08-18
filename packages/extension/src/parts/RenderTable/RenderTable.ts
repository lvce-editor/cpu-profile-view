// cspell:word treegrid
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { CpuProfileViewState } from '../CpuProfileViewInstance/CpuProfileViewInstance.ts'
import type { TreeNode } from '../TreeNode/TreeNode.ts'
import { element } from '../Element/Element.ts'
import { getVisibleRows } from '../GetVisibleRows/GetVisibleRows.ts'
import { renderHeaderCell } from '../RenderHeaderCell/RenderHeaderCell.ts'
import { renderRow } from '../RenderRow/RenderRow.ts'

export const renderTable = (state: Readonly<CpuProfileViewState>): TreeNode => {
  const header = element(VirtualDomElements.THead, { className: 'CpuProfileTableHeader' }, [
    element(VirtualDomElements.Tr, { className: 'CpuProfileTableHeaderRow' }, [
      renderHeaderCell('Self time', 'CpuProfileTimeHeaderCell'),
      renderHeaderCell('Total time', 'CpuProfileTimeHeaderCell'),
      renderHeaderCell('Function', 'CpuProfileFunctionHeaderCell'),
      renderHeaderCell('Location', 'CpuProfileLocationHeaderCell'),
    ]),
  ])
  const rows = getVisibleRows(state).map((row) => renderRow(row, state.expandedNodeIds))
  const body = element(VirtualDomElements.TBody, { className: 'CpuProfileTableBody' }, rows)
  return element(
    VirtualDomElements.Table,
    { ariaLabel: 'CPU profile call tree', className: 'CpuProfileTable', role: 'treegrid' },
    [header, body],
  )
}
