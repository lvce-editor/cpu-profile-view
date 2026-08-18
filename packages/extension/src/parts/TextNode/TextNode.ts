import { text } from '@lvce-editor/virtual-dom-worker'
import type { TreeNode } from '../TreeNode/TreeNode.ts'

export const textNode = (value: string): TreeNode => ({
  children: [],
  node: text(value),
})
