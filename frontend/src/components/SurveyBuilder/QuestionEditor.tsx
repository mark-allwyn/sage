/**
 * Question Editor Component
 * Add, edit, and remove survey questions
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  Grid,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, HelpOutline as HelpIcon } from '@mui/icons-material';
import { Question, Category } from '../../services/types';
import QuestionEditorDialog from './QuestionEditorDialog';

interface QuestionEditorProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  categories: Category[];
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ questions, setQuestions, categories }) => {
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAdd = () => {
    setEditingQuestion({
      id: `q${questions.length + 1}`,
      text: '',
      type: 'likert_5',
    });
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingQuestion({ ...questions[index] });
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingQuestion || !editingQuestion.text) return;

    const newQuestion: Question = {
      id: editingQuestion.id || `q${questions.length + 1}`,
      text: editingQuestion.text,
      type: editingQuestion.type || 'likert_5',
      category: editingQuestion.category,
      categories_compared: editingQuestion.categories_compared,
      options: editingQuestion.options,
      scale: editingQuestion.scale,
    };

    if (editingIndex !== null) {
      // Update existing question
      const updated = [...questions];
      updated[editingIndex] = newQuestion;
      setQuestions(updated);
    } else {
      // Add new question
      setQuestions([...questions, newQuestion]);
    }

    setEditingQuestion(null);
    setEditingIndex(null);
    setDialogOpen(false);
  };

  const handleDelete = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleCancel = () => {
    setEditingQuestion(null);
    setEditingIndex(null);
    setDialogOpen(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5">Questions</Typography>
          <Tooltip title="Define the questions you want to ask your synthetic audience. Choose question types that match your research needs (ratings, rankings, open-ended, etc.)">
            <IconButton size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAdd}>
          Add Question
        </Button>
      </Box>

      {/* Existing Questions */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {questions.map((q, index) => (
          <Grid item xs={12} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {q.id}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {q.text}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      <Chip label={q.type} size="small" color="primary" />
                      {q.category && <Chip label={`Category: ${q.category}`} size="small" />}
                      {q.categories_compared && q.categories_compared.length > 0 && (
                        <Chip label={`Comparing: ${q.categories_compared.join(', ')}`} size="small" />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton onClick={() => handleEdit(index)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(index)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Question Editor Dialog */}
      <QuestionEditorDialog
        open={dialogOpen}
        question={editingQuestion}
        isEditing={editingIndex !== null}
        categories={categories}
        onSave={handleSave}
        onCancel={handleCancel}
        onQuestionChange={setEditingQuestion}
      />

      {questions.length === 0 && !editingQuestion && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No questions added yet. Click "Add Question" to get started.
        </Typography>
      )}
    </Paper>
  );
};

export default QuestionEditor;
