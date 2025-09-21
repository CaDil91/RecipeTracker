import React from 'react';
import { TextInput, TextInputProps } from './TextInput';

export interface TextAreaProps extends Omit<TextInputProps, 'multiline' | 'numberOfLines'> {
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  rows = 4,
  ...props
}) => {
  return (
    <TextInput
      {...props}
      multiline={true}
      numberOfLines={rows}
    />
  );
};

export default TextArea;