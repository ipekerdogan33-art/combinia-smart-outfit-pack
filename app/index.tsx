import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import colors from '../theme/colors';
import { clearOnboardingProfile, getOnboardingProfile } from '../lib/storage';
import { OnboardingData } from '../types/onboarding';
import ProfilePreviewCard from '../components/ProfilePreviewCard';
import { getSavedLooks, SavedLook } from '../lib/savedLooksStorage';
import { getPlanSummary } from '../lib/accessControl';
import { AppPlan } from '../types/access';
import PlanStatusCard from '../components/PlanStatusCard';
import { analyzeWardrobe, WardrobeInsights } from '../lib/wardrobeInsights';
import { getWardrobeItems } from '../lib/wardrobeStorage';
import FeaturedSavedLookCard from '../components/FeaturedSavedLookCard';
import WardrobeInsightsCard from '../components/WardrobeInsightsCard';
import MostWornItemsCard from '../components/MostWornItemsCard';
import { analyzeModeReadiness, ModeReadiness } from '../lib/modeReadiness';
import ModeReadinessCard from '../components/ModeReadinessCard';
import {
  deriveOutfitLearningInsights,
  getOutfitFeedbackState,
  OutfitLearningInsights,
} from '../lib/outfitFeedbackStorage';
import StyleLearningCard from '../components/StyleLearningCard';
import {
  buildDailyHomeRecommendation,
  DailyHomeRecommendation,
} from '../lib/homeRecommendation';
import DailyRecommendationCard from '../components/DailyRecommendationCard';
import ConciergeEntryCard from '../components/ConciergeEntryCard';
import ShoppingEntryCard from '../components/ShoppingEntryCard';
import CareEntryCard from '../components/CareEntryCard';
import ActionCenterEntryCard from '../components/ActionCenterEntryCard';
import BackgroundCleanupEntryCard from '../components/BackgroundCleanupEntryCard';
import WardrobeHealthCard from '../components/WardrobeHealthCard';
import { getWearHistory } from '../lib/wearHistoryStorage';
import WearHistorySummaryCard from '../components/WearHistorySummaryCard';
import { analyzeImageQuality } from '../lib/imageQualityAudit';
import ImageQualityHealthCard from '../components/ImageQualityHealthCard';

