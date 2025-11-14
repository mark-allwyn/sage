/**
 * Survey Builder Page
 * Create and edit survey configurations
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Save as SaveIcon, Code as CodeIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import SurveyForm from '../components/SurveyBuilder/SurveyForm';
import YAMLPreview from '../components/SurveyBuilder/YAMLPreview';
import { useCreateSurvey, useUpdateSurvey, useDeleteSurvey, useSurveys, useSurvey } from '../services/hooks';
import { getErrorMessage } from '../services/api';
import { SurveyBuilderState } from '../services/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
};

const SurveyBuilderPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const [surveyData, setSurveyData] = useState<SurveyBuilderState>({
    name: '',
    description: '',
    context: '',
    questions: [],
    persona_groups: [],
    categories: [],
    demographics: ['age_group', 'gender', 'occupation'],
    sample_size: 100,
  });
  const [filename, setFilename] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: surveys, isLoading: surveysLoading } = useSurveys();
  const { data: selectedSurvey, isLoading: surveyLoading } = useSurvey(selectedSurveyId, {
    enabled: !!selectedSurveyId && mode === 'edit',
  });

  // Load selected survey data into form when editing
  useEffect(() => {
    if (selectedSurvey && mode === 'edit') {
      setSurveyData({
        name: selectedSurvey.name,
        description: selectedSurvey.description || '',
        context: selectedSurvey.context || '',
        questions: selectedSurvey.questions,
        persona_groups: selectedSurvey.persona_groups,
        categories: selectedSurvey.categories || [],
        demographics: selectedSurvey.demographics || ['age_group', 'gender', 'occupation'],
        sample_size: selectedSurvey.sample_size || 100,
      });
      setFilename(selectedSurveyId + '.yaml');
    }
  }, [selectedSurvey, selectedSurveyId, mode]);

  const createSurveyMutation = useCreateSurvey({
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: `Survey created successfully: ${data.survey_id}`,
        severity: 'success',
      });
      // Reset form
      setSurveyData({
        name: '',
        description: '',
        context: '',
        questions: [],
        persona_groups: [],
        categories: [],
        demographics: ['age_group', 'gender', 'occupation'],
        sample_size: 100,
      });
      setFilename('');
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error creating survey: ${getErrorMessage(error)}`,
        severity: 'error',
      });
    },
  });

  const updateSurveyMutation = useUpdateSurvey({
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: `Survey updated successfully: ${data.survey_id}`,
        severity: 'success',
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error updating survey: ${getErrorMessage(error)}`,
        severity: 'error',
      });
    },
  });

  const deleteSurveyMutation = useDeleteSurvey({
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: `Survey deleted successfully: ${data.survey_id}`,
        severity: 'success',
      });
      // Reset form
      setMode('create');
      setSelectedSurveyId('');
      setSurveyData({
        name: '',
        description: '',
        context: '',
        questions: [],
        persona_groups: [],
        categories: [],
        demographics: ['age_group', 'gender', 'occupation'],
        sample_size: 100,
      });
      setFilename('');
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error deleting survey: ${getErrorMessage(error)}`,
        severity: 'error',
      });
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleModeChange = (newMode: 'create' | 'edit') => {
    setMode(newMode);
    if (newMode === 'create') {
      setSelectedSurveyId('');
      setSurveyData({
        name: '',
        description: '',
        context: '',
        questions: [],
        persona_groups: [],
        categories: [],
        demographics: ['age_group', 'gender', 'occupation'],
        sample_size: 100,
      });
      setFilename('');
    }
  };

  const handleSurveySelect = (surveyId: string) => {
    setSelectedSurveyId(surveyId);
  };

  const handleSave = (yamlContent: string) => {
    if (!filename.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a filename',
        severity: 'error',
      });
      return;
    }

    if (mode === 'edit' && selectedSurveyId) {
      updateSurveyMutation.mutate({
        surveyId: selectedSurveyId,
        request: {
          yaml_content: yamlContent,
          filename: filename.trim(),
        },
      });
    } else {
      createSurveyMutation.mutate({
        yaml_content: yamlContent,
        filename: filename.trim(),
      });
    }
  };

  const handleDelete = () => {
    if (selectedSurveyId) {
      deleteSurveyMutation.mutate(selectedSurveyId);
      setDeleteDialogOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const isLoading = createSurveyMutation.isPending || updateSurveyMutation.isPending || deleteSurveyMutation.isPending;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Survey Builder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a new survey or edit an existing survey configuration.
        </Typography>
      </Box>

      {/* Mode Selector */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Getting Started
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose whether to create a new survey or edit an existing one
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box
              onClick={() => handleModeChange('create')}
              sx={{
                p: 3,
                border: mode === 'create' ? '2px solid' : '1px solid',
                borderColor: mode === 'create' ? 'primary.main' : 'divider',
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: mode === 'create' ? 'primary.light' : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: mode === 'create' ? 'primary.light' : 'action.hover',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AddIcon sx={{ fontSize: 40, color: mode === 'create' ? 'primary.dark' : 'primary.main', mr: 2 }} />
                <Typography variant="h6">Create New Survey</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Start from scratch with a blank survey configuration. Define questions, categories, and persona groups.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              onClick={() => handleModeChange('edit')}
              sx={{
                p: 3,
                border: mode === 'edit' ? '2px solid' : '1px solid',
                borderColor: mode === 'edit' ? 'primary.main' : 'divider',
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: mode === 'edit' ? 'primary.light' : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: mode === 'edit' ? 'primary.light' : 'action.hover',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CodeIcon sx={{ fontSize: 40, color: mode === 'edit' ? 'primary.dark' : 'primary.main', mr: 2 }} />
                <Typography variant="h6">Edit Existing Survey</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Modify an existing survey configuration. Update questions, adjust categories, or refine persona groups.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Survey Selector (only in edit mode) */}
        {mode === 'edit' && (
          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Select Survey to Edit
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Survey</InputLabel>
              <Select
                value={selectedSurveyId}
                label="Survey"
                onChange={(e) => handleSurveySelect(e.target.value)}
                disabled={surveysLoading}
              >
                <MenuItem value="">
                  <em>Choose a survey...</em>
                </MenuItem>
                {surveys?.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    <Box>
                      <Typography variant="body2">{s.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.num_questions} questions • {s.num_persona_groups} persona groups
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {surveyLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Loading survey...
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Survey Information */}
      {(mode === 'create' || (mode === 'edit' && selectedSurveyId)) && (
        <Paper sx={{ p: 4, mb: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Survey Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mode === 'edit' ? 'Update your survey configuration and save changes' : 'Provide a filename for your new survey configuration'}
            </Typography>
          </Box>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} md={mode === 'edit' ? 12 : 12}>
              <TextField
                fullWidth
                label="Filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="my_survey.yaml"
                helperText={mode === 'edit' ? 'Filename cannot be changed in edit mode' : 'Enter a descriptive filename (e.g., customer_satisfaction.yaml)'}
                disabled={mode === 'edit'}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {mode === 'edit' && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isLoading}
                  >
                    Delete Survey
                  </Button>
                )}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={isLoading || !filename.trim()}
                  onClick={() => {
                    // Generate YAML from current survey data
                    const yaml = generateYAML(surveyData);
                    handleSave(yaml);
                  }}
                  sx={{ minWidth: 200 }}
                >
                  {isLoading ? 'Saving...' : mode === 'edit' ? 'Update Survey' : 'Save Survey'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tabs - Only show when in create mode or edit mode with selected survey */}
      {(mode === 'create' || (mode === 'edit' && selectedSurveyId)) && (
        <>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Form Builder" />
              <Tab label="YAML Preview" icon={<CodeIcon />} iconPosition="end" />
            </Tabs>
          </Paper>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <SurveyForm surveyData={surveyData} setSurveyData={setSurveyData} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <YAMLPreview surveyData={surveyData} />
          </TabPanel>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Survey</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this survey? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Helper function to generate YAML from survey data
const generateYAML = (data: SurveyBuilderState): string => {
  const yaml: string[] = [];

  yaml.push('survey:');
  yaml.push(`  name: "${data.name}"`);
  yaml.push(`  description: "${data.description}"`);
  yaml.push(`  context: "${data.context}"`);
  yaml.push(`  sample_size: ${data.sample_size}`);

  // Demographics
  yaml.push('  demographics:');
  data.demographics.forEach(demo => {
    yaml.push(`    - ${demo}`);
  });

  // Categories (if any)
  if (data.categories && data.categories.length > 0) {
    yaml.push('  categories:');
    data.categories.forEach(cat => {
      yaml.push(`    - id: ${cat.id}`);
      yaml.push(`      name: "${cat.name}"`);
      yaml.push(`      description: "${cat.description}"`);
      yaml.push(`      context: "${cat.context}"`);
    });
  }

  // Questions
  yaml.push('  questions:');
  data.questions.forEach(q => {
    yaml.push(`    - id: ${q.id}`);
    yaml.push(`      text: "${q.text}"`);
    yaml.push(`      type: ${q.type}`);
    if (q.category) {
      yaml.push(`      category: ${q.category}`);
    }
    if (q.categories_compared && q.categories_compared.length > 0) {
      yaml.push(`      categories_compared: [${q.categories_compared.join(', ')}]`);
    }
    if (q.options && q.options.length > 0) {
      yaml.push(`      options:`);
      q.options.forEach(opt => {
        yaml.push(`        - "${opt}"`);
      });
    }
  });

  // Persona Groups
  yaml.push('  persona_groups:');
  data.persona_groups.forEach(pg => {
    yaml.push(`    - name: "${pg.name}"`);
    yaml.push(`      description: "${pg.description}"`);
    yaml.push(`      weight: ${pg.weight}`);
    yaml.push(`      personas:`);
    pg.personas.forEach(p => {
      yaml.push(`        - "${p}"`);
    });
    yaml.push(`      target_demographics:`);
    yaml.push(`        gender: [${pg.target_demographics.gender.map(g => `"${g}"`).join(', ')}]`);
    yaml.push(`        age_group: [${pg.target_demographics.age_group.map(a => `"${a}"`).join(', ')}]`);
    yaml.push(`        occupation: [${pg.target_demographics.occupation.map(o => `"${o}"`).join(', ')}]`);
  });

  return yaml.join('\n');
};

export default SurveyBuilderPage;
