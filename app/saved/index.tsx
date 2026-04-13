import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { deleteSavedLook, getSavedLooks, SavedLook } from '../../lib/savedLooksStorage';
import { getCommunityPosts, publishSavedLook } from '../../lib/communityStorage';

function PreviewStrip({ look }: { look: SavedLook }) {
  const pieces = [
    look.pieces.top,
    look.pieces.bottom,
    look.pieces.dress,
    look.pieces.suit,
    look.pieces.shoe,
    look.pieces.outerwear,
    look.pieces.bag,
    look.pieces.accessory,
  ].filter(Boolean);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
      {pieces.map((item: any, index) => (
        <View
          key={`${look.id}-${index}`}
          style={{
            width: 110,
            height: 110,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#F6F2EC',
            marginRight: 10,
          }}
        >
          <Image
            source={{ uri: item.processedImageUri || item.imageUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>
      ))}
    </ScrollView>
  );
}

export default function SavedLooksScreen() {
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [publishedIds, setPublishedIds] = useState<string[]>([]);

  const loadLooks = useCallback(async () => {
    const data = await getSavedLooks();
    const posts = await getCommunityPosts();
    setLooks(data);
    setPublishedIds(posts.map((item) => item.sourceSavedLookId));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLooks();
    }, [loadLooks])
  );

  const publishedSet = useMemo(() => new Set(publishedIds), [publishedIds]);

  const handleDelete = async (id: string) => {
    await deleteSavedLook(id);
    loadLooks();
  };

  const handlePublish = async (look: SavedLook) => {
    await publishSavedLook(look);
    loadLooks();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 80,
          paddingBottom: 40,
        }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.5,
            marginBottom: 10,
          }}
        >
          Kaydedilen Kombinler
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Beğendiğin kombinleri burada saklayabilir, topluluğa taşıyabilir ve try-on / planlayıcı akışına açabilirsin.
        </Text>

        {looks.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.borderSoft,
              padding: 18,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}>
              Henüz kaydedilmiş kombin yok. Beğendiğin bir görünümü kaydettiğinde burada göreceksin.
            </Text>
          </View>
        ) : (
          looks.map((look) => {
            const isPublished = publishedSet.has(look.id);

            return (
              <View
                key={look.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 20,
                  padding: 16,
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
                    fontSize: 19,
                    fontWeight: '700',
                    color: colors.text,
                    marginBottom: 6,
                  }}
                >
                  {look.title}
                </Text>

                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: colors.muted,
                    marginBottom: 8,
                  }}
                >
                  {look.occasion}
                </Text>

                <Text
                  style={{
                    fontSize: 15,
                    lineHeight: 22,
                    color: colors.textSecondary,
                    marginBottom: 14,
                  }}
                >
                  {look.explanation}
                </Text>

                {!!look.tryOnPreviewUri && (
                  <View
                    style={{
                      backgroundColor: '#F6F2EC',
                      borderRadius: 18,
                      overflow: 'hidden',
                      marginBottom: 14,
                    }}
                  >
                    <Image
                      source={{ uri: look.tryOnPreviewUri }}
                      style={{ width: '100%', height: 360 }}
                      resizeMode="contain"
                    />
                  </View>
                )}

                <PreviewStrip look={look} />

                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <Pressable
                    onPress={() => handlePublish(look)}
                    style={{
                      backgroundColor: isPublished ? '#EAF6ED' : '#F3EFE9',
                      paddingVertical: 14,
                      paddingHorizontal: 14,
                      borderRadius: 14,
                      alignItems: 'center',
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: isPublished ? '#1D7A35' : colors.text,
                        fontSize: 13,
                        fontWeight: '700',
                      }}
                    >
                      {isPublished ? 'Community’de Yayında' : 'Community’ye Ekle'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push(`/shell/planner?lookId=${look.id}`)}
                    style={{
                      backgroundColor: '#F3EFE9',
                      paddingVertical: 14,
                      paddingHorizontal: 14,
                      borderRadius: 14,
                      alignItems: 'center',
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
                      Planner’a Gönder
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push(`/tryon?lookId=${look.id}`)}
                    style={{
                      backgroundColor: '#F3EFE9',
                      paddingVertical: 14,
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

                  <Pressable
                    onPress={() => router.push(`/share/look?lookId=${look.id}`)}
                    style={{
                      backgroundColor: '#F3EFE9',
                      paddingVertical: 14,
                      paddingHorizontal: 14,
                      borderRadius: 14,
                      alignItems: 'center',
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
                      Paylaşım Kartı
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleDelete(look.id)}
                    style={{
                      backgroundColor: '#F3ECE4',
                      paddingVertical: 14,
                      paddingHorizontal: 14,
                      borderRadius: 14,
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: '#B00020', fontSize: 13, fontWeight: '700' }}>
                      Kaydı Sil
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
