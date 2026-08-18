import { expect, test } from '@jest/globals'
import { formatPercentage, formatTime } from '../src/parts/FormatTime/FormatTime.ts'

test('formats seconds, milliseconds, and microseconds', () => {
  expect(formatTime(1500)).toBe('1.50 s')
  expect(formatTime(12.345)).toBe('12.35 ms')
  expect(formatTime(0.25)).toBe('250 μs')
})

test('formats percentages', () => {
  expect(formatPercentage(12.345)).toBe('12.3%')
})
