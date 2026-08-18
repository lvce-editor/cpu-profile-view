import type { Test } from '@lvce-editor/test-with-playwright'
import { openCpuProfile } from './_cpuProfileTestUtils.ts'

export const name = 'cpu-profile-view.large-profile'

const nodeCount = 20_000
const sampleCount = 50_000

const repeat = (value: number, count: number): readonly number[] => {
  const values: number[] = []
  while (values.length < count) {
    values.push(value)
  }
  return values
}

const createProfile = (): string => {
  const nodes = Array.from({ length: nodeCount }, (_, index) => {
    const id = index + 1
    let children: readonly number[] | undefined
    if (id === 1) {
      children = [2]
    } else if (id === 2) {
      children = Array.from({ length: nodeCount - 2 }, (_, childIndex) => childIndex + 3)
    }
    return {
      callFrame: { columnNumber: 0, functionName: `function${id}`, lineNumber: id - 1, url: 'large.js' },
      ...(children && { children }),
      id,
    }
  })
  return JSON.stringify({
    endTime: sampleCount * 1000,
    nodes,
    samples: repeat(2, sampleCount),
    startTime: 0,
    timeDeltas: repeat(1000, sampleCount),
  })
}

export const test: Test = async (api) => {
  await openCpuProfile(api, 'large', createProfile())

  const view = api.Locator('.CpuProfileView')
  const rows = api.Locator('.CpuProfileTableRow')
  const summary = api.Locator('.CpuProfileSummary')
  await api.expect(view).toBeVisible()
  await api.expect(summary).toHaveText('50.00 s total · 50000 samples')
  await api.expect(rows).toHaveCount(2)
}
