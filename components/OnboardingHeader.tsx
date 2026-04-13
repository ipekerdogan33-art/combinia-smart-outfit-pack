import { Text, View } from 'react-native';
import ProgressBar from './ProgressBar';
import colors from '../theme/colors';

export default function OnboardingHeader({
  stepLabel,
  step,
  total,
  title,
  subtitle,
}: {
  stepLabel: string;
  step: number;
  total: number;
  title: string;
  subtitle: string;
}) {
  return (
    <View>
      <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 8 }}>{stepLabel}</Text>
      <ProgressBar step={step} total={total} />
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5, marginBottom: 10 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 16, lineHeight: 24, color: colors.textSecondary, marginBottom: 28 }}>
        {subtitle}
      </Text>
    </View>
  );
}
