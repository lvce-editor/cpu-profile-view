// cspell:word treegrid
import { text, VirtualDomElements, type VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { CpuProfileNode } from '../CpuProfile/CpuProfile.ts'
import type { CpuProfileViewState } from '../CpuProfileViewInstance/CpuProfileViewInstance.ts'
import { formatPercentage, formatTime } from '../FormatTime/FormatTime.ts'

interface TreeNode {
  readonly children: readonly TreeNode[]
  readonly node: VirtualDomNode
}

interface VisibleRow {
  readonly depth: number
  readonly node: CpuProfileNode
}

const textNode = (value: string): TreeNode => ({
  children: [],
  node: text(value),
})

const element = (
  type: number,
  properties: Readonly<Record<string, unknown>> = {},
  children: readonly TreeNode[] = [],
): TreeNode => ({
  children,
  node: {
    ...properties,
    childCount: children.length,
    type,
  },
})

const flatten = (tree: TreeNode): readonly VirtualDomNode[] => {
  return [tree.node, ...tree.children.flatMap(flatten)]
}

const getVisibleRows = (state: Readonly<CpuProfileViewState>): readonly VisibleRow[] => {
  const nodeById = new Map(state.profile.nodes.map((node) => [node.id, node]))
  const visited = new Set<number>()
  const rows: VisibleRow[] = []

  const visit = (id: number, depth: number): void => {
    if (visited.has(id)) {
      return
    }
    const node = nodeById.get(id)
    if (!node) {
      return
    }
    visited.add(id)
    rows.push({ depth, node })
    if (state.expandedNodeIds.has(id)) {
      for (const childId of node.children) {
        visit(childId, depth + 1)
      }
    }
  }

  for (const rootId of state.profile.rootIds) {
    visit(rootId, 0)
  }
  return rows
}

const span = (className: string, value: string): TreeNode => {
  return element(VirtualDomElements.Span, { className }, [textNode(value)])
}

const renderDisclosure = (node: CpuProfileNode, expanded: boolean): TreeNode => {
  if (node.children.length === 0) {
    return element(VirtualDomElements.Span, { className: 'CpuProfileDisclosurePlaceholder' })
  }
  return element(
    VirtualDomElements.Button,
    {
      ariaExpanded: expanded ? 'true' : 'false',
      ariaLabel: `${expanded ? 'Collapse' : 'Expand'} ${node.functionName}`,
      className: 'CpuProfileDisclosure',
      name: `toggle:${node.id}`,
      onClick: 'handleClick',
    },
    [textNode(expanded ? '▾' : '▸')],
  )
}

const renderFunctionCell = (row: VisibleRow, expanded: boolean): TreeNode => {
  const indentation = Array.from({ length: row.depth }, () =>
    element(VirtualDomElements.Span, { className: 'CpuProfileIndent' }),
  )
  return element(VirtualDomElements.Td, { className: 'CpuProfileFunctionCell' }, [
    ...indentation,
    renderDisclosure(row.node, expanded),
    span('CpuProfileFunctionName', row.node.functionName),
  ])
}

const renderTimeCell = (className: string, time: number, percentage: number): TreeNode => {
  return element(VirtualDomElements.Td, { className }, [
    span('CpuProfileTime', formatTime(time)),
    span('CpuProfilePercentage', formatPercentage(percentage)),
  ])
}

const renderRow = (row: VisibleRow, expandedNodeIds: ReadonlySet<number>): TreeNode => {
  const { node } = row
  return element(VirtualDomElements.Tr, { className: 'CpuProfileTableRow', name: `node:${node.id}` }, [
    renderTimeCell('CpuProfileSelfTimeCell', node.selfTime, node.selfPercentage),
    renderTimeCell('CpuProfileTotalTimeCell', node.totalTime, node.totalPercentage),
    renderFunctionCell(row, expandedNodeIds.has(node.id)),
    element(VirtualDomElements.Td, { className: 'CpuProfileLocationCell' }, [textNode(node.location)]),
  ])
}

const renderHeaderCell = (label: string, className: string): TreeNode => {
  return element(VirtualDomElements.Th, { className }, [textNode(label)])
}

const renderTable = (state: Readonly<CpuProfileViewState>): TreeNode => {
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

const renderHeader = (state: Readonly<CpuProfileViewState>): TreeNode => {
  const summary = `${formatTime(state.profile.duration)} total · ${state.profile.sampleCount} samples`
  return element(VirtualDomElements.Header, { className: 'CpuProfileHeader' }, [
    element(VirtualDomElements.Div, { className: 'CpuProfileTitle' }, [textNode('CPU Profile')]),
    element(VirtualDomElements.Div, { className: 'CpuProfileSummary' }, [textNode(summary)]),
  ])
}

export const render = (state: Readonly<CpuProfileViewState>): readonly VirtualDomNode[] => {
  return flatten(
    element(VirtualDomElements.Div, { className: 'CpuProfileView' }, [renderHeader(state), renderTable(state)]),
  )
}
