import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { WardrobeItemStatus } from '../types/wardrobe';

export default function WardrobeItemStatusBadge({
  status,
}: {
  status: WardrobeItemStatus;
}) {
  const styleMap = {
    Temiz: {
      bg: '#EAF6ED',
      text: '#1D7A35',
    },
    Kirli: {
      bg: '#FBEAEA',
      text: '#B00020',
    },
    'Kuru Temizlemede': {
      bg: '#EEF2FB',
      text: '#355CBE',
    },
  } as const;

  const tone = styleMap[status];

  return (
    <View
      style={{
        backgroundColor: tone.bg,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: tone.text,
        }}
      >
        {status}
      </Text>
    </View>
  );
}
