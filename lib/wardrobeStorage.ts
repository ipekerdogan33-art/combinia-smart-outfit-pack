import AsyncStorage from '@react-native-async-storage/async-storage';
import { WardrobeItem, WardrobeItemStatus } from '../types/wardrobe';
import { CanonicalCategory } from '../types/catalog';
import { toCanonicalWardrobeItem, validateCategorySubcategory } from './canonicalWardrobe';
import { logWearEvent, WearEventContext } from './wearHistoryStorage';

const WARDROBE_STORAGE_KEY = 'combinia_wardrobe_items';

const DIRTY_BY_CATEGORY: CanonicalCategory[] = [
  'Üst',
  'Alt',
  'Elbise',
  'Takım',
  'Ceket',
  'Dış Giyim',
  'Ayakkabı',
];

function normalizeWardrobeItem(item: any): WardrobeItem {
  const canonical = toCanonicalWardrobeItem(item);

  if (!validateCategorySubcategory(canonical.category, canonical.subcategory)) {
    throw new Error(
      `Geçersiz kategori/subcategory eşleşmesi: ${canonical.category} / ${canonical.subcategory}`
    );
  }

  return canonical;
}

export async function getWardrobeItems(): Promise<WardrobeItem[]> {
  const raw = await AsyncStorage.getItem(WARDROBE_STORAGE_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  return parsed.map(normalizeWardrobeItem);
}

export async function saveWardrobeItems(items: WardrobeItem[]) {
  const normalized = items.map(normalizeWardrobeItem);
  await AsyncStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(normalized));
}

export async function addWardrobeItem(item: WardrobeItem) {
  const items = await getWardrobeItems();
  await saveWardrobeItems([normalizeWardrobeItem(item), ...items]);
}

export async function updateWardrobeItem(
  itemId: string,
  patch: Partial<WardrobeItem>
) {
  const items = await getWardrobeItems();
  const updated = items.map((item) =>
    item.id === itemId
      ? normalizeWardrobeItem({
          ...item,
          ...patch,
          id: item.id,
        })
      : item
  );

  await saveWardrobeItems(updated);
}

export async function setWardrobeItemStatus(
  itemId: string,
  status: WardrobeItemStatus
) {
  await updateWardrobeItem(itemId, { status });
}

export async function bulkSetWardrobeItemStatus(
  itemIds: string[],
  status: WardrobeItemStatus
) {
  const items = await getWardrobeItems();
  const idSet = new Set(itemIds);
  const updated = items.map((item) =>
    idSet.has(item.id)
      ? { ...item, status }
      : item
  );

  await saveWardrobeItems(updated);
}

export async function deleteWardrobeItem(itemId: string) {
  const items = await getWardrobeItems();
  await saveWardrobeItems(items.filter((item) => item.id !== itemId));
}

export async function toggleFavoriteWardrobeItem(itemId: string) {
  const items = await getWardrobeItems();
  const updated = items.map((item) =>
    item.id === itemId
      ? { ...item, isFavorite: !item.isFavorite }
      : item
  );
  await saveWardrobeItems(updated);
}

export async function cycleWardrobeItemStatus(itemId: string) {
  const items = await getWardrobeItems();
  const order: WardrobeItemStatus[] = ['Temiz', 'Kirli', 'Kuru Temizlemede'];

  const updated = items.map((item) => {
    if (item.id !== itemId) return item;
    const current = item.status || 'Temiz';
    const next = order[(order.indexOf(current) + 1) % order.length];
    return { ...item, status: next };
  });

  await saveWardrobeItems(updated);
}

export async function markOutfitAsWorn(
  itemIds: string[],
  context?: WearEventContext
) {
  const items = await getWardrobeItems();
  const today = new Date().toISOString();

  const updated = items.map((item) => {
    if (!itemIds.includes(item.id)) return item;

    const shouldBecomeDirty = DIRTY_BY_CATEGORY.includes(item.category);

    return {
      ...item,
      wearCount: (item.wearCount || 0) + 1,
      lastWornAt: today,
      status: shouldBecomeDirty ? 'Kirli' : item.status || 'Temiz',
    };
  });

  await saveWardrobeItems(updated);
  await logWearEvent(itemIds, context);
}
