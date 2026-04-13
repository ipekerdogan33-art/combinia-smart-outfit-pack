import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { PlannerRotationInsights } from '../lib/plannerRotation';

export default function PlannerRotationCard({
  insights,
}: {
  insights: PlannerRotationInsights;
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
        Rotasyon Sağlığı
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        Haftalık planın aynı parça tekrarlarını ve kirlenme riskini dikkate alır.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {[
          `Skor: ${insights.rotationScore}`,
          `Planlı gün: ${insights.plannedDays}`,
          `Farklı görünüm: ${insights.uniqueLookCount}`,
          `Riskli parça: ${insights.riskyItemCount}`,
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
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
