/**
 * Survey Form Component
 * Main form for creating/editing surveys with progressive disclosure
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from '@mui/material';
import {
  HelpOutline as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { SurveyBuilderState, DEMOGRAPHICS_OPTIONS } from '../../services/types';
import QuestionEditor from './QuestionEditor';
import PersonaGroupEditor from './PersonaGroupEditor';
import CategoryEditor from './CategoryEditor';

interface SurveyFormProps {
  surveyData: SurveyBuilderState;
  setSurveyData: (data: SurveyBuilderState) => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ surveyData, setSurveyData }) => {
  const [expandedPanel, setExpandedPanel] = useState<string>('panel1');

  const handleChange = (field: keyof SurveyBuilderState, value: any) => {
    setSurveyData({ ...surveyData, [field]: value });
  };

  const handlePanelChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : '');
  };

  // Helper to check if a section is complete
  const isBasicInfoComplete = () => {
    return surveyData.name && surveyData.description && surveyData.context;
  };

  const isCategoriesComplete = () => {
    return surveyData.categories && surveyData.categories.length > 0;
  };

  const isQuestionsComplete = () => {
    return surveyData.questions && surveyData.questions.length > 0;
  };

  const isPersonasComplete = () => {
    return surveyData.persona_groups && surveyData.persona_groups.length > 0;
  };

  return (
    <Box>
      {/* Step 1: Basic Information */}
      <Accordion
        expanded={expandedPanel === 'panel1'}
        onChange={handlePanelChange('panel1')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: expandedPanel === 'panel1' ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            {isBasicInfoComplete() && (
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
            )}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">Step 1: Basic Information</Typography>
              <Typography variant="caption" color="text.secondary">
                Name, description, and survey context
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ p: 3, mb: 0, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h5">
            Basic Information
          </Typography>
          <Tooltip title="Define the core details of your survey including name, description, and target audience parameters">
            <IconButton size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <TextField
                fullWidth
                label="Survey Name"
                value={surveyData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                helperText="A concise, descriptive name for your survey"
              />
              <Tooltip title="Choose a clear, memorable name that describes the survey's purpose (e.g., 'Brand Perception Study 2024')" arrow placement="right">
                <IconButton
                  size="medium"
                  sx={{
                    mt: 1,
                    minWidth: 44,
                    minHeight: 44,
                  }}
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <TextField
                fullWidth
                label="Description"
                value={surveyData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={2}
                required
                helperText="Brief overview of the survey's objectives and scope"
              />
              <Tooltip title="Describe what you're trying to learn from this survey. This helps provide context to the AI when generating responses." arrow placement="right">
                <IconButton
                  size="medium"
                  sx={{
                    mt: 1,
                    minWidth: 44,
                    minHeight: 44,
                  }}
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <TextField
                fullWidth
                label="Context"
                value={surveyData.context}
                onChange={(e) => handleChange('context', e.target.value)}
                multiline
                rows={6}
                helperText="Detailed background information that will be shared with AI respondents"
                required
              />
              <Tooltip title="Provide comprehensive context about the topic. This could include market background, product details, or any information that would help a real person understand the survey better. The AI uses this to generate more authentic responses." arrow placement="right">
                <IconButton
                  size="medium"
                  sx={{
                    mt: 1,
                    minWidth: 44,
                    minHeight: 44,
                  }}
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <TextField
                fullWidth
                type="number"
                label="Sample Size"
                value={surveyData.sample_size}
                onChange={(e) => handleChange('sample_size', parseInt(e.target.value) || 100)}
                inputProps={{ min: 10, max: 1000 }}
                helperText="Number of synthetic respondents (10-1000)"
              />
              <Tooltip title="The total number of synthetic respondents to generate. Larger samples provide more statistical power but take longer to run. Start with 100-200 for testing." arrow placement="right">
                <IconButton
                  size="medium"
                  sx={{
                    mt: 1,
                    minWidth: 44,
                    minHeight: 44,
                  }}
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Demographics</InputLabel>
                <Select
                  multiple
                  value={surveyData.demographics}
                  onChange={(e) => handleChange('demographics', e.target.value)}
                  input={<OutlinedInput label="Demographics" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {DEMOGRAPHICS_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Select demographic dimensions to vary across your synthetic audience. These will be used to create diverse respondent profiles that match your target population." arrow placement="right">
                <IconButton
                  size="medium"
                  sx={{
                    mt: 1,
                    minWidth: 44,
                    minHeight: 44,
                  }}
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>
        </AccordionDetails>
      </Accordion>

      {/* Step 2: Categories */}
      <Accordion
        expanded={expandedPanel === 'panel2'}
        onChange={handlePanelChange('panel2')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: expandedPanel === 'panel2' ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            {isCategoriesComplete() && (
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
            )}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">Step 2: Categories (Optional)</Typography>
              <Typography variant="caption" color="text.secondary">
                {surveyData.categories && surveyData.categories.length > 0
                  ? `${surveyData.categories.length} ${surveyData.categories.length === 1 ? 'category' : 'categories'} defined`
                  : 'Group questions into categories for better organization'}
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <CategoryEditor
            categories={surveyData.categories || []}
            setCategories={(categories) => handleChange('categories', categories)}
          />
        </AccordionDetails>
      </Accordion>

      {/* Step 3: Questions */}
      <Accordion
        expanded={expandedPanel === 'panel3'}
        onChange={handlePanelChange('panel3')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: expandedPanel === 'panel3' ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            {isQuestionsComplete() && (
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
            )}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">Step 3: Questions *</Typography>
              <Typography variant="caption" color="text.secondary">
                {surveyData.questions && surveyData.questions.length > 0
                  ? `${surveyData.questions.length} ${surveyData.questions.length === 1 ? 'question' : 'questions'} added`
                  : 'Define the questions for your survey'}
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <QuestionEditor
            questions={surveyData.questions}
            setQuestions={(questions) => handleChange('questions', questions)}
            categories={surveyData.categories || []}
          />
        </AccordionDetails>
      </Accordion>

      {/* Step 4: Persona Groups */}
      <Accordion
        expanded={expandedPanel === 'panel4'}
        onChange={handlePanelChange('panel4')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: expandedPanel === 'panel4' ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            {isPersonasComplete() && (
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
            )}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">Step 4: Persona Groups *</Typography>
              <Typography variant="caption" color="text.secondary">
                {surveyData.persona_groups && surveyData.persona_groups.length > 0
                  ? `${surveyData.persona_groups.length} persona ${surveyData.persona_groups.length === 1 ? 'group' : 'groups'} configured`
                  : 'Define audience segments for synthetic responses'}
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <PersonaGroupEditor
            personaGroups={surveyData.persona_groups}
            setPersonaGroups={(groups) => handleChange('persona_groups', groups)}
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default SurveyForm;
