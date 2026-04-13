import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedLook } from './savedLooksStorage';

export type CommunityPost = {
  id: string;
  sourceSavedLookId: string;
  title: string;
  explanation: string;
  occasion: string;
  pieces: SavedLook['pieces'];
  publishedAt: string;
  authorName: string;
  likes: number;
  comments: number;
};

const COMMUNITY_KEY = 'combinia_community_posts';

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const raw = await AsyncStorage.getItem(COMMUNITY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function publishSavedLook(look: SavedLook) {
  const existing = await getCommunityPosts();
  const already = existing.find((item) => item.sourceSavedLookId === look.id);
  if (already) return;

  const post: CommunityPost = {
    id: `community-${look.id}`,
    sourceSavedLookId: look.id,
    title: look.title,
    explanation: look.explanation,
    occasion: look.occasion,
    pieces: look.pieces,
    publishedAt: new Date().toISOString(),
    authorName: 'Sen',
    likes: Math.floor(Math.random() * 20),
    comments: Math.floor(Math.random() * 6),
  };

  await AsyncStorage.setItem(COMMUNITY_KEY, JSON.stringify([post, ...existing]));
}

export async function deleteCommunityPost(id: string) {
  const existing = await getCommunityPosts();
  const updated = existing.filter((item) => item.id !== id);
  await AsyncStorage.setItem(COMMUNITY_KEY, JSON.stringify(updated));
}
