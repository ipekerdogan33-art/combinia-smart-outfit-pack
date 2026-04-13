import { Pressable, Text, View } from 'react-native';
import ProductImageFrame from './ProductImageFrame';
import colors from '../theme/colors';
import { SavedLook } from '../lib/savedLooksStorage';

export default function LookQuickActionCard({
  look,
  onPlanner,
  onTryOn,
  onCommunity,
}: {
  look: SavedLook;
  onPlanner: () => void;
  onTryOn: () => void;
  onCommunity: () => void;
}) {
  const pieces = [
    look.pieces.top,
    look.pieces.bottom,
    look.pieces.dress,
    look.pieces.suit,
    look.pieces.shoe,
    look.pieces.outerwear,
    look.pieces.bag,
    look.pieces.accessory,
  ].filter(Boolean) as any[];

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 6,
        }}
      >
        {look.title}
      </Text>

      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: colors.muted,
          marginBottom: 10,
        }}
      >
        {look.occasion}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
        {pieces.slice(0, 3).map((item, index) => (
          <ProductImageFrame
            key={index}
            uri={item.processedImageUri || item.imageUri}
            category={item.category}
            frameWidth={84}
            style={{
              marginRight: 10,
            }}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Pressable
          onPress={onPlanner}
          style={{
            backgroundColor: '#F3EFE9',
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 14,
            alignItems: 'center',
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
            Planner
          </Text>
        </Pressable>

        <Pressable
          onPress={onTryOn}
          style={{
            backgroundColor: '#F3EFE9',
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 14,
            alignItems: 'center',
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
            Try-On
          </Text>
        </Pressable>

        <Pressable
          onPress={onCommunity}
          style={{
            backgroundColor: '#F3EFE9',
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 14,
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
            Community
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
