import { Image, Text, View } from 'react-native';
import colors from '../theme/colors';
import { WardrobeItem } from '../types/wardrobe';

export default function MostWornItemsCard({
  items,
}: {
  items: WardrobeItem[];
}) {
  if (!items.length) return null;

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
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        }}
      >
        En Çok Giyilenler
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        Son kullanım davranışına göre öne çıkan parçalar.
      </Text>

      {items.map((item) => (
        <View
          key={item.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F7F2EB',
            borderRadius: 16,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: 14,
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              marginRight: 12,
            }}
          >
            <Image
              source={{ uri: item.imageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 4,
              }}
            >
              {item.name}
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
              }}
            >
              {item.category} • {item.wearCount || 0} kez giyildi
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
