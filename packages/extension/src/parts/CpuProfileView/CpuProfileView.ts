import type { View } from '@lvce-editor/api'
import { createInstance, type CpuProfileViewInstance } from '../CpuProfileViewInstance/CpuProfileViewInstance.ts'

export const viewId = 'builtin.cpu-profile-view'

export const view: View<CpuProfileViewInstance> = {
  create: createInstance,
  id: viewId,
  kind: 'virtualDom',
  title: 'CPU Profile',
}
