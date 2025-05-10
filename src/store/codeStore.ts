import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CodeState {
  codeHistory: string[];
  currentCode: string | null;
  namedScripts: Map<string, string>;
  scriptCategories: Map<string, Set<string>>;
  addCode: (code: string) => void;
  updateScript: (name: string, code: string) => void;
  saveScript: (name: string, code: string, category?: string) => void;
  getScriptsByCategory: (category: string) => string[];
  getScript: (name: string) => string | null;
  getCurrentCode: () => string | null;
  clearHistory: () => void;
}

export const useCodeStore = create<CodeState>()(
  persist(
    (set, get) => ({
      codeHistory: [],
      currentCode: null,
      namedScripts: new Map(),
      scriptCategories: new Map(),

      // Clear history on page load
      onLoad: () => set({ 
        codeHistory: [], 
        currentCode: null 
      }),

      addCode: (code: string) => set((state) => ({
        codeHistory: [...state.codeHistory, code],
        currentCode: code
      })),

      updateScript: (name: string, code: string) => set((state) => {
        const scripts = new Map(state.namedScripts);
        scripts.set(name, code);
        return { namedScripts: scripts };
      }),

      saveScript: (name: string, code: string, category = 'default') => set((state) => {
        const scripts = new Map(state.namedScripts);
        const categories = new Map(state.scriptCategories);
        
        scripts.set(name, code);
        
        if (!categories.has(category)) {
          categories.set(category, new Set());
        }
        categories.get(category)?.add(name);
        
        return { 
          namedScripts: scripts,
          scriptCategories: categories
        };
      }),

      getScriptsByCategory: (category: string) => {
        const state = get();
        const scriptNames = state.scriptCategories.get(category) || new Set();
        return Array.from(scriptNames)
          .map(name => state.namedScripts.get(name))
          .filter(Boolean) as string[];
      },

      getScript: (name: string) => get().namedScripts.get(name) || null,
      getCurrentCode: () => get().currentCode,
      
      clearHistory: () => set({ 
        codeHistory: [], 
        currentCode: null,
        namedScripts: new Map()
      })
    }),
    {
      name: 'code-store',
      onRehydrateStorage: () => (state) => {
        // Clear history when storage is rehydrated (page reload)
        if (state) {
          state.onLoad();
        }
      }
    }
  )
);