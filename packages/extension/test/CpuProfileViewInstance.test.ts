import type { ViewContext } from '@lvce-editor/api'
import { expect, jest, test } from '@jest/globals'
import { createInstanceWithDependencies } from '../src/parts/CpuProfileViewInstance/CpuProfileViewInstance.ts'

const profile = JSON.stringify({
  endTime: 2000,
  nodes: [
    { callFrame: { functionName: '(root)' }, children: [2], id: 1 },
    { callFrame: { functionName: 'parent' }, children: [3], id: 2 },
    { callFrame: { functionName: 'child' }, id: 3 },
  ],
  samples: [3],
  startTime: 0,
  timeDeltas: [2000],
})

const context = {
  state: {},
  uid: 7,
  uri: '/workspace/test.cpuprofile',
  viewId: 'builtin.cpu-profile-view',
} as unknown as ViewContext

test('reads the profile and expands call frames', async () => {
  const readFile = jest.fn(async (_uri: string) => profile)
  const instance = await createInstanceWithDependencies(context, { readFile })

  expect(readFile).toHaveBeenCalledWith('/workspace/test.cpuprofile')
  expect(instance.render().filter((node) => node.className === 'CpuProfileFunctionName')).toHaveLength(2)

  await instance.handleEvent?.({ name: 'toggle:2', type: 'click' })
  expect(instance.render().some((node) => node.text === 'child')).toBe(true)
  expect(instance.saveState()).toEqual({ expandedNodeIds: [1, 2], uri: '/workspace/test.cpuprofile' })

  await instance.handleEvent?.({ name: 'toggle:2', type: 'click' })
  await instance.handleEvent?.({ name: 'toggle:nope', type: 'click' })
  await instance.handleEvent?.({ name: 'toggle:1', type: 'input' })
  expect(instance.saveState()).toEqual({ expandedNodeIds: [1], uri: '/workspace/test.cpuprofile' })
  instance.dispose?.()
})

test('restores saved state and saved uri', async () => {
  const savedContext = {
    state: { expandedNodeIds: [1, 2, 99, 'invalid'], uri: '/saved.cpuprofile' },
    uid: 8,
    viewId: 'builtin.cpu-profile-view',
  } as unknown as ViewContext
  const readFile = jest.fn(async (_uri: string) => profile)
  const instance = await createInstanceWithDependencies(savedContext, { readFile })

  expect(readFile).toHaveBeenCalledWith('/saved.cpuprofile')
  expect(instance.render().some((node) => node.text === 'child')).toBe(true)
  expect(instance.saveState()).toEqual({ expandedNodeIds: [1, 2], uri: '/saved.cpuprofile' })
})

test('supports a missing view context', async () => {
  const readFile = jest.fn(async (_uri: string) => profile)
  const instance = await createInstanceWithDependencies(undefined, { readFile })

  expect(readFile).toHaveBeenCalledWith('')
  expect(instance.saveState()).toEqual({ expandedNodeIds: [1], uri: '' })
})
