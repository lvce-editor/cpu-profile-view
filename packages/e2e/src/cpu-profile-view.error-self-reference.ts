import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-self-reference'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    nodes: [{ callFrame: { functionName: '(root)', url: '' }, children: [1], id: 1 }],
  })
  await expectCpuProfileError(api, 'self-reference', profile, 'CPU profile node 1 cannot reference itself as a child')
}
