import { WardrobeItem } from '../types/wardrobe';

export type ImageQualityPriority = {
  itemId: string;
  name: string;
  category: string;
  subcategory: string;
  reason: string;
  severity: 'Yüksek' | 'Orta';
  wearCount: number;
  isFavorite: boolean;
  originalUri: string;
  processedUri: string;
};

export type ImageQualityAudit = {
  total: number;
  cleanedCount: number;
  rawCount: number;
  score: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  priorityItems: ImageQualityPriority[];
};

export function hasCleanProcessedImage(item: WardrobeItem) {
  return !!item.processedImageUri && item.processedImageUri !== item.imageUri;
}

function buildPriority(item: WardrobeItem): ImageQualityPriority {
  const favorite = !!item.isFavorite;
  const highWear = (item.wearCount || 0) >= 3;

  let severity: 'Yüksek' | 'Orta' = 'Orta';
  let reason = 'Bu parça hâlâ ham görselle duruyor.';

  if (favorite && highWear) {
    severity = 'Yüksek';
    reason = 'Favori ve sık kullanılan bir parça olduğu için öncelikli temizlenmeli.';
  } else if (favorite) {
    severity = 'Yüksek';
    reason = 'Favori parça olduğu için daha temiz sunumla görünmeli.';
  } else if (highWear) {
    severity = 'Yüksek';
    reason = 'Sık kullanılan parça olduğu için daha temiz görsel öncelikli olmalı.';
  } else if ((item.status || 'Temiz') === 'Temiz') {
    reason = 'Aktif kullanılabilir durumda olduğu için temiz görüntü kaliteyi artırır.';
  } else {
    reason = 'Ham görsel ileride temizlenerek daha iyi sonuç verebilir.';
  }

  return {
    itemId: item.id,
    name: item.name,
    category: item.category,
    subcategory: item.subcategory,
    reason,
    severity,
    wearCount: item.wearCount || 0,
    isFavorite: !!item.isFavorite,
    originalUri: item.imageUri,
    processedUri: item.processedImageUri || item.imageUri,
  };
}

export function analyzeImageQuality(items: WardrobeItem[]): ImageQualityAudit {
  const total = items.length;
  const cleanedItems = items.filter(hasCleanProcessedImage);
  const rawItems = items.filter((item) => !hasCleanProcessedImage(item));

  const priorityItems = rawItems
    .map(buildPriority)
    .sort((a, b) => {
      const sevA = a.severity === 'Yüksek' ? 1 : 0;
      const sevB = b.severity === 'Yüksek' ? 1 : 0;
      if (sevB !== sevA) return sevB - sevA;
      if ((b.wearCount || 0) !== (a.wearCount || 0)) return (b.wearCount || 0) - (a.wearCount || 0);
      if (Number(b.isFavorite) !== Number(a.isFavorite)) return Number(b.isFavorite) - Number(a.isFavorite);
      return a.name.localeCompare(b.name, 'tr');
    });

  const score = total === 0 ? 100 : Math.round((cleanedItems.length / total) * 100);

  return {
    total,
    cleanedCount: cleanedItems.length,
    rawCount: rawItems.length,
    score,
    highPriorityCount: priorityItems.filter((item) => item.severity === 'Yüksek').length,
    mediumPriorityCount: priorityItems.filter((item) => item.severity === 'Orta').length,
    priorityItems: priorityItems.slice(0, 12),
  };
}
