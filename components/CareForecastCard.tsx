import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { PlannerRotationInsights } from '../lib/plannerRotation';

export default function CareForecastCard({
  insights,
}: {
  insights: PlannerRotationInsights;
}) {
  if (!insights.riskItems.length) return null;

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
        Bakım Riski Tahmini
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        Planner içindeki tekrar planlarına göre bakım riski taşıyan parçalar:
      </Text>

      {insights.riskItems.map((item) => (
        <View
          key={item.itemId}
          style={{
            backgroundColor: '#F7F2EB',
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
            {item.itemName}
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: colors.textSecondary,
            }}
          >
            Planlı günler: {item.days.join(', ')} • Durum: {item.status}
          </Text>
        </View>
      ))}
    </View>
  );
}
