import { CanonicalCategory, CanonicalSubcategory, Occasion, OutfitSlot } from '../types/catalog';
import { SUBCATEGORY_TO_CATEGORY } from '../constants/catalog';

export type GuidedAddSuggestion = {
  slot: OutfitSlot;
  occasion: Occasion;
  category: CanonicalCategory;
  subcategory: CanonicalSubcategory;
  title: string;
  description: string;
};

const DEFAULT_SLOT_MAP: Record<
  OutfitSlot,
  {
    category: CanonicalCategory;
    subcategory: CanonicalSubcategory;
    title: string;
    description: string;
  }
> = {
  top: {
    category: 'Üst',
    subcategory: 'Tişört',
    title: 'Temel üst parça',
    description: 'Bir üst parça eklersen kombin motoru daha rahat çalışır.',
  },
  bottom: {
    category: 'Alt',
    subcategory: 'Pantolon',
    title: 'Çok yönlü alt parça',
    description: 'Bir alt parça eklersen daha fazla kombin kurulabilir.',
  },
  dress: {
    category: 'Elbise',
    subcategory: 'Günlük Elbise',
    title: 'Elbise',
    description: 'Elbise görünümü için bu kategori eksik görünüyor.',
  },
  suit: {
    category: 'Takım',
    subcategory: 'Pantolon Takım',
    title: 'Takım',
    description: 'Bu mod için takım görünümü eklemek kombin gücünü artırır.',
  },
  jacket: {
    category: 'Ceket',
    subcategory: 'Blazer',
    title: 'Ceket',
    description: 'Ceket eklemek görünümü daha tamamlanmış hale getirir.',
  },
  outerwear: {
    category: 'Dış Giyim',
    subcategory: 'Trençkot',
    title: 'Dış giyim',
    description: 'Dış katman, özellikle serin ve yağışlı havada kritik rol oynar.',
  },
  shoe: {
    category: 'Ayakkabı',
    subcategory: 'Sneaker',
    title: 'Ayakkabı',
    description: 'Ayakkabı eklemek kombinlerin tamamlanmasını kolaylaştırır.',
  },
  bag: {
    category: 'Çanta',
    subcategory: 'Omuz Çantası',
    title: 'Çanta',
    description: 'Çanta görünümü daha tamamlanmış gösterir.',
  },
  accessory: {
    category: 'Aksesuar',
    subcategory: 'Kolye',
    title: 'Aksesuar',
    description: 'Aksesuar küçük ama etkili bir tamamlama katmanı sağlar.',
  },
};

const OCCASION_SLOT_OVERRIDES: Record<
  Occasion,
  Partial<Record<OutfitSlot, CanonicalSubcategory>>
> = {
  'Günlük': {
    top: 'Tişört',
    bottom: 'Jean',
    dress: 'Günlük Elbise',
    shoe: 'Sneaker',
    bag: 'Tote',
    accessory: 'Gözlük',
    jacket: 'Denim Ceket',
  },
  'Ofis': {
    top: 'Gömlek',
    bottom: 'Pantolon',
    dress: 'Midi Elbise',
    suit: 'Pantolon Takım',
    jacket: 'Blazer',
    shoe: 'Loafer',
    bag: 'Structured Bag',
    accessory: 'Kemer',
  },
  'Davet': {
    top: 'Bluz',
    bottom: 'Midi Etek',
    dress: 'Davet Elbisesi',
    suit: 'Etek Takım',
    jacket: 'Blazer',
    shoe: 'Topuklu',
    bag: 'Clutch',
    accessory: 'Kolye',
  },
  'Spor': {
    top: 'Top',
    bottom: 'Tayt',
    shoe: 'Sneaker',
    outerwear: 'Mont',
    bag: 'Tote',
  },
  'Seyahat': {
    top: 'Tişört',
    bottom: 'Straight Jean',
    dress: 'Günlük Elbise',
    jacket: 'Blazer',
    outerwear: 'Trençkot',
    shoe: 'Sneaker',
    bag: 'Tote',
    accessory: 'Şal',
  },
};

export function buildGuidedAddSuggestion(
  occasion: Occasion,
  slot: OutfitSlot
): GuidedAddSuggestion {
  const overrideSubcategory = OCCASION_SLOT_OVERRIDES[occasion]?.[slot];
  const fallback = DEFAULT_SLOT_MAP[slot];
  const subcategory = overrideSubcategory || fallback.subcategory;
  const category = SUBCATEGORY_TO_CATEGORY[subcategory];

  return {
    slot,
    occasion,
    category,
    subcategory,
    title: fallback.title,
    description: fallback.description,
  };
}
