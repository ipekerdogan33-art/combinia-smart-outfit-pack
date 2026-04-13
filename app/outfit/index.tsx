import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { getWardrobeItems, markOutfitAsWorn } from '../../lib/wardrobeStorage';
import { getOnboardingProfile } from '../../lib/storage';
import { generateSmartOutfits } from '../../lib/outfitEngine';
import { saveLook } from '../../lib/savedLooksStorage';
import { OnboardingData } from '../../types/onboarding';
import { OutfitRecommendation } from '../../types/outfit';
import OutfitSuggestionCard from '../../components/OutfitSuggestionCard';
import { getPlan } from '../../lib/accessControl';
import { OCCASIONS } from '../../constants/catalog';
import { Occasion, Precipitation, WeatherBand } from '../../types/catalog';
import { diagnoseOutfitFailure } from '../../lib/outfitDiagnostics';
import OutfitFailureHintsCard from '../../components/OutfitFailureHintsCard';
import { WardrobeItem } from '../../types/wardrobe';
import OutfitEngineInsightsCard from '../../components/OutfitEngineInsightsCard';
import {
  getOutfitFeedbackState,
  recordOutfitFeedback,
  rerankRecommendationsByFeedback,
  OutfitFeedbackState,
} from '../../lib/outfitFeedbackStorage';
import LookScorePanel from '../../components/LookScorePanel';
import StyleStoryCard from '../../components/StyleStoryCard';
import { calculateLookScore } from '../../lib/lookScoring';
import { buildStyleNarrative } from '../../lib/styleNarrative';

