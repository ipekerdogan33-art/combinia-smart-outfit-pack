import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import colors from '../../theme/colors';
import { incrementGenerationCount } from '../../lib/accessControl';
import { AdBreakReason } from '../../types/access';

export default function AdBreakScreen() {
  const { occasion, itemId, reason, weatherBand, precipitation } = useLocalSearchParams<{
    occasion?: string;
    itemId?: string;
    reason?: AdBreakReason;
    weatherBand?: string;
    precipitation?: string;
  }>();
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    let current = 3;

    const timer = setInterval(() => {
      current -= 1;
      setSeconds(current);

      if (current <= 0) {
        clearInterval(timer);

        (async () => {
          await incrementGenerationCount();

          router.replace({
            pathname: '/outfit',
            params: {
              occasion: occasion ?? 'Günlük',
              weatherBand: weatherBand ?? '15-20',
              precipitation: precipitation ?? 'Kuru',
              itemId: itemId ?? '',
            },
          });
        })();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const title =
    reason === 'refresh' ? 'Yeni kombin hazırlanıyor' : 'Kombin hazırlanıyor';

  const subtitle =
    reason === 'refresh'
      ? 'Free planda “değiştir” aksiyonundan önce kısa bir reklam alanı bulunur.'
      : 'Free planda kombin gösterilmeden önce kısa bir reklam alanı bulunur.';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          width: '100%',
          backgroundColor: colors.surface,
          borderRadius: 24,
          padding: 24,
          borderWidth: 1,
          borderColor: colors.borderSoft,
        }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 14,
            textAlign: 'center',
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 18,
          }}
        >
          {subtitle}
        </Text>

        <View
          style={{
            height: 8,
            backgroundColor: '#F3EFE9',
            borderRadius: 999,
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: `${((3 - seconds) / 3) * 100}%`,
              height: '100%',
              backgroundColor: colors.primary,
            }}
          />
        </View>

        <Text
          style={{
            fontSize: 42,
            fontWeight: '700',
            color: colors.primary,
            textAlign: 'center',
          }}
        >
          {seconds}
        </Text>
      </View>
    </View>
  );
}
