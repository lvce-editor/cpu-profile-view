import { beforeEach, expect, jest, test } from '@jest/globals'
import * as CpuProfileParserWorker from '../src/parts/CpuProfileParserWorker/CpuProfileParserWorker.ts'

const invoke = jest.fn<(method: string, ...params: readonly unknown[]) => Promise<unknown>>()
const dispose = jest.fn<() => Promise<void>>(async () => {})
const createRpc = jest.fn<
  (options: { readonly id: string }) => Promise<{
    readonly dispose: typeof dispose
    readonly invoke: typeof invoke
  }>
>(async () => ({ dispose, invoke }))

beforeEach(() => {
  jest.resetAllMocks()
  createRpc.mockResolvedValue({ dispose, invoke })
  CpuProfileParserWorker.state.createRpc = createRpc
  CpuProfileParserWorker.state.rpcPromise = undefined
})

test('lazily creates and reuses the parser worker', async () => {
  const firstProfile = { duration: 1, nodes: [], rootIds: [], sampleCount: 1 }
  const secondProfile = { duration: 2, nodes: [], rootIds: [], sampleCount: 2 }
  invoke.mockResolvedValueOnce(firstProfile).mockResolvedValueOnce(secondProfile)

  await expect(CpuProfileParserWorker.parseCpuProfile('first')).resolves.toBe(firstProfile)
  await expect(CpuProfileParserWorker.parseCpuProfile('second')).resolves.toBe(secondProfile)

  expect(createRpc).toHaveBeenCalledTimes(1)
  expect(createRpc).toHaveBeenCalledWith({ id: 'builtin.cpu-profile-view.parser-worker' })
  expect(invoke).toHaveBeenNthCalledWith(1, 'CpuProfileParser.parse', 'first')
  expect(invoke).toHaveBeenNthCalledWith(2, 'CpuProfileParser.parse', 'second')
})

test('disposes an initialized worker and can be called before initialization', async () => {
  await CpuProfileParserWorker.dispose()
  expect(dispose).not.toHaveBeenCalled()

  invoke.mockResolvedValue({ duration: 0, nodes: [], rootIds: [], sampleCount: 0 })
  await CpuProfileParserWorker.parseCpuProfile('{}')
  await CpuProfileParserWorker.dispose()

  expect(dispose).toHaveBeenCalledTimes(1)
  expect(CpuProfileParserWorker.state.rpcPromise).toBeUndefined()
})
