import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import OptionCard from '../../components/OptionCard';
import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import { useOnboarding } from '../../context/OnboardingContext';
import colors from '../../theme/colors';

const ageOptions = ['18–24', '25–34', '35–44', '45–54', '55–64', '65+'];
const heightOptions = ['150 cm altı', '150–159 cm', '160–169 cm', '170–179 cm', '180 cm+'];
const weightOptions = ['45 kg altı', '45–54 kg', '55–64 kg', '65–74 kg', '75–84 kg', '85 kg+'];

const commonBodyShapes = [
  'Kum Saati',
  'Armut',
  'Elma',
  'Dikdörtgen',
  'Atletik/Ters Üçgen',
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

export default function BodyScreen() {
  const { data, updateField } = useOnboarding();

  const isReady = !!data.age && !!data.height && !!data.weight && !!data.bodyShape;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 32 }}>
        <OnboardingHeader
          stepLabel="Adım 3 / 5"
          step={3}
          total={5}
          title="Vücut ve oran bilgilerin"
          subtitle="Stil motoru siluet ve oran kurallarını buna göre çalıştıracak."
        />

        <SelectGroup title="Yaş aralığı" options={ageOptions} selected={data.age} onSelect={(v) => updateField('age', v)} />
        <SelectGroup title="Boy" options={heightOptions} selected={data.height} onSelect={(v) => updateField('height', v)} />
        <SelectGroup title="Kilo" options={weightOptions} selected={data.weight} onSelect={(v) => updateField('weight', v)} />
        <SelectGroup title="Vücut şekli" options={commonBodyShapes} selected={data.bodyShape} onSelect={(v) => updateField('bodyShape', v)} />

        <PrimaryButton title="Devam Et" disabled={!isReady} onPress={() => router.push('/onboarding/style')} />
      </ScrollView>
    </View>
  );
}
