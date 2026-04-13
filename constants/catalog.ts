import {
  CanonicalCategory,
  CanonicalSubcategory,
  Occasion,
  Precipitation,
  WeatherBand,
} from '../types/catalog';

export const OCCASIONS: Occasion[] = [
  'Günlük',
  'Ofis',
  'Davet',
  'Spor',
  'Seyahat',
];

export const WEATHER_BANDS: WeatherBand[] = [
  '0-10',
  '10-15',
  '15-20',
  '20-25',
  '25+',
];

export const PRECIPITATION_OPTIONS: Precipitation[] = ['Kuru', 'Yağışlı'];

export const CANONICAL_CATEGORIES: CanonicalCategory[] = [
  'Üst',
  'Alt',
  'Elbise',
  'Takım',
  'Ceket',
  'Dış Giyim',
  'Ayakkabı',
  'Çanta',
  'Aksesuar',
];

export const CATEGORY_SUBCATEGORY_MAP: Record<CanonicalCategory, CanonicalSubcategory[]> = {
  'Üst': [
    'Gömlek',
    'Bluz',
    'Tişört',
    'Body',
    'Top',
    'Crop Top',
    'Kazak',
    'Hırka',
    'Denim Gömlek',
  ],
  'Alt': [
    'Pantolon',
    'Jean',
    'Skinny Jean',
    'Straight Jean',
    'Wide Leg Pantolon',
    'Mini Etek',
    'Midi Etek',
    'Maxi Etek',
    'Şort',
    'Tayt',
  ],
  'Elbise': [
    'Mini Elbise',
    'Midi Elbise',
    'Maxi Elbise',
    'Günlük Elbise',
    'Davet Elbisesi',
  ],
  'Takım': ['Pantolon Takım', 'Etek Takım', 'Co-ord Set'],
  'Ceket': ['Blazer', 'Denim Ceket', 'Deri Ceket'],
  'Dış Giyim': ['Trençkot', 'Mont', 'Kaban', 'Palto'],
  'Ayakkabı': ['Sneaker', 'Loafer', 'Topuklu', 'Bot', 'Sandalet', 'Oxford'],
  'Çanta': ['Omuz Çantası', 'Tote', 'El Çantası', 'Structured Bag', 'Clutch'],
  'Aksesuar': ['Kolye', 'Küpe', 'Bileklik', 'Gözlük', 'Kemer', 'Şal'],
};

export const SUBCATEGORY_TO_CATEGORY: Record<CanonicalSubcategory, CanonicalCategory> =
  Object.entries(CATEGORY_SUBCATEGORY_MAP).reduce((acc, [category, subcategories]) => {
    subcategories.forEach((subcategory) => {
      acc[subcategory] = category as CanonicalCategory;
    });
    return acc;
  }, {} as Record<CanonicalSubcategory, CanonicalCategory>);

export const LEGACY_CATEGORY_ALIASES: Record<string, CanonicalSubcategory> = {
  'Gömlek': 'Gömlek',
  'Bluz': 'Bluz',
  'Tişört': 'Tişört',
  'Body': 'Body',
  'Top': 'Top',
  'Crop Top': 'Crop Top',
  'Kazak / Hırka': 'Hırka',
  'Kazak': 'Kazak',
  'Hırka': 'Hırka',
  'Pantolon': 'Pantolon',
  'Jean': 'Jean',
  'Şort': 'Şort',
  'Etek': 'Midi Etek',
  'Elbise': 'Günlük Elbise',
  'Takım': 'Pantolon Takım',
  'Ceket': 'Blazer',
  'Dış Giyim': 'Trençkot',
  'Ayakkabı': 'Sneaker',
  'Çanta': 'Omuz Çantası',
  'Aksesuar': 'Kolye',
  'Spor': 'Tişört',
};

export const PRIMARY_FILTERS = ['Tümü', ...CANONICAL_CATEGORIES, 'Favoriler', 'Kirli'] as const;
