import { DimensionValue, View } from 'react-native';
import colors from '../theme/colors';

export default function ProgressBar({ step, total }: { step: number; total: number }) {
  const width = `${(step / total) * 100}%` as DimensionValue;

  return (
    <View style={{ height: 6, backgroundColor: colors.progressTrack, borderRadius: 999, overflow: 'hidden', marginBottom: 28 }}>
      <View style={{ width, height: '100%', backgroundColor: colors.primary }} />
    </View>
  );
}
