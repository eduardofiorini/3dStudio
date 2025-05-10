import { create } from "zustand";
import { createTransformSlice } from "./slices/transformSlice";
import { createObjectsSlice } from "./slices/objectsSlice";
import { createSceneSlice } from "./slices/sceneSlice";
import { createHierarchySlice } from "./slices/hierarchySlice";
import { createUiSlice } from "./slices/uiSlice";
import { createHistorySlice } from "./slices/historySlice";
import { createArrayModifierSlice } from "./slices/arrayModifierSlice";
import { createMaterialAssetsSlice } from "./slices/materialAssetsSlice";
import { createShaderAssetsSlice } from "./slices/shaderAssetsSlice";
import { createPersistenceSlice } from "./slices/persistenceSlice";
import { createSelectionSlice } from "./slices/selectionSlice";
import { createShaderAssetsSlice } from './slices/shaderAssetsSlice';
import { createRenderModeSlice } from './slices/renderModeSlice';
import { createCameraPreviewSlice } from './slices/cameraPreviewSlice';

export const useEditorStore = create<EditorState>()((...args) => ({
  ...createTransformSlice(...args),
  ...createObjectsSlice(...args),
  ...createSceneSlice(...args),
  ...createHierarchySlice(...args),
  ...createUiSlice(...args),
  ...createHistorySlice(...args),
  ...createArrayModifierSlice(...args),
  ...createMaterialAssetsSlice(...args),
  ...createShaderAssetsSlice(...args),
  ...createPersistenceSlice(...args),
  ...createRenderModeSlice(...args),
  ...createSelectionSlice(...args),
  ...createCameraPreviewSlice(...args),
}));