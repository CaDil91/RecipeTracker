import React from 'react';
import { TextInput as PaperTextInput, HelperText, Text, useTheme } from 'react-native-paper';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { FieldError } from 'react-hook-form';

export interface TextInputProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: FieldError | string;
  helperText?: string;
  mode?: 'flat' | 'outlined';
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  readOnly?: boolean;
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
  readOnly = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  testID,
  style,
  maxLength,
  onBlur,
  onFocus,
}) => {
  const theme = useTheme();
  const errorMessage = typeof error === 'string' ? error : error?.message;
  const hasError = !!errorMessage;

  // ReadOnly mode: Display as text with same layout as TextInput
  if (readOnly) {
    const styles = StyleSheet.create({
      readOnlyContainer: {
        marginBottom: 4,
      },
      label: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
        color: theme.colors.onSurfaceVariant,
        marginBottom: 4,
      },
      valueContainer: {
        minHeight: 56, // MD3 TextInput height
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        justifyContent: 'center',
      },
      valueText: {
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        color: theme.colors.onSurface,
        lineHeight: 24,
      },
      placeholderText: {
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        color: theme.colors.onSurfaceDisabled,
        fontStyle: 'italic',
        lineHeight: 24,
      },
    });

    return (
      <View style={[style, styles.readOnlyContainer]} testID={`${testID}-readonly`}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueContainer}>
          <Text style={value ? styles.valueText : styles.placeholderText}>
            {value || placeholder || ' '}
          </Text>
        </View>
        {helperText && (
          <HelperText type="info" visible={true}>
            {helperText}
          </HelperText>
        )}
      </View>
    );
  }

  // Editable mode: Standard TextInput
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