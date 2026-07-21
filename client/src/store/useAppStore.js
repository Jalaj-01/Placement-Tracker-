import { create } from 'zustand'

export const useAppStore = create((set) => ({
  sidebarCollapsed: true, // Default to compact icon sidebar for clean spacious layout
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  isOffline: !navigator.onLine,
  setOffline: (value) => set({ isOffline: value }),
  
  // Right Slide-Over AI Coach Panel State
  aiCoachOpen: false,
  openAICoach: () => set({ aiCoachOpen: true, sidebarCollapsed: true }),
  closeAICoach: () => set({ aiCoachOpen: false }),
  toggleAICoach: () => set((s) => ({ aiCoachOpen: !s.aiCoachOpen, sidebarCollapsed: true })),
}))
