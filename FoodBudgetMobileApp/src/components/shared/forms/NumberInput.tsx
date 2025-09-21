import React from 'react';
import { TextInput, TextInputProps } from './TextInput';

export interface NumberInputProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  value: number | string;
  onChangeValue: (value: number | undefined) => void;
  min?: number;
  max?: number;
  integer?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChangeValue,
  min,
  max,
  integer = false,
  error,
  ...props
}) => {
  const handleChangeText = (text: string) => {
    if (text === '') {
      onChangeValue(undefined);
      return;
    }

    const cleanedText = text.replace(/[^0-9.-]/g, '');

    if (integer) {
      const intValue = parseInt(cleanedText, 10);
      if (!isNaN(intValue)) {
        onChangeValue(intValue);
      }
    } else {
      const floatValue = parseFloat(cleanedText);
      if (!isNaN(floatValue)) {
        onChangeValue(floatValue);
      }
    }
  };

  let validationError = error;
  if (!validationError && value !== undefined && value !== '') {
    const numValue = typeof value === 'number' ? value : parseFloat(value as string);
    if (!isNaN(numValue)) {
      if (min !== undefined && numValue < min) {
        validationError = `Value must be at least ${min}`;
      } else if (max !== undefined && numValue > max) {
        validationError = `Value must be at most ${max}`;
      }
    }
  }

  return (
    <TextInput
      {...props}
      value={value?.toString() || ''}
      onChangeText={handleChangeText}
      keyboardType="numeric"
      error={validationError}
    />
  );
};

export default NumberInput;