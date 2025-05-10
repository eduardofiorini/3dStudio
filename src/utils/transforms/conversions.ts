// Convert degrees to radians
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Convert radians to degrees
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

// Format transform values for display
export function formatTransformValue(value: number, precision: number = 3): string {
  return Number.isFinite(value) ? value.toFixed(precision) : '0';
}