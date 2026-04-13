import { PlannerDay, PLANNER_DAYS, WeeklyPlan } from '../types/planner';
import { SavedLook } from './savedLooksStorage';
import { WardrobeItem } from '../types/wardrobe';
import { WearHistoryEntry } from './wearHistoryStorage';

export type PlannerRotationWarning = {
  id: string;
  level: 'Orta' | 'Yüksek';
  title: string;
  description: string;
  days: PlannerDay[];
};

export type PlannerRiskItem = {
  itemId: string;
  itemName: string;
  days: PlannerDay[];
  status: string;
};

export type PlannerRotationInsights = {
  plannedDays: number;
  uniqueLookCount: number;
  repeatedLookCount: number;
  riskyItemCount: number;
  warnings: PlannerRotationWarning[];
  riskItems: PlannerRiskItem[];
  rotationScore: number;
};

const DIRTY_AFTER_USE_CATEGORIES = new Set([
  'Üst',
  'Alt',
  'Elbise',
  'Takım',
  'Ceket',
  'Dış Giyim',
  'Ayakkabı',
]);

function daysSince(date: string) {
  const ts = new Date(date).getTime();
  if (Number.isNaN(ts)) return 999;
  return Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
}

export function analyzePlannerRotation(
  plan: WeeklyPlan,
  looks: SavedLook[],
  wardrobeItems: WardrobeItem[],
  wearHistory: WearHistoryEntry[]
): PlannerRotationInsights {
  const lookMap = new Map(looks.map((look) => [look.id, look]));
  const itemMap = new Map(wardrobeItems.map((item) => [item.id, item]));

  const assignedDays = PLANNER_DAYS.filter((day) => !!plan[day]);
  const plannedDays = assignedDays.length;

  const lookUsage = new Map<string, PlannerDay[]>();
  const itemUsage = new Map<string, PlannerDay[]>();
  const warnings: PlannerRotationWarning[] = [];

  assignedDays.forEach((day) => {
    const lookId = plan[day];
    if (!lookId) return;

    const look = lookMap.get(lookId);
    if (!look) return;

    const lookDays = lookUsage.get(lookId) || [];
    lookUsage.set(lookId, [...lookDays, day]);

    const itemIds = Object.values(look.pieces || {})
      .filter(Boolean)
      .map((item: any) => item.id);

    itemIds.forEach((itemId) => {
      const days = itemUsage.get(itemId) || [];
      itemUsage.set(itemId, [...days, day]);
    });
  });

  lookUsage.forEach((days, lookId) => {
    if (days.length >= 2) {
      const look = lookMap.get(lookId);
      warnings.push({
        id: `repeat-look-${lookId}`,
        level: days.length >= 3 ? 'Yüksek' : 'Orta',
        title: 'Aynı görünüm birden fazla gün planlandı',
        description: `${look?.title || 'Bir görünüm'} ${days.join(', ')} günlerinde tekrar ediyor.`,
        days,
      });
    }
  });

  const recentHistory = wearHistory.filter((entry) => daysSince(entry.wornAt) <= 3);

  const riskItems: PlannerRiskItem[] = [];

  itemUsage.forEach((days, itemId) => {
    const item = itemMap.get(itemId);
    if (!item) return;

    const recentlyWorn = recentHistory.some((entry) => entry.itemIds.includes(itemId));

    if (days.length >= 2 && DIRTY_AFTER_USE_CATEGORIES.has(item.category)) {
      riskItems.push({
        itemId,
        itemName: item.name,
        days,
        status: item.status || 'Temiz',
      });

      warnings.push({
        id: `risk-item-${itemId}`,
        level: days.length >= 3 ? 'Yüksek' : 'Orta',
        title: 'Tekrar planlanan parça kirlenebilir',
        description: `${item.name} ${days.join(', ')} günlerinde tekrar planlanmış. İlk kullanım sonrası kirli hale gelebilir.`,
        days,
      });
    }

    if ((item.status === 'Kirli' || item.status === 'Kuru Temizlemede') && days.length) {
      warnings.push({
        id: `status-item-${itemId}`,
        level: 'Yüksek',
        title: 'Bakım durumu planla çakışıyor',
        description: `${item.name} şu an ${item.status.toLocaleLowerCase('tr-TR')} durumda ama ${days.join(', ')} için planlanmış.`,
        days,
      });
    }

    if (recentlyWorn && days.length) {
      warnings.push({
        id: `recent-item-${itemId}`,
        level: 'Orta',
        title: 'Yakın zamanda giyilen parça tekrar geliyor',
        description: `${item.name} son günlerde giyilmiş ve ${days.join(', ')} için yeniden planlanmış.`,
        days,
      });
    }
  });

  const uniqueLookCount = lookUsage.size;
  const repeatedLookCount = [...lookUsage.values()].filter((days) => days.length >= 2).length;
  const riskyItemCount = riskItems.length;

  const rotationScore =
    plannedDays === 0
      ? 100
      : Math.max(
          0,
          Math.round(
            (uniqueLookCount / plannedDays) * 100 -
              repeatedLookCount * 8 -
              riskyItemCount * 6
          )
        );

  return {
    plannedDays,
    uniqueLookCount,
    repeatedLookCount,
    riskyItemCount,
    warnings: warnings.slice(0, 8),
    riskItems: riskItems.slice(0, 6),
    rotationScore,
  };
}
