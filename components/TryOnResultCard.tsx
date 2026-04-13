import { Text, View } from 'react-native';
import ProductImageFrame from './ProductImageFrame';
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
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
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

      <ProductImageFrame uri={uri} category="try-on" variant="hero" />
    </View>
  );
}
