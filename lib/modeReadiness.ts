import { MODE_TEMPLATES } from '../constants/modeTemplates';
import { OCCASIONS } from '../constants/catalog';
import { Occasion, OutfitSlot } from '../types/catalog';
import { WardrobeItem } from '../types/wardrobe';

export type ModeReadiness = {
  occasion: Occasion;
  ready: boolean;
  completion: number;
  supportedTemplates: number;
  totalTemplates: number;
  missingSlots: string[];
  bestTemplateLabel: string;
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

export function analyzeModeReadiness(items: WardrobeItem[]): ModeReadiness[] {
  const usableItems = items.filter((item) => (item.status || 'Temiz') !== 'Kuru Temizlemede');

  return OCCASIONS.map((occasion) => {
    const templates = MODE_TEMPLATES[occasion];
    let supportedTemplates = 0;
    let bestCompletion = 0;
    let bestMissingSlots: string[] = [];
    let bestTemplateLabel = templates[0]?.label || occasion;

    templates.forEach((template) => {
      const missing = template.required.filter((slot) => {
        return !usableItems.some((item) => slotMatches(slot, item) && supportsOccasion(item, occasion));
      });

      const completion =
        template.required.length === 0
          ? 100
          : Math.round(((template.required.length - missing.length) / template.required.length) * 100);

      if (missing.length === 0) {
        supportedTemplates += 1;
      }

      if (completion >= bestCompletion) {
        bestCompletion = completion;
        bestMissingSlots = missing.map((slot) => SLOT_LABELS[slot]);
        bestTemplateLabel = template.label;
      }
    });

    return {
      occasion,
      ready: supportedTemplates > 0,
      completion: bestCompletion,
      supportedTemplates,
      totalTemplates: templates.length,
      missingSlots: [...new Set(bestMissingSlots)],
      bestTemplateLabel,
    };
  });
}
