import { Text, View } from 'react-native';
import colors from '../theme/colors';

export default function ShellScreenHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <View style={{ marginBottom: 24 }}>
      {!!eyebrow && (
        <Text
          style={{
            color: colors.muted,
            fontSize: 12,
            fontWeight: '700',
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </Text>
      )}

      <Text
        style={{
          fontSize: 32,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
        }}
      >
        {description}
      </Text>
    </View>
  );
}
