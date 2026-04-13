import {
  ProductIsolationHint,
  ProductSelectionPoint,
  detectClothing,
  removeAndDetect,
  removeBackground,
} from './backendClient';
import { enqueueCleanupItem } from './cleanupQueueStorage';
import { getWardrobeItems, updateWardrobeItem } from './wardrobeStorage';
import { WardrobeItem } from '../types/wardrobe';

export type { ProductSelectionPoint };

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
  isProductOnly: boolean;
  rejectionReasons: string[];
  backgroundObjects: string[];
  maskConfidence?: number;
  foregroundConfidence?: number;
  source: BackgroundProcessSource;
};

const BLOCKED_BACKGROUND_OBJECTS = [
  'door',
  'chair',
  'wall',
  'hanger',
  'floor',
  'ground',
  'table',
  'bed',
  'person',
  'body',
  'hand',
  'arm',
  'leg',
  'mirror',
  'shelf',
  'cabinet',
  'closet',
  'kapı',
  'kapi',
  'sandalye',
  'duvar',
  'askı',
  'aski',
  'zemin',
  'masa',
  'yatak',
  'insan',
  'vücut',
  'vucut',
  'el',
  'kol',
  'bacak',
  'ayna',
  'raf',
  'dolap',
];

type MockIsolationMode = 'pass' | 'fail' | 'off';

function isDevOrTestRuntime() {
  const nodeEnv = process.env.NODE_ENV;
  const nativeDev = (globalThis as any).__DEV__;
  return nodeEnv === 'test' || nodeEnv === 'development' || nativeDev === true;
}

function getMockIsolationMode(): MockIsolationMode {
  if (!isDevOrTestRuntime()) return 'off';

  const raw = process.env.EXPO_PUBLIC_MOCK_PRODUCT_ISOLATION;
  if (raw === 'pass' || raw === 'fail') return raw;
  return 'off';
}

function applyMockIsolationContract(data: any) {
  const mode = getMockIsolationMode();

  if (mode === 'pass') {
    return {
      ...data,
      product_only: true,
      is_product_only: true,
      background_objects: [],
      rejection_reason: '',
      mask_confidence: 0.99,
      foreground_confidence: 0.99,
    };
  }

  if (mode === 'fail') {
    return {
      ...data,
      product_only: false,
      is_product_only: false,
      background_objects: ['door', 'chair'],
      rejection_reason: 'Background objects are still visible.',
    };
  }

  return data;
}

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

function normalizeObjectName(value: string) {
  return value.trim().toLocaleLowerCase('tr-TR');
}

function extractBackgroundObjects(data: any) {
  const raw = data?.background_objects || data?.backgroundObjects || data?.detected_background_objects || [];
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => String(item || '').trim())
    .filter(Boolean);
}

function blocksProductOnly(objectName: string) {
  const normalized = normalizeObjectName(objectName);
  return BLOCKED_BACKGROUND_OBJECTS.some((blocked) => normalized.includes(blocked));
}

function buildIsolationDecision(data: any, processedUri: string, originalUri: string) {
  const backgroundObjects = extractBackgroundObjects(data);
  const blockedObjects = backgroundObjects.filter(blocksProductOnly);
  const explicitProductOnly = data?.is_product_only ?? data?.product_only;
  const rejectionReason = data?.rejection_reason || data?.rejectionReason || '';
  const maskConfidence = Number(data?.mask_confidence ?? data?.maskConfidence);
  const foregroundConfidence = Number(data?.foreground_confidence ?? data?.foregroundConfidence);
  const hasProcessedPng = !!processedUri && processedUri !== originalUri;
  const rejectionReasons: string[] = [];

  if (!hasProcessedPng) {
    rejectionReasons.push('Temiz PNG üretilemedi.');
  }

  if (explicitProductOnly !== true) {
    rejectionReasons.push(
      explicitProductOnly === false
        ? 'Sonuç yalnızca ürün olarak doğrulanmadı.'
        : 'Backend yalnızca ürün kaldığını açıkça doğrulamadı.'
    );
  }

  if (blockedObjects.length) {
    rejectionReasons.push(`Arka plan öğesi görünüyor: ${blockedObjects.join(', ')}.`);
  }

  if (rejectionReason) {
    rejectionReasons.push(String(rejectionReason));
  }

  return {
    isProductOnly: hasProcessedPng && explicitProductOnly === true && !blockedObjects.length,
    rejectionReasons,
    backgroundObjects,
    maskConfidence: Number.isFinite(maskConfidence) ? maskConfidence : undefined,
    foregroundConfidence: Number.isFinite(foregroundConfidence) ? foregroundConfidence : undefined,
  };
}

export function hasRealProcessedOutput(result: ProcessedWardrobeImage) {
  const uri = (result.processedImageUri || '').trim();
  return (
    !!uri &&
    uri !== result.originalUri &&
    result.source !== 'original-fallback' &&
    result.isProductOnly
  );
}

export function isApprovedProductIsolation(result: ProcessedWardrobeImage) {
  return hasRealProcessedOutput(result);
}

export async function processWardrobeImage(
  imageUri: string,
  isolationHint?: ProductIsolationHint
): Promise<ProcessedWardrobeImage> {
  try {
    const combined = await removeAndDetect(imageUri, isolationHint);
    const isolationData = applyMockIsolationContract(combined);
    const processed = pickProcessedUri(isolationData);
    const decision = buildIsolationDecision(isolationData, processed, imageUri);

    if (processed) {
      return {
        originalUri: imageUri,
        processedImageUri: processed,
        category: isolationData?.category || '',
        subcategory: isolationData?.subcategory || '',
        color: isolationData?.color_name || isolationData?.color || '',
        confidence: isolationData?.confidence || 0,
        ...decision,
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
      const isolationData = applyMockIsolationContract(detect);
      const decision = buildIsolationDecision(isolationData, processed, imageUri);

      return {
        originalUri: imageUri,
        processedImageUri: processed,
        category: isolationData?.category || '',
        subcategory: isolationData?.subcategory || '',
        color: isolationData?.color_name || isolationData?.color || '',
        confidence: isolationData?.confidence || 0,
        ...decision,
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
    isProductOnly: false,
    rejectionReasons: ['Temiz PNG üretilemedi.'],
    backgroundObjects: [],
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

export async function scanMissingCleanupQueue() {
  const items = await getWardrobeItems();
  const missing = items.filter(
    (item) => !item.processedImageUri || item.processedImageUri === item.imageUri
  );

  for (const item of missing) {
    await enqueueCleanupItem(item.id, 'missing');
  }

  return missing.length;
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
