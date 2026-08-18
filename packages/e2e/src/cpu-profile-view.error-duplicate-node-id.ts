import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-duplicate-node-id'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    nodes: [
      { callFrame: { functionName: 'first', url: '' }, id: 1 },
      { callFrame: { functionName: 'second', url: '' }, id: 1 },
    ],
  })
  await expectCpuProfileError(api, 'duplicate-node-id', profile, 'CPU profile contains duplicate node id 1')
}
