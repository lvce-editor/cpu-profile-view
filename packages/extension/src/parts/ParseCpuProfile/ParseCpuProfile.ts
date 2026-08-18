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

const parseNode = (value: unknown): RawNode => {
  if (!isRecord(value) || !Number.isSafeInteger(value.id)) {
    throw new Error('Every CPU profile node must have an integer id')
  }
  const callFrame = isRecord(value.callFrame) ? value.callFrame : {}
  const children = Array.isArray(value.children)
    ? value.children.filter((child): child is number => Number.isSafeInteger(child))
    : []
  return {
    children,
    columnNumber: readFiniteNumber(callFrame.columnNumber, -1),
    functionName: readString(callFrame.functionName) || '(anonymous)',
    hitCount: readNonNegativeNumber(value.hitCount),
    id: value.id as number,
    lineNumber: readFiniteNumber(callFrame.lineNumber, -1),
    url: readString(callFrame.url),
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
  return Math.max(0, (endTime - startTime) / 1000)
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
  let value: unknown
  try {
    value = JSON.parse(content)
  } catch {
    throw new Error('CPU profile is not valid JSON')
  }
  if (!isRecord(value) || !Array.isArray(value.nodes) || value.nodes.length === 0) {
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
      if (nodeById.has(childId) && childId !== node.id && !parentById.has(childId)) {
        parentById.set(childId, node.id)
      }
    }
  }

  const samples = Array.isArray(value.samples)
    ? value.samples.filter((sample): sample is number => Number.isSafeInteger(sample) && nodeById.has(sample))
    : []
  const timeDeltas = Array.isArray(value.timeDeltas) ? value.timeDeltas : []
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
  const rootIds = rawNodes.filter((node) => !parentById.has(node.id)).map((node) => node.id)

  return {
    duration,
    nodes,
    rootIds: rootIds.length > 0 ? rootIds : [rawNodes[0].id],
    sampleCount: samples.length,
  }
}
