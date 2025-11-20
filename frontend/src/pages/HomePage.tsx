/**
 * Home Page - Redesigned
 * Professional, streamlined landing page with cohesive visual flow
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
  Container,
  Stack,
  Chip,
  Paper,
  alpha,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Create as CreateIcon,
  PlayArrow as PlayArrowIcon,
  History as HistoryIcon,
  Science as ScienceIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircleOutline as CheckIcon,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'AI-Powered Personas',
      description: 'Generate realistic synthetic audiences using advanced language models',
    },
    {
      title: 'Semantic Analysis',
      description: 'Convert qualitative responses to quantitative distributions with SSR',
    },
    {
      title: 'Rapid Insights',
      description: 'Get survey results in minutes, not weeks, with automated pipelines',
    },
    {
      title: 'Ground Truth Validation',
      description: 'Validate synthetic data quality against real-world benchmarks',
    },
  ];

  const stats = [
    { value: '100+', label: 'Surveys Created' },
    { value: '10K+', label: 'Responses Generated' },
    { value: '95%', label: 'Accuracy Rate' },
    { value: '<5 Min', label: 'Avg. Survey Time' },
  ];

  const workflows = [
    {
      number: '01',
      title: 'Define Your Survey',
      description: 'Create questions, categories, and target demographics',
    },
    {
      number: '02',
      title: 'Configure & Run',
      description: 'Select your AI model and execute the SSR pipeline',
    },
    {
      number: '03',
      title: 'Analyze Results',
      description: 'Review distributions, demographics, and insights',
    },
    {
      number: '04',
      title: 'Validate Quality',
      description: 'Run ground truth experiments for data reliability',
    },
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section - Redesigned with tighter spacing */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4338CA 0%, #7C3AED 50%, #9333EA 100%)',
          color: 'white',
          pt: { xs: 6, md: 8 },
          pb: { xs: 10, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 40%), ' +
              'radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 40%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -2,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(to bottom, transparent, #ffffff)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Chip
              icon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />}
              label="Powered by Advanced AI"
              size="medium"
              sx={{
                mb: 3,
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            />
            <Typography
              variant="h1"
              sx={{
                mb: 2,
                fontSize: { xs: '2.75rem', md: '4.5rem' },
                fontWeight: 800,
                letterSpacing: '-0.04em',
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                lineHeight: 1.1,
              }}
            >
              S.A.G.E
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontSize: { xs: '1.125rem', md: '1.5rem' },
                fontWeight: 500,
                opacity: 0.95,
                letterSpacing: '0.02em',
              }}
            >
              Synthetic Audience Generation Engine
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                fontSize: { xs: '1rem', md: '1.125rem' },
                fontWeight: 400,
                lineHeight: 1.7,
                maxWidth: 700,
                mx: 'auto',
                opacity: 0.9,
              }}
            >
              Transform qualitative research into quantitative insights using advanced semantic
              analysis and large language models.
            </Typography>

            {/* Primary CTA */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                size="large"
                variant="contained"
                onClick={() => navigate('/builder')}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 4,
                  py: 1.75,
                  fontSize: '1.0625rem',
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 600,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.95)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Get Started
              </Button>
              <Button
                size="large"
                variant="outlined"
                onClick={() => navigate('/documentation')}
                sx={{
                  px: 4,
                  py: 1.75,
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Learn More
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Stats Bar - Integrated into hero with overlap */}
      <Box
        sx={{
          mt: -6,
          mb: 8,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Container maxWidth="lg">
          <Paper
            elevation={8}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 0.5,
                        fontSize: { xs: '1.75rem', md: '2.25rem' },
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* Features Section - Tighter, more connected */}
      <Box sx={{ pb: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h2"
              sx={{
                mb: 1.5,
                fontSize: { xs: '1.875rem', md: '2.5rem' },
                fontWeight: 700,
              }}
            >
              Powerful Features
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 650,
                mx: 'auto',
                fontSize: '1.0625rem',
                lineHeight: 1.6,
              }}
            >
              Everything you need for cutting-edge market research with synthetic audiences
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'primary.main',
                      boxShadow: `0 8px 24px ${alpha('#4F46E5', 0.12)}`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: alpha('#4F46E5', 0.1),
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, fontSize: '1.0625rem' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.9375rem' }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Workflow Section - Streamlined horizontal flow */}
      <Box
        sx={{
          py: 8,
          bgcolor: alpha('#4F46E5', 0.02),
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h2"
              sx={{
                mb: 1.5,
                fontSize: { xs: '1.875rem', md: '2.5rem' },
                fontWeight: 700,
              }}
            >
              How It Works
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 650,
                mx: 'auto',
                fontSize: '1.0625rem',
                lineHeight: 1.6,
              }}
            >
              Four simple steps to generate synthetic audience insights
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {workflows.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    position: 'relative',
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      '&::after': index < workflows.length - 1 ? {
                        content: '""',
                        position: 'absolute',
                        top: 30,
                        right: { xs: 'auto', md: -24 },
                        bottom: { xs: -24, md: 'auto' },
                        left: { xs: 30, md: 'auto' },
                        width: { xs: 2, md: 48 },
                        height: { xs: 48, md: 2 },
                        background: 'linear-gradient(to right, #4F46E5, #9333EA)',
                        opacity: 0.3,
                        display: { xs: 'none', sm: 'block' },
                      } : {},
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        boxShadow: `0 4px 12px ${alpha('#4F46E5', 0.3)}`,
                      }}
                    >
                      {step.number}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '1.0625rem' }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.9375rem' }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Quick Actions - Grid of action cards */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h2"
              sx={{
                mb: 1.5,
                fontSize: { xs: '1.875rem', md: '2.5rem' },
                fontWeight: 700,
              }}
            >
              Get Started
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 650,
                mx: 'auto',
                fontSize: '1.0625rem',
                lineHeight: 1.6,
              }}
            >
              Choose your workflow and start generating insights
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                icon: <CreateIcon />,
                title: 'Create Survey',
                description: 'Build surveys with questions, categories, and demographic targets',
                action: 'Start Building',
                path: '/builder',
                gradient: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
              },
              {
                icon: <PlayArrowIcon />,
                title: 'Run Survey',
                description: 'Execute the SSR pipeline and generate synthetic responses',
                action: 'Run Now',
                path: '/runner',
                gradient: 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
              },
              {
                icon: <HistoryIcon />,
                title: 'View Results',
                description: 'Analyze completed runs with visualizations and insights',
                action: 'View Results',
                path: '/history',
                gradient: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
              },
              {
                icon: <ScienceIcon />,
                title: 'Ground Truth Testing',
                description: 'Validate synthetic data quality with ground truth experiments',
                action: 'Run Experiments',
                path: '/ground-truth',
                gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background: item.gradient,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        boxShadow: 2,
                      }}
                    >
                      {React.cloneElement(item.icon, { sx: { fontSize: 28 } })}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, fontSize: '1.0625rem' }}>
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2.5, lineHeight: 1.6, fontSize: '0.9375rem', flexGrow: 1 }}
                    >
                      {item.description}
                    </Typography>
                    <Button
                      variant="text"
                      endIcon={<ArrowForwardIcon />}
                      fullWidth
                      sx={{
                        mt: 'auto',
                        justifyContent: 'flex-start',
                        color: 'primary.main',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        '&:hover': {
                          bgcolor: alpha('#4F46E5', 0.04),
                        },
                      }}
                    >
                      {item.action}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Final CTA - Integrated with gradient */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          background: 'linear-gradient(135deg, #4338CA 0%, #7C3AED 50%, #9333EA 100%)',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%), ' +
              'radial-gradient(circle at 70% 70%, rgba(255,255,255,0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontSize: { xs: '1.875rem', md: '2.75rem' },
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Ready to Transform Your Research?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              opacity: 0.95,
              fontSize: '1.0625rem',
              lineHeight: 1.7,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Join researchers using S.A.G.E to generate synthetic audience insights faster and more
            accurately than ever before.
          </Typography>
          <Button
            size="large"
            variant="contained"
            onClick={() => navigate('/builder')}
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 5,
              py: 2,
              fontSize: '1.0625rem',
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.95)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Create Your First Survey
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
