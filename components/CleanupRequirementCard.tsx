import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';

export default function CleanupRequirementCard({
  visible,
  message,
  onRetry,
  onPickNew,
  onOpenSafeArea,
}: {
  visible: boolean;
  message: string;
  onRetry: () => void;
  onPickNew: () => void;
  onOpenSafeArea: () => void;
}) {
  if (!visible) return null;

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
        Sadece Ürün Kalmalı
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        {message}
      </Text>

      <Pressable
        onPress={onOpenSafeArea}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
          Güvenli Alanı Seç
        </Text>
      </Pressable>

      <View style={{ flexDirection: 'row' }}>
        <Pressable
          onPress={onRetry}
          style={{
            flex: 1,
            backgroundColor: '#F3EFE9',
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
            Tekrar Dene
          </Text>
        </Pressable>

        <Pressable
          onPress={onPickNew}
          style={{
            flex: 1,
            backgroundColor: '#F3EFE9',
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
            Başka Fotoğraf Seç
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
