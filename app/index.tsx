import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import colors from '../theme/colors';
import { getOnboardingProfile } from '../lib/storage';
import { OnboardingData } from '../types/onboarding';
import { getSavedLooks } from '../lib/savedLooksStorage';
import { getWardrobeItems } from '../lib/wardrobeStorage';
import ShellScreenHeader from '../components/ShellScreenHeader';
import {
  buildDailyHomeRecommendation,
  DailyHomeRecommendation,
} from '../lib/homeRecommendation';
import { analyzeImageQuality } from '../lib/imageQualityAudit';

function MetaPill({ label }: { label: string }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.borderSoft,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
        {label}
      </Text>
    </View>
  );
}

function PrimaryCta({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
        {title}
      </Text>
    </Pressable>
  );
}

function SecondaryCta({
  title,
  detail,
  onPress,
}: {
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        borderRadius: 8,
        padding: 14,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 4 }}>
        {title}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 17 }}>
        {detail}
      </Text>
    </Pressable>
  );
}

function DailyDecisionPanel({
  recommendation,
  primaryLabel,
  onPrimaryPress,
}: {
  recommendation: DailyHomeRecommendation;
  primaryLabel: string;
  onPrimaryPress: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        padding: 20,
        marginBottom: 14,
      }}
    >
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
        BUGÜN
      </Text>

      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700', marginBottom: 10 }}>
        {recommendation.title}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        <MetaPill label={recommendation.todayLabel} />
        <MetaPill label={recommendation.city} />
        <MetaPill label={`${recommendation.weatherBand}°C`} />
        <MetaPill label={recommendation.occasion} />
      </View>

      <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 18 }}>
        {recommendation.reason}
      </Text>

      <PrimaryCta title={primaryLabel} onPress={onPrimaryPress} />
    </View>
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
        <ShellScreenHeader
          eyebrow="COMBINIA"
          title="Bugünün Kararı"
          description="Günün planı için tek net kombin yönü."
        />

        {profile ? (
          <>
            {!!dailyRecommendation && (
              <DailyDecisionPanel
                recommendation={dailyRecommendation}
                onPrimaryPress={openDailyRecommendation}
                primaryLabel={primaryLabel}
              />
            )}

            {!dailyRecommendation && (
              <PrimaryCta title="Bugün Ne Giymeliyim?" onPress={() => router.push('/outfit/occasion')} />
            )}

            <View style={{ flexDirection: 'row', marginTop: dailyRecommendation ? 4 : 16 }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <SecondaryCta
                  title={wardrobeCount ? 'Ürün Ekle' : 'İlk Ürünü Ekle'}
                  detail="Temiz PNG onayıyla"
                  onPress={() => router.push('/wardrobe/add')}
                />
              </View>

              <View style={{ flex: 1 }}>
                <SecondaryCta
                  title={cleanupCount ? 'Closet Uyarısı' : 'Closet'}
                  detail={cleanupCount ? `${cleanupCount} görsel bekliyor` : 'Dolabı düzenle'}
                  onPress={() => router.push('/shell/closet')}
                />
              </View>
            </View>
          </>
        ) : (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.borderSoft,
              padding: 18,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
              Stil Profilini Oluştur
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 18 }}>
              Günlük karar ekranı için kısa profilini tamamla.
            </Text>
            <PrimaryCta title="Başla" onPress={() => router.push('/onboarding/gender')} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
