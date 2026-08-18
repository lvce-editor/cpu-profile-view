import { createRpc } from '@lvce-editor/api'
import type { CpuProfile } from '../CpuProfile/CpuProfile.ts'

interface Rpc {
  readonly dispose: () => Promise<void> | void
  readonly invoke: (method: string, ...params: readonly unknown[]) => Promise<unknown>
}

type CreateRpc = (options: { readonly id: string }) => Promise<Rpc>

export const state: {
  createRpc: CreateRpc
  rpcPromise: Promise<Rpc> | undefined
} = {
  createRpc,
  rpcPromise: undefined,
}

const getRpc = (): Promise<Rpc> => {
  const { createRpc: createRpcFunction, rpcPromise } = state
  if (rpcPromise) {
    return rpcPromise
  }
  const newRpcPromise = createRpcFunction({ id: 'builtin.cpu-profile-view.parser-worker' })
  state.rpcPromise = newRpcPromise
  return newRpcPromise
}

export const parseCpuProfile = async (content: string): Promise<CpuProfile> => {
  const rpc = await getRpc()
  return rpc.invoke('CpuProfileParser.parse', content) as Promise<CpuProfile>
}

export const dispose = async (): Promise<void> => {
  const { rpcPromise } = state
  state.rpcPromise = undefined
  if (!rpcPromise) {
    return
  }
  const rpc = await rpcPromise
  await rpc.dispose()
}
