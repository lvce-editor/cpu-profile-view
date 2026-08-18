import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { TreeNode } from '../TreeNode/TreeNode.ts'

export const flatten = (tree: TreeNode): readonly VirtualDomNode[] => {
  return [tree.node, ...tree.children.flatMap(flatten)]
}
