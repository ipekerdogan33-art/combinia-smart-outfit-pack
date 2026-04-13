import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { ActionCenterSummary } from '../lib/actionCenterEngine';

export default function ActionCenterSummaryCard({
  summary,
}: {
  summary: ActionCenterSummary;
}) {
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
        Öncelik Özeti
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        Şu anda dikkat isteyen işleri tek yerde görüyorsun.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {[
          `Yüksek: ${summary.highCount}`,
          `Orta: ${summary.mediumCount}`,
          `Bakım: ${summary.careCount}`,
          `Planner: ${summary.plannerCount}`,
          `Alışveriş: ${summary.shoppingCount}`,
        ].map((item) => (
          <View
            key={item}
            style={{
              backgroundColor: '#F3EFE9',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
