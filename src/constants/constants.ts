export const VARIANCE_THRESHOLDS = {
  HIGH: 2,
  MEDIUM: 1,
} as const;

export const MAP_BOUNDS = {
  LNG_OFFSET: 122.3,
  LNG_RANGE: 0.4,
  LAT_CENTER: 37.85,
  LAT_RANGE: 0.06,
} as const;

export const WARNING_LEVEL = 41.5; // inches

export const CHART_COLORS = {
  MANHOLE_METRICS: '#2563eb',
  REFERENCE: '#7c3aed',
  RAINFALL: '#16a34a',
  WARNING: '#9ca3af',
} as const;
