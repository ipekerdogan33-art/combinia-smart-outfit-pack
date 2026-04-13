export type AppLanguage = 'TR' | 'EN';
export type RegionMode = 'TR' | 'GLOBAL';
export type WeatherPreference = 'AUTO' | 'MANUAL';
export type TryOnPreference = 'MOCKUP' | 'AVATAR';

export type UserSettings = {
  language: AppLanguage;
  region: RegionMode;
  weatherPreference: WeatherPreference;
  tryOnPreference: TryOnPreference;
  weatherCity: string;
};
