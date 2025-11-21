/**
 * Question Edit Form Component
 * Reusable form for creating and editing survey questions
 */

import React, { useMemo, useEffect } from 'react';
import {
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  OutlinedInput,
  Tooltip,
  Typography,
  Alert,
} from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { Question, QuestionType, Category, QUESTION_TYPES } from '../../services/types';
import { useFormValidation, ValidationRule, validationRules } from '../../hooks/useFormValidation';

interface QuestionEditFormProps {
  question: Partial<Question>;
  setQuestion: (question: Partial<Question>) => void;
  categories: Category[];
  onValidationChange?: (isValid: boolean) => void;
}

const QuestionEditForm: React.FC<QuestionEditFormProps> = ({
  question,
  setQuestion,
  categories,
  onValidationChange
}) => {
  // Define validation rules
  const rules: ValidationRule[] = useMemo(() => [
    {
      ...validationRules.required('Question ID is required'),
      field: 'id',
      validate: (value) => typeof value === 'string' && value.trim().length > 0,
    },
    {
      ...validationRules.pattern(/^[a-z0-9_]+$/, 'Question ID must be lowercase with underscores only'),
      field: 'id',
    },
    {
      ...validationRules.required('Question text is required'),
      field: 'text',
      validate: (value) => typeof value === 'string' && value.trim().length > 0,
    },
    {
      ...validationRules.minLength(5, 'Question text must be at least 5 characters'),
      field: 'text',
    },
  ], []);

  const validation = useFormValidation(rules);

  // Validate form whenever question changes
  useEffect(() => {
    validation.validateForm(question);
  }, [question, validation]);

  // Notify parent of validation state
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(validation.isValid);
    }
  }, [validation.isValid, onValidationChange]);

  const handleFieldChange = (field: string, value: any) => {
    setQuestion({ ...question, [field]: value });
    validation.touchField(field);
  };

  return (
    <Grid container spacing={2}>
      {!validation.isValid && Object.keys(validation.errors).length > 0 && (
        <Grid item xs={12}>
          <Alert severity="warning" sx={{ mb: 1 }}>
            Please fix the errors below before saving
          </Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <TextField
            fullWidth
            label="Question ID"
            value={question.id || ''}
            onChange={(e) => handleFieldChange('id', e.target.value)}
            onBlur={() => validation.touchField('id')}
            required
            error={!!validation.getFieldError('id')}
            helperText={validation.getFieldError('id') || "Unique identifier (e.g., 'q1', 'brand_awareness')"}
          />
          <Tooltip title="A unique ID for this question. Use lowercase with underscores (e.g., 'q1', 'brand_awareness', 'purchase_intent')">
            <IconButton size="small" sx={{ mt: 1 }}>
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <TextField
            fullWidth
            label="Question Text"
            value={question.text || ''}
            onChange={(e) => handleFieldChange('text', e.target.value)}
            onBlur={() => validation.touchField('text')}
            multiline
            rows={2}
            required
            error={!!validation.getFieldError('text')}
            helperText={validation.getFieldError('text') || "The actual question to ask respondents"}
          />
          <Tooltip title="Write the question exactly as you want it presented to respondents. Be clear and specific. For rating questions, you can include the scale in the question text.">
            <IconButton size="small" sx={{ mt: 1 }}>
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Question Type</InputLabel>
            <Select
              value={question.type || 'likert_5'}
              label="Question Type"
              onChange={(e) => setQuestion({ ...question, type: e.target.value as QuestionType })}
            >
              {QUESTION_TYPES.map((qt) => (
                <MenuItem key={qt.value} value={qt.value}>
                  {qt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Select the response format: Likert scales (1-5, 1-7, 1-10) for ratings, Multiple Choice for selecting options, Ranking for ordering items, or Open-Ended for text responses">
            <IconButton size="small" sx={{ mt: 1 }}>
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Grid>
      {categories.length > 0 && (
        <>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Category (Single)</InputLabel>
                <Select
                  value={question.category || ''}
                  label="Category (Single)"
                  onChange={(e) => setQuestion({ ...question, category: e.target.value, categories_compared: undefined })}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Use this when asking about a single category (e.g., 'How much do you like Product A?'). Leave empty if question doesn't relate to a specific category.">
                <IconButton size="small" sx={{ mt: 1 }}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Categories Compared (Multi)</InputLabel>
                <Select
                  multiple
                  value={question.categories_compared || []}
                  label="Categories Compared (Multi)"
                  onChange={(e) => setQuestion({ ...question, categories_compared: e.target.value as string[], category: undefined })}
                  input={<OutlinedInput label="Categories Compared (Multi)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Use this for comparison questions (e.g., 'Rank these products by preference'). Select multiple categories to compare. Don't use with Category (Single).">
                <IconButton size="small" sx={{ mt: 1 }}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </>
      )}

      {/* Answer Options - for multiple choice, yes/no, etc. */}
      {(question.type === 'multiple_choice' || question.type === 'yes_no') && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Answer Options (one per line)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={(question.options || []).join('\n')}
            onChange={(e) => {
              const options = e.target.value.split('\n').filter(opt => opt.trim() !== '');
              setQuestion({ ...question, options });
            }}
            placeholder="Enter each option on a new line"
            helperText="Each line will be a separate answer option"
          />
        </Grid>
      )}

      {/* Scale Definition - for likert scales */}
      {question.type?.includes('likert') && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Scale Labels (format: 1: Label Text, one per line)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={
              question.scale
                ? Object.entries(question.scale)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n')
                : ''
            }
            onChange={(e) => {
              const lines = e.target.value.split('\n');
              const scale: Record<number, string> = {};
              lines.forEach(line => {
                const match = line.match(/^(\d+):\s*(.+)$/);
                if (match) {
                  scale[Number(match[1])] = match[2].trim();
                }
              });
              setQuestion({ ...question, scale: Object.keys(scale).length > 0 ? scale : undefined });
            }}
            placeholder="1: Strongly Disagree&#10;2: Disagree&#10;3: Neutral&#10;4: Agree&#10;5: Strongly Agree"
            helperText="Define the text label for each numeric value (e.g., '1: Strongly Disagree')"
          />
        </Grid>
      )}

      {/* Scale Definition - for preference/comparison scales */}
      {question.type?.includes('preference') && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Comparison Scale Labels (format: 1: Label Text, one per line)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={
              question.scale
                ? Object.entries(question.scale)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n')
                : ''
            }
            onChange={(e) => {
              const lines = e.target.value.split('\n');
              const scale: Record<number, string> = {};
              lines.forEach(line => {
                const match = line.match(/^(\d+):\s*(.+)$/);
                if (match) {
                  scale[Number(match[1])] = match[2].trim();
                }
              });
              setQuestion({ ...question, scale: Object.keys(scale).length > 0 ? scale : undefined });
            }}
            placeholder={
              question.categories_compared && question.categories_compared.length >= 2
                ? `1: Strongly prefer {${question.categories_compared[0]}}&#10;2: Prefer {${question.categories_compared[0]}}&#10;3: No preference&#10;4: Prefer {${question.categories_compared[1]}}&#10;5: Strongly prefer {${question.categories_compared[1]}}`
                : "1: Strongly prefer first option&#10;2: Prefer first option&#10;3: No preference&#10;4: Prefer second option&#10;5: Strongly prefer second option"
            }
            helperText={
              question.categories_compared && question.categories_compared.length >= 2
                ? `Use {${question.categories_compared[0]}} and {${question.categories_compared[1]}} as placeholders for the category names`
                : "Use {category_id} as placeholders for category names (select categories first)"
            }
          />
        </Grid>
      )}
    </Grid>
  );
};

export default QuestionEditForm;
