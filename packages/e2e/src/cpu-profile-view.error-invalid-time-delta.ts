import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-invalid-time-delta'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    endTime: 1000,
    nodes: [{ callFrame: { functionName: '(root)', url: '' }, id: 1 }],
    samples: [1],
    startTime: 0,
    timeDeltas: [-1],
  })
  await expectCpuProfileError(
    api,
    'invalid-time-delta',
    profile,
    'CPU profile timeDeltas must contain only non-negative finite numbers',
  )
}
