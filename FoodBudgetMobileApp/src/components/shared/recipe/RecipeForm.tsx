import React, { useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { HelperText, Text, useTheme, Chip } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RecipeRequestDto, RecipeResponseDto } from '../../../lib/shared';
import { RecipeRequestSchema } from '../../../lib/shared';
import { TextInput } from '../forms/TextInput';
import { TextArea } from '../forms/TextArea';
import { NumberInput } from '../forms/NumberInput';
import { CategoryPicker } from '../forms/CategoryPicker';
import { ImagePicker } from '../forms/ImagePicker';
import { Button } from '../ui/Button';
import { Card } from '../layout/Card';
import { spacing, fontConfig } from '../../../theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface RecipeFormProps {
  initialValues?: Partial<RecipeResponseDto>;
  onSubmit?: (data: RecipeRequestDto) => void | Promise<void>; // Optional when readOnly
  onCancel?: (hasChanges: boolean) => void;
  submitLabel?: string;
  isLoading?: boolean;
  readOnly?: boolean;
  testID?: string;
}

export interface RecipeFormRef {
  hasFormChanges: () => boolean;
}

const RecipeFormComponent = forwardRef<RecipeFormRef, RecipeFormProps>(({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save Recipe',
  isLoading = false,
  readOnly = false,
  testID = 'recipe-form',
}, ref) => {
  const theme = useTheme();

  // React Hook Form setup - Only initialize in EDIT mode
  const formMethods = !readOnly ? useForm<RecipeRequestDto>({
    resolver: zodResolver(RecipeRequestSchema),
    defaultValues: {
      title: initialValues?.title || '',
      instructions: initialValues?.instructions || '',
      servings: initialValues?.servings || 1,
      category: initialValues?.category || '',
      imageUrl: initialValues?.imageUrl || '',
    },
    mode: 'onSubmit', // Only validate on submit (progressive validation)
  }) : null;

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState,
  } = formMethods || {};

  const isDirty = formState?.isDirty || false;
  const isSubmitting = formState?.isSubmitting || false;

  // Expose hasFormChanges via ref (2025 pattern: useImperativeHandle)
  useImperativeHandle(ref, () => ({
    hasFormChanges: () => isDirty,
  }));

  // Handle form submission
  const handleFormSubmit = rhfHandleSubmit ? rhfHandleSubmit(async (data) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  }) : () => {};

  const handleCancel = () => {
    if (onCancel) {
      onCancel(isDirty);
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  /**
   * Note on Controller usage:
   *
   * We're using React Hook Form's Controller directly instead of creating wrapper components.
   * This approach is simpler for single-form usage.
   *
   * When to create wrappers:
   * - If you add 2-3+ more forms using RHF later, then extract to wrappers
   * - Good threshold: "Rule of Three" - third time you repeat something, extract it
   *
   * If we need to reuse these patterns in multiple forms, we can refactor to
   * create wrapper components like ControlledTextInput, ControlledNumberInput, etc.
   */

  // ReadOnly mode: Content-focused VIEW layout
  if (readOnly) {
    return (
      <View style={styles.viewContainer} testID={testID}>
        {/* Recipe Image - Full width, prominent */}
        {initialValues?.imageUrl && (
          <Image
            source={{ uri: initialValues.imageUrl }}
            style={styles.viewImage}
            resizeMode="cover"
            testID={`${testID}-image`}
          />
        )}

        {/* Title - Large headline */}
        <Text variant="headlineLarge" style={styles.viewTitle}>
          {initialValues?.title || 'Untitled Recipe'}
        </Text>

        {/* Metadata Row - Category + Servings */}
        <View style={styles.metadataRow}>
          {initialValues?.category && (
            <Chip
              mode="flat"
              style={styles.categoryChip}
              textStyle={styles.categoryChipText}
            >
              {initialValues.category}
            </Chip>
          )}
          <View style={styles.servingsContainer}>
            <MaterialCommunityIcons
              name="account-group"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodyLarge" style={styles.servingsText}>
              {`${initialValues?.servings || 1} ${initialValues?.servings === 1 ? 'serving' : 'servings'}`}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        {initialValues?.instructions && (
          <View style={styles.instructionsSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Instructions
            </Text>
            <Text variant="bodyLarge" style={styles.instructionsText}>
              {initialValues.instructions || ''}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // EDIT mode: Form layout with Card
  return (
    <View style={styles.container} testID={testID}>
      <Card style={styles.card}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextInput
              label="Recipe Title"
              value={value || ''}
              onChangeText={onChange}
              error={error}
              placeholder="Enter recipe name"
              maxLength={200}
              testID={`${testID}-title`}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="servings"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <NumberInput
              label="Servings"
              value={value ?? 1}
              onChangeValue={onChange}
              error={error}
              min={1}
              max={100}
              integer={true}
              placeholder="Number of servings"
              testID={`${testID}-servings`}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View style={styles.input} testID={`${testID}-category-picker`}>
              <CategoryPicker
                value={value || ''}
                onChange={onChange}
                disabled={isFormLoading}
                testID={`${testID}-category-picker`}
              />
              {error?.message && (
                <HelperText type="error" visible={true}>
                  {error.message}
                </HelperText>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="imageUrl"
          render={({ field: { onChange, value } }) => (
            <View style={styles.input} testID={`${testID}-image-picker`}>
              <ImagePicker
                value={value || null}
                onChange={onChange}
                disabled={isFormLoading}
                testID={`${testID}-image-picker`}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="instructions"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextArea
              label="Instructions"
              value={value || ''}
              onChangeText={onChange}
              error={error}
              placeholder="Enter cooking instructions (optional)"
              rows={8}
              maxLength={5000}
              testID={`${testID}-instructions`}
              style={styles.input}
            />
          )}
        />
      </Card>

      {!readOnly && (
        <View style={styles.buttonContainer}>
          <Button
            title={submitLabel}
            variant="primary"
            onPress={handleFormSubmit}
            loading={isFormLoading}
            disabled={isFormLoading}
            fullWidth
            testID={`${testID}-submit`}
            style={styles.submitButton}
          />

          {onCancel && (
            <Button
              title="Cancel"
              variant="secondary"
              onPress={handleCancel}
              disabled={isFormLoading}
              fullWidth
              testID={`${testID}-cancel`}
            />
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  // EDIT mode styles
  container: {
    flex: 1,
  },
  card: {
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
  },
  buttonContainer: {
    gap: spacing.md, // MD3 8px grid system
  },
  submitButton: {
    marginBottom: spacing.sm,
  },

  // VIEW mode styles - Content-focused layout
  viewContainer: {
    flex: 1,
  },
  viewImage: {
    width: '100%',
    height: 240, // 30 * 8px grid
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  viewTitle: {
    marginBottom: spacing.md,
    fontFamily: fontConfig.headlineLarge.fontFamily,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  categoryChipText: {
    fontFamily: fontConfig.labelLarge.fontFamily,
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  servingsText: {
    fontFamily: fontConfig.bodyLarge.fontFamily,
  },
  instructionsSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    fontFamily: fontConfig.titleMedium.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  instructionsText: {
    fontFamily: fontConfig.bodyLarge.fontFamily,
    lineHeight: 24,
  },
});

// Export with the display name for debugging (2025 pattern)
RecipeFormComponent.displayName = 'RecipeForm';
export const RecipeForm = RecipeFormComponent;