import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-null'

export const test: Test = async (api) => {
  await expectCpuProfileError(api, 'null', 'null', 'CPU profile must be a JSON object')
}
