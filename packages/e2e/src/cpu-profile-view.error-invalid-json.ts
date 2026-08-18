import type { Test } from '@lvce-editor/test-with-playwright'
import { expectCpuProfileError } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.error-invalid-json'

export const test: Test = async (api) => {
  await expectCpuProfileError(api, 'invalid-json', '{"nodes":[', 'CPU profile is not valid JSON')
}
