import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { HelperText } from 'react-native-paper';
import { RecipeRequestDto, RecipeResponseDto } from '../../../lib/shared';
import { RecipeRequestSchema } from '../../../lib/shared';
import { TextInput } from '../forms/TextInput';
import { TextArea } from '../forms/TextArea';
import { NumberInput } from '../forms/NumberInput';
import { CategoryPicker } from '../forms/CategoryPicker';
import { ImagePicker } from '../forms/ImagePicker';
import { Button } from '../ui/Button';
import { Card } from '../layout/Card';
import { ZodError } from 'zod';

export interface RecipeFormProps {
  initialValues?: Partial<RecipeResponseDto>;
  onSubmit: (data: RecipeRequestDto) => void | Promise<void>;
  onCancel?: (hasChanges: boolean) => void;
  submitLabel?: string;
  isLoading?: boolean;
  testID?: string;
}

export interface RecipeFormRef {
  hasFormChanges: () => boolean;
}

interface FormErrors {
  title?: string;
  instructions?: string;
  servings?: string;
  category?: string;
  imageUrl?: string;
}

const RecipeFormComponent = forwardRef<RecipeFormRef, RecipeFormProps>(({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save Recipe',
  isLoading = false,
  testID = 'recipe-form',
}, ref) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [instructions, setInstructions] = useState(initialValues?.instructions || '');
  const [servings, setServings] = useState<number | undefined>(initialValues?.servings || 1);
  const [category, setCategory] = useState<string | null>(initialValues?.category || null);
  const [imageUrl, setImageUrl] = useState<string | null>(initialValues?.imageUrl || null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Progressive validation: Only validate if the user has attempted to submit
    if (hasAttemptedSubmit) {
      validateForm();
    }
  }, [title, instructions, servings, category, imageUrl, hasAttemptedSubmit]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Expose hasFormChanges via ref (2025 pattern: useImperativeHandle)
  useImperativeHandle(ref, () => ({
    hasFormChanges,
  }));

  const validateForm = (): boolean => {
    try {
      const formData: RecipeRequestDto = {
        title,
        instructions: instructions || null,
        servings: servings || 1,
        category: category || '',
        imageUrl: imageUrl || null,
      };

      RecipeRequestSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError && error.issues) {
        const newErrors: FormErrors = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as keyof FormErrors;
          if (field && !newErrors[field]) {
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (internalLoading || isLoading) return;

    // Mark that the user has attempted to submit (enables progressive validation)
    setHasAttemptedSubmit(true);

    // Validate form data
    try {
      const formData: RecipeRequestDto = {
        title,
        instructions: instructions || null,
        servings: servings || 1,
        category: category || '',
        imageUrl: imageUrl || null,
      };

      RecipeRequestSchema.parse(formData);
      setErrors({});

      // If validation passes, submit the form
      setInternalLoading(true);
      try {
        await onSubmit(formData);
      } finally {
        if (isMountedRef.current) {
          setInternalLoading(false);
        }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: FormErrors = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as keyof FormErrors;
          if (field && !newErrors[field]) {
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
      }
      // Non-validation errors (like network errors) are silently caught
      // The parent component should handle them via the onSubmit promise
    }
  };

  const getFieldError = (field: keyof FormErrors): string | undefined => {
    // Hybrid validation: Only show errors after user has attempted to submit
    return hasAttemptedSubmit ? errors[field] : undefined;
  };

  const hasFormChanges = (): boolean => {
    // Compare current values to initial values
    const initialTitle = initialValues?.title || '';
    const initialInstructions = initialValues?.instructions || '';
    const initialServings = initialValues?.servings || 1;
    const initialCategory = initialValues?.category || '';
    const initialImageUrl = initialValues?.imageUrl || '';

    return (
      title !== initialTitle ||
      instructions !== initialInstructions ||
      servings !== initialServings ||
      category !== initialCategory ||
      imageUrl !== initialImageUrl
    );
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(hasFormChanges());
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <Card style={styles.card}>
        <TextInput
          label="Recipe Title"
          value={title}
          onChangeText={setTitle}
          error={getFieldError('title')}
          placeholder="Enter recipe name"
          maxLength={200}
          testID={`${testID}-title`}
          style={styles.input}
        />

        <NumberInput
          label="Servings"
          value={servings || ''}
          onChangeValue={setServings}
          error={getFieldError('servings')}
          min={1}
          max={100}
          integer={true}
          placeholder="Number of servings"
          testID={`${testID}-servings`}
          style={styles.input}
        />

        <View style={styles.input} testID={`${testID}-category-picker`}>
          <CategoryPicker
            value={category}
            onChange={setCategory}
            disabled={isLoading || internalLoading}
            testID={`${testID}-category-picker`}
          />
          {getFieldError('category') && (
            <HelperText type="error" visible={true}>
              {getFieldError('category')}
            </HelperText>
          )}
        </View>

        <View style={styles.input} testID={`${testID}-image-picker`}>
          <ImagePicker
            value={imageUrl}
            onChange={setImageUrl}
            disabled={isLoading || internalLoading}
            testID={`${testID}-image-picker`}
          />
        </View>

        <TextArea
          label="Instructions"
          value={instructions}
          onChangeText={setInstructions}
          error={getFieldError('instructions')}
          placeholder="Enter cooking instructions (optional)"
          rows={8}
          maxLength={5000}
          testID={`${testID}-instructions`}
          style={styles.input}
        />
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title={submitLabel}
          variant="primary"
          onPress={handleSubmit}
          loading={isLoading || internalLoading}
          disabled={isLoading || internalLoading}
          fullWidth
          testID={`${testID}-submit`}
          style={styles.submitButton}
        />
        
        {onCancel && (
          <Button
            title="Cancel"
            variant="secondary"
            onPress={handleCancel}
            disabled={isLoading || internalLoading}
            fullWidth
            testID={`${testID}-cancel`}
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  submitButton: {
    marginBottom: 8,
  },
});

// Export with the display name for debugging (2025 pattern)
RecipeFormComponent.displayName = 'RecipeForm';
export const RecipeForm = RecipeFormComponent;