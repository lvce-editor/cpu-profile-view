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
