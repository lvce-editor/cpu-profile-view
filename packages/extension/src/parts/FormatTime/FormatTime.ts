export const formatTime = (milliseconds: number): string => {
  if (milliseconds >= 1000) {
    return `${(milliseconds / 1000).toFixed(2)} s`
  }
  if (milliseconds >= 1) {
    return `${milliseconds.toFixed(2)} ms`
  }
  return `${(milliseconds * 1000).toFixed(0)} μs`
}

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}
