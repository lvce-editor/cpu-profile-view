import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-invalid-hit-count'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    endTime: 1000,
    nodes: [{ callFrame: { functionName: '(root)', url: '' }, hitCount: -1, id: 1 }],
    startTime: 0,
  })
  await expectCpuProfileError(
    api,
    'invalid-hit-count',
    profile,
    'CPU profile node 1 hitCount must be a non-negative integer',
  )
}
