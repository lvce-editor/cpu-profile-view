import { VirtualDomElements, type VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { CpuProfileViewState } from '../CpuProfileViewInstance/CpuProfileViewInstance.ts'
import { element } from '../Element/Element.ts'
import { flatten } from '../Flatten/Flatten.ts'
import { renderHeader } from '../RenderHeader/RenderHeader.ts'
import { renderTable } from '../RenderTable/RenderTable.ts'

export const render = (state: Readonly<CpuProfileViewState>): readonly VirtualDomNode[] => {
  return flatten(
    element(VirtualDomElements.Div, { className: 'CpuProfileView' }, [renderHeader(state), renderTable(state)]),
  )
}
