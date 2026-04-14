import { DetectResult, RemoveAndDetectResult, TryOnResult } from '../types/backend';
import { SavedLook } from './savedLooksStorage';

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE ||
  'http://10.0.2.2:8003';

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 25000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

function buildImageFormData(uri: string, field = 'file', name = 'photo.jpg', type = 'image/jpeg') {
  const formData = new FormData();
  formData.append(field, {
    uri,
    name,
    type,
  } as any);
  return formData;
}

function toDataUri(base64?: string, mime = 'image/png') {
  if (!base64) return '';
  if (base64.startsWith('data:')) return base64;
  return `data:${mime};base64,${base64}`;
}

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetchWithTimeout(`${API_BASE}/health`, { method: 'GET' }, 5000);
  if (!response.ok) throw new Error('Health check failed');
  return response.json();
}

export async function isBackendAvailable() {
  try {
    await healthCheck();
    return true;
  } catch {
    return false;
  }
}

export async function removeBackground(imageUri: string): Promise<string> {
  const formData = buildImageFormData(imageUri);

  const response = await fetchWithTimeout(`${API_BASE}/remove-background`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Background removal failed');
  const data = await response.json();
  return toDataUri(data.image_base64);
}

export async function detectClothing(imageUri: string): Promise<DetectResult> {
  const formData = buildImageFormData(imageUri);

  const response = await fetchWithTimeout(`${API_BASE}/detect-clothing`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Clothing detection failed');
  return response.json();
}

export async function removeAndDetect(imageUri: string): Promise<RemoveAndDetectResult> {
  const formData = buildImageFormData(imageUri);

  const response = await fetchWithTimeout(`${API_BASE}/remove-and-detect`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Remove and detect failed');

  const data = await response.json();

  return {
    ...data,
    originalUri: imageUri,
    transparentDataUri: data.image_base64 ? toDataUri(data.image_base64) : '',
    transparentUrl: data.image_url || data.output_url || '',
  };
}

export async function simpleTryOn(
  clothUri: string,
  category: string,
): Promise<TryOnResult> {
  const formData = new FormData();
  formData.append('cloth_image', {
    uri: clothUri,
    name: 'cloth.png',
    type: 'image/png',
  } as any);
  formData.append('category', category);

  const response = await fetchWithTimeout(`${API_BASE}/tryon-simple`, {
    method: 'POST',
    body: formData,
  }, 35000);

  if (!response.ok) throw new Error('Simple try-on failed');
  return response.json();
}

export async function compositeTryOn(
  look: SavedLook,
  mannequinStyle: string,
): Promise<TryOnResult> {
  const formData = new FormData();

  const pieceEntries = Object.entries(look.pieces).filter(([, item]) => !!item);

  pieceEntries.forEach(([slot, item]) => {
    const uri = (item as any).processedImageUri || (item as any).imageUri;
    formData.append(`${slot}_image`, {
      uri,
      name: `${slot}.png`,
      type: 'image/png',
    } as any);
  });

  formData.append('style', mannequinStyle);
  formData.append('occasion', look.occasion);

  const response = await fetchWithTimeout(`${API_BASE}/tryon`, {
    method: 'POST',
    body: formData,
  }, 40000);

  if (!response.ok) throw new Error('Composite try-on failed');
  return response.json();
}

export async function aiTryOn(
  personUri: string,
  clothUri: string,
  category: string,
): Promise<TryOnResult> {
  const formData = new FormData();
  formData.append('person_image', {
    uri: personUri,
    name: 'person.png',
    type: 'image/png',
  } as any);
  formData.append('cloth_image', {
    uri: clothUri,
    name: 'cloth.png',
    type: 'image/png',
  } as any);
  formData.append('category', category);

  const response = await fetchWithTimeout(`${API_BASE}/tryon-ai`, {
    method: 'POST',
    body: formData,
  }, 45000);

  if (!response.ok) throw new Error('AI try-on failed');
  return response.json();
}

export function resolveTryOnImage(result: TryOnResult | null | undefined) {
  if (!result) return '';
  if (result.imageUrl) return result.imageUrl;
  if (result.image_base64) return toDataUri(result.image_base64);
  return '';
}
