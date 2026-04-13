import * as ImagePicker from 'expo-image-picker';
import { updateWardrobeItem } from './wardrobeStorage';
import { recordManualCleanup } from './backgroundStatusStorage';

export async function pickManualProcessedPngFromGallery() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('permission-denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets?.length) {
    return '';
  }

  return result.assets[0].uri;
}

export async function applyManualProcessedImageToWardrobeItem(
  itemId: string,
  processedUri: string
) {
  if (!processedUri) return;

  await updateWardrobeItem(itemId, {
    processedImageUri: processedUri,
  } as any);

  await recordManualCleanup(itemId);
}
