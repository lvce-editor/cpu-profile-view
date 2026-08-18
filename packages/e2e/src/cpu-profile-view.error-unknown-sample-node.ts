import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-unknown-sample-node'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    endTime: 1000,
    nodes: [{ callFrame: { functionName: '(root)', url: '' }, id: 1 }],
    samples: [99],
    startTime: 0,
    timeDeltas: [1000],
  })
  await expectCpuProfileError(api, 'unknown-sample-node', profile, 'CPU profile sample 99 references an unknown node')
}
