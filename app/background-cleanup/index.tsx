import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { getWardrobeItems } from '../../lib/wardrobeStorage';
import { WardrobeItem } from '../../types/wardrobe';
import {
  bulkReprocessWardrobeImages,
  reprocessWardrobeItemById,
  scanMissingCleanupQueue,
} from '../../lib/backgroundProcessing';
import BackgroundPreviewCard from '../../components/BackgroundPreviewCard';
import { analyzeImageQuality, ImageQualityPriority } from '../../lib/imageQualityAudit';
import ImageQualityHealthCard from '../../components/ImageQualityHealthCard';
import ImageCleanupPriorityCard from '../../components/ImageCleanupPriorityCard';
import { getSavedLooks } from '../../lib/savedLooksStorage';
import { getWeeklyPlan } from '../../lib/plannerStorage';
import {
  buildCleanupPriorityGroups,
  CleanupPriorityGroup,
} from '../../lib/cleanupPriorityEngine';
import CleanupPriorityGroupCard from '../../components/CleanupPriorityGroupCard';
import {
  CleanupStatusRecord,
  getCleanupStatusList,
} from '../../lib/backgroundStatusStorage';
import CleanupRecentActivityCard from '../../components/CleanupRecentActivityCard';
import {
  buildVisualPriorityAudit,
  VisualPriorityAudit,
  VisualPriorityItem,
} from '../../lib/visualPriorityEngine';
import VisualPriorityCard from '../../components/VisualPriorityCard';
import VisualPriorityItemCard from '../../components/VisualPriorityItemCard';
import {
  clearCleanupQueue,
  CleanupQueueItem,
  getCleanupQueue,
} from '../../lib/cleanupQueueStorage';
import CleanupQueueCard from '../../components/CleanupQueueCard';

