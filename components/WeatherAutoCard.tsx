import { Pressable, Text, TextInput, View } from 'react-native';
import colors from '../theme/colors';
import { AutoWeatherContext } from '../lib/weatherService';

export default function WeatherAutoCard({
  city,
  onChangeCity,
  onApply,
  loading,
  result,
}: {
  city: string;
  onChangeCity: (value: string) => void;
  onApply: () => void;
  loading: boolean;
  result: AutoWeatherContext | null;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 18,
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
        Havayı Otomatik Doldur
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        Şehir gir, hava bağlamını otomatik dolduralım.
      </Text>

      <TextInput
        value={city}
        onChangeText={onChangeCity}
        placeholder="Örn: İstanbul"
        placeholderTextColor={colors.muted}
        style={{
          backgroundColor: '#F7F2EB',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.borderSoft,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          color: colors.text,
          marginBottom: 12,
        }}
      />

      <Pressable
        onPress={onApply}
        disabled={loading || !city.trim()}
        style={{
          backgroundColor: loading || !city.trim() ? colors.disabled : colors.primary,
          paddingVertical: 16,
          borderRadius: 16,
          alignItems: 'center',
          marginBottom: result ? 12 : 0,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>
          {loading ? 'Hava Alınıyor...' : 'Otomatik Doldur'}
        </Text>
      </Pressable>

      {!!result && (
        <View
          style={{
            backgroundColor: '#F7F2EB',
            borderRadius: 16,
            padding: 14,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
            {result.city}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
            Sıcaklık bandı: {result.weatherBand}°C
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
            Yağış: {result.precipitationState}
          </Text>
          <Text style={{ fontSize: 13, lineHeight: 20, color: colors.muted }}>
            {result.summary}
          </Text>
        </View>
      )}
    </View>
  );
}
