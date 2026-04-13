import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { canGenerateOutfit, getPlan } from '../../lib/accessControl';
import { OCCASIONS, WEATHER_BANDS, PRECIPITATION_OPTIONS } from '../../constants/catalog';
import { Occasion, Precipitation, WeatherBand } from '../../types/catalog';
import { fetchWeatherContextForCity, AutoWeatherContext } from '../../lib/weatherService';
import WeatherAutoCard from '../../components/WeatherAutoCard';
import { getUserSettings, updateUserSettings } from '../../lib/settingsStorage';

const modeDescriptions: Record<Occasion, string> = {
  'Günlük': 'Rahat ama derli toplu kombinler',
  'Ofis': 'Daha düzenli ve profesyonel görünüm',
  'Davet': 'Daha şık ve özenli kombinler',
  'Spor': 'Hareket ve konfor odaklı kombinler',
  'Seyahat': 'Pratik ve tekrar kullanılabilir görünümler',
};

export default function OccasionScreen() {
  const { itemId } = useLocalSearchParams<{ itemId?: string }>();

  const [mode, setMode] = useState<Occasion | null>(null);
  const [weatherBand, setWeatherBand] = useState<WeatherBand>('15-20');
  const [precipitation, setPrecipitation] = useState<Precipitation>('Kuru');
  const [city, setCity] = useState('İstanbul');
  const [autoWeather, setAutoWeather] = useState<AutoWeatherContext | null>(null);
  const [autoLoading, setAutoLoading] = useState(false);

  const isReady = !!mode;

  useEffect(() => {
    (async () => {
      const settings = await getUserSettings();
      setCity(settings.weatherCity || 'İstanbul');

      if (settings.weatherPreference === 'AUTO' && settings.weatherCity) {
        try {
          const weather = await fetchWeatherContextForCity(settings.weatherCity);
          setAutoWeather(weather);
          setWeatherBand(weather.weatherBand);
          setPrecipitation(weather.precipitationState);
        } catch (error) {
          // silent fallback
        }
      }
    })();
  }, []);

  const handleAutoApply = async () => {
    if (!city.trim()) return;

    setAutoLoading(true);

    try {
      const result = await fetchWeatherContextForCity(city.trim());
      setAutoWeather(result);
      setWeatherBand(result.weatherBand);
      setPrecipitation(result.precipitationState);
      await updateUserSettings({
        weatherCity: result.city,
        weatherPreference: 'AUTO',
      });
    } catch (error) {
      Alert.alert(
        'Hava bilgisi alınamadı',
        'Şehir bulunamadı ya da servis yanıt vermedi. Manuel seçimle devam edebilirsin.'
      );
    } finally {
      setAutoLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!mode) return;

    const gate = await canGenerateOutfit();
    const plan = await getPlan();

    if (!gate.allowed) {
      router.push('/paywall');
      return;
    }

    if (plan === 'free') {
      router.push({
        pathname: '/ad-break',
        params: {
          occasion: mode,
          weatherBand,
          precipitation,
          itemId: itemId ?? '',
          reason: 'initial',
        },
      });
      return;
    }

    router.push({
      pathname: '/outfit',
      params: {
        occasion: mode,
        weatherBand,
        precipitation,
        itemId: itemId ?? '',
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 80,
          paddingBottom: 32,
        }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.5,
            marginBottom: 10,
          }}
        >
          Kombin Bağlamını Seç
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Rehberdeki mod yapısına göre kombin üreteceğiz.
        </Text>

        <WeatherAutoCard
          city={city}
          onChangeCity={setCity}
          onApply={handleAutoApply}
          loading={autoLoading}
          result={autoWeather}
        />

        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 12,
          }}
        >
          Mod
        </Text>

        {OCCASIONS.map((item) => {
          const active = mode === item;
          return (
            <Pressable
              key={item}
              onPress={() => setMode(item)}
              style={{
                backgroundColor: active ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.borderSoft,
                borderRadius: 20,
                padding: 18,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: active ? '#fff' : colors.text,
                  marginBottom: 6,
                }}
              >
                {item}
              </Text>

              <Text
                style={{
                  fontSize: 15,
                  lineHeight: 22,
                  color: active ? '#F6F2EC' : colors.textSecondary,
                }}
              >
                {modeDescriptions[item]}
              </Text>
            </Pressable>
          );
        })}

        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginTop: 8,
            marginBottom: 12,
          }}
        >
          Sıcaklık
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
          {WEATHER_BANDS.map((item) => {
            const active = weatherBand === item;
            return (
              <Pressable
                key={item}
                onPress={() => setWeatherBand(item)}
                style={{
                  backgroundColor: active ? colors.primary : '#F3EFE9',
                  borderRadius: 999,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  marginRight: 10,
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700' }}>
                  {item}°C
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 12,
          }}
        >
          Hava Durumu
        </Text>

        <View style={{ flexDirection: 'row', marginBottom: 28 }}>
          {PRECIPITATION_OPTIONS.map((item) => {
            const active = precipitation === item;
            return (
              <Pressable
                key={item}
                onPress={() => setPrecipitation(item)}
                style={{
                  backgroundColor: active ? colors.primary : '#F3EFE9',
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  marginRight: 10,
                }}
              >
                <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700' }}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleContinue}
          disabled={!isReady}
          style={{
            backgroundColor: isReady ? colors.primary : colors.disabled,
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
            Kombinleri Göster
          </Text>
        </Pressable>

        <Text
          style={{
            fontSize: 13,
            lineHeight: 20,
            color: colors.muted,
            marginTop: 12,
            textAlign: 'center',
          }}
        >
          İstersen hava bağlamını otomatik doldurabilir, istersen manuel seçimle devam edebilirsin.
        </Text>
      </ScrollView>
    </View>
  );
}
