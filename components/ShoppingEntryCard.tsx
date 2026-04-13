import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';

export default function ShoppingEntryCard({
  onPress,
}: {
  onPress: () => void;
}) {
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
        Alışveriş Listesi
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        Eksik parçaları tek yerde topla, sonra doğrudan ürün ekleme akışına geç.
      </Text>

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
          Listeyi Aç
        </Text>
      </View>
    </Pressable>
  );
}
