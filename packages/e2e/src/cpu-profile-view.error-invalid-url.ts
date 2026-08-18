import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-invalid-url'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    nodes: [{ callFrame: { functionName: 'work', url: 42 }, id: 1 }],
  })
  await expectCpuProfileError(api, 'invalid-url', profile, 'CPU profile node 1 callFrame.url must be a string')
}
