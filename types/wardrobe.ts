import {
  CanonicalCategory,
  CanonicalSubcategory,
  CanonicalWardrobeItem,
  Occasion,
  WardrobeStatus,
} from './catalog';

export type WardrobeCategory = CanonicalCategory;
export type WardrobeItemStatus = WardrobeStatus;
export type WardrobeOccasion = Occasion;

export type WardrobeItem = CanonicalWardrobeItem & {
  category: CanonicalCategory;
  subcategory: CanonicalSubcategory;
  occasions: Occasion[];
  status: WardrobeStatus;
};
