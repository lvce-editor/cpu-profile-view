import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-empty-nodes'

export const test: Test = async (api) => {
  await expectCpuProfileError(
    api,
    'empty-nodes',
    JSON.stringify({ endTime: 0, nodes: [], startTime: 0 }),
    'CPU profile must contain a non-empty nodes array',
  )
}
