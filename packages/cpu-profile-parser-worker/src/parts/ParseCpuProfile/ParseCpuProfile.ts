export interface CpuProfileNode {
  readonly children: readonly number[]
  readonly columnNumber: number
  readonly functionName: string
  readonly id: number
  readonly lineNumber: number
  readonly location: string
  readonly selfPercentage: number
  readonly selfTime: number
  readonly totalPercentage: number
  readonly totalTime: number
  readonly url: string
}

export interface CpuProfile {
  readonly duration: number
  readonly nodes: readonly CpuProfileNode[]
  readonly rootIds: readonly number[]
  readonly sampleCount: number
}

interface RawNode {
  readonly children: readonly number[]
  readonly columnNumber: number
  readonly functionName: string
  readonly hitCount: number
  readonly id: number
  readonly lineNumber: number
  readonly url: string
}

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const readFiniteNumber = (value: unknown, fallback = 0): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

const readNonNegativeNumber = (value: unknown): number => {
  return Math.max(0, readFiniteNumber(value))
}

const readString = (value: unknown): string => {
  return typeof value === 'string' ? value : ''
}

const readLineNumber = (value: unknown, nodeId: number): number => {
  if (value === undefined) {
    return -1
  }
  if (!Number.isSafeInteger(value) || (value as number) < -1) {
    throw new Error(`CPU profile node ${nodeId} callFrame.lineNumber must be an integer greater than or equal to -1`)
  }
  return value as number
}

const readHitCount = (value: unknown, nodeId: number): number => {
  if (value === undefined) {
    return 0
  }
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new Error(`CPU profile node ${nodeId} hitCount must be a non-negative integer`)
  }
  return value as number
}

const readUrl = (value: unknown, nodeId: number): string => {
  if (value === undefined) {
    return ''
  }
  if (typeof value !== 'string') {
    throw new TypeError(`CPU profile node ${nodeId} callFrame.url must be a string`)
  }
  return value
}

const readChildren = (value: unknown, nodeId: number): readonly number[] => {
  if (value === undefined) {
    return []
  }
  if (!Array.isArray(value) || value.some((childId) => !Number.isSafeInteger(childId))) {
    throw new Error(`CPU profile node ${nodeId} children must contain only integer node ids`)
  }
  return value
}

const parseTimeDeltas = (value: unknown): readonly number[] => {
  if (value === undefined) {
    return []
  }
  if (
    !Array.isArray(value) ||
    value.some((delta) => typeof delta !== 'number' || !Number.isFinite(delta) || delta < 0)
  ) {
    throw new Error('CPU profile timeDeltas must contain only non-negative finite numbers')
  }
  return value
}

const parseNode = (value: unknown): RawNode => {
  if (!isRecord(value) || !Number.isSafeInteger(value.id)) {
    throw new Error('Every CPU profile node must have an integer id')
  }
  const id = value.id as number
  const callFrame = isRecord(value.callFrame) ? value.callFrame : {}
  return {
    children: readChildren(value.children, id),
    columnNumber: readFiniteNumber(callFrame.columnNumber, -1),
    functionName: readString(callFrame.functionName) || '(anonymous)',
    hitCount: readHitCount(value.hitCount, id),
    id,
    lineNumber: readLineNumber(callFrame.lineNumber, id),
    url: readUrl(callFrame.url, id),
  }
}

const formatLocation = (node: RawNode): string => {
  if (!node.url) {
    return '(unknown)'
  }
  const line = node.lineNumber >= 0 ? `:${node.lineNumber + 1}` : ''
  const column = node.columnNumber >= 0 ? `:${node.columnNumber + 1}` : ''
  return `${node.url}${line}${column}`
}

const getElapsedDuration = (profile: Readonly<Record<string, unknown>>): number => {
  const startTime = readFiniteNumber(profile.startTime)
  const endTime = readFiniteNumber(profile.endTime)
  if (endTime < startTime) {
    throw new Error('CPU profile endTime must be greater than or equal to startTime')
  }
  return (endTime - startTime) / 1000
}

const getSampleDurations = (
  sampleCount: number,
  timeDeltas: readonly unknown[],
  elapsedDuration: number,
): readonly number[] => {
  const fallback = sampleCount === 0 ? 0 : elapsedDuration / sampleCount
  return Array.from({ length: sampleCount }, (_, index) => {
    const delta = readNonNegativeNumber(timeDeltas[index]) / 1000
    return delta > 0 ? delta : fallback
  })
}

const addToNodeAndAncestors = (
  id: number,
  duration: number,
  parentById: ReadonlyMap<number, number>,
  totals: Map<number, number>,
): void => {
  const visited = new Set<number>()
  let current: number | undefined = id
  while (current !== undefined && !visited.has(current)) {
    visited.add(current)
    totals.set(current, (totals.get(current) ?? 0) + duration)
    current = parentById.get(current)
  }
}

