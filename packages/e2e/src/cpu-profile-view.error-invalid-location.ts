import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-invalid-location'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    endTime: 1000,
    nodes: [
      {
        callFrame: { columnNumber: 0, functionName: 'work', lineNumber: -2, url: 'app.js' },
        id: 1,
      },
    ],
    samples: [1],
    startTime: 0,
    timeDeltas: [1000],
  })
  await expectCpuProfileError(
    api,
    'invalid-location',
    profile,
    'CPU profile node 1 callFrame.lineNumber must be an integer greater than or equal to -1',
  )
}
