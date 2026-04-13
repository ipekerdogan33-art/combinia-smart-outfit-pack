import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { getSavedLooks, SavedLook } from '../../lib/savedLooksStorage';
import { getOnboardingProfile } from '../../lib/storage';
import { buildPremiumShareCaptions } from '../../lib/shareCaption';
import { calculateLookScore } from '../../lib/lookScoring';
import PremiumShareCard from '../../components/PremiumShareCard';
import LookScorePanel from '../../components/LookScorePanel';
import { buildStyleNarrative } from '../../lib/styleNarrative';
import { getOutfitFeedbackState, OutfitFeedbackState } from '../../lib/outfitFeedbackStorage';
import { OnboardingData } from '../../types/onboarding';

export default function ShareLookScreen() {
  const { lookId } = useLocalSearchParams<{ lookId?: string }>();
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [feedbackState, setFeedbackState] = useState<OutfitFeedbackState | null>(null);

  useEffect(() => {
    (async () => {
      const [data, currentProfile, currentFeedback] = await Promise.all([
        getSavedLooks(),
        getOnboardingProfile(),
        getOutfitFeedbackState(),
      ]);
      setLooks(data);
      setProfile(currentProfile);
      setFeedbackState(currentFeedback);
    })();
  }, []);

  const look = useMemo(
    () => looks.find((item) => item.id === lookId) || null,
    [looks, lookId]
  );

  const narrative = useMemo(
    () => (look && profile ? buildStyleNarrative(look, profile) : look?.explanation || ''),
    [look, profile]
  );

  const score = useMemo(
    () => (look ? calculateLookScore(look, feedbackState) : null),
    [look, feedbackState]
  );

  const captions = useMemo(
    () => (look ? buildPremiumShareCaptions(look, profile) : []),
    [look, profile]
  );

  const handleShare = async () => {
    if (!look || !captions.length) return;
    await Share.share({
      message: captions[0],
    });
  };

  if (!look || !score) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ fontSize: 18, color: colors.textSecondary }}>
          Paylaşım görünümü bulunamadı.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 10,
            letterSpacing: -0.5,
          }}
        >
          Premium Paylaşım Kartı
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 18,
          }}
        >
          Görünümünü daha editoryal bir sunumla paylaşabilirsin.
        </Text>

        <PremiumShareCard
          look={look}
          narrative={narrative}
          score={score}
        />

        <LookScorePanel breakdown={score} />

        {!!captions.length && (
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
              Hazır Paylaşım Metni
            </Text>

            {captions.map((caption, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#F7F2EB',
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 14, lineHeight: 22, color: colors.textSecondary }}>
                  {caption}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={handleShare}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
            Paylaşım Metnini Gönder
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={{
            backgroundColor: '#F3EFE9',
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
            Geri Dön
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
