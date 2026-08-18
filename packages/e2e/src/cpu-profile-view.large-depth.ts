import type { Test } from '@lvce-editor/test-with-playwright'
import { openCpuProfile } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.large-depth'

const depth = 20_000

const createProfile = (): string => {
  const nodes = Array.from({ length: depth }, (_, index) => {
    const id = index + 1
    return {
      callFrame: { columnNumber: 0, functionName: `depth${id}`, lineNumber: id - 1, url: 'deep.js' },
      ...(id < depth && { children: [id + 1] }),
      id,
    }
  })
  return JSON.stringify({ endTime: 1000, nodes, samples: [1], startTime: 0, timeDeltas: [1000] })
}

export const test: Test = async (api) => {
  await openCpuProfile(api, 'large-depth', createProfile())

  const rows = api.Locator('.CpuProfileTableRow')
  const functionNames = api.Locator('.CpuProfileFunctionName')
  await api.expect(rows).toHaveCount(2)
  await api.expect(functionNames.nth(0)).toHaveText('depth1')
  await api.expect(functionNames.nth(1)).toHaveText('depth2')
}
