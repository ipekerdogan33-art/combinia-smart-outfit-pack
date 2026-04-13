import { WardrobeItem } from '../types/wardrobe';

export type MissingEssential = {
  id: string;
  title: string;
  reason: string;
};

export type WardrobeInsights = {
  totalItems: number;
  categoryCounts: Record<string, number>;
  missingEssentials: MissingEssential[];
  mostWornItems: WardrobeItem[];
  favoriteCount: number;
  dirtyCount: number;
};

function normalizeColor(value?: string) {
  return (value || '').trim().toLocaleLowerCase('tr-TR');
}

function colorIn(item: WardrobeItem, expected: string[]) {
  const c = normalizeColor(item.color);
  return expected.some((value) => c.includes(value));
}

function hasItem(items: WardrobeItem[], matcher: (item: WardrobeItem) => boolean) {
  return items.some(matcher);
}

export function analyzeWardrobe(items: WardrobeItem[]): WardrobeInsights {
  const categoryCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const missingEssentials: MissingEssential[] = [];

  if (
    !hasItem(
      items,
      (item) =>
        ['Gömlek', 'Bluz'].includes(item.category) &&
        colorIn(item, ['beyaz', 'krem', 'ekru'])
    )
  ) {
    missingEssentials.push({
      id: 'white-top',
      title: 'Açık renk gömlek / bluz',
      reason: 'Ofis ve günlük kombinlerde en çok iş gören temel parçalardan biri.',
    });
  }

  if (
    !hasItem(
      items,
      (item) => item.category === 'Pantolon' && colorIn(item, ['siyah', 'lacivert'])
    )
  ) {
    missingEssentials.push({
      id: 'dark-pants',
      title: 'Koyu nötr pantolon',
      reason: 'Klasik, minimalist ve ofis kombinleri için güçlü bir temel oluşturur.',
    });
  }

  if (
    !hasItem(
      items,
      (item) => item.category === 'Ayakkabı' && colorIn(item, ['beyaz', 'ekru', 'krem'])
    )
  ) {
    missingEssentials.push({
      id: 'light-shoe',
      title: 'Açık renk sneaker',
      reason: 'Günlük kombinleri daha hafif ve modern gösterir.',
    });
  }

  if (
    !hasItem(
      items,
      (item) => item.category === 'Ceket' && colorIn(item, ['siyah', 'bej', 'kahve', 'lacivert'])
    )
  ) {
    missingEssentials.push({
      id: 'blazer',
      title: 'Nötr blazer / ceket',
      reason: 'Ofis, davet ve smart-casual kombinleri güçlendirir.',
    });
  }

  if (
    !hasItem(
      items,
      (item) =>
        item.category === 'Çanta' && colorIn(item, ['siyah', 'bej', 'kahve', 'camel'])
    )
  ) {
    missingEssentials.push({
      id: 'neutral-bag',
      title: 'Nötr çanta',
      reason: 'Birden fazla kombinde rahatça tekrar kullanılabilir.',
    });
  }

  const mostWornItems = [...items]
    .filter((item) => (item.wearCount || 0) > 0)
    .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
    .slice(0, 3);

  const favoriteCount = items.filter((item) => item.isFavorite).length;
  const dirtyCount = items.filter((item) => item.status === 'Kirli').length;

  return {
    totalItems: items.length,
    categoryCounts,
    missingEssentials: missingEssentials.slice(0, 4),
    mostWornItems,
    favoriteCount,
    dirtyCount,
  };
}
