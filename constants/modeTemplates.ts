import { ModeVariant, Occasion } from '../types/catalog';

export const MODE_TEMPLATES: Record<Occasion, ModeVariant[]> = {
  'Günlük': [
    {
      label: 'Günlük temel görünüm',
      required: ['top', 'bottom'],
      optional: ['shoe', 'jacket', 'outerwear', 'bag', 'accessory'],
    },
    {
      label: 'Günlük elbise görünümü',
      required: ['dress'],
      optional: ['shoe', 'outerwear', 'bag', 'accessory'],
    },
  ],
  'Ofis': [
    {
      label: 'Ofis klasik görünümü',
      required: ['top', 'bottom'],
      optional: ['jacket', 'shoe', 'bag', 'accessory', 'outerwear'],
    },
    {
      label: 'Ofis elbise görünümü',
      required: ['dress'],
      optional: ['jacket', 'shoe', 'bag', 'accessory', 'outerwear'],
    },
    {
      label: 'Ofis takım görünümü',
      required: ['suit'],
      optional: ['shoe', 'bag', 'accessory', 'outerwear'],
    },
  ],
  'Davet': [
    {
      label: 'Davet elbise görünümü',
      required: ['dress'],
      optional: ['shoe', 'bag', 'accessory', 'outerwear'],
    },
    {
      label: 'Davet takım görünümü',
      required: ['suit'],
      optional: ['shoe', 'bag', 'accessory', 'outerwear'],
    },
    {
      label: 'Davet ayrık görünüm',
      required: ['top', 'bottom'],
      optional: ['jacket', 'shoe', 'bag', 'accessory'],
    },
  ],
  'Spor': [
    {
      label: 'Spor görünüm',
      required: ['top', 'bottom'],
      optional: ['shoe', 'outerwear', 'bag'],
    },
  ],
  'Seyahat': [
    {
      label: 'Seyahat kapsül görünümü',
      required: ['top', 'bottom'],
      optional: ['shoe', 'outerwear', 'bag', 'accessory'],
    },
    {
      label: 'Seyahat elbise görünümü',
      required: ['dress'],
      optional: ['shoe', 'bag', 'outerwear', 'accessory'],
    },
  ],
};
