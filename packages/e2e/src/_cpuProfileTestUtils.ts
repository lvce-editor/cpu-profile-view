import type { TestApi } from '@lvce-editor/test-with-playwright'

export const openCpuProfile = async (
  { FileSystem, Main, Workspace }: TestApi,
  fileName: string,
  content: string,
): Promise<void> => {
  const temporaryDirectory = await FileSystem.getTmpDir()
  const uri = `${temporaryDirectory}/${fileName}.cpuprofile`
  await FileSystem.writeFile(uri, content)
  await Workspace.setPath(temporaryDirectory)
  await Main.openUri(uri)
}

export const expectCpuProfileError = async (
  { expect, FileSystem, Locator, Main, Workspace }: TestApi,
  fileName: string,
  content: string,
  message: string,
): Promise<void> => {
  const temporaryDirectory = await FileSystem.getTmpDir()
  const uri = `${temporaryDirectory}/${fileName}.cpuprofile`
  await FileSystem.writeFile(uri, content)
  await Workspace.setPath(temporaryDirectory)
  await Main.openUri(uri)
  const error = Locator('.Viewlet.Error')
  await expect(error).toBeVisible()
  await expect(error).toContainText(`Error: ${message}`)
}
