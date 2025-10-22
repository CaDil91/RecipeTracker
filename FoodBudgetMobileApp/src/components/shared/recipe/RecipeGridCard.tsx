import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, IconButton, Chip, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { RecipeResponseDto } from '../../../lib/shared';

const GRID_PADDING = 16;
const CARD_GAP = 8;
const ASPECT_RATIO = 1.3;

export interface RecipeGridCardProps {
  recipe: RecipeResponseDto;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  columns?: 2 | 3 | 4;
  containerWidth?: number;
  testID?: string;
}

export const RecipeGridCard: React.FC<RecipeGridCardProps> = ({
  recipe,
  onPress,
  columns = 2,
  containerWidth,
  testID,
}) => {
  const theme = useTheme();
  const [imageError, setImageError] = React.useState(false);

  const { cardWidth, cardHeight } = React.useMemo(() => {
    if (!containerWidth || containerWidth === 0) return { cardWidth: 0, cardHeight: 0 };
    const totalGaps = CARD_GAP * (columns - 1);
    const availableWidth = containerWidth - GRID_PADDING - totalGaps;
    const width = availableWidth / columns;
    return {
      cardWidth: width,
      cardHeight: width * ASPECT_RATIO,
    };
  }, [containerWidth, columns]);

  const showImage = recipe.imageUrl && !imageError;

  // Story 12c: Check if recipe has temp ID (optimistic create in progress)
  const isTempRecipe = recipe.id.startsWith('temp-');

  return (
    <TouchableOpacity
      onPress={onPress}
      testID={testID}
      activeOpacity={0.8}
    >
      <Surface
        style={[styles.card, { width: cardWidth, height: cardHeight }]}
        elevation={2}
      >
        {showImage ? (
          <Image
            source={{ uri: recipe.imageUrl ?? undefined }}
            style={styles.image}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: theme.colors.surfaceVariant }]}>
            <IconButton
              icon="silverware-fork-knife"
              size={32}
              iconColor={theme.colors.onSurfaceVariant}
            />
          </View>
        )}

        {/* Story 12c: Loading indicator for temp recipes */}
        {isTempRecipe && (
          <View style={styles.loadingOverlay} testID={`${testID}-loading-indicator`}>
            <ActivityIndicator size="small" color="white" />
          </View>
        )}

        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text
              variant={columns > 2 ? 'titleSmall' : 'titleMedium'}
              style={styles.title}
              numberOfLines={2}
            >
              {recipe.title}
            </Text>

            <View style={styles.chipContainer}>
              {recipe.category && recipe.category !== 'All' && (
                <Chip compact mode="flat" textStyle={styles.chipText}>
                  {recipe.category}
                </Chip>
              )}
              <Chip
                icon="silverware-fork-knife"
                compact
                mode="flat"
                textStyle={styles.chipText}
              >
                {recipe.servings}
              </Chip>
            </View>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    overflow: 'hidden',
    borderRadius: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  content: {
    padding: 12,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  chipText: {
    fontSize: 11,
  },
});