import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { SmartShoppingSuggestion } from '../lib/shoppingSuggestions';

export default function ShoppingSuggestionCard({
  suggestion,
  onAdd,
  onOpenAdd,
}: {
  suggestion: SmartShoppingSuggestion;
  onAdd: () => void;
  onOpenAdd: () => void;
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
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 6,
        }}
      >
        {suggestion.title}
      </Text>

      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: suggestion.priority === 'Yüksek' ? '#B00020' : '#8B6A00',
          marginBottom: 8,
        }}
      >
        Öncelik: {suggestion.priority}
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 21,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        {suggestion.description}
      </Text>

      <View style={{ flexDirection: 'row' }}>
        <Pressable
          onPress={onAdd}
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
            Listeye Ekle
          </Text>
        </Pressable>

        <Pressable
          onPress={onOpenAdd}
          style={{
            flex: 1,
            backgroundColor: '#F3EFE9',
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
            Hemen Ekle
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
