import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'cpu-profile-view.opens-profile'

const profile = JSON.stringify({
  endTime: 10_000,
  nodes: [
    {
      callFrame: { columnNumber: -1, functionName: '(root)', lineNumber: -1, scriptId: '0', url: '' },
      children: [2, 3],
      hitCount: 0,
      id: 1,
    },
    {
      callFrame: { columnNumber: 4, functionName: 'renderDashboard', lineNumber: 9, scriptId: '1', url: 'app.js' },
      children: [4],
      hitCount: 2,
      id: 2,
    },
    {
      callFrame: { columnNumber: 2, functionName: 'updateChart', lineNumber: 19, scriptId: '1', url: 'charts.js' },
      hitCount: 1,
      id: 3,
    },
    {
      callFrame: { columnNumber: 0, functionName: 'calculatePoints', lineNumber: 29, scriptId: '1', url: 'math.js' },
      hitCount: 1,
      id: 4,
    },
  ],
  samples: [2, 2, 3, 4],
  startTime: 0,
  timeDeltas: [2000, 3000, 1000, 4000],
})

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main, Workspace }) => {
  const temporaryDirectory = await FileSystem.getTmpDir()
  const uri = `${temporaryDirectory}/dashboard.cpuprofile`
  await FileSystem.writeFile(uri, profile)
  await Workspace.setPath(temporaryDirectory)

  await Main.openUri(uri)

  const view = Locator('.CpuProfileView')
  const table = Locator('.CpuProfileTable')
  const summary = Locator('.CpuProfileSummary')
  await expect(view).toBeVisible()
  await expect(table).toBeVisible()
  await expect(summary).toHaveText('10.00 ms total · 4 samples')

  const functions = Locator('.CpuProfileFunctionName')
  const rootFunction = functions.nth(0)
  const renderDashboardFunction = functions.nth(1)
  const updateChartFunction = functions.nth(2)
  await expect(functions).toHaveCount(3)
  await expect(rootFunction).toHaveText('(root)')
  await expect(renderDashboardFunction).toHaveText('renderDashboard')
  await expect(updateChartFunction).toHaveText('updateChart')

  const renderDashboardDisclosure = Locator('button[name="toggle:2"]')
  await expect(renderDashboardDisclosure).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await renderDashboardDisclosure.click()
  await Command.execute('Timeout.sleep', 200)
  const calculatePointsFunction = functions.nth(2)
  const mathLocation = Locator('text=math.js:30:1')
  await expect(functions).toHaveCount(4)
  await expect(calculatePointsFunction).toHaveText('calculatePoints')
  await expect(mathLocation).toBeVisible()
}
