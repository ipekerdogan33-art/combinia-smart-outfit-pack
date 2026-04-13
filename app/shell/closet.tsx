import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { getWardrobeItems } from '../../lib/wardrobeStorage';
import ShellSectionCard from '../../components/ShellSectionCard';
import { WardrobeItem } from '../../types/wardrobe';
import WardrobeHealthCard from '../../components/WardrobeHealthCard';
import ImageQualityHealthCard from '../../components/ImageQualityHealthCard';
import BackgroundCleanupEntryCard from '../../components/BackgroundCleanupEntryCard';
import MostWornItemsCard from '../../components/MostWornItemsCard';
import WardrobeInsightsCard from '../../components/WardrobeInsightsCard';
import { analyzeImageQuality } from '../../lib/imageQualityAudit';
import { analyzeWardrobe } from '../../lib/wardrobeInsights';
import { getWearHistory, WearHistoryEntry } from '../../lib/wearHistoryStorage';
import WearHistorySummaryCard from '../../components/WearHistorySummaryCard';

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
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 10,
          }}
        >
          Closet
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Ürün ekleme, temiz PNG kalitesi ve gardırop sağlığı burada.
        </Text>

        <ShellSectionCard
          title={`Toplam ${items.length} parça`}
          description={`Temiz parça: ${cleanCount} • Favori parça: ${favoriteCount}`}
          cta="Gardırobu Aç"
          onPress={() => router.push('/wardrobe')}
        />

        <ShellSectionCard
          title="Yeni ürün ekle"
          description="Fotoğraf önce ürün ayrıştırma onayından geçer; yalnızca ürün kalırsa kayıt açılır."
          cta="Ürün Ekle"
          onPress={() => router.push('/wardrobe/add')}
        />

        <ImageQualityHealthCard
          audit={imageAudit}
          onPress={() => router.push('/background-cleanup')}
        />

        <BackgroundCleanupEntryCard onPress={() => router.push('/background-cleanup')} />

        <WardrobeHealthCard
          totalCount={items.length}
          cleanCount={cleanCount}
          dirtyCount={dirtyCount}
          dryCleaningCount={dryCleaningCount}
        />

        <WearHistorySummaryCard
          entry={latestWearEntry}
          itemNames={latestWearItemNames}
        />

        {!!insights.mostWornItems.length && (
          <MostWornItemsCard items={insights.mostWornItems} />
        )}

        <WardrobeInsightsCard insights={insights} />
      </ScrollView>
    </View>
  );
}
