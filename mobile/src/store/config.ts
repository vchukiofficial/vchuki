import { create } from 'zustand';
import { DEFAULT_CONFIG } from '@/lib/pricing';
import type { StoreConfig } from '@/lib/types';

/** Store rules (fees, thresholds) as served by /api/mobile/home, with the site's values as fallback. */
export const useConfig = create<{ config: StoreConfig; set: (c: StoreConfig) => void }>((set) => ({
  config: DEFAULT_CONFIG,
  set: (config) => set({ config }),
}));
