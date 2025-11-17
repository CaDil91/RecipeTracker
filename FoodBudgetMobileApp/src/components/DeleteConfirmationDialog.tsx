import React from 'react';
import { Portal, Dialog, Button, Text } from 'react-native-paper';

interface DeleteConfirmationDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  testID?: string;
}

/**
 * DeleteConfirmationDialog Component
 *
 * Confirmation dialog for deleting a recipe.
 * Uses React Native Paper's Portal for proper modal rendering.
 */
export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  visible,
  onDismiss,
  onConfirm,
  testID = 'recipe-detail-delete-dialog',
}) => {
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        testID={testID}
      >
        <Dialog.Title>Delete Recipe?</Dialog.Title>
        <Dialog.Content>
          <Text>Are you sure you want to delete this recipe? This action cannot be undone.</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={onDismiss}
            testID={`${testID}-cancel`}
          >
            Cancel
          </Button>
          <Button
            onPress={onConfirm}
            testID={`${testID}-confirm`}
          >
            Delete
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};