// CPU profiles are compact transport objects, so parsing and aggregation intentionally happen in one pass.
// eslint-disable-next-line sonarjs/cognitive-complexity
export const parseCpuProfile = (content: string): CpuProfile => {
  if (content.trim() === '') {
    throw new Error('CPU profile file is empty')
  }
  let value: unknown
  try {
    value = JSON.parse(content)
  } catch {
    throw new Error('CPU profile is not valid JSON')
  }
  if (!isRecord(value)) {
    throw new Error('CPU profile must be a JSON object')
  }
  if (!Array.isArray(value.nodes) || value.nodes.length === 0) {
    throw new Error('CPU profile must contain a non-empty nodes array')
  }

  const rawNodes = value.nodes.map(parseNode)
  const nodeById = new Map<number, RawNode>()
  for (const node of rawNodes) {
    if (nodeById.has(node.id)) {
      throw new Error(`CPU profile contains duplicate node id ${node.id}`)
    }
    nodeById.set(node.id, node)
  }

  const parentById = new Map<number, number>()
  for (const node of rawNodes) {
    for (const childId of node.children) {
      if (!nodeById.has(childId)) {
        throw new Error(`CPU profile node ${node.id} references unknown child node ${childId}`)
      }
      if (childId === node.id) {
        throw new Error(`CPU profile node ${node.id} cannot reference itself as a child`)
      }
      const existingParentId = parentById.get(childId)
      if (existingParentId !== undefined && existingParentId !== node.id) {
        throw new Error(`CPU profile node ${childId} has multiple parents: ${existingParentId} and ${node.id}`)
      }
      if (existingParentId === undefined) {
        parentById.set(childId, node.id)
      }
    }
  }
  const rootIds = rawNodes.filter((node) => !parentById.has(node.id)).map((node) => node.id)
  const reachableNodeIds = new Set<number>()
  const pendingNodeIds = [...rootIds]
  while (pendingNodeIds.length > 0) {
    const id = pendingNodeIds.pop() as number
    if (reachableNodeIds.has(id)) {
      continue
    }
    reachableNodeIds.add(id)
    const children = nodeById.get(id)?.children ?? []
    for (const childId of children) {
      pendingNodeIds.push(childId)
    }
  }
  if (reachableNodeIds.size !== rawNodes.length) {
    throw new Error('CPU profile call tree contains a cycle')
  }

  const samples = Array.isArray(value.samples)
    ? value.samples.map((sample) => {
        if (!Number.isSafeInteger(sample) || !nodeById.has(sample as number)) {
          throw new Error(`CPU profile sample ${String(sample)} references an unknown node`)
        }
        return sample as number
      })
    : []
  const timeDeltas = parseTimeDeltas(value.timeDeltas)
  if (timeDeltas.length > 0 && timeDeltas.length !== samples.length) {
    throw new Error('CPU profile timeDeltas length must match samples length')
  }
  const elapsedDuration = getElapsedDuration(value)
  const sampleDurations = getSampleDurations(samples.length, timeDeltas, elapsedDuration)
  const selfTimes = new Map<number, number>()
  const totalTimes = new Map<number, number>()

  if (samples.length > 0) {
    for (const [index, id] of samples.entries()) {
      const duration = sampleDurations[index] ?? 0
      selfTimes.set(id, (selfTimes.get(id) ?? 0) + duration)
      addToNodeAndAncestors(id, duration, parentById, totalTimes)
    }
  } else {
    const hitCount = rawNodes.reduce((total, node) => total + node.hitCount, 0)
    const durationPerHit = hitCount > 0 ? elapsedDuration / hitCount : 0
    for (const node of rawNodes) {
      const duration = node.hitCount * durationPerHit
      selfTimes.set(node.id, duration)
      addToNodeAndAncestors(node.id, duration, parentById, totalTimes)
    }
  }

  const sampledDuration = sampleDurations.reduce((total, duration) => total + duration, 0)
  const duration = sampledDuration > 0 ? sampledDuration : elapsedDuration
  const percentage = (time: number): number => (duration > 0 ? (time / duration) * 100 : 0)
  const nodes = rawNodes.map((node) => {
    const selfTime = selfTimes.get(node.id) ?? 0
    const totalTime = totalTimes.get(node.id) ?? 0
    return {
      children: node.children.filter((childId) => nodeById.has(childId) && childId !== node.id),
      columnNumber: node.columnNumber,
      functionName: node.functionName,
      id: node.id,
      lineNumber: node.lineNumber,
      location: formatLocation(node),
      selfPercentage: percentage(selfTime),
      selfTime,
      totalPercentage: percentage(totalTime),
      totalTime,
      url: node.url,
    }
  })
  return {
    duration,
    nodes,
    rootIds,
    sampleCount: samples.length,
  }
}
