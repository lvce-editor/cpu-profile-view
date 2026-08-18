import type { Test } from '@lvce-editor/test-with-playwright'
import { openCpuProfile } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.multiple-roots'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    endTime: 2000,
    nodes: [
      { callFrame: { functionName: 'main-thread', url: 'main.js' }, id: 1 },
      { callFrame: { functionName: 'worker-thread', url: 'worker.js' }, id: 2 },
    ],
    samples: [2],
    startTime: 0,
    timeDeltas: [2000],
  })
  await openCpuProfile(api, 'multiple-roots', profile)

  const functions = api.Locator('.CpuProfileFunctionName')
  await api.expect(functions).toHaveCount(2)
  await api.expect(functions.nth(0)).toHaveText('main-thread')
  await api.expect(functions.nth(1)).toHaveText('worker-thread')
}
