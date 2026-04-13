import { detectClothing, removeAndDetect, removeBackground } from './backendClient';
import { getWardrobeItems, updateWardrobeItem } from './wardrobeStorage';
import { WardrobeItem } from '../types/wardrobe';

export type BackgroundProcessSource =
  | 'remove-and-detect'
  | 'remove-background+detect'
  | 'original-fallback';

export type ProcessedWardrobeImage = {
  originalUri: string;
  processedImageUri: string;
  category?: string;
  subcategory?: string;
  color?: string;
  confidence?: number;
  source: BackgroundProcessSource;
};

function normalizePossibleBase64(value?: string) {
  if (!value) return '';
  if (value.startsWith('data:')) return value;
  const looksLikeBase64 = /^[A-Za-z0-9+/=\r\n]+$/.test(value.slice(0, 120));
  return looksLikeBase64 ? `data:image/png;base64,${value}` : value;
}

function pickProcessedUri(data: any) {
  return normalizePossibleBase64(
    data?.transparentDataUri ||
      data?.transparentUrl ||
      data?.image_base64 ||
      data?.imageUrl ||
      data?.output_url ||
      ''
  );
}

export function hasRealProcessedOutput(result: ProcessedWardrobeImage) {
  const uri = (result.processedImageUri || '').trim();
  return !!uri && uri !== result.originalUri && result.source !== 'original-fallback';
}

export async function processWardrobeImage(imageUri: string): Promise<ProcessedWardrobeImage> {
  try {
    const combined = await removeAndDetect(imageUri);
    const processed = pickProcessedUri(combined);

    if (processed) {
      return {
        originalUri: imageUri,
        processedImageUri: processed,
        category: combined?.category || '',
        subcategory: combined?.subcategory || '',
        color: combined?.color_name || combined?.color || '',
        confidence: combined?.confidence || 0,
        source: 'remove-and-detect',
      };
    }
  } catch {
    // continue fallback chain
  }

  try {
    const processed = normalizePossibleBase64(await removeBackground(imageUri));

    let detect: any = {};
    try {
      detect = await detectClothing(imageUri);
    } catch {
      detect = {};
    }

    if (processed) {
      return {
        originalUri: imageUri,
        processedImageUri: processed,
        category: detect?.category || '',
        subcategory: detect?.subcategory || '',
        color: detect?.color_name || detect?.color || '',
        confidence: detect?.confidence || 0,
        source: 'remove-background+detect',
      };
    }
  } catch {
    // final fallback below
  }

  return {
    originalUri: imageUri,
    processedImageUri: imageUri,
    category: '',
    subcategory: '',
    color: '',
    confidence: 0,
    source: 'original-fallback',
  };
}

export async function reprocessWardrobeItemById(itemId: string) {
  const items = await getWardrobeItems();
  const item = items.find((entry) => entry.id === itemId);

  if (!item) {
    throw new Error('Item not found');
  }

  const processed = await processWardrobeImage(item.imageUri);
  const cleaned = hasRealProcessedOutput(processed);

  await updateWardrobeItem(item.id, {
    processedImageUri: cleaned ? processed.processedImageUri : item.imageUri,
    color: item.color || processed.color || '',
  } as Partial<WardrobeItem>);

  return processed;
}

export async function bulkReprocessWardrobeImages(options?: {
  onlyMissing?: boolean;
  force?: boolean;
  itemIds?: string[];
}) {
  const items = await getWardrobeItems();
  const itemIdSet = options?.itemIds ? new Set(options.itemIds) : null;

  const candidates = items.filter((item) => {
    if (itemIdSet && !itemIdSet.has(item.id)) return false;
    if (options?.force) return true;
    if (options?.onlyMissing === false) return true;
    return !item.processedImageUri || item.processedImageUri === item.imageUri;
  });

  let processedCount = 0;
  let failedCount = 0;

  for (const item of candidates) {
    try {
      const result = await processWardrobeImage(item.imageUri);
      const cleaned = hasRealProcessedOutput(result);

      await updateWardrobeItem(item.id, {
        processedImageUri: cleaned ? result.processedImageUri : item.imageUri,
        color: item.color || result.color || '',
      } as Partial<WardrobeItem>);

      processedCount += 1;
    } catch {
      failedCount += 1;
    }
  }

  return {
    total: candidates.length,
    processedCount,
    failedCount,
  };
}
