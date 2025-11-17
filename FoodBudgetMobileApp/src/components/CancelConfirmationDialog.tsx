import React from 'react';
import { Portal, Dialog, Button, Text } from 'react-native-paper';

interface CancelConfirmationDialogProps {
  /** Whether the dialog is visible */
  visible: boolean;
  /** Handler when dialog is dismissed */
  onDismiss: () => void;
  /** Handler when cancel/discard is confirmed */
  onConfirm: () => void;
  /** Test ID prefix for testing */
  testID?: string;
}

/**
 * CancelConfirmationDialog Component
 *
 * Confirmation dialog for discarding unsaved changes when canceling edit mode.
 * Uses React Native Paper's Portal for proper modal rendering.
 */
export const CancelConfirmationDialog: React.FC<CancelConfirmationDialogProps> = ({
  visible,
  onDismiss,
  onConfirm,
  testID = 'recipe-detail-cancel-dialog',
}) => {
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        testID={testID}
      >
        <Dialog.Title>Discard Changes?</Dialog.Title>
        <Dialog.Content>
          <Text>Are you sure you want to discard your changes?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={onDismiss}
            testID={`${testID}-dismiss`}
          >
            No
          </Button>
          <Button
            onPress={onConfirm}
            testID={`${testID}-confirm`}
          >
            Yes
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};