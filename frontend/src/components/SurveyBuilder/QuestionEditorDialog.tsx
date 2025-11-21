/**
 * Question Editor Dialog Component
 * Modal dialog for creating and editing questions with focused editing experience
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
import { Question, Category } from '../../services/types';
import QuestionEditForm from './QuestionEditForm';

interface QuestionEditorDialogProps {
  open: boolean;
  question: Partial<Question> | null;
  isEditing: boolean;
  categories: Category[];
  onSave: () => void;
  onCancel: () => void;
  onQuestionChange: (question: Partial<Question>) => void;
}

const QuestionEditorDialog: React.FC<QuestionEditorDialogProps> = ({
  open,
  question,
  isEditing,
  categories,
  onSave,
  onCancel,
  onQuestionChange,
}) => {
  if (!question) return null;

  const isValid = question.text && question.id;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' }
      }}
    >
      <DialogTitle>
        {isEditing ? 'Edit Question' : 'New Question'}
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
        <QuestionEditForm
          question={question}
          setQuestion={onQuestionChange}
          categories={categories}
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
          {isEditing ? 'Update Question' : 'Add Question'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionEditorDialog;
