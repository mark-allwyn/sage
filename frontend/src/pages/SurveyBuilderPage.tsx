/**
 * Survey Builder Page
 * Create and edit survey configurations
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Code as CodeIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  Create as CreateIcon,
  ContentCopy as CopyIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import SurveyForm from '../components/SurveyBuilder/SurveyForm';
import YAMLPreview from '../components/SurveyBuilder/YAMLPreview';
import CategoryEditor from '../components/SurveyBuilder/CategoryEditor';
import QuestionEditor from '../components/SurveyBuilder/QuestionEditor';
import PersonaGroupEditor from '../components/SurveyBuilder/PersonaGroupEditor';
import { useCreateSurvey, useUpdateSurvey, useDeleteSurvey, useSurveys, useSurvey } from '../services/hooks';
import { getErrorMessage } from '../services/api';
import { SurveyBuilderState } from '../services/types';
import { SurveyBuilderSkeleton } from '../components/LoadingSkeleton';
import PageHeader from '../components/PageHeader';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

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
  const navigate = useNavigate();
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
  });
  const [filename, setFilename] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const loadedSurveyIdRef = useRef<string>('');
  const [autoSaveMessage, setAutoSaveMessage] = useState<string>('');

  // Wizard mode state
  const [wizardMode, setWizardMode] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const AUTO_SAVE_KEY = 'sage_survey_builder_autosave';

  // Wizard steps
  const wizardSteps = [
    { label: 'Basic Information', optional: false },
    { label: 'Categories', optional: true },
    { label: 'Questions', optional: false },
    { label: 'Persona Groups', optional: false },
    { label: 'Review & Save', optional: false },
  ];

  // Track unsaved changes and warn on navigation
  useUnsavedChanges({
    when: hasUnsavedChanges,
    message: 'You have unsaved changes to your survey. Do you want to leave without saving?'
  });

  const { data: surveys, isLoading: surveysLoading, refetch: refetchSurveys } = useSurveys();
  const { data: selectedSurvey, isLoading: surveyLoading } = useSurvey(selectedSurveyId, {
    enabled: !!selectedSurveyId && mode === 'edit',
  });

  // Load selected survey data into form when editing
  // Only load once per survey selection to prevent overwriting user edits
  useEffect(() => {
    if (selectedSurvey && mode === 'edit' && selectedSurveyId && loadedSurveyIdRef.current !== selectedSurveyId) {
      setSurveyData({
        name: selectedSurvey.name,
        description: selectedSurvey.description || '',
        context: selectedSurvey.context || '',
        questions: selectedSurvey.questions,
        persona_groups: selectedSurvey.persona_groups,
        categories: selectedSurvey.categories || [],
        demographics: selectedSurvey.demographics || ['age_group', 'gender', 'occupation'],
      });
      setFilename(selectedSurveyId + '.yaml');
      loadedSurveyIdRef.current = selectedSurveyId;
    }
  }, [selectedSurvey, selectedSurveyId, mode]);

  // Load auto-saved data on mount (only for create mode)
  useEffect(() => {
    if (mode === 'create') {
      try {
        const saved = localStorage.getItem(AUTO_SAVE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          // Only restore if there's meaningful data
          if (data.surveyData.name || data.surveyData.questions.length > 0) {
            const shouldRestore = window.confirm(
              'Found an auto-saved draft. Would you like to restore it?'
            );
            if (shouldRestore) {
              setSurveyData(data.surveyData);
              setFilename(data.filename);
              setAutoSaveMessage('Draft restored from auto-save');
              setTimeout(() => setAutoSaveMessage(''), 3000);
            } else {
              localStorage.removeItem(AUTO_SAVE_KEY);
            }
          }
        }
      } catch (error) {
        console.error('Error loading auto-save:', error);
      }
    }
  }, []);

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    if (mode !== 'create') return; // Only auto-save in create mode

    const interval = setInterval(() => {
      try {
        const dataToSave = {
          surveyData,
          filename,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(dataToSave));
        setAutoSaveMessage('Draft auto-saved');
        setTimeout(() => setAutoSaveMessage(''), 2000);
      } catch (error) {
        console.error('Error auto-saving:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [surveyData, filename, mode]);

  const createSurveyMutation = useCreateSurvey({
    onSuccess: (data) => {
      // Clear auto-save
      localStorage.removeItem(AUTO_SAVE_KEY);
      // Show success notification
      setSnackbar({
        open: true,
        message: `Survey created successfully: ${data.survey_id}`,
        severity: 'success',
      });
      // Automatically switch to edit mode with the newly created survey
      setMode('edit');
      setSelectedSurveyId(data.survey_id);
      loadedSurveyIdRef.current = ''; // Reset ref to allow loading the new survey
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
      // Reset the ref so the updated data can be loaded
      loadedSurveyIdRef.current = '';
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
      });
      setFilename('');
      // Refresh surveys list to update dropdown
      refetchSurveys();
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
    loadedSurveyIdRef.current = ''; // Reset loaded survey tracking
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

  const handleDuplicate = () => {
    // Switch to create mode with current survey data
    // Update the name to indicate it's a copy
    setSurveyData({
      ...surveyData,
      name: `${surveyData.name} (Copy)`,
    });
    setFilename(''); // Clear filename so user must provide new one
    setMode('create');
    setSelectedSurveyId('');
    setSnackbar({
      open: true,
      message: 'Survey duplicated. Update the filename and save to create a copy.',
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Wizard navigation
  const handleNext = () => {
    setActiveStep((prevStep) => Math.min(prevStep + 1, wizardSteps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleStepClick = (step: number) => {
    setActiveStep(step);
  };

  const canProceedToNextStep = () => {
    switch (activeStep) {
      case 0: // Basic Information
        return surveyData.name.trim().length > 0;
      case 1: // Categories (optional)
        return true;
      case 2: // Questions
        return surveyData.questions.length > 0;
      case 3: // Persona Groups
        return surveyData.persona_groups.length > 0;
      default:
        return true;
    }
  };

  const isLoading = createSurveyMutation.isPending || updateSurveyMutation.isPending || deleteSurveyMutation.isPending;

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Survey Builder"
        subtitle="Create a new survey or edit an existing survey configuration"
        icon={<CreateIcon sx={{ fontSize: 28 }} />}
      />

      {/* Auto-save indicator */}
      {autoSaveMessage && mode === 'create' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {autoSaveMessage}
        </Alert>
      )}

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
                bgcolor: mode === 'create' ? 'action.selected' : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: mode === 'create' ? 'action.selected' : 'action.hover',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AddIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
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
                bgcolor: mode === 'edit' ? 'action.selected' : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: mode === 'edit' ? 'action.selected' : 'action.hover',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CodeIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
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
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 500,
                    },
                  },
                }}
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
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
                {mode === 'edit' && selectedSurveyId && (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<CopyIcon />}
                    onClick={handleDuplicate}
                    disabled={isLoading}
                  >
                    Duplicate Survey
                  </Button>
                )}
                {mode === 'edit' && selectedSurveyId && (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/preview/${selectedSurveyId}`)}
                    disabled={isLoading}
                  >
                    Preview Survey
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

      {/* Wizard Mode Toggle */}
      {(mode === 'create' || (mode === 'edit' && selectedSurveyId)) && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={wizardMode}
                onChange={(e) => {
                  setWizardMode(e.target.checked);
                  if (e.target.checked) {
                    setActiveStep(0); // Reset to first step when enabling wizard
                  }
                }}
              />
            }
            label="Wizard Mode"
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            {wizardMode ? 'Step-by-step guided mode' : 'Free-form editing mode'}
          </Typography>
        </Paper>
      )}

      {/* Wizard Mode View */}
      {wizardMode && (mode === 'create' || (mode === 'edit' && selectedSurveyId)) && (
        <>
          <Paper sx={{ mb: 3, p: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {wizardSteps.map((step, index) => (
                <Step key={step.label}>
                  <StepButton onClick={() => handleStepClick(index)}>
                    <StepLabel optional={step.optional ? <Typography variant="caption">Optional</Typography> : undefined}>
                      {step.label}
                    </StepLabel>
                  </StepButton>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Step Content */}
          <Box>
            {/* Step 0: Basic Information */}
            {activeStep === 0 && (
              <Paper sx={{ p: 4, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Basic Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Enter the core details about your survey
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Survey Name"
                      value={surveyData.name}
                      onChange={(e) => setSurveyData({ ...surveyData, name: e.target.value })}
                      required
                      helperText="A descriptive name for your survey"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={surveyData.description}
                      onChange={(e) => setSurveyData({ ...surveyData, description: e.target.value })}
                      multiline
                      rows={3}
                      helperText="A brief description of the survey's purpose"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Context"
                      value={surveyData.context}
                      onChange={(e) => setSurveyData({ ...surveyData, context: e.target.value })}
                      multiline
                      rows={3}
                      helperText="Additional context or instructions for the survey"
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Step 1: Categories */}
            {activeStep === 1 && (
              <CategoryEditor
                categories={surveyData.categories}
                setCategories={(categories) => setSurveyData({ ...surveyData, categories })}
              />
            )}

            {/* Step 2: Questions */}
            {activeStep === 2 && (
              <QuestionEditor
                questions={surveyData.questions}
                setQuestions={(questions) => setSurveyData({ ...surveyData, questions })}
                categories={surveyData.categories}
              />
            )}

            {/* Step 3: Persona Groups */}
            {activeStep === 3 && (
              <PersonaGroupEditor
                personaGroups={surveyData.persona_groups}
                setPersonaGroups={(persona_groups) => setSurveyData({ ...surveyData, persona_groups })}
              />
            )}

            {/* Step 4: Review & Save */}
            {activeStep === 4 && (
              <Paper sx={{ p: 4, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Review & Save
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Review your survey configuration before saving
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Survey Name
                      </Typography>
                      <Typography variant="body1">{surveyData.name || '(Not set)'}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Categories
                      </Typography>
                      <Typography variant="h4">{surveyData.categories.length}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Questions
                      </Typography>
                      <Typography variant="h4">{surveyData.questions.length}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Persona Groups
                      </Typography>
                      <Typography variant="h4">{surveyData.persona_groups.length}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                      <Button
                        variant="contained"
                        size="large"
                        color="success"
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

            {/* Navigation Buttons */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  variant="outlined"
                >
                  Previous
                </Button>

                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                  Step {activeStep + 1} of {wizardSteps.length}
                </Typography>

                {activeStep < wizardSteps.length - 1 ? (
                  <Button
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNext}
                    disabled={!canProceedToNextStep()}
                    variant="contained"
                  >
                    Next
                  </Button>
                ) : (
                  <Box sx={{ width: 100 }} />
                )}
              </Box>
            </Paper>
          </Box>
        </>
      )}

      {/* Traditional Tabs View - Only show when NOT in wizard mode */}
      {!wizardMode && (mode === 'create' || (mode === 'edit' && selectedSurveyId)) && (
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

  // Demographics
  if (data.demographics && data.demographics.length > 0) {
    yaml.push('  demographics:');
    data.demographics.forEach(demo => {
      yaml.push(`    - ${demo}`);
    });
  } else {
    yaml.push('  demographics: []');
  }

  // Categories (if any)
  if (data.categories && data.categories.length > 0) {
    yaml.push('  categories:');
    data.categories.forEach(cat => {
      yaml.push(`    - id: ${cat.id}`);
      yaml.push(`      name: "${cat.name}"`);
      yaml.push(`      description: "${cat.description}"`);
      yaml.push(`      context: "${cat.context}"`);
      if (cat.media_type) {
        yaml.push(`      media_type: "${cat.media_type}"`);
      }
      if (cat.media_url) {
        yaml.push(`      media_url: "${cat.media_url}"`);
      }
      if (cat.media_path) {
        yaml.push(`      media_path: "${cat.media_path}"`);
      }
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
    if (q.scale) {
      yaml.push(`      scale:`);
      Object.entries(q.scale).forEach(([key, value]) => {
        yaml.push(`        ${key}: "${value}"`);
      });
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
    if (pg.personas && pg.personas.length > 0) {
      yaml.push(`      personas:`);
      pg.personas.forEach(p => {
        yaml.push(`        - "${p}"`);
      });
    } else {
      yaml.push(`      personas: []`);
    }
    const hasTargetDemographics = pg.target_demographics && (
      pg.target_demographics.gender?.length ||
      pg.target_demographics.age_group?.length ||
      pg.target_demographics.occupation?.length ||
      pg.target_demographics.income_level?.length ||
      pg.target_demographics.tech_comfort_level?.length
    );
    if (hasTargetDemographics) {
      yaml.push(`      target_demographics:`);
      if (pg.target_demographics.gender) {
        yaml.push(`        gender: [${pg.target_demographics.gender.map(g => `"${g}"`).join(', ')}]`);
      }
      if (pg.target_demographics.age_group) {
        yaml.push(`        age_group: [${pg.target_demographics.age_group.map(a => `"${a}"`).join(', ')}]`);
      }
      if (pg.target_demographics.occupation) {
        yaml.push(`        occupation: [${pg.target_demographics.occupation.map(o => `"${o}"`).join(', ')}]`);
      }
      if (pg.target_demographics.income_level) {
        yaml.push(`        income_level: [${pg.target_demographics.income_level.map(il => `"${il}"`).join(', ')}]`);
      }
      if (pg.target_demographics.tech_comfort_level) {
        yaml.push(`        tech_comfort_level: [${pg.target_demographics.tech_comfort_level.map(tcl => `"${tcl}"`).join(', ')}]`);
      }
    } else {
      yaml.push(`      target_demographics: {}`);
    }
  });

  return yaml.join('\n');
};

export default SurveyBuilderPage;
