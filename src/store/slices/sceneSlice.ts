import { StateCreator } from 'zustand';
import { EditorState, SceneSettings } from '../types';
import { DEFAULT_SCENE_SETTINGS } from '../../constants/defaults';

export interface SceneSlice {
  sceneSettings: SceneSettings;
  currentCapture: string | null;
  aiImage: string | null;
  prompt: string;
  updateSceneSettings: (settings: Partial<SceneSettings>) => void;
  setCurrentCapture: (capture: string | null) => void;
  setAiImage: (image: string | null) => void;
  setPrompt: (prompt: string) => void;
}

export const createSceneSlice: StateCreator<EditorState, [], [], SceneSlice> = (set) => ({
  sceneSettings: DEFAULT_SCENE_SETTINGS,
  currentCapture: null,
  aiImage: null,
  prompt: '',
  
  updateSceneSettings: (settings) => set((state) => ({
    sceneSettings: { ...state.sceneSettings, ...settings },
  })),

  setCurrentCapture: (capture) => set({ currentCapture: capture }),
  setAiImage: (image) => set({ aiImage: image }),
  setPrompt: (prompt) => set({ prompt }),
});