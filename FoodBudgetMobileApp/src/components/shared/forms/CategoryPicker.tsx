import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Menu, Button, useTheme, Chip, Text } from 'react-native-paper';

/**
 * Sprint 3: Hardcoded categories with single-select
 * Sprint 4: Will support custom categories, multi-select, and user-defined options
 */
const DEFAULT_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert'] as const;

export interface CategoryPickerProps {
  value: string | null | undefined;
  onChange?: (category: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  testID?: string;

  // Sprint 4 extensibility props (not implemented yet)
  // multiple?: boolean;
  // allowCustom?: boolean;
  // options?: string[];
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  testID = 'category-picker',
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  const openMenu = () => {
    if (!disabled) {
      setVisible(true);
    }
  };

  const closeMenu = () => setVisible(false);

  const handleSelect = (category: string) => {
    if (onChange) {
      onChange(category);
    }
    closeMenu();
  };

  const displayValue = value || 'Select Category';
  const hasValue = Boolean(value && value.trim());

  // ReadOnly mode: Display category as chip
  if (readOnly) {
    return (
      <View style={styles.container}>
        <Text variant="labelMedium" style={styles.readOnlyLabel}>
          Category
        </Text>
        <View style={styles.readOnlyContainer}>
          {hasValue ? (
            <Chip
              mode="flat"
              testID={`${testID}-chip`}
              style={styles.chip}
              textStyle={styles.chipText}
            >
              {value}
            </Chip>
          ) : (
            <Text variant="bodyMedium" style={styles.readOnlyPlaceholder}>
              No category selected
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Editable mode: Standard menu picker
  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openMenu}
            disabled={disabled}
            testID={`${testID}-trigger`}
            style={[
              styles.trigger,
              disabled && styles.triggerDisabled,
            ]}
            contentStyle={styles.triggerContent}
            labelStyle={[
              styles.triggerLabel,
              !hasValue && styles.triggerPlaceholder,
            ]}
          >
            {displayValue}
          </Button>
        }
        contentStyle={styles.menuContent}
      >
        {DEFAULT_CATEGORIES.map((category) => (
          <Menu.Item
            key={category}
            onPress={() => handleSelect(category)}
            title={category}
            testID={`${testID}-option-${category.toLowerCase()}`}
            style={[
              styles.menuItem,
              value === category && styles.menuItemSelected,
            ]}
            titleStyle={[
              styles.menuItemTitle,
              value === category && { color: theme.colors.primary },
            ]}
          />
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  trigger: {
    justifyContent: 'center',
    minHeight: 56,
  },
  triggerDisabled: {
    opacity: 0.6,
  },
  triggerContent: {
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  triggerLabel: {
    fontSize: 16,
    textAlign: 'left',
  },
  triggerPlaceholder: {
    opacity: 0.6,
  },
  menuContent: {
    maxWidth: 400,
    marginTop: 8,
  },
  menuItem: {
    minHeight: 48,
  },
  menuItemSelected: {
    backgroundColor: 'rgba(103, 80, 164, 0.08)',
  },
  menuItemTitle: {
    fontSize: 16,
  },
  // ReadOnly mode styles
  readOnlyLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  readOnlyContainer: {
    minHeight: 40,
    justifyContent: 'center',
  },
  chip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    fontFamily: 'Poppins_500Medium',
  },
  readOnlyPlaceholder: {
    opacity: 0.5,
    fontStyle: 'italic',
  },
});