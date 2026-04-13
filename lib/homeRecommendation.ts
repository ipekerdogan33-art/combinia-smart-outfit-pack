import { generateSmartOutfits } from './outfitEngine';
import { getOutfitFeedbackState, rerankRecommendationsByFeedback, feedbackAdjustmentForLook } from './outfitFeedbackStorage';
import { getWeeklyPlan } from './plannerStorage';
import { getUserSettings } from './settingsStorage';
import { fetchWeatherContextForCity } from './weatherService';
import { OnboardingData } from '../types/onboarding';
import { Occasion, Precipitation, WeatherBand } from '../types/catalog';
import { WardrobeItem } from '../types/wardrobe';
import { SavedLook } from './savedLooksStorage';
import { OutfitRecommendation } from '../types/outfit';

export type DailyHomeRecommendation = {
  source: 'planner' | 'generated' | 'saved-fallback' | 'none';
  title: string;
  reason: string;
  occasion: Occasion;
  weatherBand: WeatherBand;
  precipitation: Precipitation;
  city: string;
  look: OutfitRecommendation | SavedLook | null;
  todayLabel: string;
};

const DAY_MAP: Record<number, string> = {
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi',
  0: 'Pazar',
};

export function getTodayLabel() {
  return DAY_MAP[new Date().getDay()];
}

function inferDailyOccasion(profile: OnboardingData, todayLabel: string): Occasion {
  const styles = profile.styles || [];

  if (['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe'].includes(todayLabel)) {
    if (profile.lifestyle === 'İş odaklı') return 'Ofis';
    return 'Günlük';
  }

  if (todayLabel === 'Cuma') {
    if (profile.lifestyle === 'İş odaklı') return 'Ofis';
    return 'Günlük';
  }

  if (todayLabel === 'Cumartesi') {
    if (styles.includes('Davet')) return 'Davet';
    if (profile.lifestyle === 'Seyahat') return 'Seyahat';
    return 'Günlük';
  }

  if (todayLabel === 'Pazar') {
    if (profile.lifestyle === 'Seyahat') return 'Seyahat';
    if (styles.includes('Spor Şık')) return 'Spor';
    return 'Günlük';
  }

  return 'Günlük';
}

function weatherMatchScore(
  look: { weatherBand?: WeatherBand; precipitation?: Precipitation; occasion?: Occasion },
  weatherBand: WeatherBand,
  precipitation: Precipitation,
  occasion: Occasion
) {
  let score = 0;

  if (look.occasion === occasion) score += 3;
  if (look.weatherBand === weatherBand) score += 2;
  if (look.precipitation === precipitation) score += 1;

  return score;
}

export async function buildDailyHomeRecommendation(
  profile: OnboardingData | null,
  wardrobeItems: WardrobeItem[],
  savedLooks: SavedLook[]
): Promise<DailyHomeRecommendation | null> {
  if (!profile) return null;

  const [settings, weeklyPlan, feedbackState] = await Promise.all([
    getUserSettings(),
    getWeeklyPlan(),
    getOutfitFeedbackState(),
  ]);

  let city = settings.weatherCity || 'İstanbul';
  let weatherBand: WeatherBand = '15-20';
  let precipitation: Precipitation = 'Kuru';

  if (settings.weatherPreference === 'AUTO' && city) {
    try {
      const weather = await fetchWeatherContextForCity(city);
      city = weather.city;
      weatherBand = weather.weatherBand;
      precipitation = weather.precipitationState;
    } catch {
      // silent fallback
    }
  }

  const todayLabel = getTodayLabel();
  const plannedLookId = weeklyPlan?.[todayLabel as keyof typeof weeklyPlan] || null;

  if (plannedLookId) {
    const plannedLook = savedLooks.find((item) => item.id === plannedLookId) || null;

    if (plannedLook) {
      return {
        source: 'planner',
        title: 'Bugün için Planlanan Görünüm',
        reason: `${todayLabel} için planner içinde zaten görünüm atanmış.`,
        occasion: plannedLook.occasion,
        weatherBand: plannedLook.weatherBand,
        precipitation: plannedLook.precipitation,
        city,
        look: plannedLook,
        todayLabel,
      };
    }
  }

  const inferredOccasion = inferDailyOccasion(profile, todayLabel);

  const generated = generateSmartOutfits(
    wardrobeItems,
    profile,
    inferredOccasion,
    weatherBand,
    precipitation
  );

  const rerankedGenerated = rerankRecommendationsByFeedback(generated, feedbackState);
  const bestGenerated = rerankedGenerated[0] || null;

  if (bestGenerated) {
    return {
      source: 'generated',
      title: 'Bugünün Kişisel Önerisi',
      reason: `${todayLabel} için ${inferredOccasion.toLocaleLowerCase('tr-TR')} odağı, hava ve stil sinyallerin birlikte değerlendirildi.`,
      occasion: inferredOccasion,
      weatherBand,
      precipitation,
      city,
      look: bestGenerated,
      todayLabel,
    };
  }

  if (savedLooks.length) {
    const bestSaved = [...savedLooks].sort((a, b) => {
      const scoreA = weatherMatchScore(a, weatherBand, precipitation, inferredOccasion) + feedbackAdjustmentForLook(a, feedbackState);
      const scoreB = weatherMatchScore(b, weatherBand, precipitation, inferredOccasion) + feedbackAdjustmentForLook(b, feedbackState);
      return scoreB - scoreA;
    })[0];

    return {
      source: 'saved-fallback',
      title: 'Bugün İçin Kaydedilmiş Bir Görünüm',
      reason: `Bugün için en yakın kayıtlı görünüm öne çıkarıldı.`,
      occasion: bestSaved.occasion,
      weatherBand: bestSaved.weatherBand,
      precipitation: bestSaved.precipitation,
      city,
      look: bestSaved,
      todayLabel,
    };
  }

  return {
    source: 'none',
    title: 'Bugün İçin Öneri Hazır Değil',
    reason: 'Daha güçlü bir günlük öneri için biraz daha parça ya da kaydedilmiş görünüm gerekebilir.',
    occasion: inferredOccasion,
    weatherBand,
    precipitation,
    city,
    look: null,
    todayLabel,
  };
}
