import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { TreeNode } from '../TreeNode/TreeNode.ts'
import { element } from '../Element/Element.ts'
import { textNode } from '../TextNode/TextNode.ts'

export const renderHeaderCell = (label: string, className: string): TreeNode => {
  return element(VirtualDomElements.Th, { className }, [textNode(label)])
}
