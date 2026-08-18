import { expect, test } from '@jest/globals'
import { parseCpuProfile } from '../src/parts/ParseCpuProfile/ParseCpuProfile.ts'

const createProfile = (overrides: Readonly<Record<string, unknown>> = {}): string => {
  return JSON.stringify({
    endTime: 6000,
    nodes: [
      {
        callFrame: { columnNumber: -1, functionName: '(root)', lineNumber: -1, url: '' },
        children: [2],
        id: 1,
      },
      {
        callFrame: { columnNumber: 4, functionName: 'work', lineNumber: 9, url: 'app.js' },
        children: [3],
        id: 2,
      },
      {
        callFrame: { functionName: '', url: '' },
        id: 3,
      },
    ],
    samples: [2, 3],
    startTime: 0,
    timeDeltas: [2000, 4000],
    ...overrides,
  })
}

test('parses sample self time and ancestor total time', () => {
  const profile = parseCpuProfile(createProfile())

  expect(profile.duration).toBe(6)
  expect(profile.sampleCount).toBe(2)
  expect(profile.rootIds).toEqual([1])
  expect(profile.nodes[0]).toMatchObject({ selfTime: 0, totalPercentage: 100, totalTime: 6 })
  expect(profile.nodes[1]).toMatchObject({
    location: 'app.js:10:5',
    selfTime: 2,
    totalPercentage: 100,
    totalTime: 6,
  })
  expect(profile.nodes[1]?.selfPercentage).toBeCloseTo(100 / 3)
  expect(profile.nodes[2]).toMatchObject({ functionName: '(anonymous)', location: '(unknown)', selfTime: 4 })
})

test('uses elapsed duration when time deltas are absent', () => {
  const profile = parseCpuProfile(createProfile({ timeDeltas: [] }))
  expect(profile.duration).toBe(6)
  expect(profile.nodes[1]?.selfTime).toBe(3)
  expect(profile.nodes[2]?.selfTime).toBe(3)
})

test('uses hit counts when samples are absent', () => {
  const profile = parseCpuProfile(
    createProfile({
      nodes: [
        { callFrame: { functionName: '(root)' }, children: [2], hitCount: 0, id: 1 },
        { callFrame: { functionName: 'work' }, hitCount: 3, id: 2 },
      ],
      samples: [],
    }),
  )
  expect(profile.sampleCount).toBe(0)
  expect(profile.nodes[0]).toMatchObject({ selfTime: 0, totalTime: 6 })
  expect(profile.nodes[1]).toMatchObject({ selfTime: 6, totalTime: 6 })
})

test('handles cycles and unknown child ids without looping', () => {
  const profile = parseCpuProfile(
    createProfile({
      nodes: [
        { callFrame: { functionName: 'one' }, children: [2, 99], id: 1 },
        { callFrame: { functionName: 'two' }, children: [1, 2], id: 2 },
      ],
      samples: [2],
      timeDeltas: [1000],
    }),
  )
  expect(profile.rootIds).toEqual([1])
  expect(profile.nodes[0]?.children).toEqual([2])
  expect(profile.nodes[1]?.children).toEqual([1])
})

test('handles empty timing data and partial call frame locations', () => {
  const profile = parseCpuProfile(
    JSON.stringify({
      nodes: [
        { callFrame: { columnNumber: 2, functionName: 'columnOnly', url: 'app.js' }, id: 1 },
        { callFrame: { functionName: 'zero' }, id: 2 },
      ],
    }),
  )
  expect(profile.duration).toBe(0)
  expect(profile.rootIds).toEqual([1, 2])
  expect(profile.nodes[0]).toMatchObject({ location: 'app.js:3', selfPercentage: 0, totalPercentage: 0 })
})

test.each([
  ['not json', 'CPU profile is not valid JSON'],
  ['{}', 'CPU profile must contain a non-empty nodes array'],
  [JSON.stringify({ nodes: [{}] }), 'Every CPU profile node must have an integer id'],
  [JSON.stringify({ nodes: [{ id: 1 }, { id: 1 }] }), 'CPU profile contains duplicate node id 1'],
])('rejects malformed profiles', (content, message) => {
  expect(() => parseCpuProfile(content)).toThrow(message)
})
