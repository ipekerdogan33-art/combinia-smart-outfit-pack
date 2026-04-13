import { OutfitRecommendation } from '../types/outfit';
import { SavedLook } from './savedLooksStorage';
import {
  OutfitFeedbackState,
  feedbackAdjustmentForLook,
} from './outfitFeedbackStorage';

export type LookScoreBreakdown = {
  total: number;
  alignment: number;
  completion: number;
  personal: number;
  finish: number;
  notes: string[];
};

type ScoredLook = OutfitRecommendation | SavedLook;

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getPieces(look: ScoredLook) {
  return Object.values(look.pieces || {}).filter(Boolean) as any[];
}

export function calculateLookScore(
  look: ScoredLook,
  feedbackState?: OutfitFeedbackState | null
): LookScoreBreakdown {
  const pieces = getPieces(look);
  const hasCoreBase = !!(look.pieces?.dress || look.pieces?.suit || (look.pieces?.top && look.pieces?.bottom));
  const hasShoe = !!look.pieces?.shoe;
  const hasBag = !!look.pieces?.bag;
  const hasLayer = !!(look.pieces?.jacket || look.pieces?.outerwear);
  const hasAccessory = !!look.pieces?.accessory;

  const favoriteCount = pieces.filter((item) => item.isFavorite).length;
  const metadataHits = pieces.reduce((sum, item) => {
    return sum + Number(!!item.fabric) + Number(!!item.fit) + Number(!!item.pattern);
  }, 0);

  const feedbackBoost = feedbackState ? feedbackAdjustmentForLook(look as any, feedbackState) : 0;

  const alignment = clamp(Math.round(Math.max(8, Math.min(25, (look.score || 0) * 1.35))), 0, 25);

  let completion = 0;
  if (hasCoreBase) completion += 10;
  if (hasShoe) completion += 5;
  if (hasBag) completion += 4;
  if (hasLayer) completion += 3;
  if (hasAccessory) completion += 3;
  completion = clamp(completion, 0, 25);

  let personal = 8;
  personal += favoriteCount * 3;
  personal += Math.round(feedbackBoost * 1.5);
  personal = clamp(personal, 0, 25);

  let finish = 8;
  finish += Math.min(10, metadataHits);
  if ((look as any).tryOnPreviewUri) finish += 4;
  finish += Math.min(3, pieces.length > 3 ? 3 : pieces.length);
  finish = clamp(finish, 0, 25);

  const total = clamp(alignment + completion + personal + finish, 0, 100);

  const notes: string[] = [];

  if (favoriteCount > 0) {
    notes.push('Favori parça sinyali bu görünümü güçlendiriyor.');
  }

  if (metadataHits >= 3) {
    notes.push('Kumaş / fit / desen verisi görünüm kalitesini artırıyor.');
  }

  if (!hasShoe) {
    notes.push('Ayakkabı eklenirse görünüm daha tamamlanmış hissedilir.');
  } else if (hasBag || hasAccessory) {
    notes.push('Tamamlayıcı parçalar görünümü daha premium yapıyor.');
  }

  return {
    total,
    alignment,
    completion,
    personal,
    finish,
    notes: notes.slice(0, 3),
  };
}
