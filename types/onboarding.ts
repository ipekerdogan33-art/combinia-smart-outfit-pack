import { UserColorSeason } from './catalog';

export type OnboardingData = {
  gender: 'Kadın' | 'Erkek' | 'Belirtmek İstemiyorum' | '';
  skinTone: string;
  eyeColor: string;
  hairColor: string;
  colorSeason: UserColorSeason | '';
  age: string;
  height: string;
  weight: string;
  bodyShape: string;
  styles: string[];
  lifestyle: string;
  weekend: string;
  fashionPriority: string;
};
