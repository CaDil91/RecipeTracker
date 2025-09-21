import React from 'react';
import { Card as PaperCard, CardProps as PaperCardProps } from 'react-native-paper';
import { ViewStyle } from 'react-native';

export interface CardProps extends Omit<PaperCardProps, 'children'> {
  children: React.ReactNode;
  padded?: boolean;
  style?: ViewStyle;
}

interface CardComponent extends React.FC<CardProps> {
  Title: typeof PaperCard.Title;
  Content: typeof PaperCard.Content;
  Cover: typeof PaperCard.Cover;
  Actions: typeof PaperCard.Actions;
}

const CardBase: React.FC<CardProps> = ({
  children,
  padded = true,
  style,
  mode = 'elevated',
  elevation,
  ...props
}) => {
  const cardProps: any = {
    style,
    mode,
    ...props
  };

  if (mode === 'elevated' && elevation !== undefined) {
    cardProps.elevation = elevation;
  }

  return (
    <PaperCard {...cardProps}>
      {padded ? (
        <PaperCard.Content>
          {children}
        </PaperCard.Content>
      ) : (
        children
      )}
    </PaperCard>
  );
};

export const Card = CardBase as CardComponent;

Card.Title = PaperCard.Title;
Card.Content = PaperCard.Content;
Card.Cover = PaperCard.Cover;
Card.Actions = PaperCard.Actions;

export default Card;