import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { CpuProfileNode } from '../CpuProfile/CpuProfile.ts'
import type { TreeNode } from '../TreeNode/TreeNode.ts'
import { element } from '../Element/Element.ts'
import { textNode } from '../TextNode/TextNode.ts'

export const renderDisclosure = (node: CpuProfileNode, expanded: boolean): TreeNode => {
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
