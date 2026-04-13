import { Text, View } from 'react-native';
import colors from '../theme/colors';

export default function MetadataBadges({
  fabric,
  fit,
  pattern,
}: {
  fabric?: string;
  fit?: string;
  pattern?: string;
}) {
  const items = [fabric, fit, pattern].filter(Boolean) as string[];
  if (!items.length) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
      {items.map((item) => (
        <View
          key={item}
          style={{
            backgroundColor: '#F3EFE9',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}
