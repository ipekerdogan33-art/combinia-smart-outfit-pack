import {
  CATEGORY_SUBCATEGORY_MAP,
  LEGACY_CATEGORY_ALIASES,
  SUBCATEGORY_TO_CATEGORY,
} from '../constants/catalog';
import {
  CanonicalCategory,
  CanonicalSubcategory,
  CanonicalWardrobeItem,
  Occasion,
  WardrobeStatus,
} from '../types/catalog';

type LegacyItem = Record<string, any>;

function n(value?: string) {
  return (value || '').trim().toLocaleLowerCase('tr-TR');
}

export function inferOccasions(
  category: CanonicalCategory,
  subcategory: CanonicalSubcategory
): Occasion[] {
  if (category === 'Takım') return ['Ofis', 'Davet'];
  if (category === 'Dış Giyim') return ['Günlük', 'Ofis', 'Seyahat'];
  if (subcategory === 'Topuklu' || subcategory === 'Clutch') return ['Davet', 'Ofis'];
  if (subcategory === 'Sneaker') return ['Günlük', 'Spor', 'Seyahat'];
  if (subcategory === 'Tayt') return ['Spor', 'Günlük'];
  if (subcategory === 'Blazer') return ['Ofis', 'Davet', 'Günlük'];
  if (category === 'Aksesuar') return ['Günlük', 'Ofis', 'Davet', 'Seyahat'];
  if (category === 'Çanta') return ['Günlük', 'Ofis', 'Davet', 'Seyahat'];
  return ['Günlük', 'Ofis'];
}

function inferSubcategoryFromLegacy(item: LegacyItem): CanonicalSubcategory {
  const explicitSub = item.subcategory as CanonicalSubcategory | undefined;
  if (explicitSub && SUBCATEGORY_TO_CATEGORY[explicitSub]) return explicitSub;

  const rawCategory = item.category || item.legacyCategory || '';
  const alias = LEGACY_CATEGORY_ALIASES[rawCategory];
  if (alias) return alias;

  const name = n(item.name);

  if (name.includes('blazer')) return 'Blazer';
  if (name.includes('trenç')) return 'Trençkot';
  if (name.includes('mont')) return 'Mont';
  if (name.includes('kaban')) return 'Kaban';
  if (name.includes('palto')) return 'Palto';
  if (name.includes('skinny')) return 'Skinny Jean';
  if (name.includes('wide')) return 'Wide Leg Pantolon';
  if (name.includes('straight')) return 'Straight Jean';
  if (name.includes('jean')) return 'Jean';
  if (name.includes('midi')) return 'Midi Elbise';
  if (name.includes('mini')) return 'Mini Elbise';
  if (name.includes('maxi')) return 'Maxi Elbise';
  if (name.includes('sneaker')) return 'Sneaker';
  if (name.includes('loafer')) return 'Loafer';
  if (name.includes('topuk')) return 'Topuklu';
  if (name.includes('bot')) return 'Bot';
  if (name.includes('sandalet')) return 'Sandalet';
  if (name.includes('clutch')) return 'Clutch';
  if (name.includes('tote')) return 'Tote';
  if (name.includes('kolye')) return 'Kolye';
  if (name.includes('küpe')) return 'Küpe';
  if (name.includes('gözlük')) return 'Gözlük';
  if (name.includes('kemer')) return 'Kemer';

  return 'Tişört';
}

export function validateCategorySubcategory(
  category: CanonicalCategory,
  subcategory: CanonicalSubcategory
) {
  return CATEGORY_SUBCATEGORY_MAP[category].includes(subcategory);
}

export function toCanonicalWardrobeItem(item: LegacyItem): CanonicalWardrobeItem {
  const subcategory = inferSubcategoryFromLegacy(item);
  const category = SUBCATEGORY_TO_CATEGORY[subcategory];

  return {
    id: item.id || Date.now().toString(),
    imageUri: item.imageUri || item.uri || '',
    processedImageUri: item.processedImageUri || '',
    name: item.name || subcategory,
    category,
    subcategory,
    color: item.color || '',
    pattern: item.pattern || '',
    fabric: item.fabric || '',
    fit: item.fit || '',
    occasions: Array.isArray(item.occasions) && item.occasions.length
      ? item.occasions
      : inferOccasions(category, subcategory),
    status: (item.status as WardrobeStatus) || 'Temiz',
    isFavorite: !!item.isFavorite,
    wearCount: typeof item.wearCount === 'number' ? item.wearCount : 0,
    lastWornAt: item.lastWornAt || null,
    tags: Array.isArray(item.tags) ? item.tags : [],
    source: item.source || 'legacy',
    createdAt: item.createdAt || new Date().toISOString(),
  };
}
