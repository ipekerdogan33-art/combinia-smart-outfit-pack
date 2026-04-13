import { router } from 'expo-router';
import { View } from 'react-native';
import OptionCard from '../../components/OptionCard';
import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import { useOnboarding } from '../../context/OnboardingContext';
import colors from '../../theme/colors';

const options = ['Kadın', 'Erkek', 'Belirtmek İstemiyorum'] as const;

export default function GenderScreen() {
  const { data, updateField } = useOnboarding();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 32 }}>
      <OnboardingHeader
        stepLabel="Adım 1 / 5"
        step={1}
        total={5}
        title="Seni tanıyarak başlayalım"
        subtitle="Önce sana en uygun önerileri hazırlayabilmemiz için bir seçim yap."
      />

      {options.map((option) => (
        <OptionCard
          key={option}
          label={option}
          active={data.gender === option}
          onPress={() => updateField('gender', option)}
        />
      ))}

      <View style={{ flex: 1 }} />
      <PrimaryButton title="Devam Et" disabled={!data.gender} onPress={() => router.push('/onboarding/colors')} />
    </View>
  );
}
