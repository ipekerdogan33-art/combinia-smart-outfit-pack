import { Text, View } from 'react-native';
import colors from '../theme/colors';

export default function PlannerSummaryCard({
  filledCount,
  totalCount,
}: {
  filledCount: number;
  totalCount: number;
}) {
  const percent = totalCount === 0 ? 0 : Math.round((filledCount / totalCount) * 100);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        }}
      >
        Haftalık Plan Özeti
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        Şu anda {filledCount} / {totalCount} gün için görünüm atanmış.
      </Text>

      <View
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: '#F3EFE9',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </View>
  );
}
