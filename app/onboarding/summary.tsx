import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import { useOnboarding } from '../../context/OnboardingContext';
import colors from '../../theme/colors';
import { saveOnboardingProfile } from '../../lib/storage';

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.borderSoft,
      }}
    >
      <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{value || '-'}</Text>
    </View>
  );
}

export default function SummaryScreen() {
  const { data, reset } = useOnboarding();

  const handleComplete = async () => {
    await saveOnboardingProfile(data);
    reset();
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 32 }}>
        <OnboardingHeader
          stepLabel="Onboarding Özeti"
          step={5}
          total={5}
          title="İlk profilin hazır"
          subtitle="Renk sezonu ve stil profilin artık motor tarafından kullanılabilir."
        />

        <Row label="Cinsiyet" value={data.gender} />
        <Row label="Ten tonu" value={data.skinTone} />
        <Row label="Göz rengi" value={data.eyeColor} />
        <Row label="Saç rengi" value={data.hairColor} />
        <Row label="Renk sezonu" value={data.colorSeason} />
        <Row label="Yaş" value={data.age} />
        <Row label="Boy" value={data.height} />
        <Row label="Kilo" value={data.weight} />
        <Row label="Vücut şekli" value={data.bodyShape} />
        <Row label="Stil tercihleri" value={data.styles.join(' • ')} />
        <Row label="Yaşam tarzı" value={data.lifestyle} />
        <Row label="Hafta sonu alışkanlığı" value={data.weekend} />
        <Row label="Modaya uygun görünme önemi" value={data.fashionPriority} />

        <PrimaryButton title="Profili Kaydet" onPress={handleComplete} />
      </ScrollView>
    </View>
  );
}