export default function OutfitScreen() {
  const { itemId, occasion, weatherBand, precipitation } = useLocalSearchParams<{
    itemId?: string;
    occasion?: Occasion;
    weatherBand?: WeatherBand;
    precipitation?: Precipitation;
  }>();

  const activeOccasion: Occasion = OCCASIONS.includes((occasion || '') as Occasion)
    ? (occasion as Occasion)
    : 'Günlük';

  const activeWeatherBand: WeatherBand =
    weatherBand === '0-10' ||
    weatherBand === '10-15' ||
    weatherBand === '15-20' ||
    weatherBand === '20-25' ||
    weatherBand === '25+'
      ? weatherBand
      : '15-20';

  const activePrecipitation: Precipitation =
    precipitation === 'Yağışlı' ? 'Yağışlı' : 'Kuru';

  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [feedbackState, setFeedbackState] = useState<OutfitFeedbackState | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState('');
  const [profile, setProfile] = useState<OnboardingData | null>(null);

  const loadOutfits = async () => {
    setLoading(true);

    const [wardrobeItems, currentProfile, currentFeedback] = await Promise.all([
      getWardrobeItems(),
      getOnboardingProfile() as Promise<OnboardingData | null>,
      getOutfitFeedbackState(),
    ]);

    setItems(wardrobeItems);
    setProfile(currentProfile);
    setFeedbackState(currentFeedback);

    if (!currentProfile) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    const result = generateSmartOutfits(
      wardrobeItems,
      currentProfile,
      activeOccasion,
      activeWeatherBand,
      activePrecipitation,
      itemId
    );

    const reranked = rerankRecommendationsByFeedback(result, currentFeedback);

    setRecommendations(reranked);
    setSelectedIndex(0);
    setLoading(false);
  };

  useEffect(() => {
    loadOutfits();
  }, [itemId, activeOccasion, activeWeatherBand, activePrecipitation]);

  const selected = useMemo(
    () => recommendations[selectedIndex] || null,
    [recommendations, selectedIndex]
  );

  const diagnosis = useMemo(
    () => diagnoseOutfitFailure(items, activeOccasion),
    [items, activeOccasion]
  );

  const lookScore = useMemo(
    () => (selected ? calculateLookScore(selected, feedbackState) : null),
    [selected, feedbackState]
  );

  const styleNarrative = useMemo(
    () => (selected && profile ? buildStyleNarrative(selected, profile) : ''),
    [selected, profile]
  );

  const handleSave = async () => {
    if (!selected) return;
    await saveLook(selected);
    router.push('/saved');
  };

  const handleRefresh = async () => {
    const plan = await getPlan();

    if (plan === 'free') {
      router.push({
        pathname: '/ad-break',
        params: {
          occasion: activeOccasion,
          weatherBand: activeWeatherBand,
          precipitation: activePrecipitation,
          itemId: itemId ?? '',
          reason: 'refresh',
        },
      });
      return;
    }

    loadOutfits();
  };

  const handleWoreThis = async () => {
    if (!selected) return;

    const pieces = Object.values(selected.pieces).filter(Boolean) as any[];
    const itemIds = pieces.map((item) => item.id);
    await markOutfitAsWorn(itemIds, {
      lookTitle: selected.title,
      occasion: selected.occasion,
      weatherBand: selected.weatherBand,
      precipitation: selected.precipitation,
    });
    router.replace('/');
  };

  const handleFeedback = async (value: 'like' | 'dislike') => {
    if (!selected) return;

    const nextState = await recordOutfitFeedback(selected, value);
    setFeedbackState(nextState);
    setRecommendations((prev) => rerankRecommendationsByFeedback(prev, nextState));
    setSelectedIndex(0);
    setFeedbackNotice(
      value === 'like'
        ? 'Bu tercihi kaydettim. Benzer kombinler daha çok öne çıkacak.'
        : 'Bu sinyali kaydettim. Benzer kombinleri daha az öne çıkaracağım.'
    );
  };

  if (loading) {
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
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
          Senin için kombin hazırlanıyor...
        </Text>
      </View>
    );
  }

  if (!selected) {
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
              fontSize: 28,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Kombin bulunamadı
          </Text>

          <Text
            style={{
              fontSize: 16,
              lineHeight: 24,
              color: colors.textSecondary,
              marginBottom: 18,
            }}
          >
            Şu bağlam için eşleşen parça sayısı yeterli değil ya da gerekli temel kategoriler eksik.
          </Text>

          <OutfitFailureHintsCard diagnosis={diagnosis} />

          <Pressable
            onPress={() => router.push('/wardrobe')}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 18,
              borderRadius: 18,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
              Gardıroba Git
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/')}
            style={{
              backgroundColor: '#F3EFE9',
              paddingVertical: 18,
              borderRadius: 18,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
              Ana Sayfaya Dön
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

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
          Senin İçin Kombin
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 14,
          }}
        >
          Rehberdeki mod şablonlarına ve kategori eşleşmelerine göre öneriler üretildi.
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 }}>
          {[activeOccasion, `${activeWeatherBand}°C`, activePrecipitation].map((chip) => (
            <View
              key={chip}
              style={{
                backgroundColor: '#F3EFE9',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
                {chip}
              </Text>
            </View>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 18 }}
        >
          {recommendations.map((item, index) => {
            const active = selectedIndex === index;

            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedIndex(index)}
                style={{
                  backgroundColor: active ? colors.primary : '#F3EFE9',
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    color: active ? '#fff' : colors.text,
                    fontWeight: '700',
                  }}
                >
                  {item.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <OutfitEngineInsightsCard recommendation={selected} />
        {!!styleNarrative && <StyleStoryCard narrative={styleNarrative} />}
        {!!lookScore && <LookScorePanel breakdown={lookScore} />}

        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Pressable
            onPress={() => handleFeedback('like')}
            style={{
              flex: 1,
              backgroundColor: '#EAF6ED',
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
              marginRight: 8,
            }}
          >
            <Text style={{ color: '#1D7A35', fontSize: 14, fontWeight: '700' }}>
              Beğendim
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleFeedback('dislike')}
            style={{
              flex: 1,
              backgroundColor: '#FBEAEA',
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#B00020', fontSize: 14, fontWeight: '700' }}>
              Bana Göre Değil
            </Text>
          </Pressable>
        </View>

        {!!feedbackNotice && (
          <Text
            style={{
              fontSize: 13,
              lineHeight: 20,
              color: colors.muted,
              marginBottom: 16,
            }}
          >
            {feedbackNotice}
          </Text>
        )}

        <OutfitSuggestionCard recommendation={selected} />

        <Pressable
          onPress={handleSave}
          style={{
            backgroundColor: colors.surface,
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.borderSoft,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
            Kombini Kaydet
          </Text>
        </Pressable>

        <Pressable
          onPress={handleWoreThis}
          style={{
            backgroundColor: '#F3EFE9',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
            Bugün Bunu Giydim
          </Text>
        </Pressable>

        <Pressable
          onPress={handleRefresh}
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
            Başka 3 Öneri Üret
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/wardrobe')}
          style={{
            backgroundColor: '#F3ECE4',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
            Gardıroba Dön
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
