import { Image, Text, View } from 'react-native';
import colors from '../theme/colors';

export default function BackgroundPreviewCard({
  originalUri,
  processedUri,
  title,
  caption,
}: {
  originalUri: string;
  processedUri: string;
  title?: string;
  caption?: string;
}) {
  if (!originalUri && !processedUri) return null;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 18,
      }}
    >
      {!!title && (
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
      )}

      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: colors.muted,
              marginBottom: 8,
            }}
          >
            Orijinal
          </Text>

          <View
            style={{
              backgroundColor: '#F6F2EC',
              borderRadius: 18,
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: originalUri || processedUri }}
              style={{ width: '100%', height: 200 }}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: colors.muted,
              marginBottom: 8,
            }}
          >
            Temizlenmiş
          </Text>

          <View
            style={{
              backgroundColor: '#F6F2EC',
              borderRadius: 18,
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: processedUri || originalUri }}
              style={{ width: '100%', height: 200 }}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {!!caption && (
        <Text
          style={{
            fontSize: 13,
            lineHeight: 20,
            color: colors.muted,
            marginTop: 12,
          }}
        >
          {caption}
        </Text>
      )}
    </View>
  );
}
