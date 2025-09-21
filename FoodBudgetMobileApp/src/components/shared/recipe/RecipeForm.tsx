import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { RecipeRequestDto, RecipeResponseDto } from '../../../lib/shared/types/dto';
import { RecipeRequestSchema } from '../../../lib/shared/schemas/recipe.schema';
import { TextInput } from '../forms/TextInput';
import { TextArea } from '../forms/TextArea';
import { NumberInput } from '../forms/NumberInput';
import { Button } from '../ui/Button';
import { Card } from '../layout/Card';
import { ZodError } from 'zod';

export interface RecipeFormProps {
  initialValues?: Partial<RecipeResponseDto>;
  onSubmit: (data: RecipeRequestDto) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  testID?: string;
}

interface FormErrors {
  title?: string;
  instructions?: string;
  servings?: string;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save Recipe',
  isLoading = false,
  testID = 'recipe-form',
}) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [instructions, setInstructions] = useState(initialValues?.instructions || '');
  const [servings, setServings] = useState<number | undefined>(initialValues?.servings || 1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Progressive validation: Only validate if user has attempted submit
    if (hasAttemptedSubmit) {
      validateForm();
    }
  }, [title, instructions, servings, hasAttemptedSubmit]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const validateForm = (): boolean => {
    try {
      const formData: RecipeRequestDto = {
        title,
        instructions: instructions || null,
        servings: servings || 1,
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

  const handleFieldTouch = (field: string) => {
    setTouched(prev => new Set(prev).add(field));
  };

  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (internalLoading || isLoading) return;

    // Mark that user has attempted to submit (enables progressive validation)
    setHasAttemptedSubmit(true);

    // Mark all fields as touched to show all errors
    const allFields = new Set(['title', 'instructions', 'servings']);
    setTouched(allFields);

    // Validate form data
    try {
      const formData: RecipeRequestDto = {
        title,
        instructions: instructions || null,
        servings: servings || 1,
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

  return (
    <View style={styles.container} testID={testID}>
      <Card style={styles.card}>
        <TextInput
          label="Recipe Title"
          value={title}
          onChangeText={setTitle}
          onBlur={() => handleFieldTouch('title')}
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
          onBlur={() => handleFieldTouch('servings')}
          error={getFieldError('servings')}
          min={1}
          max={100}
          integer={true}
          placeholder="Number of servings"
          testID={`${testID}-servings`}
          style={styles.input}
        />

        <TextArea
          label="Instructions"
          value={instructions}
          onChangeText={setInstructions}
          onBlur={() => handleFieldTouch('instructions')}
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
            onPress={onCancel}
            disabled={isLoading || internalLoading}
            fullWidth
            testID={`${testID}-cancel`}
          />
        )}
      </View>
    </View>
  );
};

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

export default RecipeForm;