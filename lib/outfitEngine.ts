import { MODE_TEMPLATES } from '../constants/modeTemplates';
import { Occasion, OutfitSlot, Precipitation, UserColorSeason, WeatherBand } from '../types/catalog';
import { OnboardingData } from '../types/onboarding';
import { OutfitPieces, OutfitRecommendation } from '../types/outfit';
import { WardrobeItem } from '../types/wardrobe';

type Candidate = {
  pieces: OutfitPieces;
  score: number;
  fingerprint: string;
  reasons: string[];
  modeLabel: string;
  source: 'strict' | 'flex' | 'relaxed';
  completionScore: number;
  diversityScore: number;
  seasonHits: number;
};

const SEASON_MATCH: Record<UserColorSeason, string[]> = {
  'İlkbahar': ['karamel', 'somon', 'şeftali', 'mercan', 'krem', 'bej', 'turkuaz', 'yeşil'],
  'Yaz': ['lila', 'lavanta', 'gül', 'pudra', 'mavi', 'gri', 'beyaz', 'leylak'],
  'Sonbahar': ['hardal', 'terracotta', 'haki', 'zeytin', 'kahve', 'karamel', 'bordo', 'bakır'],
  'Kış': ['siyah', 'beyaz', 'lacivert', 'kraliyet', 'kırmızı', 'zümrüt', 'mor', 'gri'],
};

const SEASON_AVOID: Record<UserColorSeason, string[]> = {
  'İlkbahar': ['siyah', 'mürdüm'],
  'Yaz': ['turuncu', 'hardal', 'zeytin'],
  'Sonbahar': ['pembe', 'lila', 'soğuk gri'],
  'Kış': ['turuncu', 'hardal', 'somon'],
};

function n(value?: string) {
  return (value || '').trim().toLocaleLowerCase('tr-TR');
}

function isNeutral(color?: string) {
  const c = n(color);
  return ['siyah', 'beyaz', 'bej', 'krem', 'gri', 'lacivert'].includes(c);
}

