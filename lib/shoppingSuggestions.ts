import { analyzeModeReadiness } from './modeReadiness';
import { buildGuidedAddSuggestion } from './guidedAdd';
import { getShoppingList, ShoppingListItem } from './shoppingListStorage';
import { WardrobeItem } from '../types/wardrobe';

export type SmartShoppingSuggestion = {
  id: string;
  title: string;
  description: string;
  category: ShoppingListItem['category'];
  subcategory: ShoppingListItem['subcategory'];
  occasion?: ShoppingListItem['occasion'];
  priority: ShoppingListItem['priority'];
};

export function buildSmartShoppingSuggestions(
  items: WardrobeItem[]
): SmartShoppingSuggestion[] {
  const readiness = analyzeModeReadiness(items);
  const suggestions: SmartShoppingSuggestion[] = [];

  readiness
    .filter((mode) => !mode.ready && mode.missingSlotKeys.length > 0)
    .forEach((mode) => {
      const guided = buildGuidedAddSuggestion(mode.occasion, mode.missingSlotKeys[0]);

      suggestions.push({
        id: `${mode.occasion}-${guided.subcategory}`,
        title: `${mode.occasion} için ${guided.title}`,
        description: `${mode.bestTemplateLabel} tarafını güçlendirmek için ${guided.subcategory.toLocaleLowerCase('tr-TR')} eklemek iyi olabilir.`,
        category: guided.category,
        subcategory: guided.subcategory,
        occasion: guided.occasion,
        priority: mode.completion < 50 ? 'Yüksek' : 'Orta',
      });
    });

  const hasBag = items.some((item) => item.category === 'Çanta');
  const hasShoe = items.some((item) => item.category === 'Ayakkabı');

  if (!hasBag) {
    suggestions.push({
      id: 'global-bag',
      title: 'Nötr çanta',
      description: 'Bir çanta birçok görünümü daha tamamlanmış gösterir.',
      category: 'Çanta',
      subcategory: 'Omuz Çantası',
      priority: 'Orta',
    });
  }

  if (!hasShoe) {
    suggestions.push({
      id: 'global-shoe',
      title: 'Temel ayakkabı',
      description: 'Ayakkabı eklendiğinde kombin motoru çok daha rahat çalışır.',
      category: 'Ayakkabı',
      subcategory: 'Sneaker',
      priority: 'Yüksek',
    });
  }

  return suggestions.filter(
    (item, index, array) =>
      array.findIndex(
        (entry) =>
          entry.category === item.category &&
          entry.subcategory === item.subcategory &&
          entry.occasion === item.occasion
      ) === index
  ).slice(0, 6);
}

export async function buildShoppingScreenState(items: WardrobeItem[]) {
  const [shoppingList] = await Promise.all([getShoppingList()]);
  const smartSuggestions = buildSmartShoppingSuggestions(items);

  const existingKeys = new Set(
    shoppingList.map((item) => `${item.category}-${item.subcategory}-${item.occasion || ''}`)
  );

  const filteredSuggestions = smartSuggestions.filter(
    (item) => !existingKeys.has(`${item.category}-${item.subcategory}-${item.occasion || ''}`)
  );

  return {
    shoppingList,
    smartSuggestions: filteredSuggestions,
  };
}
