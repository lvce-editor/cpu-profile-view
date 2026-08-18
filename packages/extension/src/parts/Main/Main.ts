import { activate as activateExtensionApi, registerView } from '@lvce-editor/api'
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

export const deactivate = (): void => {}
