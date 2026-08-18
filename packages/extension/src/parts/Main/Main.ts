import { activate as activateExtensionApi, registerView } from '@lvce-editor/api'
import { dispose as disposeCpuProfileParserWorker } from '../CpuProfileParserWorker/CpuProfileParserWorker.ts'
import { view } from '../CpuProfileView/CpuProfileView.ts'

const state = {
  isActivated: false,
}

export const activate = async (): Promise<void> => {
  const { isActivated } = state
  if (isActivated) {
    return
  }
  state.isActivated = true
  await activateExtensionApi()
  registerView(view)
}

export const deactivate = async (): Promise<void> => {
  await disposeCpuProfileParserWorker()
}
