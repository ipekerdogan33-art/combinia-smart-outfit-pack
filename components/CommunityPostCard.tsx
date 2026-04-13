import { Image, Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { CommunityPost } from '../lib/communityStorage';

export default function CommunityPostCard({
  post,
  onRemove,
  onOpenPlanner,
  onOpenTryOn,
}: {
  post: CommunityPost;
  onRemove?: () => void;
  onOpenPlanner?: () => void;
  onOpenTryOn?: () => void;
}) {
  const pieces = [
    post.pieces.top,
    post.pieces.bottom,
    post.pieces.dress,
    post.pieces.suit,
    post.pieces.shoe,
    post.pieces.outerwear,
    post.pieces.bag,
    post.pieces.accessory,
  ].filter(Boolean) as any[];

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 16,
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
          marginBottom: 6,
        }}
      >
        {post.title}
      </Text>

      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: colors.muted,
          marginBottom: 8,
        }}
      >
        {post.authorName} • {post.occasion}
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        {post.explanation}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 }}>
        {pieces.slice(0, 4).map((item, index) => (
          <View
            key={index}
            style={{
              width: 82,
              height: 82,
              borderRadius: 14,
              overflow: 'hidden',
              backgroundColor: '#F6F2EC',
              marginRight: 10,
              marginBottom: 10,
            }}
          >
            <Image
              source={{ uri: item.tryOnPreviewUri || item.processedImageUri || item.imageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
        ))}
      </View>

      <Text
        style={{
          fontSize: 13,
          color: colors.textSecondary,
          marginBottom: onRemove || onOpenPlanner || onOpenTryOn ? 12 : 0,
        }}
      >
        ❤️ {post.likes} beğeni • 💬 {post.comments} yorum
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {!!onOpenPlanner && (
          <Pressable
            onPress={onOpenPlanner}
            style={{
              backgroundColor: '#F3EFE9',
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
              alignItems: 'center',
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
              Planner’da Aç
            </Text>
          </Pressable>
        )}

        {!!onOpenTryOn && (
          <Pressable
            onPress={onOpenTryOn}
            style={{
              backgroundColor: '#F3EFE9',
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
              alignItems: 'center',
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
              Try-On’da Aç
            </Text>
          </Pressable>
        )}

        {!!onRemove && (
          <Pressable
            onPress={onRemove}
            style={{
              backgroundColor: '#F3ECE4',
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Text style={{ color: '#B00020', fontSize: 13, fontWeight: '700' }}>
              Yayından Kaldır
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
