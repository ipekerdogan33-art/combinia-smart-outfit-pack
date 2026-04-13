import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import OptionCard from '../../components/OptionCard';
import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import { useOnboarding } from '../../context/OnboardingContext';
import colors from '../../theme/colors';
import { deriveColorSeason } from '../../lib/colorSeason';

const skinOptions = [
  'Fildişi',
  'Şeftali',
  'Açık Bej',
  'Pembe Alt Tonlu',
  'Buğday',
  'Bronz',
  'Soğuk Bej',
  'Esmer',
];

const eyeOptions = [
  'Açık Mavi',
  'Mavi',
  'Gri',
  'Açık Yeşil',
  'Ela',
  'Kahverengi',
  'Amber',
  'Koyu Yeşil',
];

const hairOptions = [
  'Sarı',
  'Açık Kumral',
  'Küllü Sarı',
  'Küllü Kumral',
  'Açık Kahve',
  'Koyu Kahve',
  'Kızıl',
  'Siyah',
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

export default function ColorsScreen() {
  const { data, updateField } = useOnboarding();

  const updateColorField = (
    field: 'skinTone' | 'eyeColor' | 'hairColor',
    value: string
  ) => {
    updateField(field, value);

    const next = {
      ...data,
      [field]: value,
    };

    if (next.skinTone && next.eyeColor && next.hairColor) {
      updateField(
        'colorSeason',
        deriveColorSeason({
          skinTone: next.skinTone,
          eyeColor: next.eyeColor,
          hairColor: next.hairColor,
        })
      );
    }
  };

  const isReady = !!data.skinTone && !!data.eyeColor && !!data.hairColor;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 32 }}>
        <OnboardingHeader
          stepLabel="Adım 2 / 5"
          step={2}
          total={5}
          title="Renk özelliklerin"
          subtitle="Renk sezonunu daha doğru tahmin edebilmek için birkaç bilgi alalım."
        />

        <SelectGroup
          title="Ten tonu"
          options={skinOptions}
          selected={data.skinTone}
          onSelect={(value) => updateColorField('skinTone', value)}
        />

        <SelectGroup
          title="Göz rengi"
          options={eyeOptions}
          selected={data.eyeColor}
          onSelect={(value) => updateColorField('eyeColor', value)}
        />

        <SelectGroup
          title="Saç rengi"
          options={hairOptions}
          selected={data.hairColor}
          onSelect={(value) => updateColorField('hairColor', value)}
        />

        {!!data.colorSeason && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.borderSoft,
              borderRadius: 18,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 6 }}>
              Tahmini renk sezonun
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
              {data.colorSeason}
            </Text>
          </View>
        )}

        <PrimaryButton
          title="Devam Et"
          disabled={!isReady}
          onPress={() => router.push('/onboarding/body')}
        />
      </ScrollView>
    </View>
  );
}
