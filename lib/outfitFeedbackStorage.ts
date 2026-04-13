import AsyncStorage from '@react-native-async-storage/async-storage';
import { OutfitRecommendation } from '../types/outfit';
import { WardrobeItem } from '../types/wardrobe';

export type OutfitFeedbackState = {
  itemScores: Record<string, number>;
  comboScores: Record<string, number>;
  likedLooks: number;
  dislikedLooks: number;
  updatedAt: string;
};

export type OutfitLearningInsights = {
  likedLooks: number;
  dislikedLooks: number;
  likedSubcategories: string[];
  avoidedSubcategories: string[];
};

const FEEDBACK_KEY = 'combinia_outfit_feedback';

function clamp(value: number, min = -6, max = 6) {
  return Math.max(min, Math.min(max, value));
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

export function createLookSignature(look: { pieces: Record<string, any> }) {
  const ids = Object.values(look.pieces || {})
    .filter(Boolean)
    .map((item: any) => item.id)
    .sort();

  return ids.join('-') || 'empty';
}

export async function getOutfitFeedbackState(): Promise<OutfitFeedbackState> {
  const raw = await AsyncStorage.getItem(FEEDBACK_KEY);
  if (!raw) {
    return {
      itemScores: {},
      comboScores: {},
      likedLooks: 0,
      dislikedLooks: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  const parsed = JSON.parse(raw);
  return {
    itemScores: parsed?.itemScores || {},
    comboScores: parsed?.comboScores || {},
    likedLooks: parsed?.likedLooks || 0,
    dislikedLooks: parsed?.dislikedLooks || 0,
    updatedAt: parsed?.updatedAt || new Date().toISOString(),
  };
}

export async function recordOutfitFeedback(
  look: OutfitRecommendation,
  value: 'like' | 'dislike'
) {
  const state = await getOutfitFeedbackState();
  const sign = value === 'like' ? 1 : -1;
  const comboBoost = value === 'like' ? 2 : -2;

  const pieceIds = Object.values(look.pieces || {})
    .filter(Boolean)
    .map((item: any) => item.id);

  pieceIds.forEach((id) => {
    state.itemScores[id] = clamp((state.itemScores[id] || 0) + sign);
  });

  const signature = createLookSignature(look);
  state.comboScores[signature] = clamp((state.comboScores[signature] || 0) + comboBoost, -12, 12);

  if (value === 'like') state.likedLooks += 1;
  if (value === 'dislike') state.dislikedLooks += 1;

  state.updatedAt = new Date().toISOString();

  await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(state));
  return state;
}

export function feedbackAdjustmentForLook(
  look: OutfitRecommendation,
  state: OutfitFeedbackState
) {
  const signature = createLookSignature(look);
  const comboScore = state.comboScores[signature] || 0;

  const pieceIds = Object.values(look.pieces || {})
    .filter(Boolean)
    .map((item: any) => item.id);

  const itemSum = pieceIds.reduce((sum, id) => sum + (state.itemScores[id] || 0), 0);
  const itemAverage = pieceIds.length ? itemSum / pieceIds.length : 0;

  return comboScore + itemAverage * 1.25;
}

export function rerankRecommendationsByFeedback(
  recommendations: OutfitRecommendation[],
  state: OutfitFeedbackState
) {
  return [...recommendations].sort((a, b) => {
    const scoreA = a.score + feedbackAdjustmentForLook(a, state);
    const scoreB = b.score + feedbackAdjustmentForLook(b, state);
    return scoreB - scoreA;
  });
}

export function deriveOutfitLearningInsights(
  state: OutfitFeedbackState,
  items: WardrobeItem[]
): OutfitLearningInsights {
  const sortedPositive = [...items]
    .filter((item) => (state.itemScores[item.id] || 0) > 0)
    .sort((a, b) => (state.itemScores[b.id] || 0) - (state.itemScores[a.id] || 0));

  const sortedNegative = [...items]
    .filter((item) => (state.itemScores[item.id] || 0) < 0)
    .sort((a, b) => (state.itemScores[a.id] || 0) - (state.itemScores[b.id] || 0));

  return {
    likedLooks: state.likedLooks,
    dislikedLooks: state.dislikedLooks,
    likedSubcategories: unique(sortedPositive.map((item) => item.subcategory)).slice(0, 4),
    avoidedSubcategories: unique(sortedNegative.map((item) => item.subcategory)).slice(0, 3),
  };
}
