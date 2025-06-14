import { create } from 'zustand';

export type TabType = 'game' | 'stats' | 'theme' | 'settings';

interface NavigationState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: 'game',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

// Individual selectors for optimal performance
export const useActiveTab = () => useNavigationStore((state) => state.activeTab);
export const useSetActiveTab = () => useNavigationStore((state) => state.setActiveTab);
