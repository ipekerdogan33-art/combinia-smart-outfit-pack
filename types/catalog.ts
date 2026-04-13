export type Occasion = 'Günlük' | 'Ofis' | 'Davet' | 'Spor' | 'Seyahat';
export type WeatherBand = '0-10' | '10-15' | '15-20' | '20-25' | '25+';
export type Precipitation = 'Kuru' | 'Yağışlı';

export type CanonicalCategory =
  | 'Üst'
  | 'Alt'
  | 'Elbise'
  | 'Takım'
  | 'Ceket'
  | 'Dış Giyim'
  | 'Ayakkabı'
  | 'Çanta'
  | 'Aksesuar';

export type CanonicalSubcategory =
  | 'Gömlek'
  | 'Bluz'
  | 'Tişört'
  | 'Body'
  | 'Top'
  | 'Crop Top'
  | 'Kazak'
  | 'Hırka'
  | 'Denim Gömlek'
  | 'Pantolon'
  | 'Jean'
  | 'Skinny Jean'
  | 'Straight Jean'
  | 'Wide Leg Pantolon'
  | 'Mini Etek'
  | 'Midi Etek'
  | 'Maxi Etek'
  | 'Şort'
  | 'Tayt'
  | 'Mini Elbise'
  | 'Midi Elbise'
  | 'Maxi Elbise'
  | 'Günlük Elbise'
  | 'Davet Elbisesi'
  | 'Pantolon Takım'
  | 'Etek Takım'
  | 'Co-ord Set'
  | 'Blazer'
  | 'Denim Ceket'
  | 'Deri Ceket'
  | 'Trençkot'
  | 'Mont'
  | 'Kaban'
  | 'Palto'
  | 'Sneaker'
  | 'Loafer'
  | 'Topuklu'
  | 'Bot'
  | 'Sandalet'
  | 'Oxford'
  | 'Omuz Çantası'
  | 'Tote'
  | 'El Çantası'
  | 'Structured Bag'
  | 'Clutch'
  | 'Kolye'
  | 'Küpe'
  | 'Bileklik'
  | 'Gözlük'
  | 'Kemer'
  | 'Şal';

export type WardrobeStatus = 'Temiz' | 'Kirli' | 'Kuru Temizlemede';

export type UserColorSeason = 'İlkbahar' | 'Yaz' | 'Sonbahar' | 'Kış';

export type OutfitSlot =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'suit'
  | 'jacket'
  | 'outerwear'
  | 'shoe'
  | 'bag'
  | 'accessory';

export type ModeVariant = {
  required: OutfitSlot[];
  optional: OutfitSlot[];
  label: string;
};

export type CanonicalWardrobeItem = {
  id: string;
  imageUri: string;
  processedImageUri?: string;
  name: string;
  category: CanonicalCategory;
  subcategory: CanonicalSubcategory;
  color?: string;
  pattern?: string;
  fabric?: string;
  fit?: string;
  occasions: Occasion[];
  status: WardrobeStatus;
  isFavorite: boolean;
  wearCount: number;
  lastWornAt?: string | null;
  tags?: string[];
  source?: 'legacy' | 'canonical';
  createdAt?: string;
};
