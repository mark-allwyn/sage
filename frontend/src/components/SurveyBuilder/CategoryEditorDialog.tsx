/**
 * Category Editor Dialog Component
 * Modal dialog for creating and editing categories
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
import { Category } from '../../services/types';
import CategoryEditForm from './CategoryEditForm';

interface CategoryEditorDialogProps {
  open: boolean;
  category: Partial<Category> | null;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onCategoryChange: (category: Partial<Category>) => void;
}

const CategoryEditorDialog: React.FC<CategoryEditorDialogProps> = ({
  open,
  category,
  isEditing,
  onSave,
  onCancel,
  onCategoryChange,
}) => {
  if (!category) return null;

  const isValid = category.id && category.name;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        {isEditing ? 'Edit Category' : 'New Category'}
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
        <CategoryEditForm
          category={category}
          setCategory={onCategoryChange}
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
          {isEditing ? 'Update Category' : 'Add Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryEditorDialog;
