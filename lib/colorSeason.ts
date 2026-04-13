import { UserColorSeason } from '../types/catalog';

type ColorProfileInput = {
  skinTone?: string;
  eyeColor?: string;
  hairColor?: string;
};

function n(value?: string) {
  return (value || '').trim().toLocaleLowerCase('tr-TR');
}

export function deriveColorSeason({
  skinTone,
  eyeColor,
  hairColor,
}: ColorProfileInput): UserColorSeason {
  const skin = n(skinTone);
  const eye = n(eyeColor);
  const hair = n(hairColor);

  const spring =
    ['fildişi', 'şeftali', 'açık bej'].some((v) => skin.includes(v)) &&
    ['açık mavi', 'açık yeşil', 'fındık'].some((v) => eye.includes(v)) &&
    ['sarı', 'açık kumral', 'çilek sarısı'].some((v) => hair.includes(v));

  if (spring) return 'İlkbahar';

  const summer =
    ['pembe', 'gül', 'porselen'].some((v) => skin.includes(v)) &&
    ['mavi', 'gri', 'açık yeşil'].some((v) => eye.includes(v)) &&
    ['küllü sarı', 'küllü kumral', 'açık kahve'].some((v) => hair.includes(v));

  if (summer) return 'Yaz';

  const autumn =
    ['altın', 'buğday', 'bronz', 'sıcak bej'].some((v) => skin.includes(v)) &&
    ['kahverengi', 'ela', 'yeşil', 'amber'].some((v) => eye.includes(v)) &&
    ['koyu kahve', 'kızıl', 'koyu kumral'].some((v) => hair.includes(v));

  if (autumn) return 'Sonbahar';

  return 'Kış';
}