function daysSince(date?: string | null) {
  if (!date) return 999;
  const ts = new Date(date).getTime();
  if (Number.isNaN(ts)) return 999;
  const diff = Date.now() - ts;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function matchesPalette(color: string | undefined, season: UserColorSeason) {
  const c = n(color);
  if (!c) return 0;
  if (isNeutral(c)) return 1;
  if (SEASON_MATCH[season].some((item) => c.includes(item))) return 2;
  if (SEASON_AVOID[season].some((item) => c.includes(item))) return -1;
  return 0;
}

function getColorScore(a?: string, b?: string) {
  const colorA = n(a);
  const colorB = n(b);

  if (!colorA || !colorB) return 0;
  if (colorA === colorB) return 2;
  if (isNeutral(colorA) || isNeutral(colorB)) return 2;

  const goodPairs = [
    ['mavi', 'beyaz'],
    ['mavi', 'bej'],
    ['mavi', 'siyah'],
    ['kırmızı', 'siyah'],
    ['kırmızı', 'beyaz'],
    ['yeşil', 'bej'],
    ['kahverengi', 'bej'],
    ['bordo', 'siyah'],
  ];

  const matched = goodPairs.some(
    ([x, y]) => (colorA === x && colorB === y) || (colorA === y && colorB === x)
  );

  return matched ? 1 : 0;
}

function supportsOccasion(item: WardrobeItem, occasion: Occasion) {
  return !item.occasions?.length || item.occasions.includes(occasion);
}

function slotCategoryMatches(slot: OutfitSlot, item: WardrobeItem) {
  if (slot === 'top') return item.category === 'Üst';
  if (slot === 'bottom') return item.category === 'Alt';
  if (slot === 'dress') return item.category === 'Elbise';
  if (slot === 'suit') return item.category === 'Takım';
  if (slot === 'jacket') return item.category === 'Ceket';
  if (slot === 'outerwear') return item.category === 'Dış Giyim';
  if (slot === 'shoe') return item.category === 'Ayakkabı';
  if (slot === 'bag') return item.category === 'Çanta';
  if (slot === 'accessory') return item.category === 'Aksesuar';
  return false;
}

function weatherHardBlock(item: WardrobeItem, weatherBand: WeatherBand, precipitation: Precipitation) {
  const sub = item.subcategory;

  if (weatherBand === '0-10' && ['Şort', 'Crop Top', 'Top', 'Mini Elbise', 'Sandalet'].includes(sub)) return true;
  if (weatherBand === '10-15' && ['Şort', 'Sandalet'].includes(sub)) return true;
  if (weatherBand === '25+' && ['Kaban', 'Palto', 'Mont', 'Kazak', 'Hırka', 'Bot'].includes(sub)) return true;
  if (precipitation === 'Yağışlı' && sub === 'Sandalet') return true;

  return false;
}

function isStrictCompatible(
  slot: OutfitSlot,
  item: WardrobeItem,
  occasion: Occasion,
  weatherBand: WeatherBand,
  precipitation: Precipitation
) {
  if (!slotCategoryMatches(slot, item)) return false;
  if (!supportsOccasion(item, occasion)) return false;
  if (weatherHardBlock(item, weatherBand, precipitation)) return false;

  const sub = item.subcategory;

  if (occasion === 'Ofis') {
    if (slot === 'bottom' && ['Şort', 'Tayt'].includes(sub)) return false;
    if (slot === 'shoe' && ['Sandalet'].includes(sub)) return false;
  }

  if (occasion === 'Davet') {
    if (slot === 'bottom' && ['Şort', 'Tayt'].includes(sub)) return false;
  }

  if (occasion === 'Spor') {
    if (slot === 'bottom' && !['Şort', 'Tayt', 'Pantolon', 'Jean'].includes(sub)) return false;
    if (slot === 'shoe' && !['Sneaker'].includes(sub)) return false;
  }

  return true;
}

function isRelaxedCompatible(
  slot: OutfitSlot,
  item: WardrobeItem,
  occasion: Occasion,
  weatherBand: WeatherBand,
  precipitation: Precipitation
) {
  if (!slotCategoryMatches(slot, item)) return false;
  if (weatherHardBlock(item, weatherBand, precipitation)) return false;

  const sub = item.subcategory;

  if (occasion === 'Ofis') {
    if (slot === 'bottom' && ['Şort', 'Tayt'].includes(sub)) return false;
  }

  if (occasion === 'Davet') {
    if (slot === 'bottom' && ['Şort', 'Tayt'].includes(sub)) return false;
  }

  return true;
}

function getPoolForSlot(
  items: WardrobeItem[],
  slot: OutfitSlot,
  occasion: Occasion,
  weatherBand: WeatherBand,
  precipitation: Precipitation,
  relaxed = false
) {
  return items.filter((item) =>
    relaxed
      ? isRelaxedCompatible(slot, item, occasion, weatherBand, precipitation)
      : isStrictCompatible(slot, item, occasion, weatherBand, precipitation)
  );
}

function getOccasionScore(item: WardrobeItem, occasion: Occasion) {
  const sub = item.subcategory;

  if (occasion === 'Ofis') {
    if (['Gömlek', 'Bluz', 'Blazer', 'Pantolon', 'Straight Jean', 'Wide Leg Pantolon', 'Structured Bag', 'Loafer', 'Oxford'].includes(sub)) return 2;
    if (['Topuklu', 'Midi Elbise', 'Omuz Çantası'].includes(sub)) return 1;
    if (['Sneaker'].includes(sub)) return -1;
  }

  if (occasion === 'Davet') {
    if (['Davet Elbisesi', 'Midi Elbise', 'Maxi Elbise', 'Pantolon Takım', 'Etek Takım', 'Topuklu', 'Clutch', 'Kolye', 'Küpe'].includes(sub)) return 3;
    if (['Blazer', 'Omuz Çantası', 'Structured Bag', 'Bileklik'].includes(sub)) return 1;
  }

  if (occasion === 'Spor') {
    if (['Sneaker', 'Tayt', 'Şort', 'Tişört', 'Top', 'Crop Top'].includes(sub)) return 3;
    if (['Jean', 'Loafer', 'Topuklu', 'Clutch'].includes(sub)) return -3;
  }

  if (occasion === 'Seyahat') {
    if (['Sneaker', 'Jean', 'Straight Jean', 'Wide Leg Pantolon', 'Tote', 'Trençkot', 'Hırka'].includes(sub)) return 2;
  }

  if (occasion === 'Günlük') {
    if (['Tişört', 'Jean', 'Sneaker', 'Tote', 'Bluz', 'Günlük Elbise'].includes(sub)) return 2;
  }

  return 0;
}

function getWeatherScore(item: WardrobeItem, weatherBand: WeatherBand, precipitation: Precipitation) {
  const sub = item.subcategory;
  let score = 0;

  if (weatherBand === '0-10') {
    if (['Kazak', 'Hırka', 'Kaban', 'Palto', 'Mont', 'Bot'].includes(sub)) score += 3;
    if (['Blazer', 'Trençkot', 'Oxford'].includes(sub)) score += 1;
  }

  if (weatherBand === '10-15') {
    if (['Kazak', 'Hırka', 'Trençkot', 'Blazer', 'Bot', 'Loafer'].includes(sub)) score += 2;
  }

  if (weatherBand === '15-20') {
    if (['Gömlek', 'Bluz', 'Blazer', 'Denim Ceket', 'Loafer', 'Sneaker'].includes(sub)) score += 1;
  }

  if (weatherBand === '20-25') {
    if (['Tişört', 'Bluz', 'Günlük Elbise', 'Şort', 'Sneaker', 'Sandalet'].includes(sub)) score += 2;
  }

  if (weatherBand === '25+') {
    if (['Tişört', 'Bluz', 'Top', 'Crop Top', 'Mini Elbise', 'Günlük Elbise', 'Şort', 'Sandalet'].includes(sub)) score += 3;
  }

  if (precipitation === 'Yağışlı') {
    if (['Trençkot', 'Mont', 'Kaban', 'Bot', 'Sneaker', 'Oxford', 'Loafer'].includes(sub)) score += 2;
  }

  return score;
}

function getStyleScore(item: WardrobeItem, profile: OnboardingData) {
  let score = 0;
  const styles = profile.styles || [];

  if (styles.includes('Klasik') && ['Gömlek', 'Blazer', 'Pantolon', 'Structured Bag', 'Loafer', 'Oxford'].includes(item.subcategory)) score += 2;
  if (styles.includes('Günlük / Casual') && ['Tişört', 'Jean', 'Sneaker', 'Tote'].includes(item.subcategory)) score += 2;
  if (styles.includes('Minimalist') && ['Gömlek', 'Pantolon', 'Blazer', 'Sneaker', 'Structured Bag'].includes(item.subcategory)) score += 1;
  if (styles.includes('Davet') && ['Davet Elbisesi', 'Topuklu', 'Clutch', 'Kolye'].includes(item.subcategory)) score += 2;
  if (styles.includes('Spor Şık') && ['Sneaker', 'Blazer', 'Pantolon', 'Tişört'].includes(item.subcategory)) score += 1;

  if (profile.lifestyle === 'İş odaklı' && ['Gömlek', 'Blazer', 'Pantolon', 'Structured Bag'].includes(item.subcategory)) score += 1;
  if (profile.lifestyle === 'Seyahat' && ['Sneaker', 'Tote', 'Trençkot', 'Jean'].includes(item.subcategory)) score += 1;

  if (item.isFavorite) score += 0.5;
  return score;
}

function getMetadataScore(item: WardrobeItem, occasion: Occasion, weatherBand: WeatherBand) {
  let score = 0;
  const fabric = n(item.fabric);
  const fit = n(item.fit);
  const pattern = n(item.pattern);

  if (occasion === 'Ofis') {
    if (['keten', 'pamuk', 'yün', 'triko'].some((v) => fabric.includes(v))) score += 1;
    if (['structured', 'regular', 'slim'].some((v) => fit.includes(v))) score += 1;
    if (['düz', 'çizgili', 'ekose'].some((v) => pattern.includes(v))) score += 0.5;
  }

  if (occasion === 'Davet') {
    if (['saten', 'ipek', 'dantel'].some((v) => fabric.includes(v))) score += 1.5;
    if (['slim', 'structured'].some((v) => fit.includes(v))) score += 0.5;
  }

  if (occasion === 'Günlük') {
    if (['pamuk', 'denim', 'triko'].some((v) => fabric.includes(v))) score += 1;
    if (['oversize', 'relaxed', 'regular'].some((v) => fit.includes(v))) score += 1;
  }

  if (occasion === 'Spor') {
    if (['teknik', 'esnek', 'poly', 'performans'].some((v) => fabric.includes(v))) score += 2;
    if (['relaxed', 'regular'].some((v) => fit.includes(v))) score += 0.5;
  }

  if (occasion === 'Seyahat') {
    if (['pamuk', 'denim', 'triko', 'keten'].some((v) => fabric.includes(v))) score += 1;
    if (['relaxed', 'regular', 'oversize'].some((v) => fit.includes(v))) score += 0.75;
  }

  if (weatherBand === '25+' && ['keten', 'pamuk'].some((v) => fabric.includes(v))) score += 1;
  if ((weatherBand === '0-10' || weatherBand === '10-15') && ['yün', 'triko', 'denim'].some((v) => fabric.includes(v))) score += 1;

  return score;
}

function getDiversityScore(item: WardrobeItem) {
  let score = 0;
  const wearCount = item.wearCount || 0;
  const recency = daysSince(item.lastWornAt);

  if (wearCount <= 1) score += 1.5;
  else if (wearCount <= 3) score += 0.5;
  else if (wearCount >= 10) score -= 0.5;

  if (recency <= 1) score -= 1;
  else if (recency <= 3) score -= 0.5;
  else if (recency >= 14) score += 1;

  return score;
}

function getCompletionBonus(pieces: OutfitPieces, occasion: Occasion) {
  let score = 0;

  if (pieces.shoe) score += 1;

  if (occasion === 'Ofis') {
    if (pieces.jacket || pieces.outerwear) score += 1;
    if (pieces.bag) score += 1;
    if (pieces.accessory) score += 0.5;
  }

  if (occasion === 'Davet') {
    if (pieces.bag) score += 1;
    if (pieces.accessory) score += 1;
    if (pieces.jacket || pieces.outerwear) score += 0.5;
  }

  if (occasion === 'Spor') {
    if (pieces.shoe) score += 1;
    if (pieces.bag) score += 0.5;
  }

  if (occasion === 'Seyahat') {
    if (pieces.bag) score += 1;
    if (pieces.outerwear || pieces.jacket) score += 0.5;
    if (pieces.accessory) score += 0.25;
  }

  if (occasion === 'Günlük') {
    if (pieces.bag) score += 0.5;
    if (pieces.accessory) score += 0.25;
  }

  return score;
}

function getAllPieces(pieces: OutfitPieces) {
  return Object.values(pieces).filter(Boolean) as WardrobeItem[];
}

function assignSlot(pieces: OutfitPieces, slot: OutfitSlot, item: WardrobeItem | null) {
  return { ...pieces, [slot]: item || null };
}

function scorePieces(
  pieces: OutfitPieces,
  profile: OnboardingData,
  occasion: Occasion,
  weatherBand: WeatherBand,
  precipitation: Precipitation
) {
  const all = getAllPieces(pieces);
  let score = 0;
  const reasons: string[] = [];
  let seasonHits = 0;
  let diversityScore = 0;

  all.forEach((item) => {
    score += getOccasionScore(item, occasion);
    score += getWeatherScore(item, weatherBand, precipitation);
    score += getStyleScore(item, profile);
    score += getMetadataScore(item, occasion, weatherBand);

    const diversity = getDiversityScore(item);
    diversityScore += diversity;
    score += diversity;

    if (profile.colorSeason) {
      const seasonScore = matchesPalette(item.color, profile.colorSeason as UserColorSeason);
      score += seasonScore;
      if (seasonScore > 0) seasonHits += 1;
    }
  });

  const keyPairs = [
    [pieces.top, pieces.bottom],
    [pieces.top, pieces.jacket],
    [pieces.top, pieces.outerwear],
    [pieces.bottom, pieces.jacket],
    [pieces.dress, pieces.shoe],
    [pieces.suit, pieces.shoe],
    [pieces.bag, pieces.shoe],
    [pieces.bag, pieces.accessory],
  ];

  keyPairs.forEach(([a, b]) => {
    if (a && b) score += getColorScore(a.color, b.color);
  });

  const neutrals = all.filter((item) => isNeutral(item.color)).length;
  if (neutrals >= 2) {
    score += 1;
    reasons.push('Nötr denge korunmuş.');
  }

  if (seasonHits >= 2) {
    reasons.push('Renk sezonunla uyumlu tonlar öne çıktı.');
  }

  const completionBonus = getCompletionBonus(pieces, occasion);
  score += completionBonus;

  if (completionBonus >= 2) {
    reasons.push('Görünüm daha tamamlanmış bir set oluşturuyor.');
  }

  if (diversityScore >= 1.5) {
    reasons.push('Az kullanılan parçalar öne çıkarıldı.');
  }

  return {
    score,
    reasons,
    seasonHits,
    diversityScore,
    completionScore: completionBonus,
  };
}

function bestOptionalForSlot(
  currentPieces: OutfitPieces,
  slot: OutfitSlot,
  pool: WardrobeItem[],
  usedIds: Set<string>,
  profile: OnboardingData,
  occasion: Occasion,
  weatherBand: WeatherBand,
  precipitation: Precipitation
) {
  const candidates = [null, ...pool.filter((item) => !usedIds.has(item.id))];
  let best: WardrobeItem | null = null;
  let bestScore = -999;

  candidates.forEach((item) => {
    const next = assignSlot(currentPieces, slot, item);
    const { score } = scorePieces(next, profile, occasion, weatherBand, precipitation);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  });

  return best;
}

function cartesianProduct(pools: WardrobeItem[][]) {
  return pools.reduce<WardrobeItem[][]>(
    (acc, pool) => acc.flatMap((combo) => pool.map((item) => [...combo, item])),
    [[]]
  );
}

function buildCandidates(
  items: WardrobeItem[],
  profile: OnboardingData,
  occasion: Occasion,
  weatherBand: WeatherBand,
  precipitation: Precipitation,
  baseItemId: string | undefined,
  source: Candidate['source'],
  relaxed = false
) {
  const baseItem = baseItemId ? items.find((item) => item.id === baseItemId) || null : null;
  const templates = MODE_TEMPLATES[occasion];
  const candidateList: Candidate[] = [];

  templates.forEach((template) => {
    const requiredPools = template.required.map((slot) =>
      getPoolForSlot(items, slot, occasion, weatherBand, precipitation, relaxed)
    );

    if (requiredPools.some((pool) => pool.length === 0)) return;

    const combos = cartesianProduct(requiredPools);

    combos.forEach((combo) => {
      const usedIds = new Set<string>();
      let pieces: OutfitPieces = {};
      let invalid = false;

      template.required.forEach((slot, index) => {
        const item = combo[index];
        if (!item) invalid = true;
        if (item && usedIds.has(item.id)) invalid = true;
        if (item) usedIds.add(item.id);
        pieces = assignSlot(pieces, slot, item || null);
      });

      if (invalid) return;
      if (baseItem && !getAllPieces(pieces).some((item) => item.id === baseItem.id)) return;

      template.optional.forEach((slot) => {
        const pool = getPoolForSlot(items, slot, occasion, weatherBand, precipitation, relaxed);
        if (!pool.length) return;

        const best = bestOptionalForSlot(
          pieces,
          slot,
          pool,
          usedIds,
          profile,
          occasion,
          weatherBand,
          precipitation
        );

        if (best) usedIds.add(best.id);
        pieces = assignSlot(pieces, slot, best);
      });

      const selectedPieces = getAllPieces(pieces);
      if (!selectedPieces.length) return;

      const scored = scorePieces(pieces, profile, occasion, weatherBand, precipitation);

      candidateList.push({
        pieces,
        score: scored.score,
        reasons: scored.reasons,
        completionScore: scored.completionScore,
        diversityScore: scored.diversityScore,
        seasonHits: scored.seasonHits,
        modeLabel: template.label,
        fingerprint: selectedPieces.map((item) => item.id).sort().join('-'),
        source,
      });
    });
  });

  const unique = new Map<string, Candidate>();
  candidateList.forEach((candidate) => {
    const previous = unique.get(candidate.fingerprint);
    if (!previous || candidate.score > previous.score) {
      unique.set(candidate.fingerprint, candidate);
    }
  });

  return [...unique.values()];
}

export function generateSmartOutfits(
  items: WardrobeItem[],
  profile: OnboardingData,
  occasion: Occasion,
  weatherBand: WeatherBand,
  precipitation: Precipitation,
  baseItemId?: string
): OutfitRecommendation[] {
  const cleanItems = items.filter((item) => (item.status || 'Temiz') === 'Temiz');
  const flexibleItems = items.filter((item) => (item.status || 'Temiz') !== 'Kuru Temizlemede');

  let candidates = buildCandidates(cleanItems, profile, occasion, weatherBand, precipitation, baseItemId, 'strict', false);

  if (!candidates.length) {
    candidates = buildCandidates(flexibleItems, profile, occasion, weatherBand, precipitation, baseItemId, 'flex', false);
  }

  if (!candidates.length) {
    candidates = buildCandidates(flexibleItems, profile, occasion, weatherBand, precipitation, baseItemId, 'relaxed', true);
  }

  const sorted = [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.completionScore !== a.completionScore) return b.completionScore - a.completionScore;
    return b.diversityScore - a.diversityScore;
  }).slice(0, 3);

  return sorted.map((candidate, index) => {
    const title = ['Güvenli Seçim', 'Trend Dokunuşu', 'Daha Cesur'][index] || candidate.modeLabel;
    const explanationParts = [...candidate.reasons];
    explanationParts.unshift(`${candidate.modeLabel} için daha uyumlu bir kurgu seçildi.`);

    if (weatherBand === '0-10' || weatherBand === '10-15') {
      explanationParts.push('Serin hava dikkate alındı.');
    }

    if (weatherBand === '25+') {
      explanationParts.push('Daha sıcak hava için hafif parçalar öne çıktı.');
    }

    if (precipitation === 'Yağışlı') {
      explanationParts.push('Yağış ihtimali koruyucu seçimleri etkiledi.');
    }

    if (baseItemId) {
      explanationParts.push('Seçtiğin parça görünümün merkezinde tutuldu.');
    }

    if (candidate.source === 'flex') {
      explanationParts.push('Temiz parça sayısı yetersiz olduğu için esnek eşleşme kullanıldı.');
    }

    if (candidate.source === 'relaxed') {
      explanationParts.push('Eksik kategoriler nedeniyle yumuşatılmış kombin kurgusu kullanıldı.');
    }

    return {
      id: `${candidate.fingerprint}-${index}`,
      title,
      explanation: explanationParts.slice(0, 3).join(' '),
      score: candidate.score,
      occasion,
      weatherBand,
      precipitation,
      pieces: candidate.pieces,
    };
  });
}
