import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { readFile, type ViewContext, type ViewEvent, type VirtualDomViewInstance } from '@lvce-editor/api'
import type { CpuProfile } from '../ParseCpuProfile/ParseCpuProfile.ts'
import { parseCpuProfile } from '../ParseCpuProfile/ParseCpuProfile.ts'
import { render } from '../RenderCpuProfile/RenderCpuProfile.ts'

interface CpuProfileViewContext extends ViewContext {
  readonly uri?: string
}

interface CpuProfileSavedState {
  readonly expandedNodeIds?: unknown
  readonly uri?: unknown
}

export interface CpuProfileViewState {
  readonly expandedNodeIds: ReadonlySet<number>
  readonly profile: CpuProfile
}

export interface CpuProfileViewInstance extends VirtualDomViewInstance {
  readonly render: () => readonly VirtualDomNode[]
  readonly saveState: () => CpuProfileSavedState
}

export interface CpuProfileViewDependencies {
  readonly readFile: (uri: string) => Promise<string>
}

const defaultDependencies: CpuProfileViewDependencies = {
  readFile,
}

const getSavedState = (context: CpuProfileViewContext | undefined): CpuProfileSavedState => {
  if (!context?.state || typeof context.state !== 'object') {
    return {}
  }
  return context.state
}

const getUri = (context: CpuProfileViewContext | undefined, savedState: CpuProfileSavedState): string => {
  if (typeof context?.uri === 'string') {
    return context.uri
  }
  return typeof savedState.uri === 'string' ? savedState.uri : ''
}

const getExpandedNodeIds = (savedState: CpuProfileSavedState, profile: CpuProfile): ReadonlySet<number> => {
  if (!Array.isArray(savedState.expandedNodeIds)) {
    return new Set(profile.rootIds)
  }
  const validIds = new Set(profile.nodes.map((node) => node.id))
  return new Set(savedState.expandedNodeIds.filter((id): id is number => Number.isSafeInteger(id) && validIds.has(id)))
}

const toggleExpandedNode = (expandedNodeIds: ReadonlySet<number>, id: number): ReadonlySet<number> => {
  const next = new Set(expandedNodeIds)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  return next
}

export const createInstanceWithDependencies = async (
  context: CpuProfileViewContext | undefined,
  dependencies: CpuProfileViewDependencies,
): Promise<CpuProfileViewInstance> => {
  const savedState = getSavedState(context)
  const uri = getUri(context, savedState)
  const profile = parseCpuProfile(await dependencies.readFile(uri))
  let state: CpuProfileViewState = {
    expandedNodeIds: getExpandedNodeIds(savedState, profile),
    profile,
  }

  return {
    dispose(): void {},
    handleEvent(event: Readonly<ViewEvent>): void {
      if (event.type !== 'click' || !event.name?.startsWith('toggle:')) {
        return
      }
      const id = Number(event.name.slice('toggle:'.length))
      if (!Number.isSafeInteger(id)) {
        return
      }
      const { expandedNodeIds } = state
      state = {
        ...state,
        expandedNodeIds: toggleExpandedNode(expandedNodeIds, id),
      }
    },
    render(): readonly VirtualDomNode[] {
      return render(state)
    },
    saveState(): CpuProfileSavedState {
      const { expandedNodeIds } = state
      return {
        expandedNodeIds: [...expandedNodeIds],
        uri,
      }
    },
  }
}

export const createInstance = (context?: ViewContext): Promise<CpuProfileViewInstance> => {
  return createInstanceWithDependencies(context, defaultDependencies)
}
