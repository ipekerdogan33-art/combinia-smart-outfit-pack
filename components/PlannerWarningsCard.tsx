import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { PlannerRotationInsights } from '../lib/plannerRotation';

export default function PlannerWarningsCard({
  insights,
}: {
  insights: PlannerRotationInsights;
}) {
  if (!insights.warnings.length) return null;

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
        Haftalık Uyarılar
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        Planner içindeki tekrar ve bakım risklerini burada görebilirsin.
      </Text>

      {insights.warnings.map((warning) => (
        <View
          key={warning.id}
          style={{
            backgroundColor: warning.level === 'Yüksek' ? '#FBEAEA' : '#F7F2EB',
            borderRadius: 16,
            padding: 14,
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 4,
            }}
          >
            {warning.title}
          </Text>

          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: warning.level === 'Yüksek' ? '#B00020' : '#8B6A00',
              marginBottom: 6,
            }}
          >
            {warning.level}
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: colors.textSecondary,
            }}
          >
            {warning.description}
          </Text>
        </View>
      ))}
    </View>
  );
}
