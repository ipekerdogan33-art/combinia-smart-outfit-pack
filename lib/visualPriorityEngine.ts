import { WeeklyPlan } from '../types/planner';
import { WardrobeItem } from '../types/wardrobe';
import { SavedLook } from './savedLooksStorage';

export type VisualPriorityItem = {
  itemId: string;
  name: string;
  category: string;
  subcategory: string;
  score: number;
  reasons: string[];
  originalUri: string;
  processedUri: string;
};

export type VisualPriorityAudit = {
  rawVisibleCount: number;
  criticalCount: number;
  topItems: VisualPriorityItem[];
};

function isRaw(item: WardrobeItem) {
  return !item.processedImageUri || item.processedImageUri === item.imageUri;
}

function getSavedLookItemIds(look: SavedLook | undefined | null) {
  if (!look) return [];
  return Object.values(look.pieces || {})
    .filter(Boolean)
    .map((item: any) => item.id);
}

export function buildVisualPriorityAudit(args: {
  wardrobeItems: WardrobeItem[];
  savedLooks: SavedLook[];
  weeklyPlan: WeeklyPlan;
}): VisualPriorityAudit {
  const { wardrobeItems, savedLooks, weeklyPlan } = args;

  const lookMap = new Map(savedLooks.map((look) => [look.id, look]));
  const latestSavedLook = savedLooks[0] || null;
  const plannedLookIds = Object.values(weeklyPlan).filter(Boolean) as string[];

  const savedLookUsage = new Map<string, number>();
  savedLooks.forEach((look) => {
    getSavedLookItemIds(look).forEach((id) => {
      savedLookUsage.set(id, (savedLookUsage.get(id) || 0) + 1);
    });
  });

  const plannedItemIds = new Set(
    plannedLookIds.flatMap((lookId) => getSavedLookItemIds(lookMap.get(lookId)))
  );

  const latestItemIds = new Set(getSavedLookItemIds(latestSavedLook));

  const topItems = wardrobeItems
    .filter(isRaw)
    .map((item) => {
      let score = 0;
      const reasons: string[] = [];

      if (plannedItemIds.has(item.id)) {
        score += 6;
        reasons.push('Planner içinde kullanılacak.');
      }

      if (latestItemIds.has(item.id)) {
        score += 4;
        reasons.push('En son kaydedilen görünümde yer alıyor.');
      }

      const usageCount = savedLookUsage.get(item.id) || 0;
      if (usageCount > 0) {
        score += Math.min(usageCount, 3);
        reasons.push('Kaydedilen görünümlerde tekrar kullanılıyor.');
      }

      if (item.isFavorite) {
        score += 3;
        reasons.push('Favori parça.');
      }

      if ((item.wearCount || 0) >= 5) {
        score += 3;
        reasons.push('Sık giyiliyor.');
      } else if ((item.wearCount || 0) >= 2) {
        score += 2;
        reasons.push('Tekrar kullanılan parça.');
      }

      if ((item.status || 'Temiz') === 'Temiz') {
        score += 1;
        reasons.push('Şu anda aktif kullanılabilir.');
      }

      if (['Üst', 'Alt', 'Elbise', 'Takım', 'Ayakkabı'].includes(item.category)) {
        score += 1;
      }

      return {
        itemId: item.id,
        name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        score,
        reasons,
        originalUri: item.imageUri,
        processedUri: item.processedImageUri || item.imageUri,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  return {
    rawVisibleCount: topItems.length,
    criticalCount: topItems.filter((item) => item.score >= 6).length,
    topItems,
  };
}
