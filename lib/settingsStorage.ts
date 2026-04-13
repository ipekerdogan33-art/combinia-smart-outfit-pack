import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '../types/settings';

const SETTINGS_KEY = 'combinia_user_settings';

const defaultSettings: UserSettings = {
  language: 'TR',
  region: 'TR',
  weatherPreference: 'AUTO',
  tryOnPreference: 'MOCKUP',
  weatherCity: 'İstanbul',
};

export async function getUserSettings(): Promise<UserSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;

  const parsed = JSON.parse(raw) as Partial<UserSettings>;
  return {
    ...defaultSettings,
    ...parsed,
  };
}

export async function updateUserSettings(partial: Partial<UserSettings>) {
  const current = await getUserSettings();
  const updated = { ...current, ...partial };
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}
