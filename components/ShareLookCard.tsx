import { Image, Text, View } from 'react-native';
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
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
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
        <View
          style={{
            backgroundColor: '#F6F2EC',
            borderRadius: 22,
            overflow: 'hidden',
            marginBottom: 14,
          }}
        >
          <Image
            source={{ uri: look.tryOnPreviewUri }}
            style={{ width: '100%', height: 560 }}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 14,
          }}
        >
          {pieces.slice(0, 6).map((item, index) => (
            <View
              key={index}
              style={{
                width: '31%',
                aspectRatio: 1,
                borderRadius: 16,
                overflow: 'hidden',
                backgroundColor: '#F6F2EC',
                marginRight: '3%',
                marginBottom: 10,
              }}
            >
              <Image
                source={{ uri: item.processedImageUri || item.imageUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
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
