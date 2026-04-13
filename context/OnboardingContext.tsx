import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { OnboardingData } from '../types/onboarding';

type OnboardingContextType = {
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  reset: () => void;
};

export const initialOnboardingData: OnboardingData = {
  gender: '',
  skinTone: '',
  eyeColor: '',
  hairColor: '',
  colorSeason: '',
  age: '',
  height: '',
  weight: '',
  bodyShape: '',
  styles: [],
  lifestyle: '',
  weekend: '',
  fashionPriority: '',
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialOnboardingData);

  const updateField = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setData(initialOnboardingData);

  const value = useMemo(() => ({ data, updateField, reset }), [data]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
}
