import React, { useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RecipeRequestDto, RecipeResponseDto } from '../../../lib/shared';
import { RecipeRequestSchema } from '../../../lib/shared';
import { Button } from '../ui/Button';
import { spacing } from '../../../theme/typography';
import {
  ViewRecipeImage,
  EditableRecipeImage,
  ViewRecipeTitle,
  EditableRecipeTitle,
  ViewRecipeInstructions,
  EditableRecipeInstructions,
  ViewRecipeCategory,
  EditableRecipeCategory,
  ViewRecipeServings,
  EditableRecipeServings,
} from './index';

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
  // React Hook Form setup - Always call hooks (Rules of Hooks)
  // Note: We always initialize useForm to avoid hook count changes between renders
  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState,
  } = useForm<RecipeRequestDto>({
    resolver: zodResolver(RecipeRequestSchema),
    defaultValues: {
      title: initialValues?.title || '',
      instructions: initialValues?.instructions || '',
      servings: initialValues?.servings || 1,
      category: initialValues?.category || '',
      imageUrl: initialValues?.imageUrl || '',
    },
    mode: 'onSubmit', // Only validate on submit (progressive validation)
  });

  const isDirty = formState.isDirty;
  const isSubmitting = formState.isSubmitting;

  // Expose hasFormChanges via ref (2025 pattern: useImperativeHandle)
  useImperativeHandle(ref, () => ({
    hasFormChanges: () => isDirty,
  }));

  // Handle form submission
  const handleFormSubmit = rhfHandleSubmit(async (data) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  });

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

  // VIEW mode: Direct rendering from initialValues using View* components
  if (readOnly) {
    return (
      <View style={styles.container} testID={testID}>
        {/* Recipe Image - Full width, prominent */}
        <ViewRecipeImage
          imageUrl={initialValues?.imageUrl || ''}
          testID={`${testID}-image`}
          accessibilityLabel={`Recipe image for ${initialValues?.title || 'Untitled Recipe'}`}
        />

        {/* Title - Large headline */}
        <ViewRecipeTitle
          title={initialValues?.title || 'Untitled Recipe'}
          testID={`${testID}-title`}
        />

        {/* Metadata Row - Category + Servings */}
        <View style={styles.metadataRow}>
          <ViewRecipeCategory
            category={initialValues?.category || ''}
            testID={`${testID}-category`}
          />
          <ViewRecipeServings
            servings={initialValues?.servings || 1}
            testID={`${testID}-servings`}
          />
        </View>

        {/* Instructions */}
        <ViewRecipeInstructions
          instructions={initialValues?.instructions || ''}
          testID={`${testID}-instructions`}
        />
      </View>
    );
  }

  // EDIT mode: Controlled components (visually identical to VIEW, but will be editable)
  return (
    <View style={styles.container} testID={testID}>
      {/* Recipe Image - Editable with overlay controls and bounce animation */}
      <Controller
        control={control}
        name="imageUrl"
        render={({ field: { onChange, value } }) => (
          <EditableRecipeImage
            value={value as string}
            onChange={onChange}
            testID={`${testID}-image`}
          />
        )}
      />

      {/* Title - Editable with bounce animation */}
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value } }) => (
          <EditableRecipeTitle
            value={value as string}
            onChange={onChange}
            testID={`${testID}-title`}
          />
        )}
      />

      {/* Metadata Row - Category + Servings */}
      <View style={styles.metadataRow}>
        {/* Category - Editable with bounce animation and modal picker */}
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <EditableRecipeCategory
              value={value as string}
              onChange={onChange}
              testID={`${testID}-category`}
            />
          )}
        />

        {/* Servings - Editable with bounce animation and stepper controls */}
        <Controller
          control={control}
          name="servings"
          render={({ field: { onChange, value } }) => (
            <EditableRecipeServings
              value={value as number}
              onChange={onChange}
              testID={`${testID}-servings`}
            />
          )}
        />
      </View>

      {/* Instructions - Editable with bounce animation (label stays static) */}
      <Controller
        control={control}
        name="instructions"
        render={({ field: { onChange, value } }) => (
          <EditableRecipeInstructions
            value={value as string}
            onChange={onChange}
            testID={`${testID}-instructions`}
          />
        )}
      />

      {/* Action Buttons - Only show in EDIT mode */}
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
    </View>
  );
});

/**
 * RecipeForm Styles
 *
 * Component-specific styles have been extracted to co-located component files.
 * This StyleSheet now contains only form-level layout styles.
 */
const styles = StyleSheet.create({
  // Main container - Used by both VIEW and EDIT modes
  container: {
    flex: 1,
  },
  // Metadata row - Contains category and servings in horizontal layout
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  // Action buttons - EDIT mode only
  buttonContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  submitButton: {
    marginBottom: spacing.sm,
  },
});

// Export with the display name for debugging (2025 pattern)
RecipeFormComponent.displayName = 'RecipeForm';
export const RecipeForm = RecipeFormComponent;