import AsyncStorage from '@react-native-async-storage/async-storage';
import { CanonicalCategory, CanonicalSubcategory, Occasion } from '../types/catalog';

export type ShoppingPriority = 'Yüksek' | 'Orta';

export type ShoppingListItem = {
  id: string;
  title: string;
  description: string;
  category: CanonicalCategory;
  subcategory: CanonicalSubcategory;
  occasion?: Occasion;
  priority: ShoppingPriority;
  purchased: boolean;
  source: 'smart' | 'manual';
  createdAt: string;
};

const SHOPPING_LIST_KEY = 'combinia_shopping_list';

function normalizeItem(item: any): ShoppingListItem {
  return {
    id: item.id || Date.now().toString(),
    title: item.title || 'Yeni alışveriş öğesi',
    description: item.description || '',
    category: item.category,
    subcategory: item.subcategory,
    occasion: item.occasion || undefined,
    priority: item.priority || 'Orta',
    purchased: !!item.purchased,
    source: item.source || 'manual',
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

export async function getShoppingList(): Promise<ShoppingListItem[]> {
  const raw = await AsyncStorage.getItem(SHOPPING_LIST_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  return parsed.map(normalizeItem);
}

export async function saveShoppingList(items: ShoppingListItem[]) {
  await AsyncStorage.setItem(
    SHOPPING_LIST_KEY,
    JSON.stringify(items.map(normalizeItem))
  );
}

export async function addShoppingListItem(item: Omit<ShoppingListItem, 'id' | 'createdAt'>) {
  const existing = await getShoppingList();

  const duplicate = existing.find((entry) =>
    entry.category === item.category &&
    entry.subcategory === item.subcategory &&
    entry.occasion === item.occasion &&
    entry.purchased === item.purchased
  );

  if (duplicate) return duplicate;

  const next: ShoppingListItem = normalizeItem({
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  });

  await saveShoppingList([next, ...existing]);
  return next;
}

export async function removeShoppingListItem(id: string) {
  const existing = await getShoppingList();
  await saveShoppingList(existing.filter((item) => item.id !== id));
}

export async function toggleShoppingListPurchased(id: string) {
  const existing = await getShoppingList();
  const updated = existing.map((item) =>
    item.id === id
      ? { ...item, purchased: !item.purchased }
      : item
  );
  await saveShoppingList(updated);
}
