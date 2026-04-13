import { Image, Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { SavedLook } from '../lib/savedLooksStorage';

export default function FeaturedSavedLookCard({
  look,
  onPress,
}: {
  look: SavedLook;
  onPress: () => void;
}) {
  const pieces = [
    look.pieces.top,
    look.pieces.bottom,
    look.pieces.dress,
    look.pieces.suit,
    look.pieces.shoe,
    look.pieces.outerwear,
  ].filter(Boolean) as any[];

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        padding: 18,
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
        Öne Çıkan Görünüm
      </Text>

      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: colors.muted,
          marginBottom: 8,
        }}
      >
        {look.occasion}
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        {look.explanation}
      </Text>

      <View style={{ flexDirection: 'row', marginBottom: 14 }}>
        {pieces.slice(0, 3).map((item, index) => (
          <View
            key={index}
            style={{
              width: 92,
              height: 92,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#F6F2EC',
              marginRight: 10,
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

      <View
        style={{
          backgroundColor: '#F3EFE9',
          paddingVertical: 12,
          borderRadius: 14,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 14,
            fontWeight: '700',
          }}
        >
          Kaydedilen kombinleri aç
        </Text>
      </View>
    </Pressable>
  );
}
