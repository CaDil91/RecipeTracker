import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Menu, Button, useTheme } from 'react-native-paper';

/**
 * Sprint 3: Hardcoded categories with single-select
 * Sprint 4: Will support custom categories, multi-select, and user-defined options
 */
const DEFAULT_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert'] as const;

export interface CategoryPickerProps {
  value: string | null | undefined;
  onChange: (category: string) => void;
  disabled?: boolean;
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
    onChange(category);
    closeMenu();
  };

  const displayValue = value || 'Select Category';
  const hasValue = Boolean(value && value.trim());

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
});