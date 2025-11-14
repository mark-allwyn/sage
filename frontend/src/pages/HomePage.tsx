/**
 * Home Page
 * Landing page with overview and quick actions
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import {
  Create as CreateIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  Science as ScienceIcon,
  History as HistoryIcon,
  CompareArrows as CompareArrowsIcon,
} from '@mui/icons-material';
import { useHealthCheck } from '../services/hooks';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: health, isLoading, isError } = useHealthCheck();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
          <ScienceIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h2" component="h1">
            S.A.G.E
          </Typography>
        </Box>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Synthetic Audience Generation Engine
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 800, mx: 'auto' }}>
          Generate synthetic survey audiences and transform qualitative responses into quantitative
          probability distributions using advanced semantic similarity techniques powered by large language models.
        </Typography>
      </Box>

      {/* API Status */}
      <Box sx={{ mb: 4 }}>
        {isLoading && (
          <Alert severity="info">Checking API connection...</Alert>
        )}
        {isError && (
          <Alert severity="error">
            Cannot connect to API backend. Please ensure the FastAPI server is running on http://localhost:8000
          </Alert>
        )}
        {health && (
          <Alert severity="success">
            API Connected - Version {health.version}
          </Alert>
        )}
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quick Actions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Get started with the most common tasks
        </Typography>
      </Box>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <CreateIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Survey Builder
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and configure surveys with questions, persona groups, and categories.
                Define demographic targets and rating scales.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="large"
                variant="contained"
                fullWidth
                onClick={() => navigate('/builder')}
              >
                Build Survey
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <VisibilityIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Survey Preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and explore existing survey configurations. See questions, categories,
                and persona group definitions.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="large"
                variant="contained"
                fullWidth
                onClick={() => navigate('/preview')}
              >
                Preview Surveys
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <PlayArrowIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Run Survey
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Execute the complete pipeline: generate profiles, collect LLM responses,
                and apply SSR to produce probability distributions.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="large"
                variant="contained"
                fullWidth
                onClick={() => navigate('/runner')}
              >
                Run Survey
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <HistoryIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Survey History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View all previously run surveys. Filter, search, and explore past results.
                Compare runs and export data for analysis.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="large"
                variant="outlined"
                fullWidth
                onClick={() => navigate('/history')}
              >
                View History
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <CompareArrowsIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Ground Truth Testing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create ground truths and run experiments to validate synthetic data quality.
                Compare distributions and calculate statistical metrics.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="large"
                variant="outlined"
                fullWidth
                onClick={() => navigate('/ground-truth')}
              >
                Run Experiments
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* How It Works */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Four simple steps to generate synthetic survey data
          </Typography>
        </Box>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.default', borderRadius: 2, height: '100%' }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 'bold',
                margin: '0 auto 16px'
              }}>
                1
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Define Survey
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create questions, categories, and persona groups that represent your target demographics.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.default', borderRadius: 2, height: '100%' }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 'bold',
                margin: '0 auto 16px'
              }}>
                2
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Generate Profiles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Automatically create diverse respondent profiles based on persona groups and demographic targets.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.default', borderRadius: 2, height: '100%' }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 'bold',
                margin: '0 auto 16px'
              }}>
                3
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Collect Responses
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use LLMs (GPT-5, Claude 4) to generate natural language responses from each profile.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.default', borderRadius: 2, height: '100%' }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 'bold',
                margin: '0 auto 16px'
              }}>
                4
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Apply SSR
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Convert text responses to probability distributions using semantic similarity rating.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Features */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Key Features
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Everything you need for synthetic survey research
        </Typography>
      </Box>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <Box sx={{ fontSize: 48, mb: 2 }}>📊</Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Multi-Modal Support
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Include images and webpage URLs in your surveys with vision-capable models.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <Box sx={{ fontSize: 48, mb: 2 }}>❓</Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Flexible Questions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Yes/No, Likert scales, multiple choice, and preference comparisons.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <Box sx={{ fontSize: 48, mb: 2 }}>👥</Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Persona Sampling
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Target specific demographics with weighted persona groups.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <Box sx={{ fontSize: 48, mb: 2 }}>🤖</Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Latest LLM Models
            </Typography>
            <Typography variant="body2" color="text.secondary">
              OpenAI GPT-5 and Anthropic Claude 4 with vision support.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
