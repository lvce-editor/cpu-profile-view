import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-cycle'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    nodes: [
      { callFrame: { functionName: 'one', url: '' }, children: [2], id: 1 },
      { callFrame: { functionName: 'two', url: '' }, children: [1], id: 2 },
    ],
  })
  await expectCpuProfileError(api, 'cycle', profile, 'CPU profile call tree contains a cycle')
}
