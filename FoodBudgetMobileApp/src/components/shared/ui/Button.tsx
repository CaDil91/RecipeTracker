import React from 'react';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { ViewStyle } from 'react-native';

export interface ButtonProps extends Omit<PaperButtonProps, 'children'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'text';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  fullWidth = false,
  mode,
  buttonColor,
  textColor,
  style,
  ...props
}) => {
  const getVariantProps = () => {
    switch (variant) {
      case 'primary':
        return {
          mode: 'contained' as const,
          buttonColor: buttonColor || undefined,
        };
      case 'secondary':
        return {
          mode: 'outlined' as const,
        };
      case 'danger':
        return {
          mode: 'contained' as const,
          buttonColor: buttonColor || '#dc3545',
        };
      case 'text':
        return {
          mode: 'text' as const,
        };
      default:
        return {
          mode: mode || 'contained' as const,
        };
    }
  };

  const variantProps = getVariantProps();

  return (
    <PaperButton
      {...variantProps}
      {...props}
      disabled={props.disabled || props.loading}
      textColor={textColor}
      style={[
        fullWidth && { width: '100%' },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{
        disabled: props.disabled || props.loading,
        busy: props.loading,
      }}
    >
      {title}
    </PaperButton>
  );
};

export default Button;