import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-invalid-time-range'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    endTime: 1000,
    nodes: [{ callFrame: { functionName: '(root)', url: '' }, id: 1 }],
    startTime: 2000,
  })
  await expectCpuProfileError(
    api,
    'invalid-time-range',
    profile,
    'CPU profile endTime must be greater than or equal to startTime',
  )
}
