import { PlannerDay, PLANNER_DAYS, WeeklyPlan } from '../types/planner';
import { SavedLook } from './savedLooksStorage';
import { WeeklyWeatherDay } from './weatherService';
import {
  OutfitFeedbackState,
  feedbackAdjustmentForLook,
} from './outfitFeedbackStorage';
import { WearHistoryEntry } from './wearHistoryStorage';

export type PlannerDaySuggestion = {
  day: PlannerDay;
  weather: WeeklyWeatherDay | null;
  bestLook: SavedLook | null;
  alternatives: SavedLook[];
  reason: string;
};

function preferredOccasionsForDay(day: PlannerDay) {
  if (['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe'].includes(day)) {
    return ['Ofis', 'Günlük'];
  }

  if (day === 'Cuma') {
    return ['Ofis', 'Günlük', 'Seyahat'];
  }

  if (day === 'Cumartesi') {
    return ['Günlük', 'Davet', 'Seyahat'];
  }

  return ['Günlük', 'Seyahat', 'Spor'];
}

function weatherScore(look: SavedLook, weather: WeeklyWeatherDay | null) {
  if (!weather) return 0;

  let score = 0;

  if (look.weatherBand === weather.weatherBand) score += 2;
  else {
    const order = ['0-10', '10-15', '15-20', '20-25', '25+'];
    const lookIndex = order.indexOf(look.weatherBand);
    const weatherIndex = order.indexOf(weather.weatherBand);

    if (lookIndex !== -1 && weatherIndex !== -1) {
      const distance = Math.abs(lookIndex - weatherIndex);
      if (distance === 1) score += 1;
      if (distance >= 3) score -= 1.5;
    }
  }

  if (look.precipitation === weather.precipitationState) score += 1;

  return score;
}

function occasionScore(look: SavedLook, day: PlannerDay) {
  const preferred = preferredOccasionsForDay(day);
  const index = preferred.indexOf(look.occasion);

  if (index === 0) return 4;
  if (index === 1) return 2.5;
  if (index === 2) return 1;
  return -1;
}

function repeatPenalty(look: SavedLook, currentPlan: WeeklyPlan) {
  const assigned = Object.values(currentPlan).filter(Boolean);
  if (assigned.includes(look.id)) return -4;
  return 0;
}

function daysSince(date: string) {
  const ts = new Date(date).getTime();
  if (Number.isNaN(ts)) return 999;
  return Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
}

function recentWearPenalty(look: SavedLook, wearHistory: WearHistoryEntry[]) {
  const relevantHistory = wearHistory.filter((entry) => daysSince(entry.wornAt) <= 4);
  if (!relevantHistory.length) return 0;

  const lookItemIds = new Set(
    Object.values(look.pieces || {})
      .filter(Boolean)
      .map((item: any) => item.id)
  );

  let penalty = 0;

  relevantHistory.forEach((entry, index) => {
    const overlap = entry.itemIds.filter((id) => lookItemIds.has(id)).length;
    if (!overlap) return;

    if (index === 0) penalty -= overlap * 1.5;
    else if (index <= 2) penalty -= overlap * 0.75;
    else penalty -= overlap * 0.35;

    if (entry.lookId && entry.lookId === look.id) {
      penalty -= 1.5;
    }
  });

  return penalty;
}

function buildReason(look: SavedLook, weather: WeeklyWeatherDay | null, day: PlannerDay) {
  const parts: string[] = [];

  const preferred = preferredOccasionsForDay(day);
  if (preferred.includes(look.occasion)) {
    parts.push(`${day} için ${look.occasion.toLocaleLowerCase('tr-TR')} odağıyla uyumlu.`);
  }

  if (weather && look.weatherBand === weather.weatherBand) {
    parts.push('Hava bandı ile iyi eşleşiyor.');
  }

  if (weather && look.precipitation === weather.precipitationState) {
    parts.push('Yağış durumu uyumlu.');
  }

  return parts.slice(0, 2).join(' ') || 'Dengeli bir günlük öneri.';
}

export function buildWeeklyPlannerSuggestions(
  looks: SavedLook[],
  weeklyWeather: WeeklyWeatherDay[],
  feedbackState: OutfitFeedbackState,
  currentPlan: WeeklyPlan,
  wearHistory: WearHistoryEntry[]
): PlannerDaySuggestion[] {
  return PLANNER_DAYS.map((day) => {
    const weather =
      weeklyWeather.find((item) => item.dayLabel === day) || null;

    const sorted = [...looks].sort((a, b) => {
      const scoreA =
        a.score +
        occasionScore(a, day) +
        weatherScore(a, weather) +
        feedbackAdjustmentForLook(a, feedbackState) +
        repeatPenalty(a, currentPlan) +
        recentWearPenalty(a, wearHistory);

      const scoreB =
        b.score +
        occasionScore(b, day) +
        weatherScore(b, weather) +
        feedbackAdjustmentForLook(b, feedbackState) +
        repeatPenalty(b, currentPlan) +
        recentWearPenalty(b, wearHistory);

      return scoreB - scoreA;
    });

    const bestLook = sorted[0] || null;
    const alternatives = sorted.slice(1, 3);

    return {
      day,
      weather,
      bestLook,
      alternatives,
      reason: bestLook ? buildReason(bestLook, weather, day) : 'Bu gün için öneri bulunamadı.',
    };
  });
}

export function buildAutoFillAssignments(
  suggestions: PlannerDaySuggestion[],
  currentPlan: WeeklyPlan
) {
  const result: Partial<WeeklyPlan> = {};

  suggestions.forEach((suggestion) => {
    if (!currentPlan[suggestion.day] && suggestion.bestLook) {
      result[suggestion.day] = suggestion.bestLook.id;
    }
  });

  return result;
}
