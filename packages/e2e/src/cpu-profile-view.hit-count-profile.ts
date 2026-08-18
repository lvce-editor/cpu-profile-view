import type { Test } from '@lvce-editor/test-with-playwright'
import { openCpuProfile } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.hit-count-profile'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    endTime: 6000,
    nodes: [
      { callFrame: { functionName: '(root)', url: '' }, children: [2], hitCount: 0, id: 1 },
      { callFrame: { functionName: 'work', url: 'worker.js' }, hitCount: 3, id: 2 },
    ],
    startTime: 0,
  })
  await openCpuProfile(api, 'hit-count', profile)

  const summary = api.Locator('.CpuProfileSummary')
  const functions = api.Locator('.CpuProfileFunctionName')
  await api.expect(summary).toHaveText('6.00 ms total · 0 samples')
  await api.expect(functions).toHaveCount(2)
  await api.expect(functions.nth(1)).toHaveText('work')
}
