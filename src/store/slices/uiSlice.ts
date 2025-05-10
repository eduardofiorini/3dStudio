import { StateCreator } from 'zustand';
import { EditorState } from '../types';

export interface PanelSectionState {
  transform: boolean;
  material: boolean;
  physics: boolean;
  light: boolean;
  text: boolean;
}

export interface UiSlice {
  panelSections: Record<string, PanelSectionState>;
  expandedMenus: Set<string>;
  setPanelSectionState: (objectId: string, section: keyof PanelSectionState, isOpen: boolean) => void;
  getPanelSectionState: (objectId: string, section: keyof PanelSectionState) => boolean;
  toggleMenu: (menuId: string) => void;
  isMenuExpanded: (menuId: string) => boolean;
}

const defaultSectionState: PanelSectionState = {
  transform: true,
  material: true,
  physics: false,
  light: true,
  text: true,  // Text section expanded by default
};

export const createUiSlice: StateCreator<EditorState, [], [], UiSlice> = (set, get) => ({
  panelSections: {},
  expandedMenus: new Set(),
  
  setPanelSectionState: (objectId, section, isOpen) => 
    set((state) => ({
      panelSections: {
        ...state.panelSections,
        [objectId]: {
          ...defaultSectionState,
          ...(state.panelSections[objectId] || {}),
          [section]: isOpen,
        },
      },
    })),
    
  getPanelSectionState: (objectId, section) => {
    const state = get().panelSections[objectId];
    return state ? state[section] : defaultSectionState[section];
  },

  toggleMenu: (menuId) => set((state) => {
    const newExpandedMenus = new Set(state.expandedMenus);
    if (newExpandedMenus.has(menuId)) {
      newExpandedMenus.delete(menuId);
    } else {
      newExpandedMenus.add(menuId);
    }
    return { expandedMenus: newExpandedMenus };
  }),

  isMenuExpanded: (menuId) => {
    return get().expandedMenus.has(menuId);
  }
});