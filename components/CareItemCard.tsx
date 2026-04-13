import { Image, Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { WardrobeItem } from '../types/wardrobe';

export default function CareItemCard({
  item,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  item: WardrobeItem;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 14,
      }}
    >
      <View
        style={{
          backgroundColor: '#F6F2EC',
          borderRadius: 18,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <Image
          source={{ uri: item.processedImageUri || item.imageUri }}
          style={{ width: '100%', height: 220 }}
          resizeMode="contain"
        />
      </View>

      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
        {item.name}
      </Text>

      <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 2 }}>
        {item.category} • {item.subcategory}
      </Text>

      <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
        {item.status || 'Temiz'}
      </Text>

      <View style={{ flexDirection: 'row' }}>
        <Pressable
          onPress={onPrimary}
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
            marginRight: onSecondary ? 8 : 0,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
            {primaryLabel}
          </Text>
        </Pressable>

        {!!secondaryLabel && !!onSecondary && (
          <Pressable
            onPress={onSecondary}
            style={{
              flex: 1,
              backgroundColor: '#F3EFE9',
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
              {secondaryLabel}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
