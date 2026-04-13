import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import colors from '../theme/colors';
import { getOnboardingProfile } from '../lib/storage';
import { OnboardingData } from '../types/onboarding';
import { getSavedLooks } from '../lib/savedLooksStorage';
import { getWardrobeItems } from '../lib/wardrobeStorage';
import {
  buildDailyHomeRecommendation,
  DailyHomeRecommendation,
} from '../lib/homeRecommendation';
import DailyRecommendationCard from '../components/DailyRecommendationCard';
import { analyzeImageQuality } from '../lib/imageQualityAudit';

function HomeAction({
  title,
  detail,
  primary,
  onPress,
}: {
  title: string;
  detail?: string;
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: primary ? colors.primary : colors.surface,
        borderRadius: 18,
        borderWidth: primary ? 0 : 1,
        borderColor: colors.borderSoft,
        padding: 18,
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          color: primary ? '#fff' : colors.text,
          fontSize: 16,
          fontWeight: '700',
          marginBottom: detail ? 6 : 0,
        }}
      >
        {title}
      </Text>

      {!!detail && (
        <Text
          style={{
            color: primary ? 'rgba(255,255,255,0.82)' : colors.textSecondary,
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          {detail}
        </Text>
      )}
    </Pressable>
  );
}

export default function Home() {
  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [dailyRecommendation, setDailyRecommendation] = useState<DailyHomeRecommendation | null>(null);
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const [cleanupCount, setCleanupCount] = useState(0);

  const loadData = useCallback(async () => {
    const [savedProfile, savedLooks, wardrobeItems] = await Promise.all([
      getOnboardingProfile(),
      getSavedLooks(),
      getWardrobeItems(),
    ]);

    setProfile(savedProfile);
    setWardrobeCount(wardrobeItems.length);
    setCleanupCount(analyzeImageQuality(wardrobeItems).rawCount);
    setDailyRecommendation(
      await buildDailyHomeRecommendation(savedProfile, wardrobeItems, savedLooks)
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const openDailyRecommendation = () => {
    if (!dailyRecommendation) return;

    if (dailyRecommendation.source === 'planner' && dailyRecommendation.look) {
      router.push(`/shell/planner?lookId=${(dailyRecommendation.look as any).id}`);
      return;
    }

    if (dailyRecommendation.source === 'saved-fallback' && dailyRecommendation.look) {
      router.push('/saved');
      return;
    }

    router.push({
      pathname: '/outfit',
      params: {
        occasion: dailyRecommendation.occasion,
        weatherBand: dailyRecommendation.weatherBand,
        precipitation: dailyRecommendation.precipitation,
      },
    });
  };

  const primaryLabel =
    dailyRecommendation?.source === 'planner'
      ? "Planner'ı Aç"
      : dailyRecommendation?.source === 'saved-fallback'
      ? 'Kaydedilenleri Aç'
      : 'Bugünün Önerisini Aç';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 80,
          paddingBottom: 40,
        }}
      >
        <Text
          style={{
            fontSize: 34,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 10,
          }}
        >
          Combinia
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Bugünün havasına, planına ve gardırobuna göre tek net karar.
        </Text>

        {profile ? (
          <>
            {!!dailyRecommendation && (
              <DailyRecommendationCard
                recommendation={dailyRecommendation}
                onPrimaryPress={openDailyRecommendation}
                primaryLabel={primaryLabel}
              />
            )}

            <HomeAction
              title="Bugün Ne Giymeliyim?"
              detail="Mod, hava ve dolap durumuna göre yeni bir görünüm üret."
              primary
              onPress={() => router.push('/outfit/occasion')}
            />

            <HomeAction
              title={wardrobeCount ? 'Gardıroba Ürün Ekle' : 'İlk Ürünü Ekle'}
              detail="Yeni parça temiz PNG onayından geçmeden kaydedilmez."
              onPress={() => router.push('/wardrobe/add')}
            />

            {!!cleanupCount && (
              <HomeAction
                title={`${cleanupCount} görsel temizlenmeli`}
                detail="Gardırop kalitesini Closet içinde toparla."
                onPress={() => router.push('/shell/closet')}
              />
            )}
          </>
        ) : (
          <HomeAction
            title="Stil Profilini Oluştur"
            detail="Günlük karar ekranı için önce kısa profilini tamamla."
            primary
            onPress={() => router.push('/onboarding/gender')}
          />
        )}
      </ScrollView>
    </View>
  );
}
