import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-empty-file'

export const test: Test = async (api) => {
  await expectCpuProfileError(api, 'empty', '', 'CPU profile file is empty')
}
