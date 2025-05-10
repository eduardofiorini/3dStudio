import { CSSProperties } from 'react';

interface SelectionBoxOverlayProps {
  isSelecting: boolean;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}

export function SelectionBoxOverlay({ isSelecting, startPoint, endPoint }: SelectionBoxOverlayProps) {
  if (!isSelecting) return null;

  const left = Math.min(startPoint.x, endPoint.x);
  const top = Math.min(startPoint.y, endPoint.y);
  const width = Math.abs(endPoint.x - startPoint.x);
  const height = Math.abs(endPoint.y - startPoint.y);

  const style: CSSProperties = {
    position: 'fixed',
    left,
    top,
    width,
    height,
    border: '1px dashed rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    pointerEvents: 'none',
    zIndex: 1000,
  };

  return <div style={style} />;
}