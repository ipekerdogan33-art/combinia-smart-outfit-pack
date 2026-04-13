import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import OptionCard from '../../components/OptionCard';
import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import { useOnboarding } from '../../context/OnboardingContext';
import colors from '../../theme/colors';

const lifestyleOptions = [
  'İş odaklı',
  'Sosyal ve aktif',
  'Çoğunlukla evde',
  'Seyahat',
  'Sporda',
];

const weekendOptions = [
  'Plan yaparım / dışarı çıkarım',
  'Evde dinlenirim',
  'Gündelik işlerimi hallederim',
  'Hepsinin karışımı',
];

const fashionPriorityOptions = [
  'Mümkün olan en iyi uyum',
  'En önemli konu',
  'Öncelikli değil',
];

function SelectGroup({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={{ marginBottom: 26 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
        {title}
      </Text>

      {options.map((option) => (
        <OptionCard
          key={option}
          label={option}
          active={selected === option}
          onPress={() => onSelect(option)}
        />
      ))}
    </View>
  );
}

export default function LifestyleScreen() {
  const { data, updateField } = useOnboarding();

  const isReady = !!data.lifestyle && !!data.weekend && !!data.fashionPriority;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 32 }}>
        <OnboardingHeader
          stepLabel="Adım 5 / 5"
          step={5}
          total={5}
          title="Yaşam tarzın"
          subtitle="Yaşam tarzı ve modaya önem seviyesi, kombinlerin tonunu belirleyecek."
        />

        <SelectGroup title="Yaşam tarzı" options={lifestyleOptions} selected={data.lifestyle} onSelect={(v) => updateField('lifestyle', v)} />
        <SelectGroup title="Hafta sonu alışkanlığı" options={weekendOptions} selected={data.weekend} onSelect={(v) => updateField('weekend', v)} />
        <SelectGroup title="Modaya uygun görünme önemi" options={fashionPriorityOptions} selected={data.fashionPriority} onSelect={(v) => updateField('fashionPriority', v)} />

        <PrimaryButton title="Özeti Gör" disabled={!isReady} onPress={() => router.push('/onboarding/summary')} />
      </ScrollView>
    </View>
  );
}
