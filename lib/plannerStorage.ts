import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlannerDay, PLANNER_DAYS, WeeklyPlan } from '../types/planner';

const WEEKLY_PLAN_KEY = 'combinia_weekly_plan';

function createEmptyPlan(): WeeklyPlan {
  return {
    Pazartesi: null,
    Salı: null,
    Çarşamba: null,
    Perşembe: null,
    Cuma: null,
    Cumartesi: null,
    Pazar: null,
  };
}

export async function getWeeklyPlan(): Promise<WeeklyPlan> {
  const raw = await AsyncStorage.getItem(WEEKLY_PLAN_KEY);
  if (!raw) return createEmptyPlan();

  const parsed = JSON.parse(raw) as Partial<WeeklyPlan>;
  const fallback = createEmptyPlan();

  PLANNER_DAYS.forEach((day) => {
    fallback[day] = parsed?.[day] ?? null;
  });

  return fallback;
}

export async function setPlannerDayLook(day: PlannerDay, lookId: string) {
  const current = await getWeeklyPlan();
  current[day] = lookId;
  await AsyncStorage.setItem(WEEKLY_PLAN_KEY, JSON.stringify(current));
}

export async function setWeeklyPlanBatch(assignments: Partial<WeeklyPlan>) {
  const current = await getWeeklyPlan();
  const merged = { ...current, ...assignments };
  await AsyncStorage.setItem(WEEKLY_PLAN_KEY, JSON.stringify(merged));
  return merged;
}

export async function clearPlannerDay(day: PlannerDay) {
  const current = await getWeeklyPlan();
  current[day] = null;
  await AsyncStorage.setItem(WEEKLY_PLAN_KEY, JSON.stringify(current));
}

export async function clearWeeklyPlan() {
  await AsyncStorage.setItem(WEEKLY_PLAN_KEY, JSON.stringify(createEmptyPlan()));
}
