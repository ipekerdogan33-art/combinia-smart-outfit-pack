import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { PlannerDaySuggestion } from '../lib/plannerIntelligence';

export default function PlannerSuggestionsCard({
  suggestions,
  onAssignDay,
  onAutoFill,
}: {
  suggestions: PlannerDaySuggestion[];
  onAssignDay: (day: string, lookId: string) => void;
  onAutoFill: () => void;
}) {
  if (!suggestions.length) return null;

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
        Haftalık Akıllı Öneriler
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        Hava, geri bildirim ve görünüm skoruna göre gün bazlı öneriler.
      </Text>

      <Pressable
        onPress={onAutoFill}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 16,
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>
          Haftayı Akıllı Doldur
        </Text>
      </Pressable>

      {suggestions.map((item) => (
        <View
          key={item.day}
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
            {item.day}
          </Text>

          <Text
            style={{
              fontSize: 13,
              color: colors.muted,
              marginBottom: 6,
            }}
          >
            {item.weather ? `${item.weather.weatherBand}°C • ${item.weather.precipitationState}` : 'Hava verisi yok'}
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 6,
            }}
          >
            {item.bestLook ? item.bestLook.title : 'Öneri yok'}
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: colors.textSecondary,
              marginBottom: item.bestLook ? 10 : 0,
            }}
          >
            {item.reason}
          </Text>

          {!!item.bestLook && (
            <Pressable
              onPress={() => onAssignDay(item.day, item.bestLook!.id)}
              style={{
                backgroundColor: '#F3EFE9',
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
                Bu Güne Ata
              </Text>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}
