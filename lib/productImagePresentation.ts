import { CanonicalCategory } from '../types/catalog';

export type ProductImageVariant = 'thumbnail' | 'hero';

const CATEGORY_ASPECT_RATIO: Record<CanonicalCategory, number> = {
  'Üst': 0.82,
  Alt: 0.82,
  Elbise: 0.72,
  Takım: 0.76,
  Ceket: 0.82,
  'Dış Giyim': 0.72,
  Ayakkabı: 1,
  Çanta: 1,
  Aksesuar: 1,
};

const COMPOSITE_ASPECT_RATIO: Record<string, number> = {
  look: 0.72,
  'try-on': 0.68,
};

export function getProductImageAspectRatio(category?: CanonicalCategory | string) {
  if (category && COMPOSITE_ASPECT_RATIO[category]) {
    return COMPOSITE_ASPECT_RATIO[category];
  }

  return CATEGORY_ASPECT_RATIO[category as CanonicalCategory] || 0.82;
}

export function getProductImagePadding(
  category?: CanonicalCategory | string,
  variant: ProductImageVariant = 'thumbnail'
) {
  if (category === 'look' || category === 'try-on') return variant === 'hero' ? 18 : 12;
  if (category === 'Aksesuar') return variant === 'hero' ? 22 : 14;
  if (category === 'Ayakkabı' || category === 'Çanta') return variant === 'hero' ? 18 : 10;
  return variant === 'hero' ? 16 : 8;
}

export function getProductImageRadius(variant: ProductImageVariant = 'thumbnail') {
  return variant === 'hero' ? 18 : 14;
}
