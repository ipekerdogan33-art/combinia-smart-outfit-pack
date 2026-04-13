import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { SavedLook } from '../lib/savedLooksStorage';
import ProductImageFrame from './ProductImageFrame';

export default function SavedLookMiniCard({ look }: { look: SavedLook }) {
  const pieces = [
    look.pieces.top,
    look.pieces.bottom,
    look.pieces.dress,
    look.pieces.suit,
    look.pieces.shoe,
    look.pieces.outerwear,
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
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
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
        Son Kaydedilen Kombin
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 10,
        }}
      >
        {look.title}
      </Text>

      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: colors.muted,
          marginBottom: 14,
        }}
      >
        {look.occasion}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {pieces.slice(0, 3).map((item, index) => (
          <ProductImageFrame
            key={`${item.id || index}-${index}`}
            uri={item.processedImageUri || item.imageUri}
            category={item.category}
            frameWidth={88}
            style={{ marginRight: 10 }}
          />
        ))}
      </View>
    </View>
  );
}
