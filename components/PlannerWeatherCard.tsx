import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { WeeklyWeatherDay } from '../lib/weatherService';

export default function PlannerWeatherCard({
  city,
  days,
}: {
  city: string;
  days: WeeklyWeatherDay[];
}) {
  if (!days.length) return null;

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
        Haftalık Hava
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        {city} için önümüzdeki günlerin hava bağlamı.
      </Text>

      {days.map((day) => (
        <View
          key={day.date}
          style={{
            backgroundColor: '#F7F2EB',
            borderRadius: 16,
            padding: 12,
            marginBottom: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>
            {day.dayLabel}
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            {day.weatherBand}°C • {day.precipitationState}
          </Text>
        </View>
      ))}
    </View>
  );
}
