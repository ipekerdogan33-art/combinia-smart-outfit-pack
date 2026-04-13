import { OnboardingData } from '../types/onboarding';
import { SavedLook } from './savedLooksStorage';
import { buildStyleNarrative } from './styleNarrative';

export function buildPremiumShareCaptions(
  look: SavedLook,
  profile: OnboardingData | null
) {
  const narrative = profile ? buildStyleNarrative(look, profile) : look.explanation;

  const first = [
    `Combinia Look — ${look.title}`,
    `${look.occasion} • ${look.weatherBand}°C • ${look.precipitation}`,
    '',
    narrative,
  ].join('\n');

  const second = [
    `Bugün için seçtiğim görünüm: ${look.title}`,
    `${look.occasion} odağında kuruldu.`,
    narrative,
  ].join('\n');

  return [first, second];
}
