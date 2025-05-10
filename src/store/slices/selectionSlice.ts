import { StateCreator } from 'zustand';
import { EditorState } from '../types';

export interface SelectionState {
  isSelecting: boolean;
  selectionStart: { x: number; y: number };
  selectionEnd: { x: number; y: number };
}

export interface SelectionSlice extends SelectionState {
  setSelectionState: (state: Partial<SelectionState>) => void;
}

export const createSelectionSlice: StateCreator<EditorState, [], [], SelectionSlice> = (set) => ({
  isSelecting: false,
  selectionStart: { x: 0, y: 0 },
  selectionEnd: { x: 0, y: 0 },
  
  setSelectionState: (state) => set((prev) => ({
    ...prev,
    ...state
  })),
});