import { StateCreator } from 'zustand';
import { EditorState } from '../types';

export interface CameraPreviewState {
  cameraPreviewVisible: boolean;
  setCameraPreviewVisible: (visible: boolean) => void;
}

export const createCameraPreviewSlice: StateCreator<
  EditorState,
  [],
  [],
  CameraPreviewState
> = (set) => ({
  cameraPreviewVisible: false,
  setCameraPreviewVisible: (visible) => set({ cameraPreviewVisible: visible }),
});