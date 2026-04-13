import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { getOnboardingProfile } from '../../lib/storage';
import { getWardrobeItems } from '../../lib/wardrobeStorage';
import { getSavedLooks } from '../../lib/savedLooksStorage';
import { buildConciergeBriefing, ConciergeBriefing } from '../../lib/conciergeEngine';
import ConciergeHeroCard from '../../components/ConciergeHeroCard';
import ConciergePriorityCard from '../../components/ConciergePriorityCard';
import DailyRecommendationCard from '../../components/DailyRecommendationCard';
import ActionCenterEntryCard from '../../components/ActionCenterEntryCard';

export default function ConciergeScreen() {
  const [briefing, setBriefing] = useState<ConciergeBriefing | null>(null);

  const load = useCallback(async () => {
    const [profile, wardrobeItems, savedLooks] = await Promise.all([
      getOnboardingProfile(),
      getWardrobeItems(),
      getSavedLooks(),
    ]);

    const nextBriefing = await buildConciergeBriefing(
      profile,
      wardrobeItems,
      savedLooks
    );

    setBriefing(nextBriefing);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!briefing) {
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
        <Text style={{ color: colors.textSecondary }}>
          Stil asistanı hazırlanıyor...
        </Text>
      </View>
    );
  }

  const openDailyRecommendation = () => {
    if (!briefing.dailyRecommendation) return;

    if (briefing.dailyRecommendation.source === 'planner' && briefing.dailyRecommendation.look) {
      router.push({
        pathname: '/shell/planner',
        params: {
          lookId: (briefing.dailyRecommendation.look as any).id,
        },
      });
      return;
    }

    if (briefing.dailyRecommendation.source === 'saved-fallback') {
      router.push('/saved');
      return;
    }

    router.push({
      pathname: '/outfit',
      params: {
        occasion: briefing.dailyRecommendation.occasion,
        weatherBand: briefing.dailyRecommendation.weatherBand,
        precipitation: briefing.dailyRecommendation.precipitation,
      },
    });
  };

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
            fontSize: 30,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.5,
            marginBottom: 10,
          }}
        >
          Stil Asistanı
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Bugün için sana özel günlük stil brifingi.
        </Text>

        <ConciergeHeroCard briefing={briefing} />

        {!!briefing.dailyRecommendation && (
          <DailyRecommendationCard
            recommendation={briefing.dailyRecommendation}
            onPrimaryPress={openDailyRecommendation}
            primaryLabel="Günlük Öneriyi Aç"
          />
        )}

        <ActionCenterEntryCard onPress={() => router.push('/action-center')} />

        {briefing.priorities.map((priority) => (
          <ConciergePriorityCard
            key={priority.id}
            priority={priority}
            onPress={() => router.push(priority.route as any)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
