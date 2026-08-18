import type { ViewContext } from '@lvce-editor/api'
import { expect, jest, test } from '@jest/globals'
import { createInstanceWithDependencies } from '../src/parts/CpuProfileViewInstance/CpuProfileViewInstance.ts'

const profileContent = '{"profile":true}'

const profile = {
  duration: 2,
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
      totalTime: 2,
      url: '',
    },
    {
      children: [3],
      columnNumber: -1,
      functionName: 'parent',
      id: 2,
      lineNumber: -1,
      location: '(unknown)',
      selfPercentage: 0,
      selfTime: 0,
      totalPercentage: 100,
      totalTime: 2,
      url: '',
    },
    {
      children: [],
      columnNumber: -1,
      functionName: 'child',
      id: 3,
      lineNumber: -1,
      location: '(unknown)',
      selfPercentage: 100,
      selfTime: 2,
      totalPercentage: 100,
      totalTime: 2,
      url: '',
    },
  ],
  rootIds: [1],
  sampleCount: 1,
}

const context = {
  state: {},
  uid: 7,
  uri: '/workspace/test.cpuprofile',
  viewId: 'builtin.cpu-profile-view',
} as unknown as ViewContext

test('reads the profile and expands call frames', async () => {
  const readFile = jest.fn(async (_uri: string) => profileContent)
  const parseCpuProfile = jest.fn(async (_content: string) => profile)
  const instance = await createInstanceWithDependencies(context, { parseCpuProfile, readFile })

  expect(readFile).toHaveBeenCalledWith('/workspace/test.cpuprofile')
  expect(parseCpuProfile).toHaveBeenCalledWith(profileContent)
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
  const readFile = jest.fn(async (_uri: string) => profileContent)
  const parseCpuProfile = jest.fn(async (_content: string) => profile)
  const instance = await createInstanceWithDependencies(savedContext, { parseCpuProfile, readFile })

  expect(readFile).toHaveBeenCalledWith('/saved.cpuprofile')
  expect(instance.render().some((node) => node.text === 'child')).toBe(true)
  expect(instance.saveState()).toEqual({ expandedNodeIds: [1, 2], uri: '/saved.cpuprofile' })
})

test('supports a missing view context', async () => {
  const readFile = jest.fn(async (_uri: string) => profileContent)
  const parseCpuProfile = jest.fn(async (_content: string) => profile)
  const instance = await createInstanceWithDependencies(undefined, { parseCpuProfile, readFile })

  expect(readFile).toHaveBeenCalledWith('')
  expect(instance.saveState()).toEqual({ expandedNodeIds: [1], uri: '' })
})
