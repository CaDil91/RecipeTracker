import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { RecipeResponseDto } from '../../../lib/shared/types/dto';
import { Button } from '../ui/Button';

export interface RecipeCardProps {
  recipe: RecipeResponseDto;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  testID?: string;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onPress,
  onEdit,
  onDelete,
  testID,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      style={styles.card}
      onPress={onPress}
      mode="elevated"
      testID={testID}
    >
      <Card.Title
        title={recipe.title}
        subtitle={`Created ${formatDate(recipe.createdAt)}`}
      />
      
      <Card.Content>
        <View style={styles.chipContainer}>
          <Chip icon="silverware-fork-knife" style={styles.chip}>
            {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
          </Chip>
        </View>
        
        {recipe.instructions && (
          <Text 
            variant="bodyMedium" 
            numberOfLines={3}
            style={styles.instructions}
          >
            {recipe.instructions}
          </Text>
        )}
      </Card.Content>

      {onPress && (
        <Card.Actions>
          <Button
            title="View Details"
            variant="text"
            onPress={onPress}
            testID={`${testID}-view`}
          />
        </Card.Actions>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  instructions: {
    opacity: 0.8,
    lineHeight: 20,
  },
});