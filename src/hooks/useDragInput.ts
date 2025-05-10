import { useCallback, useEffect, useRef, useState } from 'react';

interface DragInputOptions {
  onChange: (value: number) => void;
  onDragChange?: (value: number) => void;
  onStartEdit?: () => void;
  transformType?: 'position' | 'rotation' | 'scale';
  step?: number;
  sensitivity?: number;
  min?: number;
  max?: number;
}

const SENSITIVITY_MULTIPLIERS = {
  position: 0.05,    // Doubled position sensitivity
  rotation: 0.9,    // Keep rotation sensitivity
  scale: 0.025      // Keep scale sensitivity
};

export function useDragInput({
  onChange,
  onDragChange,
  onStartEdit,
  transformType = 'position',
  step = 0.1,
  sensitivity = 0.05,
  min,
  max
}: DragInputOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTimeRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);
  const shiftKeyRef = useRef<boolean>(false);
  
  // Get adjusted sensitivity based on transform type
  const getAdjustedSensitivity = () => SENSITIVITY_MULTIPLIERS[transformType] || sensitivity;

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLInputElement>, currentValue: number) => {
    dragStartTimeRef.current = Date.now();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startValueRef.current = currentValue;
    shiftKeyRef.current = e.shiftKey;
    e.preventDefault(); // Prevent text selection
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const dragDuration = Date.now() - dragStartTimeRef.current;
    // If the mouse was down for less than 200ms, treat it as a click
    if (dragDuration < 200 && !isDragging) {
      e.currentTarget.select();
      onStartEdit?.();
    }
  }, [isDragging, onStartEdit]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Update shift key state during drag
      shiftKeyRef.current = e.shiftKey;
      
      let delta;
      if (transformType === 'rotation' && shiftKeyRef.current) {
        // Use vertical movement for fine rotation control when shift is held
        delta = (startYRef.current - e.clientY) * 1.0; // Increased sensitivity for fine control
        const newValue = startValueRef.current + delta;
        onChange(newValue);
      } else {
        // Normal behavior for other transforms or rotation without shift
        delta = (e.clientX - startXRef.current) * getAdjustedSensitivity();
        const steps = Math.round(delta / step);
        const newValue = startValueRef.current + (steps * step);
      
        let finalValue = min !== undefined && max !== undefined
          ? Math.min(Math.max(newValue, min), max) 
          : newValue;
      
        // Use onDragChange for live updates during drag
        if (onDragChange) {
          onDragChange(finalValue);
        } else {
          onChange(finalValue);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      shiftKeyRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') shiftKeyRef.current = false;
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleMouseUp);
    };
  }, [isDragging, onChange, step, sensitivity, min, max]);

  return {
    handleMouseDown,
    handleClick,
    isDragging
  };
}