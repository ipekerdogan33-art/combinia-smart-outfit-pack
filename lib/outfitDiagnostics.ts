import { MODE_TEMPLATES } from '../constants/modeTemplates';
import { Occasion, OutfitSlot } from '../types/catalog';
import { WardrobeItem } from '../types/wardrobe';

export type OutfitFailureDiagnosis = {
  occasion: Occasion;
  bestTemplateLabel: string;
  missingSlots: string[];
  message: string;
};

const SLOT_LABELS: Record<OutfitSlot, string> = {
  top: 'Üst',
  bottom: 'Alt',
  dress: 'Elbise',
  suit: 'Takım',
  jacket: 'Ceket',
  outerwear: 'Dış Giyim',
  shoe: 'Ayakkabı',
  bag: 'Çanta',
  accessory: 'Aksesuar',
};

function supportsOccasion(item: WardrobeItem, occasion: Occasion) {
  return !item.occasions?.length || item.occasions.includes(occasion);
}

function slotMatches(slot: OutfitSlot, item: WardrobeItem) {
  if (slot === 'top') return item.category === 'Üst';
  if (slot === 'bottom') return item.category === 'Alt';
  if (slot === 'dress') return item.category === 'Elbise';
  if (slot === 'suit') return item.category === 'Takım';
  if (slot === 'jacket') return item.category === 'Ceket';
  if (slot === 'outerwear') return item.category === 'Dış Giyim';
  if (slot === 'shoe') return item.category === 'Ayakkabı';
  if (slot === 'bag') return item.category === 'Çanta';
  if (slot === 'accessory') return item.category === 'Aksesuar';
  return false;
}

export function diagnoseOutfitFailure(
  items: WardrobeItem[],
  occasion: Occasion
): OutfitFailureDiagnosis {
  const usableItems = items.filter((item) => (item.status || 'Temiz') !== 'Kuru Temizlemede');
  const templates = MODE_TEMPLATES[occasion];

  let bestMissing: OutfitSlot[] = templates[0]?.required || [];
  let bestTemplateLabel = templates[0]?.label || occasion;
  let bestCompletion = -1;

  templates.forEach((template) => {
    const missing = template.required.filter((slot) => {
      return !usableItems.some((item) => slotMatches(slot, item) && supportsOccasion(item, occasion));
    });

    const completion =
      template.required.length === 0
        ? 100
        : Math.round(((template.required.length - missing.length) / template.required.length) * 100);

    if (completion > bestCompletion) {
      bestCompletion = completion;
      bestMissing = missing;
      bestTemplateLabel = template.label;
    }
  });

  const missingLabels = bestMissing.map((slot) => SLOT_LABELS[slot]);

  return {
    occasion,
    bestTemplateLabel,
    missingSlots: missingLabels,
    message: missingLabels.length
      ? `${occasion} modu için en yakın şablon "${bestTemplateLabel}". Eksik olabilecek ana parçalar: ${missingLabels.join(', ')}.`
      : `${occasion} modu için temel şablonlar görünürde tamam fakat mevcut parçalar skor eşiğini geçemedi.`,
  };
}
