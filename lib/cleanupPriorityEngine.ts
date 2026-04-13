import { WeeklyPlan } from '../types/planner';
import { WardrobeItem } from '../types/wardrobe';
import { SavedLook } from './savedLooksStorage';

export type CleanupPriorityGroup = {
  id: string;
  title: string;
  description: string;
  severity: 'Yüksek' | 'Orta';
  itemIds: string[];
  sampleNames: string[];
  count: number;
};

function isRaw(item: WardrobeItem) {
  return !item.processedImageUri || item.processedImageUri === item.imageUri;
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function takeNames(items: WardrobeItem[], ids: string[], limit = 4) {
  const idSet = new Set(ids);
  return items
    .filter((item) => idSet.has(item.id))
    .map((item) => item.name)
    .slice(0, limit);
}

export function buildCleanupPriorityGroups(args: {
  wardrobeItems: WardrobeItem[];
  savedLooks: SavedLook[];
  weeklyPlan: WeeklyPlan;
}): CleanupPriorityGroup[] {
  const { wardrobeItems, savedLooks, weeklyPlan } = args;

  const rawItems = wardrobeItems.filter(isRaw);
  const rawIdSet = new Set(rawItems.map((item) => item.id));
  const lookMap = new Map(savedLooks.map((look) => [look.id, look]));

  const plannedLookIds = Object.values(weeklyPlan).filter(Boolean) as string[];
  const plannedItemIds = unique(
    plannedLookIds.flatMap((lookId) => {
      const look = lookMap.get(lookId);
      if (!look) return [];
      return Object.values(look.pieces || {})
        .filter(Boolean)
        .map((item: any) => item.id);
    })
  ).filter((id) => rawIdSet.has(id));

  const favoriteItemIds = rawItems
    .filter((item) => item.isFavorite)
    .map((item) => item.id);

  const frequentItemIds = rawItems
    .filter((item) => (item.wearCount || 0) >= 3)
    .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
    .map((item) => item.id);

  const allRawIds = rawItems.map((item) => item.id);

  const groups: CleanupPriorityGroup[] = [];

  if (plannedItemIds.length) {
    groups.push({
      id: 'planned',
      title: 'Planner’da Kullanılacak Ham Görseller',
      description: 'Önümüzdeki günlerde planlı görünümlerde yer alan ham görseller önce temizlenirse uygulama çok daha temiz görünür.',
      severity: 'Yüksek',
      itemIds: plannedItemIds,
      sampleNames: takeNames(wardrobeItems, plannedItemIds),
      count: plannedItemIds.length,
    });
  }

  if (favoriteItemIds.length) {
    groups.push({
      id: 'favorites',
      title: 'Favori Ham Parçalar',
      description: 'Favori parçalar ana ekran, kombin ve paylaşım akışında daha sık göründüğü için öncelikli temizlenmeli.',
      severity: 'Yüksek',
      itemIds: favoriteItemIds,
      sampleNames: takeNames(wardrobeItems, favoriteItemIds),
      count: favoriteItemIds.length,
    });
  }

  if (frequentItemIds.length) {
    groups.push({
      id: 'frequent',
      title: 'Sık Giyilen Ham Parçalar',
      description: 'Sık kullanılan ama temizlenmemiş parçalar kartların görsel kalitesini düşürür.',
      severity: 'Orta',
      itemIds: frequentItemIds,
      sampleNames: takeNames(wardrobeItems, frequentItemIds),
      count: frequentItemIds.length,
    });
  }

  if (allRawIds.length) {
    groups.push({
      id: 'all-raw',
      title: 'Tüm Ham Görseller',
      description: 'Toplu yeniden işleme ile ham görselleri azaltıp daha tutarlı bir gardırop görünümü elde edebilirsin.',
      severity: 'Orta',
      itemIds: allRawIds,
      sampleNames: takeNames(wardrobeItems, allRawIds),
      count: allRawIds.length,
    });
  }

  return groups;
}
