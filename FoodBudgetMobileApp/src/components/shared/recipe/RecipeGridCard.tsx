import React from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { Text, IconButton, Chip, Surface, useTheme } from 'react-native-paper';
import { RecipeResponseDto } from '../../../lib/shared';

const GRID_PADDING = 16;
const CARD_GAP = 8;
const ASPECT_RATIO = 1.3;

const useWindowDimensions = () => {
  const [dimensions, setDimensions] = React.useState(() => Dimensions.get('window'));

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  return dimensions;
};

export interface RecipeGridCardProps {
  recipe: RecipeResponseDto & { imageUrl?: string; category?: string };
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  columns?: 2 | 3 | 4;
  testID?: string;
}

export const RecipeGridCard: React.FC<RecipeGridCardProps> = ({
  recipe,
  onPress,
  onEdit,
  onDelete,
  columns = 2,
  testID,
}) => {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [imageError, setImageError] = React.useState(false);

  const { cardWidth, cardHeight } = React.useMemo(() => {
    const totalGaps = CARD_GAP * (columns - 1);
    const availableWidth = screenWidth - GRID_PADDING - totalGaps;
    const width = availableWidth / columns;
    return {
      cardWidth: width,
      cardHeight: width * ASPECT_RATIO,
    };
  }, [screenWidth, columns]);

  const showImage = recipe.imageUrl && !imageError;
  const hasActions = onEdit || onDelete;

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
            source={{ uri: recipe.imageUrl }}
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

        {hasActions && (
          <View style={styles.actions}>
            {onEdit && (
              <IconButton
                icon="pencil"
                size={20}
                iconColor={theme.colors.onSurface}
                containerColor={theme.colors.surface}
                onPress={onEdit}
                testID={`${testID}-edit`}
              />
            )}
            {onDelete && (
              <IconButton
                icon="delete"
                size={20}
                iconColor={theme.colors.error}
                containerColor={theme.colors.surface}
                onPress={onDelete}
                testID={`${testID}-delete`}
              />
            )}
          </View>
        )}
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
  actions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
});

export default RecipeGridCard;