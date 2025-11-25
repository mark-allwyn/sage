/**
 * Quick Create Wizard Component
 * Simplified 3-step wizard for beginners
 * Step 1: Choose template or start blank
 * Step 2: Add questions
 * Step 3: Define audience (persona groups)
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { SurveyBuilderState } from '../../services/types';
import SurveyTemplates from './SurveyTemplates';
import QuestionEditor from './QuestionEditor';
import PersonaGroupEditor from './PersonaGroupEditor';

interface QuickCreateWizardProps {
  onSave: (surveyData: SurveyBuilderState, filename: string) => void;
  isLoading: boolean;
}

const QuickCreateWizard: React.FC<QuickCreateWizardProps> = ({ onSave, isLoading }) => {
  const [activeStep, setActiveStep] = useState(0);
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

  const steps = [
    'Survey Information',
    'Add Questions',
    'Define Audience',
  ];

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleTemplateSelect = (templateData: Partial<SurveyBuilderState>) => {
    setSurveyData({
      ...surveyData,
      ...templateData,
    });
  };

  const handleSave = () => {
    onSave(surveyData, filename);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return surveyData.name.trim().length > 0 && filename.trim().length > 0;
      case 1:
        return surveyData.questions.length > 0;
      case 2:
        return surveyData.persona_groups.length > 0;
      default:
        return false;
    }
  };

  return (
    <Box>
      {/* Stepper */}
      <Paper sx={{ mb: 3, p: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Box>
        {/* Step 0: Survey Information & Templates */}
        {activeStep === 0 && (
          <>
            <Paper sx={{ p: 4, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Survey Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter basic details about your survey
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Survey Name"
                    value={surveyData.name}
                    onChange={(e) => setSurveyData({ ...surveyData, name: e.target.value })}
                    required
                    placeholder="e.g., Customer Satisfaction Survey"
                    helperText="A descriptive name for your survey"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    required
                    placeholder="my_survey.yaml"
                    helperText="The file will be saved with this name (must end in .yaml)"
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
                    placeholder="Brief description of your survey's purpose"
                    helperText="Optional: Describe what this survey is for"
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
                    placeholder="Additional context or instructions"
                    helperText="Optional: Any special instructions or background information"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Survey Templates */}
            <SurveyTemplates onTemplateSelect={handleTemplateSelect} />
          </>
        )}

        {/* Step 1: Questions */}
        {activeStep === 1 && (
          <QuestionEditor
            questions={surveyData.questions}
            setQuestions={(questions) => setSurveyData({ ...surveyData, questions })}
            categories={surveyData.categories}
          />
        )}

        {/* Step 2: Persona Groups */}
        {activeStep === 2 && (
          <PersonaGroupEditor
            personaGroups={surveyData.persona_groups}
            setPersonaGroups={(persona_groups) => setSurveyData({ ...surveyData, persona_groups })}
          />
        )}
      </Box>

      {/* Navigation */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            disabled={activeStep === 0 || isLoading}
            variant="outlined"
          >
            Back
          </Button>

          <Typography variant="body2" color="text.secondary">
            Step {activeStep + 1} of {steps.length}
          </Typography>

          {activeStep < steps.length - 1 ? (
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
              disabled={!canProceed()}
              variant="contained"
            >
              Next
            </Button>
          ) : (
            <Button
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={!canProceed() || isLoading}
              variant="contained"
              color="success"
              size="large"
            >
              {isLoading ? 'Creating...' : 'Create Survey'}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default QuickCreateWizard;
