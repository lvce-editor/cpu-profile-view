import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { CpuProfileViewState } from '../src/parts/CpuProfileViewInstance/CpuProfileViewInstance.ts'
import { render } from '../src/parts/RenderCpuProfile/RenderCpuProfile.ts'

const state: CpuProfileViewState = {
  expandedNodeIds: new Set([1]),
  profile: {
    duration: 12,
    nodes: [
      {
        children: [2],
        columnNumber: -1,
        functionName: '(root)',
        id: 1,
        lineNumber: -1,
        location: '(unknown)',
        selfPercentage: 0,
        selfTime: 0,
        totalPercentage: 100,
        totalTime: 12,
        url: '',
      },
      {
        children: [3],
        columnNumber: 1,
        functionName: 'render',
        id: 2,
        lineNumber: 1,
        location: 'app.js:2:2',
        selfPercentage: 50,
        selfTime: 6,
        totalPercentage: 100,
        totalTime: 12,
        url: 'app.js',
      },
      {
        children: [],
        columnNumber: 1,
        functionName: 'child',
        id: 3,
        lineNumber: 2,
        location: 'app.js:3:2',
        selfPercentage: 50,
        selfTime: 6,
        totalPercentage: 50,
        totalTime: 6,
        url: 'app.js',
      },
    ],
    rootIds: [1],
    sampleCount: 3,
  },
}

test('renders summary, columns, and initially visible call frames', () => {
  const dom = render(state)
  expect(dom[0]).toEqual({ childCount: 2, className: 'CpuProfileView', type: VirtualDomElements.Div })
  expect(dom.some((node) => node.text === '12.00 ms total · 3 samples')).toBe(true)
  expect(dom.some((node) => node.text === 'Self time')).toBe(true)
  expect(dom.some((node) => node.text === 'Total time')).toBe(true)
  expect(dom.filter((node) => node.className === 'CpuProfileFunctionName')).toHaveLength(2)
  expect(dom).toContainEqual(
    expect.objectContaining({
      ariaExpanded: 'true',
      ariaLabel: 'Collapse (root)',
      className: 'CpuProfileDisclosure',
      name: 'toggle:1',
    }),
  )
  expect(dom).toContainEqual(expect.objectContaining({ ariaExpanded: 'false', ariaLabel: 'Expand render' }))
  expect(dom.some((node) => node.text === '50.0%')).toBe(true)
})

test('renders descendants of expanded nodes and disconnected nodes', () => {
  const { profile: baseProfile } = state
  const profile = {
    ...baseProfile,
    nodes: [...baseProfile.nodes, { ...baseProfile.nodes[2], functionName: 'detached', id: 4 }],
    rootIds: [1, 4],
  }
  const dom = render({ expandedNodeIds: new Set([1, 2]), profile })
  const functionNames = dom.filter((node) => node.className === 'CpuProfileFunctionName')
  expect(functionNames).toHaveLength(4)
  expect(dom.some((node) => node.text === 'child')).toBe(true)
  expect(dom.some((node) => node.text === 'detached')).toBe(true)
  expect(dom.filter((node) => node.className === 'CpuProfileIndent')).toHaveLength(3)
  expect(dom).toContainEqual(expect.objectContaining({ childCount: 0, className: 'CpuProfileDisclosurePlaceholder' }))
})
