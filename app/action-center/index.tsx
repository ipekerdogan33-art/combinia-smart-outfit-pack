import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
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

export default function ActionCenterScreen() {
  const [state, setState] = useState<ActionCenterState | null>(null);

  const load = useCallback(async () => {
    const [wardrobeItems, weeklyPlan, savedLooks, wearHistory, shoppingState] = await Promise.all([
      getWardrobeItems(),
      getWeeklyPlan(),
      getSavedLooks(),
      getWearHistory(),
      (async () => buildShoppingScreenState(await getWardrobeItems()))(),
    ]);

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
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.5,
            marginBottom: 10,
          }}
        >
          Aksiyon Merkezi
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Planner, bakım merkezi ve alışveriş listesi arasında dikkat isteyen konuları burada topluyoruz.
        </Text>

        <ActionCenterSummaryCard summary={state.summary} />

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
