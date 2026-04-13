export type DetectResult = {
  category?: string;
  subcategory?: string;
  color?: string;
  color_name?: string;
  confidence?: number;
  dimensions?: { width: number; height: number };
  image_base64?: string;
};

export type RemoveAndDetectResult = DetectResult & {
  transparentDataUri?: string;
  transparentUrl?: string;
  originalUri?: string;
};

export type TryOnResult = {
  image_base64?: string;
  imageUrl?: string;
  processing_time?: number;
  items_applied?: number;
};
