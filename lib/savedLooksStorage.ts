import AsyncStorage from '@react-native-async-storage/async-storage';
import { OutfitRecommendation } from '../types/outfit';

export type SavedLook = OutfitRecommendation & {
  savedAt: string;
  tryOnPreviewUri?: string;
  shareNote?: string;
};

const SAVED_LOOKS_KEY = 'combinia_saved_looks';

function normalizeSavedLook(raw: any): SavedLook {
  return {
    ...raw,
    savedAt: raw?.savedAt || new Date().toISOString(),
    tryOnPreviewUri: raw?.tryOnPreviewUri || '',
    shareNote: raw?.shareNote || '',
  };
}

export async function getSavedLooks(): Promise<SavedLook[]> {
  const raw = await AsyncStorage.getItem(SAVED_LOOKS_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  return parsed.map(normalizeSavedLook);
}

export async function saveLook(look: OutfitRecommendation) {
  const existing = await getSavedLooks();
  const payload: SavedLook = normalizeSavedLook({
    ...look,
    id: `${look.id}-${Date.now()}`,
    savedAt: new Date().toISOString(),
  });

  await AsyncStorage.setItem(
    SAVED_LOOKS_KEY,
    JSON.stringify([payload, ...existing])
  );
}

export async function deleteSavedLook(id: string) {
  const existing = await getSavedLooks();
  const updated = existing.filter((item) => item.id !== id);
  await AsyncStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify(updated));
}

export async function attachTryOnPreviewToSavedLook(id: string, tryOnPreviewUri: string) {
  const existing = await getSavedLooks();
  const updated = existing.map((item) =>
    item.id === id
      ? {
          ...item,
          tryOnPreviewUri,
        }
      : item
  );

  await AsyncStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify(updated));
}
