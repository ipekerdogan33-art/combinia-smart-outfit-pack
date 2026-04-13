import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { getWardrobeItems } from '../../lib/wardrobeStorage';
import ShellSectionCard from '../../components/ShellSectionCard';
import { WardrobeItem } from '../../types/wardrobe';

export default function ShellClosetScreen() {
  const [items, setItems] = useState<WardrobeItem[]>([]);

  const load = useCallback(async () => {
    const data = await getWardrobeItems();
    setItems(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const cleanCount = items.filter((item) => (item.status || 'Temiz') === 'Temiz').length;
  const favoriteCount = items.filter((item) => item.isFavorite).length;

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
          Gardırobunun hızlı görünümü ve ana aksiyonları burada.
        </Text>

        <ShellSectionCard
          title={`Toplam ${items.length} parça`}
          description={`Temiz parça: ${cleanCount} • Favori parça: ${favoriteCount}`}
          cta="Gardırobu Aç"
          onPress={() => router.push('/wardrobe')}
        />

        <ShellSectionCard
          title="Yeni parça ekle"
          description="Arka planı kaldırma, algılama ve kategori seçimi akışına buradan gidebilirsin."
          cta="Ürün Ekle"
          onPress={() => router.push('/wardrobe/add')}
        />
      </ScrollView>
    </View>
  );
}
