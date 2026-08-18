import type { Test } from '@lvce-editor/test-with-playwright'
import { openCpuProfile } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.zero-duration'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    nodes: [{ callFrame: { functionName: '(root)', url: '' }, id: 1 }],
  })
  await openCpuProfile(api, 'zero-duration', profile)

  const summary = api.Locator('.CpuProfileSummary')
  const functions = api.Locator('.CpuProfileFunctionName')
  await api.expect(summary).toHaveText('0 μs total · 0 samples')
  await api.expect(functions).toHaveCount(1)
}
