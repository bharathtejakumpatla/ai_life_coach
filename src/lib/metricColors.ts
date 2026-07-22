import type { SubMetric } from '../types'

export interface MetricColor {
  label: string
  light: string
  dark: string
}

// Validated categorical order (dataviz skill): blue, green, magenta, yellow, aqua.
export const OVERALL_COLOR: MetricColor = { label: 'Overall', light: '#2a78d6', dark: '#3987e5' }

export const SUB_METRIC_COLORS: Record<SubMetric, MetricColor> = {
  structure: { label: 'Structure', light: '#008300', dark: '#008300' },
  fluency: { label: 'Fluency', light: '#e87ba4', dark: '#d55181' },
  vocabulary: { label: 'Vocabulary', light: '#eda100', dark: '#c98500' },
  pacing: { label: 'Pacing', light: '#1baf7a', dark: '#199e70' },
}

export const STATUS_COLOR = {
  good: { light: '#0ca30c', dark: '#0ca30c' },
  warning: { light: '#fab219', dark: '#fab219' },
  critical: { light: '#d03b3b', dark: '#d03b3b' },
}

export function scoreTier(score: number): 'good' | 'warning' | 'critical' {
  if (score >= 70) return 'good'
  if (score >= 50) return 'warning'
  return 'critical'
}
