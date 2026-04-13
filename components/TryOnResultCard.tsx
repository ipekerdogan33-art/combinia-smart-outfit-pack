import { Image, Text, View } from 'react-native';
import colors from '../theme/colors';

export default function TryOnResultCard({
  title,
  uri,
  description,
}: {
  title: string;
  uri: string;
  description?: string;
}) {
  if (!uri) return null;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
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
        {title}
      </Text>

      {!!description && (
        <Text
          style={{
            fontSize: 15,
            lineHeight: 22,
            color: colors.textSecondary,
            marginBottom: 12,
          }}
        >
          {description}
        </Text>
      )}

      <View
        style={{
          backgroundColor: '#F6F2EC',
          borderRadius: 20,
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri }}
          style={{ width: '100%', height: 520 }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
