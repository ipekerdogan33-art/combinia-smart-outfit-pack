import { SavedLook } from './savedLooksStorage';
import { MannequinStyle, TryOnZone, TryOnZoneKey } from '../types/tryon';

const MANNEQUIN_ZONES = require('../assets/data/mannequin-zones.json') as Record<
  MannequinStyle,
  Record<TryOnZoneKey, TryOnZone>
>;

const ANCHORS = require('../assets/data/anchors.json') as Record<
  TryOnZoneKey,
  Partial<TryOnZone>
>;

export function getTryOnZonesForLook(
  look: SavedLook,
  style: MannequinStyle = 'NEUTRAL'
): TryOnZone[] {
  const styleZones = MANNEQUIN_ZONES[style] || MANNEQUIN_ZONES.NEUTRAL;
  const zones: TryOnZone[] = [];

  const pieces = look.pieces;

  if (pieces.dress) {
    zones.push({ ...styleZones.dress, ...ANCHORS.dress });
  } else if (pieces.suit) {
    zones.push({ ...styleZones.suit, ...ANCHORS.suit });
  } else {
    if (pieces.top) zones.push({ ...styleZones.top, ...ANCHORS.top });
    if (pieces.bottom) zones.push({ ...styleZones.bottom, ...ANCHORS.bottom });
  }

  if (pieces.jacket) zones.push({ ...styleZones.jacket, ...ANCHORS.jacket });
  if (pieces.outerwear) zones.push({ ...styleZones.outerwear, ...ANCHORS.outerwear });
  if (pieces.shoe) zones.push({ ...styleZones.shoe, ...ANCHORS.shoe });
  if (pieces.bag) zones.push({ ...styleZones.bag, ...ANCHORS.bag });
  if (pieces.accessory) zones.push({ ...styleZones.accessory, ...ANCHORS.accessory });

  return zones.sort((a, b) => a.zIndex - b.zIndex);
}

export function getLookPieceByZone(look: SavedLook, zoneKey: TryOnZoneKey) {
  return look.pieces[zoneKey] || null;
}
