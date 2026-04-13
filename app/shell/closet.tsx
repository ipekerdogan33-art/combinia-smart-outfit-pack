import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { getWardrobeItems } from '../../lib/wardrobeStorage';
import { WardrobeItem } from '../../types/wardrobe';
import WardrobeHealthCard from '../../components/WardrobeHealthCard';
import ImageQualityHealthCard from '../../components/ImageQualityHealthCard';
import MostWornItemsCard from '../../components/MostWornItemsCard';
import WardrobeInsightsCard from '../../components/WardrobeInsightsCard';
import { analyzeImageQuality } from '../../lib/imageQualityAudit';
import { analyzeWardrobe } from '../../lib/wardrobeInsights';
import { getWearHistory, WearHistoryEntry } from '../../lib/wearHistoryStorage';
import WearHistorySummaryCard from '../../components/WearHistorySummaryCard';

function SectionLabel({ title }: { title: string }) {
  return (
    <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700', marginBottom: 10 }}>
      {title}
    </Text>
  );
}

function ClosetCommandPanel({
  totalCount,
  cleanCount,
  favoriteCount,
}: {
  totalCount: number;
  cleanCount: number;
  favoriteCount: number;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        padding: 18,
        marginBottom: 22,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
        {totalCount} parça
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
        Temiz: {cleanCount} • Favori: {favoriteCount}
      </Text>

      <View style={{ flexDirection: 'row' }}>
        <Pressable
          onPress={() => router.push('/wardrobe/add')}
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: 8,
            paddingVertical: 14,
            alignItems: 'center',
            marginRight: 10,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Ürün Ekle</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/wardrobe')}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.borderSoft,
            borderRadius: 8,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>Gardırop</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ShellClosetScreen() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [latestWearEntry, setLatestWearEntry] = useState<WearHistoryEntry | null>(null);

  const load = useCallback(async () => {
    const [wardrobeItems, wearHistory] = await Promise.all([
      getWardrobeItems(),
      getWearHistory(),
    ]);

    setItems(wardrobeItems);
    setLatestWearEntry(wearHistory[0] || null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const cleanCount = items.filter((item) => (item.status || 'Temiz') === 'Temiz').length;
  const dirtyCount = items.filter((item) => item.status === 'Kirli').length;
  const dryCleaningCount = items.filter((item) => item.status === 'Kuru Temizlemede').length;
  const favoriteCount = items.filter((item) => item.isFavorite).length;
  const imageAudit = useMemo(() => analyzeImageQuality(items), [items]);
  const insights = useMemo(() => analyzeWardrobe(items), [items]);
  const latestWearItemNames = useMemo(() => {
    if (!latestWearEntry) return [];
    const nameMap = new Map(items.map((item) => [item.id, item.name]));
    return latestWearEntry.itemIds.map((id) => nameMap.get(id) || 'Parça');
  }, [items, latestWearEntry]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}>
        <Text style={{ fontSize: 30, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
          Closet
        </Text>

        <Text style={{ fontSize: 16, lineHeight: 23, color: colors.textSecondary, marginBottom: 22 }}>
          Ürün kalitesi, dolap sağlığı ve ekleme akışı.
        </Text>

        <ClosetCommandPanel
          totalCount={items.length}
          cleanCount={cleanCount}
          favoriteCount={favoriteCount}
        />

        <SectionLabel title="GÖRSEL KALİTE" />
        <ImageQualityHealthCard
          audit={imageAudit}
          onPress={() => router.push('/background-cleanup')}
        />

        <SectionLabel title="DOLAP DURUMU" />
        <WardrobeHealthCard
          totalCount={items.length}
          cleanCount={cleanCount}
          dirtyCount={dirtyCount}
          dryCleaningCount={dryCleaningCount}
        />

        <WardrobeInsightsCard insights={insights} />

        {!!latestWearEntry && (
          <>
            <SectionLabel title="KULLANIM" />
            <WearHistorySummaryCard
              entry={latestWearEntry}
              itemNames={latestWearItemNames}
            />
          </>
        )}

        {!!insights.mostWornItems.length && (
          <MostWornItemsCard items={insights.mostWornItems} />
        )}
      </ScrollView>
    </View>
  );
}
