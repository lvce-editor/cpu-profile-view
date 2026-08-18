import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-multiple-parents'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    nodes: [
      { callFrame: { functionName: 'first-parent', url: '' }, children: [3], id: 1 },
      { callFrame: { functionName: 'second-parent', url: '' }, children: [3], id: 2 },
      { callFrame: { functionName: 'child', url: '' }, id: 3 },
    ],
  })
  await expectCpuProfileError(api, 'multiple-parents', profile, 'CPU profile node 3 has multiple parents: 1 and 2')
}
