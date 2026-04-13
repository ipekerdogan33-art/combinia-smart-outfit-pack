import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import { useOnboarding } from '../../context/OnboardingContext';
import colors from '../../theme/colors';

const styleOptions = [
  'Klasik',
  'Günlük / Casual',
  'Minimalist',
  'Spor Şık',
  'Boho',
  'Sokak stili',
  'Davet',
  'Preppy',
  'Grunge / Salaş',
];

function MultiSelectCard({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: active ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: '600', color: active ? '#fff' : colors.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function StyleScreen() {
  const { data, updateField } = useOnboarding();

  const toggleStyle = (value: string) => {
    if (data.styles.includes(value)) {
      updateField('styles', data.styles.filter((item) => item !== value));
    } else {
      updateField('styles', [...data.styles, value]);
    }
  };

  const isReady = data.styles.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 32 }}>
        <OnboardingHeader
          stepLabel="Adım 4 / 5"
          step={4}
          total={5}
          title="Stil tercihlerin"
          subtitle="Birden fazla seçim yapabilirsin. Kombin motoru bunları ağırlık olarak kullanacak."
        />

        {styleOptions.map((option) => (
          <MultiSelectCard
            key={option}
            label={option}
            active={data.styles.includes(option)}
            onPress={() => toggleStyle(option)}
          />
        ))}

        <PrimaryButton title="Devam Et" disabled={!isReady} onPress={() => router.push('/onboarding/lifestyle')} />
      </ScrollView>
    </View>
  );
}
