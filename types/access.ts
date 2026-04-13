export type AppPlan = 'free' | 'pro';

export type DailyGenerationState = {
  dateKey: string;
  count: number;
};

export type AdBreakReason = 'initial' | 'refresh';
