import { Image, Text, View } from 'react-native';
import colors from '../theme/colors';

function Checkerboard() {
  const rows = 12;
  const cols = 12;
  const cell = 18;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }}
    >
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} style={{ flexDirection: 'row', height: cell }}>
          {Array.from({ length: cols }).map((__, col) => (
            <View
              key={`${row}-${col}`}
              style={{
                width: cell,
                height: cell,
                backgroundColor: (row + col) % 2 === 0 ? '#D9D9D9' : '#F1F1F1',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function TransparentPngPreviewCard({
  originalUri,
  processedUri,
  cleaned,
}: {
  originalUri: string;
  processedUri: string;
  cleaned: boolean;
}) {
  if (!originalUri) return null;

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
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        }}
      >
        PNG Önizleme
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 21,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        Sağ tarafta dama zemini üzerinden yalnızca ürün görünmelidir. Kapı, sandalye veya duvar kalıyorsa işlem doğru değildir.
      </Text>

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
              source={{ uri: originalUri }}
              style={{ width: '100%', height: 220 }}
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
            Temiz PNG
          </Text>

          <View
            style={{
              backgroundColor: '#F6F2EC',
              borderRadius: 18,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Checkerboard />
            <Image
              source={{ uri: processedUri || originalUri }}
              style={{ width: '100%', height: 220 }}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      <Text
        style={{
          fontSize: 13,
          lineHeight: 20,
          color: cleaned ? '#1D7A35' : colors.muted,
          marginTop: 12,
        }}
      >
        {cleaned
          ? 'Sadece ürün kaldıysa temiz PNG başarıyla üretildi.'
          : 'Henüz yalnızca ürün kalmadı. Kaydet butonu bu yüzden kapalı.'}
      </Text>
    </View>
  );
}
