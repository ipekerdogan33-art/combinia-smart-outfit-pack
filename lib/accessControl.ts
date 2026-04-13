import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppPlan, DailyGenerationState } from '../types/access';

const PLAN_KEY = 'combinia_plan';
const DAILY_KEY = 'combinia_daily_generation';
export const FREE_DAILY_LIMIT = 3;

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export async function getPlan(): Promise<AppPlan> {
  const raw = await AsyncStorage.getItem(PLAN_KEY);
  return raw === 'pro' ? 'pro' : 'free';
}

export async function setPlan(plan: AppPlan) {
  await AsyncStorage.setItem(PLAN_KEY, plan);
}

export async function getDailyGenerationState(): Promise<DailyGenerationState> {
  const raw = await AsyncStorage.getItem(DAILY_KEY);
  const today = getTodayKey();

  if (!raw) {
    const initial = { dateKey: today, count: 0 };
    await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(initial));
    return initial;
  }

  const parsed = JSON.parse(raw) as DailyGenerationState;

  if (parsed.dateKey !== today) {
    const reset = { dateKey: today, count: 0 };
    await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(reset));
    return reset;
  }

  return parsed;
}

export async function getRemainingFreeGenerations() {
  const plan = await getPlan();
  if (plan === 'pro') return Infinity;

  const state = await getDailyGenerationState();
  return Math.max(0, FREE_DAILY_LIMIT - state.count);
}

export async function getUsedFreeGenerations() {
  const plan = await getPlan();
  if (plan === 'pro') return 0;

  const state = await getDailyGenerationState();
  return state.count;
}

export async function getPlanSummary() {
  const plan = await getPlan();
  const remaining = await getRemainingFreeGenerations();
  const used = await getUsedFreeGenerations();

  return {
    plan,
    limit: FREE_DAILY_LIMIT,
    used,
    remaining,
  };
}

export async function canGenerateOutfit() {
  const plan = await getPlan();
  if (plan === 'pro') {
    return { allowed: true, plan, remaining: Infinity };
  }

  const state = await getDailyGenerationState();
  const remaining = Math.max(0, FREE_DAILY_LIMIT - state.count);

  return {
    allowed: remaining > 0,
    plan,
    remaining,
  };
}

export async function incrementGenerationCount() {
  const plan = await getPlan();
  if (plan === 'pro') return;

  const state = await getDailyGenerationState();
  const updated = {
    dateKey: state.dateKey,
    count: state.count + 1,
  };
  await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(updated));
}

export async function resetGenerationCountForDebug() {
  const today = getTodayKey();
  await AsyncStorage.setItem(
    DAILY_KEY,
    JSON.stringify({ dateKey: today, count: 0 })
  );
}
