import { Image, Text, View } from 'react-native';
import colors from '../theme/colors';
import { SavedLook } from '../lib/savedLooksStorage';

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
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
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

      <View style={{ flexDirection: 'row' }}>
        {pieces.slice(0, 3).map((item, index) => (
          <View
            key={index}
            style={{
              width: 88,
              height: 88,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#F6F2EC',
              marginRight: 10,
            }}
          >
            <Image
              source={{ uri: item.imageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
        ))}
      </View>
    </View>
  );
}
