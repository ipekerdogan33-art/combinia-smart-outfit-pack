import AsyncStorage from '@react-native-async-storage/async-storage';
import { deriveColorSeason } from './colorSeason';
import { OnboardingData } from '../types/onboarding';

export const ONBOARDING_STORAGE_KEY = 'combinia_onboarding_profile';

function normalizeProfile(raw: any): OnboardingData | null {
  if (!raw) return null;

  const skinTone = raw.skinTone || raw.skin || '';
  const eyeColor = raw.eyeColor || raw.eye || '';
  const hairColor = raw.hairColor || raw.hair || '';

  const colorSeason =
    raw.colorSeason ||
    (skinTone && eyeColor && hairColor
      ? deriveColorSeason({ skinTone, eyeColor, hairColor })
      : '');

  return {
    gender: raw.gender || '',
    skinTone,
    eyeColor,
    hairColor,
    colorSeason,
    age: raw.age || '',
    height: raw.height || '',
    weight: raw.weight || '',
    bodyShape: raw.bodyShape || '',
    styles: Array.isArray(raw.styles) ? raw.styles : [],
    lifestyle: raw.lifestyle || '',
    weekend: raw.weekend || '',
    fashionPriority: raw.fashionPriority || '',
  };
}

export async function saveOnboardingProfile(data: unknown) {
  const normalized = normalizeProfile(data);
  if (!normalized) return;
  await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(normalized));
}

export async function getOnboardingProfile() {
  const raw = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
  const parsed = raw ? JSON.parse(raw) : null;
  const normalized = normalizeProfile(parsed);

  if (normalized && JSON.stringify(parsed) !== JSON.stringify(normalized)) {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(normalized));
  }

  return normalized;
}

export async function clearOnboardingProfile() {
  await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
}
