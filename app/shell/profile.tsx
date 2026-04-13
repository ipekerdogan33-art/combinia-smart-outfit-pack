import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import colors from '../../theme/colors';
import { clearOnboardingProfile, getOnboardingProfile } from '../../lib/storage';
import { getPlanSummary } from '../../lib/accessControl';
import { OnboardingData } from '../../types/onboarding';
import { AppPlan } from '../../types/access';
import ProfilePreviewCard from '../../components/ProfilePreviewCard';
import PlanStatusCard from '../../components/PlanStatusCard';
import ShellSectionCard from '../../components/ShellSectionCard';
import { getUserSettings, updateUserSettings } from '../../lib/settingsStorage';
import { UserSettings } from '../../types/settings';
import { router } from 'expo-router';
import { fetchWeatherContextForCity, AutoWeatherContext } from '../../lib/weatherService';
import { getWardrobeItems } from '../../lib/wardrobeStorage';
import {
  deriveOutfitLearningInsights,
  getOutfitFeedbackState,
  OutfitLearningInsights,
} from '../../lib/outfitFeedbackStorage';
import StyleLearningCard from '../../components/StyleLearningCard';

function SettingToggleRow({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string;
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
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
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 12,
        }}
      >
        {label}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {values.map((value) => {
          const active = selected === value;
          return (
            <Pressable
              key={value}
              onPress={() => onSelect(value)}
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
                {value}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ShellProfileScreen() {
  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [plan, setPlan] = useState<AppPlan>('free');
  const [remaining, setRemaining] = useState(0);
  const [limit, setLimit] = useState(3);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [weatherPreview, setWeatherPreview] = useState<AutoWeatherContext | null>(null);
  const [cityInput, setCityInput] = useState('İstanbul');
  const [learningInsights, setLearningInsights] = useState<OutfitLearningInsights | null>(null);

  const load = useCallback(async () => {
    const [p, summary, userSettings, wardrobeItems, feedbackState] = await Promise.all([
      getOnboardingProfile(),
      getPlanSummary(),
      getUserSettings(),
      getWardrobeItems(),
      getOutfitFeedbackState(),
    ]);

    setProfile(p);
    setPlan(summary.plan);
    setRemaining(Number.isFinite(summary.remaining) ? summary.remaining : 999);
    setLimit(summary.limit);
    setSettings(userSettings);
    setCityInput(userSettings.weatherCity);
    setLearningInsights(deriveOutfitLearningInsights(feedbackState, wardrobeItems));

    if (userSettings.weatherCity) {
      try {
        const weather = await fetchWeatherContextForCity(userSettings.weatherCity);
        setWeatherPreview(weather);
      } catch (error) {
        setWeatherPreview(null);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const patchSettings = async (partial: Partial<UserSettings>) => {
    const updated = await updateUserSettings(partial);
    setSettings(updated);
  };

  const saveCity = async () => {
    const updated = await updateUserSettings({ weatherCity: cityInput });
    setSettings(updated);

    try {
      const weather = await fetchWeatherContextForCity(cityInput);
      setWeatherPreview(weather);
    } catch (error) {
      setWeatherPreview(null);
    }
  };

  const handleResetProfile = async () => {
    await clearOnboardingProfile();
    setProfile(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.5,
            marginBottom: 10,
          }}
        >
          Profile
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Profil, plan, ülke/dil ve try-on tercihleri burada yönetilir.
        </Text>

        <PlanStatusCard plan={plan} remaining={remaining} limit={limit} />

        {!!profile ? (
          <>
            <ProfilePreviewCard profile={profile} />
            {!!learningInsights && <StyleLearningCard insights={learningInsights} />}
          </>
        ) : (
          <ShellSectionCard
            title="Profil henüz hazır değil"
            description="Onboarding tamamlandığında burada renk sezonu ve stil profilin görünecek."
          />
        )}

        {!!settings && (
          <>
            <SettingToggleRow
              label="Dil"
              values={['TR', 'EN']}
              selected={settings.language}
              onSelect={(value) => patchSettings({ language: value as UserSettings['language'] })}
            />

            <SettingToggleRow
              label="Bölge"
              values={['TR', 'GLOBAL']}
              selected={settings.region}
              onSelect={(value) => patchSettings({ region: value as UserSettings['region'] })}
            />

            <SettingToggleRow
              label="Hava kullanımı"
              values={['AUTO', 'MANUAL']}
              selected={settings.weatherPreference}
              onSelect={(value) => patchSettings({ weatherPreference: value as UserSettings['weatherPreference'] })}
            />

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
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Hava şehri
              </Text>

              <TextInput
                value={cityInput}
                onChangeText={setCityInput}
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
                onPress={saveCity}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                  marginBottom: weatherPreview ? 12 : 0,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>
                  Şehri Kaydet
                </Text>
              </Pressable>

              {!!weatherPreview && (
                <View
                  style={{
                    backgroundColor: '#F7F2EB',
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
                    {weatherPreview.city}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
                    Sıcaklık bandı: {weatherPreview.weatherBand}°C
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
                    Yağış: {weatherPreview.precipitationState}
                  </Text>
                  <Text style={{ fontSize: 13, lineHeight: 20, color: colors.muted }}>
                    {weatherPreview.summary}
                  </Text>
                </View>
              )}
            </View>

            <SettingToggleRow
              label="Try-On tercihi"
              values={['MOCKUP', 'AVATAR']}
              selected={settings.tryOnPreference}
              onSelect={(value) => patchSettings({ tryOnPreference: value as UserSettings['tryOnPreference'] })}
            />
          </>
        )}

        <ShellSectionCard
          title="Avatar / Try-On"
          description="Mockup veya avatar tabanlı giydirme akışına buradan geçebilirsin."
          cta="Try-On Alanını Aç"
          onPress={() => router.push('/tryon')}
        />

        {!!profile && (
          <Pressable
            onPress={handleResetProfile}
            style={{
              backgroundColor: '#F3ECE4',
              paddingVertical: 16,
              borderRadius: 18,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>
              Profili Sıfırla
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
