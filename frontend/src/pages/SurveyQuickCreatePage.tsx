/**
 * Survey Quick Create Page
 * Simplified 3-step wizard for beginners
 * No mode toggle, no tabs - just a streamlined survey creation experience
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Alert,
  Snackbar,
  Button,
  Typography,
} from '@mui/material';
import {
  Create as CreateIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import QuickCreateWizard from '../components/SurveyBuilder/QuickCreateWizard';
import { useCreateSurvey } from '../services/hooks';
import { getErrorMessage } from '../services/api';
import { SurveyBuilderState } from '../services/types';
import PageHeader from '../components/PageHeader';

const SurveyQuickCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const createSurveyMutation = useCreateSurvey({
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: `Survey created successfully: ${data.survey_id}`,
        severity: 'success',
      });
      // Navigate to the survey builder page to edit further
      setTimeout(() => {
        navigate('/builder');
      }, 1500);
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error creating survey: ${getErrorMessage(error)}`,
        severity: 'error',
      });
    },
  });

  const handleSave = (surveyData: SurveyBuilderState, filename: string) => {
    const yaml = generateYAML(surveyData);
    createSurveyMutation.mutate({
      yaml_content: yaml,
      filename: filename.trim(),
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Quick Create Survey"
        subtitle="Create a new survey in 3 easy steps"
        icon={<CreateIcon sx={{ fontSize: 28 }} />}
      />

      {/* Back to Advanced Builder Link */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Need more control?
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/builder')}
          >
            Use Advanced Builder
          </Button>
        </Box>
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        This wizard will guide you through creating a survey step by step. You can always edit it later in the Advanced Builder.
      </Alert>

      {/* Quick Create Wizard */}
      <QuickCreateWizard
        onSave={handleSave}
        isLoading={createSurveyMutation.isPending}
      />

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

export default SurveyQuickCreatePage;