export default function Home() {
  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [latestSavedLook, setLatestSavedLook] = useState<SavedLook | null>(null);
  const [plan, setCurrentPlan] = useState<AppPlan>('free');
  const [remaining, setRemaining] = useState(0);
  const [limit, setLimit] = useState(3);
  const [insights, setInsights] = useState<WardrobeInsights | null>(null);
  const [modeReadiness, setModeReadiness] = useState<ModeReadiness[]>([]);
  const [learningInsights, setLearningInsights] = useState<OutfitLearningInsights | null>(null);
  const [dailyRecommendation, setDailyRecommendation] = useState<DailyHomeRecommendation | null>(null);
  const [healthCounts, setHealthCounts] = useState({
    total: 0,
    clean: 0,
    dirty: 0,
    dryCleaning: 0,
  });
  const [latestWearEntry, setLatestWearEntry] = useState<any | null>(null);
  const [latestWearItemNames, setLatestWearItemNames] = useState<string[]>([]);
  const [imageAudit, setImageAudit] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    const [savedProfile, savedLooks, summary, wardrobeItems, feedbackState, wearHistory] = await Promise.all([
      getOnboardingProfile(),
      getSavedLooks(),
      getPlanSummary(),
      getWardrobeItems(),
      getOutfitFeedbackState(),
      getWearHistory(),
    ]);

    setProfile(savedProfile);
    setLatestSavedLook(savedLooks[0] || null);
    setCurrentPlan(summary.plan);
    setRemaining(Number.isFinite(summary.remaining) ? summary.remaining : 999);
    setLimit(summary.limit);
    setInsights(analyzeWardrobe(wardrobeItems));
    setModeReadiness(analyzeModeReadiness(wardrobeItems));
    setLearningInsights(deriveOutfitLearningInsights(feedbackState, wardrobeItems));
    setDailyRecommendation(
      await buildDailyHomeRecommendation(savedProfile, wardrobeItems, savedLooks)
    );
    setImageAudit(analyzeImageQuality(wardrobeItems));

    setHealthCounts({
      total: wardrobeItems.length,
      clean: wardrobeItems.filter((item) => (item.status || 'Temiz') === 'Temiz').length,
      dirty: wardrobeItems.filter((item) => item.status === 'Kirli').length,
      dryCleaning: wardrobeItems.filter((item) => item.status === 'Kuru Temizlemede').length,
    });

    const latest = wearHistory[0] || null;
    setLatestWearEntry(latest);

    if (latest) {
      const nameMap = new Map(wardrobeItems.map((item) => [item.id, item.name]));
      setLatestWearItemNames(
        latest.itemIds.map((id: string) => nameMap.get(id) || 'Parça')
      );
    } else {
      setLatestWearItemNames([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleReset = async () => {
    await clearOnboardingProfile();
    setProfile(null);
  };

  const openDailyRecommendation = () => {
    if (!dailyRecommendation) return;

    if (dailyRecommendation.source === 'planner' && dailyRecommendation.look) {
      router.push(`/shell/planner?lookId=${(dailyRecommendation.look as any).id}`);
      return;
    }

    if (dailyRecommendation.source === 'saved-fallback' && dailyRecommendation.look) {
      router.push(`/saved`);
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
      ? 'Planner’ı Aç'
      : dailyRecommendation?.source === 'saved-fallback'
      ? 'Kaydedilenleri Aç'
      : 'Bugünün Önerisini Aç';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
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
            letterSpacing: -0.5,
            marginBottom: 12,
          }}
        >
          Combinia
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 14,
          }}
        >
          Gardırobuna, stiline ve sana özel kombinler oluşturan akıllı stil asistanı.
        </Text>

        <PlanStatusCard
          plan={plan}
          remaining={remaining}
          limit={limit}
          onPressManage={() => router.push('/paywall')}
        />

        {profile ? (
          <>
            {!!dailyRecommendation && (
              <DailyRecommendationCard
                recommendation={dailyRecommendation}
                onPrimaryPress={openDailyRecommendation}
                primaryLabel={primaryLabel}
              />
            )}

            <ConciergeEntryCard
              title="Günlük odak, hava, planner ve stil öğrenmesi tek ekranda birleştirildi."
              subtitle="Stil Asistanını Aç"
              onPress={() => router.push('/concierge')}
            />

            <ActionCenterEntryCard onPress={() => router.push('/action-center')} />
            <ShoppingEntryCard onPress={() => router.push('/shopping')} />
            <CareEntryCard onPress={() => router.push('/care')} />
            <BackgroundCleanupEntryCard onPress={() => router.push('/background-cleanup')} />
            {!!imageAudit && (
              <ImageQualityHealthCard
                audit={imageAudit}
                onPress={() => router.push('/background-cleanup')}
              />
            )}

            <WardrobeHealthCard
              totalCount={healthCounts.total}
              cleanCount={healthCounts.clean}
              dirtyCount={healthCounts.dirty}
              dryCleaningCount={healthCounts.dryCleaning}
            />

            <WearHistorySummaryCard
              entry={latestWearEntry}
              itemNames={latestWearItemNames}
            />

            <ProfilePreviewCard profile={profile} />

            {!!latestSavedLook && (
              <FeaturedSavedLookCard
                look={latestSavedLook}
                onPress={() => router.push('/saved')}
              />
            )}

            {!!modeReadiness.length && <ModeReadinessCard modes={modeReadiness} />}
            {!!learningInsights && <StyleLearningCard insights={learningInsights} />}

            {!!insights?.mostWornItems?.length && (
              <MostWornItemsCard items={insights.mostWornItems} />
            )}

            {!!insights && <WardrobeInsightsCard insights={insights} />}

            <Pressable
              onPress={() => router.push('/shell/closet')}
              style={{
                backgroundColor: '#F3EFE9',
                paddingVertical: 18,
                borderRadius: 18,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                Ürün Sekmelerini Aç
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/outfit/occasion')}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 18,
                borderRadius: 18,
                alignItems: 'center',
                marginBottom: 12,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                Bugün Ne Giymeliyim?
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/saved')}
              style={{
                backgroundColor: colors.surface,
                paddingVertical: 18,
                borderRadius: 18,
                alignItems: 'center',
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.borderSoft,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                Kaydedilen Kombinler
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/wardrobe')}
              style={{
                backgroundColor: colors.surface,
                paddingVertical: 18,
                borderRadius: 18,
                alignItems: 'center',
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.borderSoft,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                Gardıroba Git
              </Text>
            </Pressable>

            <Pressable
              onPress={handleReset}
              style={{
                backgroundColor: '#F3ECE4',
                paddingVertical: 18,
                borderRadius: 18,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                Profili Sıfırla
              </Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={() => router.push('/onboarding/gender')}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 18,
              borderRadius: 18,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
              Onboarding’e Başla
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