export default function BackgroundCleanupScreen() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [priorityGroups, setPriorityGroups] = useState<CleanupPriorityGroup[]>([]);
  const [cleanupRecords, setCleanupRecords] = useState<CleanupStatusRecord[]>([]);
  const [visualAudit, setVisualAudit] = useState<VisualPriorityAudit | null>(null);
  const [cleanupQueue, setCleanupQueue] = useState<CleanupQueueItem[]>([]);

  const load = useCallback(async () => {
    const [wardrobeItems, savedLooks, weeklyPlan, records, queue] = await Promise.all([
      getWardrobeItems(),
      getSavedLooks(),
      getWeeklyPlan(),
      getCleanupStatusList(),
      getCleanupQueue(),
    ]);

    setItems(wardrobeItems);
    setCleanupRecords(records);
    setCleanupQueue(queue);
    setPriorityGroups(
      buildCleanupPriorityGroups({
        wardrobeItems,
        savedLooks,
        weeklyPlan,
      })
    );
    setVisualAudit(
      buildVisualPriorityAudit({
        wardrobeItems,
        savedLooks,
        weeklyPlan,
      })
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const audit = useMemo(() => analyzeImageQuality(items), [items]);

  const nameById = useMemo(() => {
    return new Map(items.map((item) => [item.id, item.name]));
  }, [items]);

  const handleScanQueue = async () => {
    setBusy(true);
    setStatusText('Ham kalan parçalar kuyruk için taranıyor...');

    try {
      const count = await scanMissingCleanupQueue();
      setStatusText(`${count} parça yeniden deneme kuyruğuna eklendi.`);
      await load();
    } catch {
      setStatusText('Tarama sırasında hata oluştu.');
    } finally {
      setBusy(false);
    }
  };

  const handleProcessQueue = async () => {
    const itemIds = cleanupQueue.map((item) => item.itemId);
    if (!itemIds.length) return;

    setBusy(true);
    setStatusText('Yeniden deneme kuyruğu çalıştırılıyor...');

    try {
      const result = await bulkReprocessWardrobeImages({ itemIds });
      setStatusText(`${result.processedCount} kuyruk parçası işlendi, ${result.failedCount} parça başarısız.`);
      await load();
    } catch {
      setStatusText('Kuyruk çalıştırılırken hata oluştu.');
    } finally {
      setBusy(false);
    }
  };

  const handleClearQueue = async () => {
    setBusy(true);
    setStatusText('Kuyruk temizleniyor...');

    try {
      await clearCleanupQueue();
      setStatusText('Yeniden deneme kuyruğu temizlendi.');
      await load();
    } catch {
      setStatusText('Kuyruk temizlenirken hata oluştu.');
    } finally {
      setBusy(false);
    }
  };

  const handleProcessMissing = async () => {
    setBusy(true);
    setStatusText('Eksik görseller temizleniyor...');

    try {
      const result = await bulkReprocessWardrobeImages({ onlyMissing: true });
      setStatusText(`${result.processedCount} parça işlendi, ${result.failedCount} parça başarısız.`);
      await load();
    } catch {
      setStatusText('İşlem sırasında hata oluştu.');
    } finally {
      setBusy(false);
    }
  };

  const handleProcessAll = async () => {
    setBusy(true);
    setStatusText('Tüm görseller yeniden işleniyor...');

    try {
      const result = await bulkReprocessWardrobeImages({ force: true });
      setStatusText(`${result.processedCount} parça işlendi, ${result.failedCount} parça başarısız.`);
      await load();
    } catch {
      setStatusText('İşlem sırasında hata oluştu.');
    } finally {
      setBusy(false);
    }
  };

  const handlePriorityBatch = async () => {
    const itemIds = audit.priorityItems.map((item) => item.itemId);
    if (!itemIds.length) return;

    setBusy(true);
    setStatusText('Öncelikli parçalar temizleniyor...');

    try {
      const result = await bulkReprocessWardrobeImages({ itemIds });
      setStatusText(`${result.processedCount} öncelikli parça işlendi, ${result.failedCount} parça başarısız.`);
      await load();
    } catch {
      setStatusText('İşlem sırasında hata oluştu.');
    } finally {
      setBusy(false);
    }
  };

  const handleOptimizeVisibleSurfaces = async () => {
    const itemIds = (visualAudit?.topItems || []).slice(0, 8).map((item) => item.itemId);
    if (!itemIds.length) return;

    setBusy(true);
    setStatusText('Uygulamada en görünür ham parçalar optimize ediliyor...');

    try {
      const result = await bulkReprocessWardrobeImages({ itemIds });
      setStatusText(`${result.processedCount} görünür parça işlendi, ${result.failedCount} parça başarısız.`);
      await load();
    } catch {
      setStatusText('İşlem sırasında hata oluştu.');
    } finally {
      setBusy(false);
    }
  };

  const handleGroupProcess = async (group: CleanupPriorityGroup) => {
    if (!group.itemIds.length) return;

    setBusy(true);
    setStatusText(`${group.title} işleniyor...`);

    try {
      const result = await bulkReprocessWardrobeImages({ itemIds: group.itemIds });
      setStatusText(`${result.processedCount} parça işlendi, ${result.failedCount} parça başarısız.`);
      await load();
    } catch {
      setStatusText('İşlem sırasında hata oluştu.');
    } finally {
      setBusy(false);
    }
  };

  const handleSingle = async (item: ImageQualityPriority | VisualPriorityItem) => {
    setBusy(true);
    setStatusText(`${item.name} yeniden işleniyor...`);

    try {
      await reprocessWardrobeItemById(item.itemId);
      setStatusText(`${item.name} yeniden işlendi.`);
      await load();
    } catch {
      Alert.alert('İşlem başarısız', 'Bu parçanın arka planı şu an temizlenemedi.');
    } finally {
      setBusy(false);
    }
  };

  const previewItems = items
    .filter((item) => audit.priorityItems.some((entry) => entry.itemId === item.id))
    .slice(0, 4);

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
          Arka Plan Temizleme
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 18,
          }}
        >
          Galeriden eklediğin parçaların arka planını toplu şekilde temizleyebilir ve en kritik ham görselleri önceleyebilirsin.
        </Text>

        <ImageQualityHealthCard audit={audit} />
        <CleanupRecentActivityCard records={cleanupRecords} nameById={nameById} />
        <CleanupQueueCard
          queue={cleanupQueue}
          nameById={nameById}
          onProcessQueue={handleProcessQueue}
          onClearQueue={handleClearQueue}
        />
        {!!visualAudit && (
          <VisualPriorityCard
            audit={visualAudit}
            onOptimize={handleOptimizeVisibleSurfaces}
          />
        )}

        {!!statusText && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.borderSoft,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 13, lineHeight: 20, color: colors.muted }}>
              {statusText}
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleScanQueue}
          disabled={busy}
          style={{
            backgroundColor: busy ? colors.disabled : '#F3EFE9',
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: busy ? '#fff' : colors.text, fontWeight: '700' }}>
            Ham Görselleri Kuyruğa Tara
          </Text>
        </Pressable>

        {!!priorityGroups.length && (
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Akıllı Öncelik Grupları
            </Text>

            {priorityGroups.map((group) => (
              <CleanupPriorityGroupCard
                key={group.id}
                group={group}
                onProcess={() => handleGroupProcess(group)}
              />
            ))}
          </>
        )}

        {!!visualAudit?.topItems?.length && (
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              En Görünür Ham Parçalar
            </Text>

            {visualAudit.topItems.slice(0, 6).map((item) => (
              <VisualPriorityItemCard
                key={item.itemId}
                item={item}
                onProcess={() => handleSingle(item)}
              />
            ))}
          </>
        )}

        <Pressable
          onPress={handlePriorityBatch}
          disabled={busy || !audit.priorityItems.length}
          style={{
            backgroundColor: busy || !audit.priorityItems.length ? colors.disabled : colors.primary,
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            Öncelikli Parçaları Temizle
          </Text>
        </Pressable>

        <Pressable
          onPress={handleProcessMissing}
          disabled={busy || !audit.rawCount}
          style={{
            backgroundColor: busy || !audit.rawCount ? colors.disabled : '#F3EFE9',
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: busy || !audit.rawCount ? '#fff' : colors.text, fontWeight: '700' }}>
            Eksikleri Temizle
          </Text>
        </Pressable>

        <Pressable
          onPress={handleProcessAll}
          disabled={busy || !items.length}
          style={{
            backgroundColor: busy || !items.length ? colors.disabled : '#F3EFE9',
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <Text style={{ color: busy || !items.length ? '#fff' : colors.text, fontWeight: '700' }}>
            Tümünü Yeniden İşle
          </Text>
        </Pressable>

        {!!audit.priorityItems.length && (
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Öncelikli Temizleme Listesi
            </Text>

            {audit.priorityItems.map((item) => (
              <ImageCleanupPriorityCard
                key={item.itemId}
                item={item}
                onPress={() => handleSingle(item)}
              />
            ))}
          </>
        )}

        {!!previewItems.length && (
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Önizleme
            </Text>

            {previewItems.map((item) => (
              <BackgroundPreviewCard
                key={item.id}
                originalUri={item.imageUri}
                processedUri={item.processedImageUri || item.imageUri}
                title={item.name}
                caption={
                  !item.processedImageUri || item.processedImageUri === item.imageUri
                    ? 'Bu parça hâlâ ham görselle duruyor olabilir.'
                    : 'Bu parça temizlenmiş görselle kullanılıyor.'
                }
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
