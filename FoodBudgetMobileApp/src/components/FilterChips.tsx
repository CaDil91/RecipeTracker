import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';

export type FilterType = 'All' | 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert';

interface FilterChipsProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  testID?: string;
}

const filters: FilterType[] = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert'];

const FilterChips: React.FC<FilterChipsProps> = ({
  selectedFilter,
  onFilterChange,
  testID = 'filter-chips',
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container} testID={`${testID}-container`}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => (
          <Chip
            key={filter}
            testID={`${testID}-${filter.toLowerCase()}`}
            selected={selectedFilter === filter}
            onPress={() => onFilterChange(filter)}
            style={[
              styles.chip,
              selectedFilter === filter && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
            textStyle={[
              styles.chipText,
              selectedFilter === filter && {
                color: theme.colors.onPrimaryContainer,
              },
            ]}
            showSelectedOverlay={false}
          >
            {filter}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexGrow: 1,
    justifyContent: 'center',
  },
  chip: {
    marginHorizontal: 4,
  },
  chipText: {
    fontSize: 14,
  },
});

export default FilterChips;