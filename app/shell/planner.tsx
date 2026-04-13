import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { getSavedLooks, SavedLook } from '../../lib/savedLooksStorage';
import {
  clearPlannerDay,
  clearWeeklyPlan,
  getWeeklyPlan,
  setPlannerDayLook,
  setWeeklyPlanBatch,
} from '../../lib/plannerStorage';
import { PlannerDay, PLANNER_DAYS, WeeklyPlan } from '../../types/planner';
import PlannerDayCard from '../../components/PlannerDayCard';
import PlannerSummaryCard from '../../components/PlannerSummaryCard';
import { getUserSettings } from '../../lib/settingsStorage';
import { fetchWeeklyWeatherForCity, WeeklyWeatherDay } from '../../lib/weatherService';
import { getOutfitFeedbackState } from '../../lib/outfitFeedbackStorage';
import {
  buildAutoFillAssignments,
  buildWeeklyPlannerSuggestions,
  PlannerDaySuggestion,
} from '../../lib/plannerIntelligence';
import PlannerWeatherCard from '../../components/PlannerWeatherCard';
import PlannerSuggestionsCard from '../../components/PlannerSuggestionsCard';
import { getWearHistory } from '../../lib/wearHistoryStorage';
import { getWardrobeItems } from '../../lib/wardrobeStorage';
import { analyzePlannerRotation, PlannerRotationInsights } from '../../lib/plannerRotation';
import PlannerRotationCard from '../../components/PlannerRotationCard';
import PlannerWarningsCard from '../../components/PlannerWarningsCard';

