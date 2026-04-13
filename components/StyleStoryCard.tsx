import { Text, View } from 'react-native';
import colors from '../theme/colors';

export default function StyleStoryCard({
  narrative,
}: {
  narrative: string;
}) {
  if (!narrative) return null;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 16,
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
        Stil Notu
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 24,
          color: colors.textSecondary,
        }}
      >
        {narrative}
      </Text>
    </View>
  );
}
