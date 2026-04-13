import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { OutfitRecommendation } from '../types/outfit';
import { WardrobeItem } from '../types/wardrobe';
import ProductImageFrame from './ProductImageFrame';

function PieceBlock({ label, item }: { label: string; item: WardrobeItem }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 10 }}>{label}</Text>

      <ProductImageFrame
        uri={item.processedImageUri || item.imageUri}
        category={item.category}
        variant="hero"
        style={{ marginBottom: 12 }}
      />

      <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
        {item.name}
      </Text>
      <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 2 }}>
        {item.category} • {item.subcategory}
      </Text>
      {!!item.color && (
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>{item.color}</Text>
      )}
    </View>
  );
}

export default function OutfitSuggestionCard({
  recommendation,
}: {
  recommendation: OutfitRecommendation;
}) {
  const { pieces } = recommendation;

  return (
    <View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.borderSoft,
          marginBottom: 18,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
          {recommendation.title}
        </Text>
        <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textSecondary }}>
          {recommendation.explanation}
        </Text>
      </View>

      {!!pieces.top && <PieceBlock label="Üst Parça" item={pieces.top} />}
      {!!pieces.bottom && <PieceBlock label="Alt Parça" item={pieces.bottom} />}
      {!!pieces.dress && <PieceBlock label="Elbise" item={pieces.dress} />}
      {!!pieces.suit && <PieceBlock label="Takım" item={pieces.suit} />}
      {!!pieces.jacket && <PieceBlock label="Ceket" item={pieces.jacket} />}
      {!!pieces.outerwear && <PieceBlock label="Dış Giyim" item={pieces.outerwear} />}
      {!!pieces.shoe && <PieceBlock label="Ayakkabı" item={pieces.shoe} />}
      {!!pieces.bag && <PieceBlock label="Çanta" item={pieces.bag} />}
      {!!pieces.accessory && <PieceBlock label="Aksesuar" item={pieces.accessory} />}
    </View>
  );
}
