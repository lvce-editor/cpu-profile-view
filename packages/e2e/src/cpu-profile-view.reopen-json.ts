import type { Test } from '@lvce-editor/test-with-playwright'
import { profile } from './cpu-profile-view.ts'

export const name = 'cpu-profile-view.reopen-json'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main, Workspace }) => {
  const temporaryDirectory = await FileSystem.getTmpDir()
  const uri = `${temporaryDirectory}/dashboard.json`
  await FileSystem.writeFile(uri, profile)
  await Workspace.setPath(temporaryDirectory)

  await Main.openUri(uri)

  const reopenPromise = Command.execute('Main.reopenEditorWith')
  const cpuProfileChoice = Locator('.QuickPickItem', { hasText: 'CPU Profile' })
  await expect(cpuProfileChoice).toBeVisible()
  await cpuProfileChoice.dispatchEvent('pointerdown', {
    bubbles: true,
    clientX: 200,
    clientY: 100,
    pointerId: 1,
  } as any)
  await reopenPromise

  const view = Locator('.CpuProfileView')
  const summary = Locator('.CpuProfileSummary')
  await expect(view).toBeVisible()
  await expect(summary).toHaveText('10.00 ms total · 4 samples')
}
