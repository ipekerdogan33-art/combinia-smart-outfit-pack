import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Image, Pressable, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { WardrobeItem } from '../../types/wardrobe';
import {
  cycleWardrobeItemStatus,
  deleteWardrobeItem,
  getWardrobeItems,
  toggleFavoriteWardrobeItem,
} from '../../lib/wardrobeStorage';
import WardrobeItemStatusBadge from '../../components/WardrobeItemStatusBadge';
import { PRIMARY_FILTERS } from '../../constants/catalog';
import MetadataBadges from '../../components/MetadataBadges';
import { reprocessWardrobeItemById } from '../../lib/backgroundProcessing';
import { CleanupStatusRecord, getCleanupStatusMap } from '../../lib/backgroundStatusStorage';
import CleanupStatusBadge from '../../components/CleanupStatusBadge';
import { applyManualProcessedImageToWardrobeItem } from '../../lib/manualCleanPng';

async function pickManualPngUri() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('permission-denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets?.length) return '';
  return result.assets[0].uri;
}

function OccasionChips({ occasions }: { occasions: string[] }) {
  if (!occasions.length) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
      {occasions.map((item) => (
        <View
          key={item}
          style={{
            backgroundColor: '#F3EFE9',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ItemCard({
  item,
  cleanupRecord,
  onDelete,
  onStyle,
  onToggleFavorite,
  onCycleStatus,
  onEdit,
  onReprocess,
  onManualPng,
}: {
  item: WardrobeItem;
  cleanupRecord?: CleanupStatusRecord | null;
  onDelete: (id: string) => void;
  onStyle: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCycleStatus: (id: string) => void;
  onEdit: (id: string) => void;
  onReprocess: (id: string) => void;
  onManualPng: (id: string) => void;
}) {
  const cleaned = !!item.processedImageUri && item.processedImageUri !== item.imageUri;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <View
        style={{
          backgroundColor: '#F6F2EC',
          borderRadius: 20,
          marginBottom: 12,
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: item.processedImageUri || item.imageUri }}
          style={{
            width: '100%',
            height: 220,
          }}
          resizeMode="contain"
        />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
        <WardrobeItemStatusBadge status={item.status || 'Temiz'} />
        <CleanupStatusBadge record={cleanupRecord} cleaned={cleaned} />

        {!!item.isFavorite && (
          <View
            style={{
              backgroundColor: '#FFF2C9',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#8B6A00' }}>
              Favori
            </Text>
          </View>
        )}

        <View
          style={{
            backgroundColor: '#F3EFE9',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
            {item.wearCount || 0} kez giyildi
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: 17,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 4,
        }}
      >
        {item.name}
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 2,
        }}
      >
        {item.category} • {item.subcategory}
      </Text>

      {!!item.color && (
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 10,
          }}
        >
          {item.color}
        </Text>
      )}

      <MetadataBadges
        fabric={item.fabric}
        fit={item.fit}
        pattern={item.pattern}
      />

      <OccasionChips occasions={item.occasions || []} />

      <Pressable
        onPress={() => onStyle(item.id)}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
          Bu Parçayla Kombin Yap
        </Text>
      </Pressable>

      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Pressable
          onPress={() => onEdit(item.id)}
          style={{
            flex: 1,
            backgroundColor: '#F3EFE9',
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
            Düzenle
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onReprocess(item.id)}
          style={{
            flex: 1,
            backgroundColor: '#F3EFE9',
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
            Otomatik Yenile
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Pressable
          onPress={() => onManualPng(item.id)}
          style={{
            flex: 1,
            backgroundColor: '#F3EFE9',
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
            Temiz PNG Yükle
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onToggleFavorite(item.id)}
          style={{
            flex: 1,
            backgroundColor: '#F3EFE9',
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
            {item.isFavorite ? 'Favoriden Çıkar' : 'Favori Yap'}
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Pressable
          onPress={() => onCycleStatus(item.id)}
          style={{
            flex: 1,
            backgroundColor: '#EEF2FB',
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <Text style={{ color: '#355CBE', fontSize: 13, fontWeight: '700' }}>
            Durumu Değiştir
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onDelete(item.id)}
          style={{
            flex: 1,
            backgroundColor: '#F3ECE4',
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#B00020', fontSize: 14, fontWeight: '700' }}>
            Sil
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function WardrobeScreen() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [cleanupMap, setCleanupMap] = useState<Record<string, CleanupStatusRecord>>({});
  const [filter, setFilter] = useState<string>('Tümü');

  const loadItems = useCallback(async () => {
    const [data, cleanup] = await Promise.all([
      getWardrobeItems(),
      getCleanupStatusMap(),
    ]);
    setItems(data);
    setCleanupMap(cleanup);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const handleDelete = async (itemId: string) => {
    await deleteWardrobeItem(itemId);
    loadItems();
  };

  const handleToggleFavorite = async (itemId: string) => {
    await toggleFavoriteWardrobeItem(itemId);
    loadItems();
  };

  const handleCycleStatus = async (itemId: string) => {
    await cycleWardrobeItemStatus(itemId);
    loadItems();
  };

  const handleReprocess = async (itemId: string) => {
    try {
      await reprocessWardrobeItemById(itemId);
    } catch {
      // silent fallback
    } finally {
      loadItems();
    }
  };

  const handleManualPng = async (itemId: string) => {
    try {
      const uri = await pickManualPngUri();
      if (!uri) return;

      await applyManualProcessedImageToWardrobeItem(itemId, uri);
      loadItems();
    } catch (error: any) {
      if (error?.message === 'permission-denied') {
        Alert.alert('İzin gerekli', 'PNG seçebilmek için galeri izni vermelisin.');
      } else {
        Alert.alert('Yükleme hatası', 'Temiz PNG yüklenemedi.');
      }
    }
  };

  const resolveFilter = (value: string) => {
    if (value === 'Tümü') return items;
    if (value === 'Favoriler') return items.filter((item) => item.isFavorite);
    if (value === 'Kirli') return items.filter((item) => item.status === 'Kirli');
    return items.filter((item) => item.category === value);
  };

  const visibleItems = resolveFilter(filter);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 24,
        paddingTop: 80,
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
        Gardırop
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: colors.textSecondary,
          marginBottom: 20,
        }}
      >
        Telefonunda temizlediğin PNG dosyasını doğrudan bir parçaya bağlayabilirsin.
      </Text>

      <Pressable
        onPress={() => router.push('/background-cleanup')}
        style={{
          backgroundColor: '#F3EFE9',
          paddingVertical: 16,
          borderRadius: 18,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>
          Arka Plan Temizleme Merkezini Aç
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/wardrobe/add')}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 18,
          borderRadius: 18,
          alignItems: 'center',
          marginBottom: 16,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
          Yeni Ürün Ekle
        </Text>
      </Pressable>

      <FlatList
        data={[...PRIMARY_FILTERS]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        style={{ marginBottom: 16, maxHeight: 52 }}
        renderItem={({ item }) => {
          const active = filter === item;
          return (
            <Pressable
              onPress={() => setFilter(item)}
              style={{
                backgroundColor: active ? colors.primary : '#F3EFE9',
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
                marginRight: 10,
              }}
            >
              <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700' }}>
                {item}
              </Text>
            </Pressable>
          );
        }}
      />

      {visibleItems.length === 0 ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.borderSoft,
            padding: 18,
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            Bu filtrede parça yok. Yeni ürün ekleyerek devam edebilirsin.
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              cleanupRecord={cleanupMap[item.id]}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onCycleStatus={handleCycleStatus}
              onReprocess={handleReprocess}
              onManualPng={handleManualPng}
              onEdit={(id) =>
                router.push({
                  pathname: '/wardrobe/edit',
                  params: { itemId: id },
                })
              }
              onStyle={(id) =>
                router.push({
                  pathname: '/outfit/occasion',
                  params: { itemId: id },
                })
              }
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      )}
    </View>
  );
}
