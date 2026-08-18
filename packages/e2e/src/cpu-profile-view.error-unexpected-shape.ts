import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-unexpected-shape'

export const test: Test = async (api) => {
  await expectCpuProfileError(
    api,
    'unexpected-shape',
    JSON.stringify({ traceEvents: [] }),
    'CPU profile must contain a non-empty nodes array',
  )
}
