import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import {
  bulkSetWardrobeItemStatus,
  getWardrobeItems,
  setWardrobeItemStatus,
} from '../../lib/wardrobeStorage';
import { getWearHistory, WearHistoryEntry } from '../../lib/wearHistoryStorage';
import { WardrobeItem } from '../../types/wardrobe';
import WardrobeHealthCard from '../../components/WardrobeHealthCard';
import CareItemCard from '../../components/CareItemCard';
import WearHistoryCard from '../../components/WearHistoryCard';
import { getWeeklyPlan } from '../../lib/plannerStorage';
import { getSavedLooks } from '../../lib/savedLooksStorage';
import { analyzePlannerRotation, PlannerRotationInsights } from '../../lib/plannerRotation';
import CareForecastCard from '../../components/CareForecastCard';

export default function CareScreen() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [history, setHistory] = useState<WearHistoryEntry[]>([]);
  const [rotationInsights, setRotationInsights] = useState<PlannerRotationInsights | null>(null);

  const load = useCallback(async () => {
    const [wardrobeItems, wearHistory, weeklyPlan, savedLooks] = await Promise.all([
      getWardrobeItems(),
      getWearHistory(),
      getWeeklyPlan(),
      getSavedLooks(),
    ]);

    setItems(wardrobeItems);
    setHistory(wearHistory);
    setRotationInsights(
      analyzePlannerRotation(weeklyPlan, savedLooks, wardrobeItems, wearHistory)
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const cleanItems = useMemo(() => items.filter((item) => (item.status || 'Temiz') === 'Temiz'), [items]);
  const dirtyItems = useMemo(() => items.filter((item) => item.status === 'Kirli'), [items]);
  const dryCleaningItems = useMemo(() => items.filter((item) => item.status === 'Kuru Temizlemede'), [items]);

  const itemNameMap = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((item) => map.set(item.id, item.name));
    return map;
  }, [items]);

  const handleMarkClean = async (id: string) => {
    await setWardrobeItemStatus(id, 'Temiz');
    load();
  };

  const handleSendDryCleaning = async (id: string) => {
    await setWardrobeItemStatus(id, 'Kuru Temizlemede');
    load();
  };

  const handleReturnFromDryCleaning = async (id: string) => {
    await setWardrobeItemStatus(id, 'Temiz');
    load();
  };

  const handleCleanAllDirty = async () => {
    if (!dirtyItems.length) return;
    await bulkSetWardrobeItemStatus(dirtyItems.map((item) => item.id), 'Temiz');
    load();
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
          Bakım Merkezi
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Kirli parçaları, kuru temizleme akışını ve giyim geçmişini burada yönetebilirsin.
        </Text>

        <WardrobeHealthCard
          totalCount={items.length}
          cleanCount={cleanItems.length}
          dirtyCount={dirtyItems.length}
          dryCleaningCount={dryCleaningItems.length}
        />

        {!!rotationInsights && <CareForecastCard insights={rotationInsights} />}

        {!!dirtyItems.length && (
          <Pressable
            onPress={handleCleanAllDirty}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 16,
              borderRadius: 18,
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
              Tüm Kirlileri Temiz Yap
            </Text>
          </Pressable>
        )}

        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 12,
          }}
        >
          Kirli Parçalar
        </Text>

        {!dirtyItems.length ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.borderSoft,
              padding: 18,
              marginBottom: 18,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}>
              Şu anda kirli parça görünmüyor.
            </Text>
          </View>
        ) : (
          dirtyItems.map((item) => (
            <CareItemCard
              key={item.id}
              item={item}
              primaryLabel="Temiz Yap"
              onPrimary={() => handleMarkClean(item.id)}
              secondaryLabel="Kuru Temizlemeye Gönder"
              onSecondary={() => handleSendDryCleaning(item.id)}
            />
          ))
        )}

        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 12,
          }}
        >
          Kuru Temizlemede
        </Text>

        {!dryCleaningItems.length ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.borderSoft,
              padding: 18,
              marginBottom: 18,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}>
              Şu anda kuru temizlemede parça yok.
            </Text>
          </View>
        ) : (
          dryCleaningItems.map((item) => (
            <CareItemCard
              key={item.id}
              item={item}
              primaryLabel="Temiz Olarak Geri Geldi"
              onPrimary={() => handleReturnFromDryCleaning(item.id)}
            />
          ))
        )}

        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 12,
          }}
        >
          Son Giyim Geçmişi
        </Text>

        {!history.length ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.borderSoft,
              padding: 18,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}>
              Henüz giyim geçmişi oluşmadı. Kombin ekranında “Bugün Bunu Giydim” kullandığında burada görünür.
            </Text>
          </View>
        ) : (
          history.slice(0, 10).map((entry) => (
            <WearHistoryCard
              key={entry.id}
              entry={entry}
              itemNames={entry.itemIds.map((id) => itemNameMap.get(id) || 'Parça')}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
