import { WardrobeItem } from './wardrobe';
import { Occasion, Precipitation, WeatherBand } from './catalog';

export type OutfitOccasion = Occasion;
export type { WeatherBand, Precipitation };

export type OutfitPieces = {
  top?: WardrobeItem | null;
  bottom?: WardrobeItem | null;
  dress?: WardrobeItem | null;
  suit?: WardrobeItem | null;
  jacket?: WardrobeItem | null;
  outerwear?: WardrobeItem | null;
  shoe?: WardrobeItem | null;
  bag?: WardrobeItem | null;
  accessory?: WardrobeItem | null;
};

export type OutfitRecommendation = {
  id: string;
  title: string;
  explanation: string;
  score: number;
  occasion: OutfitOccasion;
  weatherBand: WeatherBand;
  precipitation: Precipitation;
  pieces: OutfitPieces;
};
