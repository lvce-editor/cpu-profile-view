import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-invalid-children'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    nodes: [
      { callFrame: { functionName: '(root)', url: '' }, children: [2, 'not-an-id'], id: 1 },
      { callFrame: { functionName: 'child', url: '' }, id: 2 },
    ],
  })
  await expectCpuProfileError(
    api,
    'invalid-children',
    profile,
    'CPU profile node 1 children must contain only integer node ids',
  )
}
