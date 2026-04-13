import { Text, View } from 'react-native';
import ProductImageFrame from './ProductImageFrame';
import colors from '../theme/colors';
import { SavedLook } from '../lib/savedLooksStorage';

export default function ShareLookCard({ look }: { look: SavedLook }) {
  const pieces = [
    look.pieces.top,
    look.pieces.bottom,
    look.pieces.dress,
    look.pieces.suit,
    look.pieces.jacket,
    look.pieces.outerwear,
    look.pieces.shoe,
    look.pieces.bag,
    look.pieces.accessory,
  ].filter(Boolean) as any[];

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 26,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {look.title}
      </Text>

      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: colors.muted,
          marginBottom: 12,
        }}
      >
        {look.occasion}
      </Text>

      {!!look.tryOnPreviewUri ? (
        <ProductImageFrame
          uri={look.tryOnPreviewUri}
          category="try-on"
          variant="hero"
          style={{ marginBottom: 14 }}
        />
      ) : (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 14,
          }}
        >
          {pieces.slice(0, 6).map((item, index) => (
            <ProductImageFrame
              key={index}
              uri={item.processedImageUri || item.imageUri}
              category={item.category}
              style={{
                width: '31%',
                marginRight: '3%',
                marginBottom: 10,
              }}
            />
          ))}
        </View>
      )}

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
        }}
      >
        {look.explanation}
      </Text>
    </View>
  );
}
