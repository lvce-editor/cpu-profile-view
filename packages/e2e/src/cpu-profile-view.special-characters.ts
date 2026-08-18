import type { Test } from '@lvce-editor/test-with-playwright'
import { openCpuProfile } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.special-characters'

export const test: Test = async (api) => {
  const profile = JSON.stringify({
    nodes: [
      {
        callFrame: {
          columnNumber: 2,
          functionName: '<script>alert("x")</script> 🚀',
          lineNumber: 4,
          url: 'src/你好<&>.js',
        },
        id: 1,
      },
    ],
  })
  await openCpuProfile(api, 'special-characters', profile)

  const functionName = api.Locator('.CpuProfileFunctionName')
  const location = api.Locator('.CpuProfileLocationCell')
  const scripts = api.Locator('.CpuProfileView script')
  await api.expect(functionName).toHaveText('<script>alert("x")</script> 🚀')
  await api.expect(location).toHaveText('src/你好<&>.js:5:3')
  await api.expect(scripts).toHaveCount(0)
}
