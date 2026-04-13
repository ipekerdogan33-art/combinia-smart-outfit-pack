import { Image, View } from 'react-native';
import colors from '../theme/colors';
import { CanonicalCategory } from '../types/catalog';
import {
  ProductImageVariant,
  getProductImageAspectRatio,
  getProductImagePadding,
  getProductImageRadius,
} from '../lib/productImagePresentation';

export default function ProductImageFrame({
  uri,
  category,
  variant = 'thumbnail',
  frameWidth,
  style,
}: {
  uri: string;
  category?: CanonicalCategory | string;
  variant?: ProductImageVariant;
  frameWidth?: number;
  style?: object;
}) {
  const aspectRatio = getProductImageAspectRatio(category);
  const borderRadius = getProductImageRadius(variant);
  const padding = getProductImagePadding(category, variant);

  return (
    <View
      style={[
        {
          width: frameWidth || '100%',
          aspectRatio,
          borderRadius,
          backgroundColor: '#F6F2EC',
          borderWidth: 1,
          borderColor: colors.borderSoft,
          overflow: 'hidden',
          padding,
        },
        style,
      ]}
    >
      <Image
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
}
