import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { OnboardingData } from '../types/onboarding';

export default function ProfilePreviewCard({ profile }: { profile: OnboardingData }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
        Stil Profilin
      </Text>

      <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>
        {profile.gender || '-'} • {profile.age || '-'}
      </Text>

      <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>
        Renk sezonu: {profile.colorSeason || '-'}
      </Text>

      <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>
        {profile.bodyShape || '-'}
      </Text>

      <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>
        {profile.styles?.join(' • ') || '-'}
      </Text>

      <Text style={{ color: colors.textSecondary }}>
        {profile.lifestyle || '-'}
      </Text>
    </View>
  );
}
