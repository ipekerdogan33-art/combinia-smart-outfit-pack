import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { ShoppingListItem } from '../lib/shoppingListStorage';

export default function ShoppingListItemCard({
  item,
  onToggle,
  onRemove,
  onOpenAdd,
}: {
  item: ShoppingListItem;
  onToggle: () => void;
  onRemove: () => void;
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
        opacity: item.purchased ? 0.75 : 1,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 6,
          textDecorationLine: item.purchased ? 'line-through' : 'none',
        }}
      >
        {item.title}
      </Text>

      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: item.priority === 'Yüksek' ? '#B00020' : '#8B6A00',
          marginBottom: 8,
        }}
      >
        {item.category} • {item.subcategory}
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 21,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        {item.description}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Pressable
          onPress={onToggle}
          style={{
            backgroundColor: item.purchased ? '#EAF6ED' : '#F3EFE9',
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 14,
            alignItems: 'center',
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: item.purchased ? '#1D7A35' : colors.text,
              fontSize: 13,
              fontWeight: '700',
            }}
          >
            {item.purchased ? 'Eklendi' : 'Aldım'}
          </Text>
        </Pressable>

        <Pressable
          onPress={onOpenAdd}
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
            Ürün Ekle
          </Text>
        </Pressable>

        <Pressable
          onPress={onRemove}
          style={{
            backgroundColor: '#F3ECE4',
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 14,
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text style={{ color: '#B00020', fontSize: 13, fontWeight: '700' }}>
            Sil
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
