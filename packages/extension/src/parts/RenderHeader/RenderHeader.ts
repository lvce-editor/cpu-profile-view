import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { CpuProfileViewState } from '../CpuProfileViewInstance/CpuProfileViewInstance.ts'
import type { TreeNode } from '../TreeNode/TreeNode.ts'
import { element } from '../Element/Element.ts'
import { formatTime } from '../FormatTime/FormatTime.ts'
import { textNode } from '../TextNode/TextNode.ts'

export const renderHeader = (state: Readonly<CpuProfileViewState>): TreeNode => {
  const summary = `${formatTime(state.profile.duration)} total · ${state.profile.sampleCount} samples`
  return element(VirtualDomElements.Header, { className: 'CpuProfileHeader' }, [
    element(VirtualDomElements.Div, { className: 'CpuProfileTitle' }, [textNode('CPU Profile')]),
    element(VirtualDomElements.Div, { className: 'CpuProfileSummary' }, [textNode(summary)]),
  ])
}
