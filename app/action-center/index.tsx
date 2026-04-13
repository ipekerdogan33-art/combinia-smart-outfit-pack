import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { buildActionCenterState, ActionCenterState, ActionCenterTask } from '../../lib/actionCenterEngine';
import { getWardrobeItems } from '../../lib/wardrobeStorage';
import { getWeeklyPlan } from '../../lib/plannerStorage';
import { getSavedLooks } from '../../lib/savedLooksStorage';
import { getWearHistory } from '../../lib/wearHistoryStorage';
import { analyzePlannerRotation } from '../../lib/plannerRotation';
import { addShoppingListItem } from '../../lib/shoppingListStorage';
import { buildShoppingScreenState } from '../../lib/shoppingSuggestions';
import ActionCenterSummaryCard from '../../components/ActionCenterSummaryCard';
import ActionTaskCard from '../../components/ActionTaskCard';
import ShellScreenHeader from '../../components/ShellScreenHeader';

function QuickLinkPanel() {
  const links = [
    { title: 'Alışveriş', detail: 'Eksik parçalar', route: '/shopping' },
    { title: 'Bakım', detail: 'Kirli ve kuru temizleme', route: '/care' },
    { title: 'Temiz PNG', detail: 'Görsel kalitesi', route: '/background-cleanup' },
  ];

  return (
    <View
      style={{
        marginBottom: 22,
      }}
    >
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
        HIZLI İŞLER
      </Text>

      {links.map((link, index) => (
        <Pressable
          key={link.route}
          onPress={() => router.push(link.route as any)}
          style={{
            paddingVertical: 13,
            borderTopWidth: index ? 1 : 0,
            borderTopColor: colors.borderSoft,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 3 }}>
            {link.title}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            {link.detail}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function ActionCenterScreen() {
  const [state, setState] = useState<ActionCenterState | null>(null);

  const load = useCallback(async () => {
    const [wardrobeItems, weeklyPlan, savedLooks, wearHistory] = await Promise.all([
      getWardrobeItems(),
      getWeeklyPlan(),
      getSavedLooks(),
      getWearHistory(),
    ]);

    const shoppingState = await buildShoppingScreenState(wardrobeItems);

    const rotationInsights = analyzePlannerRotation(
      weeklyPlan,
      savedLooks,
      wardrobeItems,
      wearHistory
    );

    const nextState = buildActionCenterState({
      wardrobeItems,
      weeklyPlan,
      savedLooks,
      shoppingList: shoppingState.shoppingList,
      smartSuggestions: shoppingState.smartSuggestions,
      rotationInsights,
    });

    setState(nextState);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handlePrimary = async (task: ActionCenterTask) => {
    if (task.shoppingPayload) {
      await addShoppingListItem({
        ...task.shoppingPayload,
        purchased: false,
        source: 'smart',
      });
      Alert.alert('Listeye eklendi', 'Öneri alışveriş listene eklendi.');
      load();
      return;
    }

    if (task.route) {
      router.push(task.route as any);
    }
  };

  const handleSecondary = (task: ActionCenterTask) => {
    if (task.secondaryRoute) {
      router.push(task.secondaryRoute as any);
    }
  };

  if (!state) {
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
          Aksiyon merkezi hazırlanıyor...
        </Text>
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
        <ShellScreenHeader
          eyebrow="ACTION CENTER"
          title="Öncelikler"
          description="Planner, bakım ve alışverişte dikkat isteyen işler."
        />

        <ActionCenterSummaryCard summary={state.summary} />

        <QuickLinkPanel />

        {state.tasks.map((task) => (
          <ActionTaskCard
            key={task.id}
            task={task}
            onPrimary={() => handlePrimary(task)}
            onSecondary={task.secondaryRoute ? () => handleSecondary(task) : undefined}
          />
        ))}
      </ScrollView>
    </View>
  );
}
