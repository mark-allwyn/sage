/**
 * Persona Group Editor Dialog Component
 * Modal dialog for creating and editing persona groups
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { PersonaGroup } from '../../services/types';
import PersonaGroupEditForm from './PersonaGroupEditForm';

interface PersonaGroupEditorDialogProps {
  open: boolean;
  group: Partial<PersonaGroup> | null;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onGroupChange: (group: Partial<PersonaGroup>) => void;
}

const PersonaGroupEditorDialog: React.FC<PersonaGroupEditorDialogProps> = ({
  open,
  group,
  isEditing,
  onSave,
  onCancel,
  onGroupChange,
}) => {
  if (!group) return null;

  const isValid = group.name && group.personas && group.personas.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        {isEditing ? 'Edit Persona Group' : 'New Persona Group'}
        <IconButton
          aria-label="close"
          onClick={onCancel}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <PersonaGroupEditForm
          group={group}
          setGroup={onGroupChange}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          disabled={!isValid}
        >
          {isEditing ? 'Save Changes' : 'Add Persona Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PersonaGroupEditorDialog;
