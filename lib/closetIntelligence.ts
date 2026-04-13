import { WardrobeItem } from '../types/wardrobe';

export type DuplicateGroup = {
  id: string;
  title: string;
  count: number;
  suggestion: string;
};

export type UnderusedInsight = {
  id: string;
  itemId: string;
  title: string;
  category: string;
  reason: string;
  imageUri: string;
};

export type ShoppingSuggestion = {
  id: string;
  title: string;
  priority: 'Yüksek' | 'Orta';
  reason: string;
};

export type ClosetIntelligence = {
  duplicateGroups: DuplicateGroup[];
  underusedItems: UnderusedInsight[];
  shoppingSuggestions: ShoppingSuggestion[];
};

function normalize(value?: string) {
  return (value || '').trim().toLocaleLowerCase('tr-TR');
}

function countByCategory(items: WardrobeItem[], categories: string[]) {
  return items.filter((item) => categories.includes(item.category)).length;
}

function getReviveSuggestion(item: WardrobeItem) {
  if (['Gömlek', 'Bluz'].includes(item.category)) {
    return 'Yüksek bel pantolon veya etekle daha kolay kombinlenebilir.';
  }

  if (item.category === 'Ceket' || item.category === 'Dış Giyim') {
    return 'Düz tişört ve koyu alt parçayla odak parça gibi kullanılabilir.';
  }

  if (item.category === 'Etek') {
    return 'Nötr üst ve loafer/sneaker ile daha günlük hale getirilebilir.';
  }

  if (item.category === 'Ayakkabı') {
    return 'Nötr renkli sade bir görünümde odak parça olarak öne çıkarılabilir.';
  }

  if (item.category === 'Elbise') {
    return 'Ceket veya dış katman eklenerek daha sık kullanılabilir.';
  }

  return 'Yeni bir kombin içinde tekrar görünür hale getirilebilir.';
}

function getDuplicateSuggestion(category: string) {
  if (category === 'Pantolon') {
    return 'Bir sonraki alışverişte farklı kesim veya ton düşünmek daha iyi çeşitlilik sağlar.';
  }

  if (category === 'Tişört' || category === 'Gömlek' || category === 'Bluz') {
    return 'Bu kategoride farklı renk ailesi veya farklı siluet eklemek dolabı güçlendirir.';
  }

  if (category === 'Ayakkabı') {
    return 'Bir sonraki ayakkabı tercihini farklı kullanım senaryosuna göre seçebilirsin.';
  }

  return 'Bu kategoride yeni alışverişte farklı form veya renk düşünmek iyi olabilir.';
}

export function analyzeClosetIntelligence(items: WardrobeItem[]): ClosetIntelligence {
  const duplicateMap = new Map<string, WardrobeItem[]>();

  items.forEach((item) => {
    const key = `${item.category}|${normalize(item.color) || 'renksiz'}`;
    const prev = duplicateMap.get(key) || [];
    duplicateMap.set(key, [...prev, item]);
  });

  const duplicateGroups: DuplicateGroup[] = [...duplicateMap.entries()]
    .filter(([, value]) => value.length >= 2)
    .map(([key, value]) => {
      const [category, color] = key.split('|');
      const labelColor = color === 'renksiz' ? 'benzer ton' : color;

      return {
        id: key,
        title: `${value.length} benzer ${labelColor} ${category}`,
        count: value.length,
        suggestion: getDuplicateSuggestion(category),
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const underusedItems: UnderusedInsight[] = [...items]
    .filter((item) => (item.wearCount || 0) <= 1)
    .filter((item) => (item.status || 'Temiz') === 'Temiz')
    .sort((a, b) => (a.wearCount || 0) - (b.wearCount || 0))
    .slice(0, 3)
    .map((item) => ({
      id: `underused-${item.id}`,
      itemId: item.id,
      title: item.name,
      category: item.category,
      reason: getReviveSuggestion(item),
      imageUri: item.imageUri,
    }));

  const tops = countByCategory(items, ['Gömlek', 'Bluz', 'Body', 'Tişört', 'Kazak / Hırka']);
  const bottoms = countByCategory(items, ['Pantolon', 'Şort', 'Etek']);
  const shoes = countByCategory(items, ['Ayakkabı']);
  const bags = countByCategory(items, ['Çanta']);
  const eventPieces = countByCategory(items, ['Elbise', 'Takım']);

  const shoppingSuggestions: ShoppingSuggestion[] = [];

  if (tops < 3) {
    shoppingSuggestions.push({
      id: 'tops',
      title: 'Daha çok temel üst parça',
      priority: 'Yüksek',
      reason: 'Üst parça çeşitliliği az olduğunda kombin motoru aynı görünümlere dönebilir.',
    });
  }

  if (bottoms < 2) {
    shoppingSuggestions.push({
      id: 'bottoms',
      title: 'Çok yönlü alt parça',
      priority: 'Yüksek',
      reason: 'Pantolon / etek / şort dengesi kombin esnekliğini ciddi şekilde artırır.',
    });
  }

  if (shoes < 2) {
    shoppingSuggestions.push({
      id: 'shoes',
      title: 'İkinci günlük ayakkabı',
      priority: 'Orta',
      reason: 'Ayakkabı rotasyonu hem görünümü hem tekrar hissini iyileştirir.',
    });
  }

  if (bags < 1) {
    shoppingSuggestions.push({
      id: 'bag',
      title: 'Nötr çanta',
      priority: 'Orta',
      reason: 'Nötr bir çanta birçok kombini daha tamamlanmış gösterir.',
    });
  }

  if (eventPieces < 1) {
    shoppingSuggestions.push({
      id: 'event-piece',
      title: 'Şık davet parçası',
      priority: 'Orta',
      reason: 'Elbise veya takım gibi güçlü bir parça davet kombinlerinde büyük fark yaratır.',
    });
  }

  return {
    duplicateGroups,
    underusedItems,
    shoppingSuggestions: shoppingSuggestions.slice(0, 4),
  };
}
