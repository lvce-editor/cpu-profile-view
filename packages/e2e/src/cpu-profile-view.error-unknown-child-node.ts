import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-unknown-child-node'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    nodes: [{ callFrame: { functionName: '(root)', url: '' }, children: [99], id: 1 }],
  })
  await expectCpuProfileError(api, 'unknown-child-node', profile, 'CPU profile node 1 references unknown child node 99')
}
