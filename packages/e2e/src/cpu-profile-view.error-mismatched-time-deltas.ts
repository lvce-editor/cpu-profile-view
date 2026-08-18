import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-mismatched-time-deltas'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    endTime: 2000,
    nodes: [{ callFrame: { functionName: '(root)', url: '' }, id: 1 }],
    samples: [1, 1],
    startTime: 0,
    timeDeltas: [1000],
  })
  await expectCpuProfileError(
    api,
    'mismatched-time-deltas',
    profile,
    'CPU profile timeDeltas length must match samples length',
  )
}
