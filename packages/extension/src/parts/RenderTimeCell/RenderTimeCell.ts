import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { TreeNode } from '../TreeNode/TreeNode.ts'
import { element } from '../Element/Element.ts'
import { formatPercentage, formatTime } from '../FormatTime/FormatTime.ts'
import { span } from '../Span/Span.ts'

export const renderTimeCell = (className: string, time: number, percentage: number): TreeNode => {
  return element(VirtualDomElements.Td, { className }, [
    span('CpuProfileTime', formatTime(time)),
    span('CpuProfilePercentage', formatPercentage(percentage)),
  ])
}
