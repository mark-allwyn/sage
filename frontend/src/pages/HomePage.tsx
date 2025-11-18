/**
 * Home Page
 * Minimal Apple-like landing page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useHealthCheck } from '../services/hooks';
import { HeroSkeleton } from '../components/LoadingSkeleton';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: health, isLoading, isError } = useHealthCheck();

  return (
    <Box>
      {/* Hero Section - Minimal and centered */}
      <Box sx={{
        textAlign: 'center',
        pt: { xs: 8, md: 12 },
        pb: { xs: 6, md: 10 },
        maxWidth: 980,
        mx: 'auto',
      }}>
        <Typography
          variant="h1"
          sx={{
            mb: 3,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          Synthetic Audience Generation Engine
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{
            mb: 5,
            fontSize: { xs: '1.125rem', md: '1.5rem' },
            fontWeight: 400,
            lineHeight: 1.5,
            maxWidth: 720,
            mx: 'auto',
          }}
        >
          Transform qualitative research into quantitative insights using advanced semantic
          analysis and large language models.
        </Typography>

        {/* API Status - Minimal */}
        <Box sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
          {isLoading && (
            <Alert severity="info" sx={{ border: 'none' }}>
              Connecting to API...
            </Alert>
          )}
          {isError && (
            <Alert severity="error" sx={{ border: 'none' }}>
              Cannot connect to API. Please ensure the server is running on port 8000.
            </Alert>
          )}
          {health && (
            <Alert severity="success" sx={{ border: 'none' }}>
              API Connected · Version {health.version}
            </Alert>
          )}
        </Box>

        {/* Primary CTA */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            size="large"
            variant="contained"
            onClick={() => navigate('/builder')}
            sx={{ px: 4, py: 1.5, fontSize: '1.0625rem' }}
          >
            Create Survey
          </Button>
          <Button
            size="large"
            variant="outlined"
            onClick={() => navigate('/overview')}
            sx={{ px: 4, py: 1.5, fontSize: '1.0625rem' }}
          >
            Learn More
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 10 }} />

      {/* Workflow Section - Minimal grid */}
      <Box sx={{ mb: 12, maxWidth: 1200, mx: 'auto' }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            mb: 6,
            fontSize: { xs: '1.875rem', md: '2.5rem' },
            fontWeight: 600,
          }}
        >
          How it works
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              number: '01',
              title: 'Define',
              description: 'Create survey questions and target demographics with flexible question types and persona groups.',
            },
            {
              number: '02',
              title: 'Generate',
              description: 'Automatically generate diverse respondent profiles using AI-powered demographic modeling.',
            },
            {
              number: '03',
              title: 'Collect',
              description: 'Gather natural language responses from language models representing each synthetic profile.',
            },
            {
              number: '04',
              title: 'Analyze',
              description: 'Convert text responses to probability distributions using semantic similarity rating.',
            },
          ].map((step) => (
            <Grid item xs={12} sm={6} md={3} key={step.number}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '0.6875rem',
                    mb: 2,
                    display: 'block',
                  }}
                >
                  {step.number}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ mb: 10 }} />

      {/* Actions Grid - 2-Tier Hierarchy */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', mb: 12 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            mb: 6,
            fontSize: { xs: '1.875rem', md: '2.5rem' },
            fontWeight: 600,
          }}
        >
          Get started
        </Typography>

        {/* Primary Actions - Large Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: 'Create Survey',
              description: 'Build and configure surveys with questions, categories, and demographic targets. Define your research objectives.',
              action: 'Start Building',
              path: '/builder',
              primary: true,
            },
            {
              title: 'Run Survey',
              description: 'Execute the complete SSR pipeline and generate synthetic audience responses with LLM-powered personas.',
              action: 'Run Now',
              path: '/runner',
              primary: true,
            },
          ].map((item) => (
            <Grid item xs={12} md={6} key={item.path}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                  '&:active': {
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => navigate(item.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(item.path);
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3, lineHeight: 1.6 }}
                  >
                    {item.description}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    fullWidth
                    sx={{ mt: 'auto' }}
                  >
                    {item.action}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Secondary Actions - Smaller Cards */}
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            mb: 3,
            fontWeight: 500,
            color: 'text.secondary',
          }}
        >
          Additional Tools
        </Typography>

        <Grid container spacing={2}>
          {[
            {
              title: 'Results',
              description: 'View and analyze completed survey runs',
              path: '/history',
            },
            {
              title: 'Ground Truth',
              description: 'Validate data quality with experiments',
              path: '/ground-truth',
            },
            {
              title: 'System Overview',
              description: 'Learn how S.A.G.E works',
              path: '/overview',
            },
          ].map((item) => (
            <Grid item xs={12} sm={4} key={item.path}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
                onClick={() => navigate(item.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(item.path);
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.5 }}
                  >
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Footer CTA */}
      <Box sx={{
        textAlign: 'center',
        py: 8,
        mb: 8,
      }}>
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 600,
          }}
        >
          Ready to get started?
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          Create your first synthetic audience survey in minutes.
        </Typography>
        <Button
          size="large"
          variant="contained"
          onClick={() => navigate('/builder')}
          sx={{ px: 5, py: 1.5, fontSize: '1.0625rem' }}
        >
          Create Survey
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
