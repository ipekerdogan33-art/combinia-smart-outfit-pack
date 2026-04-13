import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import CommunityPostCard from '../../components/CommunityPostCard';
import { deleteCommunityPost, getCommunityPosts, CommunityPost } from '../../lib/communityStorage';

export default function ShellCommunityScreen() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  const load = useCallback(async () => {
    const data = await getCommunityPosts();
    setPosts(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleRemove = async (id: string) => {
    await deleteCommunityPost(id);
    load();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.5,
            marginBottom: 10,
          }}
        >
          Community
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Paylaşılan saved looks akışı burada görünür.
        </Text>

        {posts.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 22,
              padding: 18,
              borderWidth: 1,
              borderColor: colors.borderSoft,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}>
              Henüz topluluğa eklenmiş görünüm yok. Saved looks ekranından paylaşım yapabilirsin.
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              onOpenPlanner={() => router.push(`/shell/planner?lookId=${post.sourceSavedLookId}`)}
              onOpenTryOn={() => router.push(`/tryon?lookId=${post.sourceSavedLookId}`)}
              onRemove={() => handleRemove(post.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
