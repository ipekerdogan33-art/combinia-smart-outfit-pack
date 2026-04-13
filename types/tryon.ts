export type TryOnMode = 'MOCKUP' | 'AVATAR';
export type MannequinStyle = 'FEMALE' | 'MALE' | 'NEUTRAL';

export type TryOnZoneKey =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'suit'
  | 'jacket'
  | 'outerwear'
  | 'shoe'
  | 'bag'
  | 'accessory';

export type TryOnZone = {
  key: TryOnZoneKey;
  label: string;
  top: number;
  left: number;
  width: number;
  height: number;
  zIndex: number;
  background?: string;
  rotate?: number;
  padding?: number;
};
