import { CanonicalCategory } from '../types/catalog';

export type MaterialConfig = {
  label: string;
  options: string[];
};

const DEFAULT_APPAREL: MaterialConfig = {
  label: 'Kumaş',
  options: [
    'Pamuk',
    'Keten',
    'Denim',
    'Yün',
    'Triko',
    'Saten',
    'Deri',
    'Teknik Kumaş',
  ],
};

const FOOTWEAR: MaterialConfig = {
  label: 'Malzeme',
  options: [
    'Deri',
    'Süet',
    'Nubuk',
    'Rugan',
    'Suni Deri',
    'Kanvas',
    'Kumaş',
    'Hasır',
    'File',
  ],
};

const BAG: MaterialConfig = {
  label: 'Malzeme',
  options: [
    'Deri',
    'Süet',
    'Rugan',
    'Kanvas',
    'Kumaş',
    'Hasır',
    'Örgü',
    'Suni Deri',
  ],
};

const ACCESSORY: MaterialConfig = {
  label: 'Malzeme',
  options: [
    'Metal',
    'Deri',
    'Kumaş',
    'İpek',
    'İnci',
    'Taşlı',
    'Saten',
  ],
};

const OUTERWEAR: MaterialConfig = {
  label: 'Kumaş',
  options: [
    'Kaşe',
    'Deri',
    'Denim',
    'Yün',
    'Pamuk',
    'Şişme',
    'Su Geçirmez',
  ],
};

export function getMaterialConfig(category?: CanonicalCategory | ''): MaterialConfig {
  if (category === 'Ayakkabı') return FOOTWEAR;
  if (category === 'Çanta') return BAG;
  if (category === 'Aksesuar') return ACCESSORY;
  if (category === 'Dış Giyim') return OUTERWEAR;
  return DEFAULT_APPAREL;
}
