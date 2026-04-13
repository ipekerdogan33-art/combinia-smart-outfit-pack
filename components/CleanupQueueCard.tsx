import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { CleanupQueueItem } from '../lib/cleanupQueueStorage';

export default function CleanupQueueCard({
  queue,
  nameById,
  onProcessQueue,
  onClearQueue,
}: {
  queue: CleanupQueueItem[];
  nameById: Map<string, string>;
  onProcessQueue: () => void;
  onClearQueue: () => void;
}) {
  if (!queue.length) return null;

  const sample = queue.slice(0, 5);

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
        Yeniden Deneme Kuyruğu
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        Temizlenemeyen veya ham kalan parçalar daha sonra toplu olarak yeniden denenebilir.
      </Text>

      {sample.map((entry) => (
        <View
          key={entry.itemId}
          style={{
            backgroundColor: '#F7F2EB',
            borderRadius: 16,
            padding: 12,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
            {nameById.get(entry.itemId) || 'Parça'}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            Sebep: {entry.reason} • Deneme: {entry.retries}
          </Text>
        </View>
      ))}

      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <Pressable
          onPress={onProcessQueue}
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
            Kuyruğu Çalıştır
          </Text>
        </Pressable>

        <Pressable
          onPress={onClearQueue}
          style={{
            flex: 1,
            backgroundColor: '#F3ECE4',
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#B00020', fontWeight: '700', fontSize: 13 }}>
            Kuyruğu Temizle
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
