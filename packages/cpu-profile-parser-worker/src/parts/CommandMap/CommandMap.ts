import { parseCpuProfile } from '../ParseCpuProfile/ParseCpuProfile.ts'

export const commandMap: Readonly<Record<string, unknown>> = {
  'CpuProfileParser.parse': parseCpuProfile,
}
