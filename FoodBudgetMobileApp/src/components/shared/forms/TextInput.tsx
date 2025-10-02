import React from 'react';
import { TextInput as PaperTextInput, HelperText } from 'react-native-paper';
import { View, ViewStyle } from 'react-native';
import { FieldError } from 'react-hook-form';

export interface TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: FieldError | string;
  helperText?: string;
  mode?: 'flat' | 'outlined';
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  testID?: string;
  style?: ViewStyle;
  maxLength?: number;
  onBlur?: () => void;
  onFocus?: () => void;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  mode = 'outlined',
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  testID,
  style,
  maxLength,
  onBlur,
  onFocus,
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const hasError = !!errorMessage;

  return (
    <View style={style}>
      <PaperTextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        mode={mode}
        error={hasError}
        multiline={multiline}
        numberOfLines={numberOfLines}
        disabled={disabled}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        testID={testID}
        maxLength={maxLength}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {(hasError || helperText) && (
        <HelperText type={hasError ? 'error' : 'info'} visible={true}>
          {errorMessage || helperText}
        </HelperText>
      )}
    </View>
  );
};