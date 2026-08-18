import type { Test } from '@lvce-editor/test-with-playwright'
import { openCpuProfile } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.many-rows'

const childCount = 1000

const createProfile = (): string => {
  const children = Array.from({ length: childCount }, (_, index) => index + 2)
  const nodes = [
    {
      callFrame: { columnNumber: -1, functionName: '(root)', lineNumber: -1, url: '' },
      children,
      id: 1,
    },
    ...children.map((id) => ({
      callFrame: { columnNumber: 0, functionName: `row${id - 1}`, lineNumber: id - 2, url: 'rows.js' },
      id,
    })),
  ]
  return JSON.stringify({ endTime: 1000, nodes, samples: [2], startTime: 0, timeDeltas: [1000] })
}

export const test: Test = async (api) => {
  await openCpuProfile(api, 'many-rows', createProfile())

  const rows = api.Locator('.CpuProfileTableRow')
  const functionNames = api.Locator('.CpuProfileFunctionName')
  await api.expect(rows).toHaveCount(1001)
  await api.expect(functionNames.nth(1000)).toHaveText('row1000')
}
