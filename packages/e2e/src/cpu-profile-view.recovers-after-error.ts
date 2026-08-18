import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError, openCpuProfile } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.recovers-after-error'

export const test: Test = async (api) => {
  await expectCpuProfileError(api, 'broken-first', '{', 'CPU profile is not valid JSON')

  const profile = JSON.stringify({
    endTime: 1000,
    nodes: [{ callFrame: { functionName: 'recovered', url: 'recovered.js' }, id: 1 }],
    samples: [1],
    startTime: 0,
    timeDeltas: [1000],
  })
  await openCpuProfile(api, 'valid-second', profile)

  const view = api.Locator('.CpuProfileView')
  const functionName = api.Locator('.CpuProfileFunctionName')
  await api.expect(view).toBeVisible()
  await api.expect(functionName).toHaveText('recovered')
}