export default function ShellPlannerScreen() {
  const { lookId } = useLocalSearchParams<{ lookId?: string }>();

  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [selectedLookId, setSelectedLookId] = useState<string | null>(null);
  const [city, setCity] = useState('İstanbul');
  const [weeklyWeather, setWeeklyWeather] = useState<WeeklyWeatherDay[]>([]);
  const [suggestions, setSuggestions] = useState<PlannerDaySuggestion[]>([]);
  const [rotationInsights, setRotationInsights] = useState<PlannerRotationInsights | null>(null);

  const load = useCallback(async () => {
    const [savedLooks, weeklyPlan, settings, feedbackState, wearHistory, wardrobeItems] = await Promise.all([
      getSavedLooks(),
      getWeeklyPlan(),
      getUserSettings(),
      getOutfitFeedbackState(),
      getWearHistory(),
      getWardrobeItems(),
    ]);

    setLooks(savedLooks);
    setPlan(weeklyPlan);
    setCity(settings.weatherCity || 'İstanbul');

    if (lookId && savedLooks.some((item) => item.id === lookId)) {
      setSelectedLookId(lookId);
    } else if (!selectedLookId && savedLooks.length) {
      setSelectedLookId(savedLooks[0].id);
    } else if (selectedLookId && savedLooks.some((item) => item.id === selectedLookId)) {
      setSelectedLookId(selectedLookId);
    } else if (savedLooks.length) {
      setSelectedLookId(savedLooks[0].id);
    }

    try {
      const forecast = await fetchWeeklyWeatherForCity(settings.weatherCity || 'İstanbul');
      setWeeklyWeather(forecast);
      setSuggestions(buildWeeklyPlannerSuggestions(savedLooks, forecast, feedbackState, weeklyPlan, wearHistory));
    } catch (error) {
      setWeeklyWeather([]);
      setSuggestions(buildWeeklyPlannerSuggestions(savedLooks, [], feedbackState, weeklyPlan, wearHistory));
    }

    setRotationInsights(
      analyzePlannerRotation(weeklyPlan, savedLooks, wardrobeItems, wearHistory)
    );
  }, [lookId, selectedLookId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const lookMap = useMemo(() => {
    const map = new Map<string, SavedLook>();
    looks.forEach((item) => map.set(item.id, item));
    return map;
  }, [looks]);

  const selectedLook = selectedLookId ? lookMap.get(selectedLookId) || null : null;
  const filledCount = plan ? Object.values(plan).filter(Boolean).length : 0;

  const handleAssign = async (day: PlannerDay) => {
    if (!selectedLookId) return;
    await setPlannerDayLook(day, selectedLookId);
    const weeklyPlan = await getWeeklyPlan();
    setPlan(weeklyPlan);
    load();
  };

  const handleAssignSuggested = async (day: string, lookId: string) => {
    await setPlannerDayLook(day as PlannerDay, lookId);
    const weeklyPlan = await getWeeklyPlan();
    setPlan(weeklyPlan);
    load();
  };

  const handleClearDay = async (day: PlannerDay) => {
    await clearPlannerDay(day);
    const weeklyPlan = await getWeeklyPlan();
    setPlan(weeklyPlan);
    load();
  };

  const handleClearWeek = async () => {
    await clearWeeklyPlan();
    const weeklyPlan = await getWeeklyPlan();
    setPlan(weeklyPlan);
    load();
  };

  const handleAutoFill = async () => {
    if (!plan) return;
    const assignments = buildAutoFillAssignments(suggestions, plan);
    const merged = await setWeeklyPlanBatch(assignments);
    setPlan(merged);
    load();
  };

  const todayIndex = new Date().getDay();
  const todayMap: Record<number, PlannerDay> = {
    1: 'Pazartesi',
    2: 'Salı',
    3: 'Çarşamba',
    4: 'Perşembe',
    5: 'Cuma',
    6: 'Cumartesi',
    0: 'Pazar',
  };
  const today = todayMap[todayIndex];

  const assignToday = async () => {
    if (!selectedLookId) return;
    await setPlannerDayLook(today, selectedLookId);
    const weeklyPlan = await getWeeklyPlan();
    setPlan(weeklyPlan);
    load();
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
          Planner
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Kaydettiğin görünümleri haftanın günlerine atayabilir, akıllı haftalık önerilerden yararlanabilirsin.
        </Text>

        {looks.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 22,
              padding: 18,
              borderWidth: 1,
              borderColor: colors.borderSoft,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}>
              Plan yapabilmek için önce kaydedilmiş kombin oluşturman gerekiyor.
            </Text>
          </View>
        ) : (
          <>
            <PlannerSummaryCard filledCount={filledCount} totalCount={PLANNER_DAYS.length} />
            <PlannerWeatherCard city={city} days={weeklyWeather} />
            {!!rotationInsights && <PlannerRotationCard insights={rotationInsights} />}
            {!!rotationInsights && <PlannerWarningsCard insights={rotationInsights} />}

            <PlannerSuggestionsCard
              suggestions={suggestions}
              onAssignDay={handleAssignSuggested}
              onAutoFill={handleAutoFill}
            />

            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Seçili görünüm
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
              {looks.map((look) => {
                const active = look.id === selectedLookId;
                return (
                  <Pressable
                    key={look.id}
                    onPress={() => setSelectedLookId(look.id)}
                    style={{
                      backgroundColor: active ? colors.primary : '#F3EFE9',
                      borderRadius: 18,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      marginRight: 10,
                      minWidth: 160,
                    }}
                  >
                    <Text
                      style={{
                        color: active ? '#fff' : colors.text,
                        fontSize: 14,
                        fontWeight: '700',
                        marginBottom: 4,
                      }}
                    >
                      {look.title}
                    </Text>
                    <Text
                      style={{
                        color: active ? '#F6F2EC' : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      {look.occasion}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {!!selectedLook && (
              <Pressable
                onPress={assignToday}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 16,
                  borderRadius: 18,
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                  Bugüne Ata
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleClearWeek}
              style={{
                backgroundColor: '#F3ECE4',
                paddingVertical: 16,
                borderRadius: 18,
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <Text style={{ color: '#B00020', fontSize: 14, fontWeight: '700' }}>
                Haftayı Temizle
              </Text>
            </Pressable>

            {PLANNER_DAYS.map((day) => (
              <PlannerDayCard
                key={day}
                day={day}
                selected={!!selectedLook}
                assignedLook={plan?.[day] ? lookMap.get(plan[day] as string) || null : null}
                onAssign={() => handleAssign(day)}
                onClear={() => handleClearDay(day)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
