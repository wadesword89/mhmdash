import { VARIANCE_THRESHOLDS, MAP_BOUNDS } from '../constants/constants';

export const getLevelDifference = (site): number => {
  return Math.abs(
    site.manholeMetrics.currentLevel - site.referenceLevel.currentLevel
  );
};

export const getLevelStatus = (difference: number) => {
  if (difference > VARIANCE_THRESHOLDS.HIGH) return 'high-variance';
  if (difference > VARIANCE_THRESHOLDS.MEDIUM) return 'medium-variance';
  return 'low-variance';
};

export const getMapPosition = (lat: number, lng: number) => {
  const { LNG_OFFSET, LNG_RANGE, LAT_CENTER, LAT_RANGE } = MAP_BOUNDS;
  return {
    left: `${((lng + LNG_OFFSET) / LNG_RANGE) * 100}%`,
    top: `${((LAT_CENTER - lat) / LAT_RANGE) * 100}%`,
  };
};

export const getVarianceBadgeVariant = (status) => {
  switch (status) {
    case 'high-variance':
      return 'destructive';
    case 'medium-variance':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const getMapPinColor = (status): string => {
  switch (status) {
    case 'high-variance':
      return 'bg-red-600';
    case 'medium-variance':
      return 'bg-yellow-600';
    default:
      return 'bg-blue-600';
  }
};

export const getVarianceDescription = (status): string => {
  switch (status) {
    case 'high-variance':
      return 'High variance detected';
    case 'medium-variance':
      return 'Medium variance';
    default:
      return 'Normal variance';
  }
};
