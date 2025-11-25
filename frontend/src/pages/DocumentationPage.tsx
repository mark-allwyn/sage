/**
 * Documentation Page
 * User-focused guide on how to use S.A.G.E
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Create as CreateIcon,
  PlayArrow as PlayArrowIcon,
  History as HistoryIcon,
  Science as ScienceIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon,
  Code as CodeIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';

const DocumentationPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSections(prev =>
      isExpanded
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  return (
    <Box>
      <PageHeader
        title="Documentation"
        subtitle="Learn how to create surveys, run experiments, and analyze results with S.A.G.E"
        icon={<InfoIcon sx={{ fontSize: 28 }} />}
      />

      {/* Quick Start Guide */}
      <Paper sx={{ p: 4, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Quick Start Guide
        </Typography>
        <Typography variant="body1" paragraph>
          S.A.G.E helps you conduct market research by generating synthetic audience responses using AI.
          Follow these steps to get started:
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                1
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Create Survey</Typography>
              <Typography variant="caption">Design questions and target audiences</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                2
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Run Survey</Typography>
              <Typography variant="caption">Execute with your preferred AI model</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                3
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Analyze Results</Typography>
              <Typography variant="caption">Review distributions and insights</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                4
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Validate (Optional)</Typography>
              <Typography variant="caption">Compare against ground truth</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Getting Started */}
      <Accordion
        expanded={expandedSections.includes('getting-started')}
        onChange={handleAccordionChange('getting-started')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LightbulbIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Getting Started
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>What is S.A.G.E?</Typography>
            <Typography variant="body1" paragraph>
              S.A.G.E (Synthetic Audience Generation Engine) is a research-backed platform that uses Large Language
              Models (LLMs) and Semantic Similarity Rating (SSR) to simulate realistic consumer survey responses at scale.
            </Typography>
            <Typography variant="body1" paragraph>
              Traditional consumer research costs companies billions annually yet suffers from panel biases, limited
              scale, and slow turnaround times. S.A.G.E addresses these challenges by enabling scalable consumer research
              simulations while preserving traditional survey metrics and interpretability.
            </Typography>

            <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Key Innovation: Semantic Similarity Rating (SSR)
              </Typography>
              <Typography variant="body2" paragraph>
                Traditional LLM surveys produce unrealistic response patterns when asked directly for numerical ratings.
                SSR overcomes this limitation by having language models provide natural written responses that are then
                mapped to rating scales using embedding similarity.
              </Typography>
              <Typography variant="body2">
                This approach yields probability distributions that closely match human behavior while providing
                qualitative explanations alongside quantitative ratings.
              </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Why Use S.A.G.E?</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', bgcolor: 'success.50' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="success.dark">
                      Research-Validated Accuracy
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="90% of human test-retest reliability"
                          secondary="Peer-reviewed methodology published in academic research"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="KS similarity > 0.85"
                          secondary="Response distributions closely match real human patterns"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', bgcolor: 'primary.50' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary.dark">
                      Speed & Scale Benefits
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Rapid insights in minutes"
                          secondary="No need to recruit and wait for human panel responses"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Unlimited scalability"
                          secondary="Generate thousands of responses without cost scaling"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>What is S.A.G.E Good For?</Typography>
            <List>
              <ListItem>
                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                <ListItemText
                  primary="Consumer product research"
                  secondary="Particularly validated for personal care products, applicable across consumer goods sectors"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                <ListItemText
                  primary="Purchase intent analysis"
                  secondary="Understand how different audiences respond to products or concepts at scale"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                <ListItemText
                  primary="Survey design validation"
                  secondary="Test questions and identify issues before fielding expensive human panels"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                <ListItemText
                  primary="Rapid exploratory research"
                  secondary="Generate preliminary insights and hypotheses quickly and cost-effectively"
                />
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>System Requirements</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Required</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="At least one LLM API key (OpenAI or Anthropic)" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Modern web browser (Chrome, Firefox, Safari, Edge)" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Backend server running on port 8000" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Optional</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Ollama for local LLM models" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Ground truth data for validation" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="CSV export tools for further analysis" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Creating Surveys */}
      <Accordion
        expanded={expandedSections.includes('create-surveys')}
        onChange={handleAccordionChange('create-surveys')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CreateIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Creating Surveys
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Survey Builder Overview</Typography>
            <Typography variant="body1" paragraph>
              The Survey Builder lets you create comprehensive survey configurations with questions,
              target audiences, and optional product categories.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>1. Basic Information</Typography>
            <List>
              <ListItem>
                <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                <ListItemText
                  primary="Survey Name"
                  secondary="A clear, descriptive name (e.g., 'Q1 2024 Product Launch Survey')"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                <ListItemText
                  primary="Description"
                  secondary="Brief overview of the survey purpose"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                <ListItemText
                  primary="Context"
                  secondary="Background information that helps the LLM understand the survey domain and purpose (IMPORTANT for quality)"
                />
              </ListItem>
            </List>

            <Alert severity="warning" icon={<LightbulbIcon />} sx={{ my: 3 }}>
              <Typography variant="body2" fontWeight="bold">Pro Tip: Context is Critical</Typography>
              <Typography variant="body2">
                Spend time writing good context! The LLM uses this to understand what kind of responses
                to generate. Include industry information, product details, and any relevant background.
              </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>2. Categories (Optional)</Typography>
            <Typography variant="body1" paragraph>
              Use categories when comparing multiple products, brands, or concepts. Each question can
              optionally be associated with a category.
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Category Name"
                  secondary="e.g., 'Premium Coffee', 'Budget Coffee'"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Description"
                  secondary="Details about this category/product"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Image & Link (Optional)"
                  secondary="Visual reference and additional information"
                />
              </ListItem>
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>3. Questions</Typography>
            <Typography variant="body1" paragraph>
              Add questions that you want to ask your synthetic audience. Each question needs:
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Question Types
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Yes/No"
                        secondary="Binary choice questions"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Likert 5-point"
                        secondary="Strongly Disagree to Strongly Agree"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Likert 7-point"
                        secondary="More granular agreement scale"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Multiple Choice"
                        secondary="Select from predefined options"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Preference"
                        secondary="Comparative rankings"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Reference Statements
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Reference statements are used by SSR to convert LLM responses into probability
                    distributions. They should:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Match the response scale" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Be semantically distinct" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Cover the full range of possible responses" />
                    </ListItem>
                  </List>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="caption">
                      Example for Likert 5: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]
                    </Typography>
                  </Alert>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>4. Persona Groups</Typography>
            <Typography variant="body1" paragraph>
              Define target audience segments with specific characteristics. Each persona group includes:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                <ListItemText
                  primary="Persona Description"
                  secondary="Detailed description of who this person is (e.g., 'Tech-savvy millennials who value sustainability')"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                <ListItemText
                  primary="Demographics"
                  secondary="Select gender, age groups, and occupations for this persona"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                <ListItemText
                  primary="Sampling Weight"
                  secondary="Proportion of responses from this group (automatically normalized)"
                />
              </ListItem>
            </List>

            <Alert severity="success" icon={<LightbulbIcon />} sx={{ mt: 3 }}>
              <Typography variant="body2" fontWeight="bold">Best Practice</Typography>
              <Typography variant="body2">
                Create 2-4 persona groups with distinct characteristics. This provides demographic
                diversity while keeping results manageable to analyze.
              </Typography>
            </Alert>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<CreateIcon />}
                onClick={() => navigate('/builder')}
              >
                Try Survey Builder
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Running Surveys */}
      <Accordion
        expanded={expandedSections.includes('run-surveys')}
        onChange={handleAccordionChange('run-surveys')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PlayArrowIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Running Surveys
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Survey Runner Overview</Typography>
            <Typography variant="body1" paragraph>
              Once you've created a survey, use the Survey Runner to execute the SSR pipeline and
              generate synthetic responses.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>Configuration Parameters</Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                    Number of Profiles
                  </Typography>
                  <Typography variant="body2" paragraph>
                    How many synthetic respondents to generate (10-500).
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="50-100 profiles"
                        secondary="Good for initial testing and quick iterations"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="100-200 profiles"
                        secondary="Recommended for most surveys"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="200+ profiles"
                        secondary="Use for final runs and ground truth creation"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                    LLM Provider & Model
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Choose which AI model to use for generating responses.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="OpenAI"
                        secondary="GPT-4, GPT-4 Turbo, GPT-3.5 - Reliable, high quality"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Anthropic"
                        secondary="Claude 3.5 Sonnet, Claude 3 Opus - Excellent reasoning"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Ollama"
                        secondary="Local models - Private, no API costs (requires setup)"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                    LLM Temperature (0.0 - 2.0)
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Controls creativity and randomness in LLM responses.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="0.7 (Recommended)"
                        secondary="Balanced between consistency and variety"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="0.5 or lower"
                        secondary="More focused and deterministic"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="1.0 or higher"
                        secondary="More creative and diverse"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                    SSR Temperature (0.1 - 5.0)
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Controls how "sharp" or "spread out" the probability distributions are.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="1.0 (Recommended)"
                        secondary="Natural distribution shape"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Lower (0.5)"
                        secondary="Sharper, more confident distributions"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Higher (2.0)"
                        secondary="Flatter, more uncertain distributions"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 4, mb: 3 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Understanding the Process
              </Typography>
              <Typography variant="body2">
                When you click "Run Survey", the system will:
                <br />1. Generate demographic profiles based on your persona groups
                <br />2. Create prompts for each profile and question
                <br />3. Send requests to the LLM to get natural language responses
                <br />4. Apply SSR to convert responses into probability distributions
                <br />5. Aggregate results and calculate statistics
              </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Real-time Progress</Typography>
            <Typography variant="body1" paragraph>
              Watch the progress panel to see:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Profile generation status" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="LLM response streaming" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="SSR processing updates" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Completion and automatic navigation to results" />
              </ListItem>
            </List>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={() => navigate('/runner')}
              >
                Go to Survey Runner
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Analyzing Results */}
      <Accordion
        expanded={expandedSections.includes('analyze-results')}
        onChange={handleAccordionChange('analyze-results')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <HistoryIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Analyzing Results
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Analysis Dashboard</Typography>
            <Typography variant="body1" paragraph>
              After completing a survey run, access the comprehensive Analysis Dashboard to explore
              your results in depth. The dashboard provides multiple views optimized for different analysis needs:
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2, mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                      Executive Summary
                    </Typography>
                    <Typography variant="body2" paragraph>
                      High-level overview with contextual insights:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText
                          primary="Key findings with natural language descriptions"
                          secondary="e.g., '67% found it appealing, 15% were neutral'"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Sample size and demographic breakdown" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Category performance rankings (if applicable)" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                      Question Analysis Table
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Sortable table with comprehensive statistics:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Mean, median, std deviation, confidence intervals" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Top-box %, bottom-box %, net score" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Performance grades (A/B+/B/C+/C/D)" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                      Demographic Analysis
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Deep dive into audience segments:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Response distributions by demographic field" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Chi-squared tests for statistical significance" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Visual charts comparing segments" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                      Category Comparison
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Compare performance across products/categories:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Winner identification and rankings" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Top and bottom questions per category" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Category-level statistics" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>Survey History & Results</Typography>
            <Typography variant="body1" paragraph>
              All completed survey runs are saved and accessible from the Survey History page.
              From there you can view raw data, export to CSV, or access the Analysis Dashboard.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Response Dataset Table
                    </Typography>
                    <Typography variant="body2" paragraph>
                      View the complete dataset in an interactive table:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText
                          primary="Category & Question ID"
                          secondary="Organized by category and question"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText
                          primary="Respondent demographics"
                          secondary="Gender, age group, occupation, persona group"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText
                          primary="LLM text responses"
                          secondary="Full qualitative responses from the language model"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText
                          primary="SSR-computed metrics"
                          secondary="Mode, Expected Value, and Entropy"
                        />
                      </ListItem>
                    </List>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ArrowForwardIcon />}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Export to CSV
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Distribution Visualizations
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Interactive bar charts showing probability distributions:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText
                          primary="Probability bar charts"
                          secondary="For each question, see the distribution across all response options"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText
                          primary="Aggregated view"
                          secondary="Combined distributions across all respondents"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
                        <ListItemText
                          primary="Category comparison"
                          secondary="When using categories, compare distributions side-by-side"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Understanding Your Results</Typography>

            <Paper variant="outlined" sx={{ p: 3, mt: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Understanding the Metrics
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" fontWeight="bold" color="primary" gutterBottom>
                    Mode
                  </Typography>
                  <Typography variant="body2">
                    The most likely response option based on the probability distribution. This represents
                    the single answer with the highest probability.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" fontWeight="bold" color="primary" gutterBottom>
                    Expected Value (E[X])
                  </Typography>
                  <Typography variant="body2">
                    The weighted average response across the probability distribution. Use this for
                    statistical analysis like traditional survey means (e.g., average Likert score of 4.2).
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" fontWeight="bold" color="primary" gutterBottom>
                    Entropy
                  </Typography>
                  <Typography variant="body2">
                    Measures the uncertainty or spread in the response distribution. Higher entropy (closer to 1)
                    = more uncertain/spread out. Lower entropy (closer to 0) = more confident/concentrated.
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Interpreting Results
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckIcon fontSize="small" color="success" /></ListItemIcon>
                  <ListItemText
                    primary="Distribution Shape"
                    secondary="Peaked distributions indicate strong consensus, while flat distributions suggest mixed opinions or uncertainty"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon fontSize="small" color="success" /></ListItemIcon>
                  <ListItemText
                    primary="High Entropy"
                    secondary="May indicate the LLM is uncertain, the question is ambiguous, or the persona truly has mixed views"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon fontSize="small" color="success" /></ListItemIcon>
                  <ListItemText
                    primary="Demographic Patterns"
                    secondary="Compare Expected Values and distributions across different persona groups to identify segment differences"
                  />
                </ListItem>
              </List>
            </Paper>

            <Alert severity="success" icon={<LightbulbIcon />}>
              <Typography variant="body2" fontWeight="bold">Pro Tip: Compare Across Runs</Typography>
              <Typography variant="body2">
                Run the same survey with different LLM providers or parameters to see how consistent
                the results are. High consistency suggests reliable insights.
              </Typography>
            </Alert>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/history')}
              >
                View Survey History
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Ground Truth Experiments */}
      <Accordion
        expanded={expandedSections.includes('ground-truth')}
        onChange={handleAccordionChange('ground-truth')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ScienceIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Ground Truth Experiments
              </Typography>
              <Chip label="Advanced" size="small" color="secondary" />
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>What is Ground Truth Testing?</Typography>
            <Typography variant="body1" paragraph>
              Ground truth testing lets you validate the accuracy of synthetic responses by comparing
              them against real human survey data. This is crucial for:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                <ListItemText
                  primary="Validating SSR accuracy"
                  secondary="Ensure synthetic data matches real-world patterns"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                <ListItemText
                  primary="Testing different LLM models"
                  secondary="Compare which models produce most realistic responses"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                <ListItemText
                  primary="Refining survey design"
                  secondary="Identify questions where synthetic responses diverge from reality"
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>Experiment Workflow</Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="h6" gutterBottom>Step 1: Create Baseline</Typography>
                  <Typography variant="body2">
                    Run a high-quality survey (200+ profiles, good parameters) and save it as ground truth.
                    This becomes your reference point.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <Typography variant="h6" gutterBottom>Step 2: Run Experiment</Typography>
                  <Typography variant="body2">
                    Execute a test run with different parameters (model, temperature, sample size, etc.)
                    that you want to compare.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%', bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="h6" gutterBottom>Step 3: Compare Results</Typography>
                  <Typography variant="body2">
                    Review comprehensive metrics: correlation, accuracy, distribution similarity, and
                    confusion matrices.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Comparison Metrics</Typography>
            <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="primary">
                    KL Divergence
                  </Typography>
                  <Typography variant="body2">
                    Kullback-Leibler divergence measures information loss. Range: [0, ∞).
                    Lower is better, 0 = identical distributions.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="primary">
                    JS Divergence
                  </Typography>
                  <Typography variant="body2">
                    Jensen-Shannon divergence (symmetric version of KL). Range: [0, 1].
                    0 = identical, 1 = completely different.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="primary">
                    Wasserstein Distance
                  </Typography>
                  <Typography variant="body2">
                    "Earth Mover's Distance" accounts for ordering of scale values.
                    Lower is better - measures minimum work to transform one distribution into another.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="primary">
                    Chi-Squared Test
                  </Typography>
                  <Typography variant="body2">
                    Statistical significance test. P-value &lt; 0.05 = significantly different.
                    Note: Shows N/A when expected frequencies are too low (&lt; 1.0).
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="primary">
                    Mean Absolute Error (MAE)
                  </Typography>
                  <Typography variant="body2">
                    Average absolute difference between probability values.
                    Lower is better - below 0.05 is excellent.
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Why Some Chi-Squared Values Show N/A
              </Typography>
              <Typography variant="body2">
                Chi-squared tests require minimum expected frequency ≥ 1.0 for validity. When ground truth
                data has response options with zero or very low probabilities (&lt; 0.5%), the expected
                frequency falls below this threshold and the test cannot be performed. This is a limitation
                of the statistical test, not an error in your data.
              </Typography>
            </Alert>

            <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 3 }}>
              <Typography variant="body2" fontWeight="bold">Important Note</Typography>
              <Typography variant="body2">
                Ground truth testing requires real human survey data for comparison. If you don't have
                real data, you can use a high-quality synthetic run as a "gold standard" to compare
                different experimental configurations.
              </Typography>
            </Alert>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ScienceIcon />}
                onClick={() => navigate('/ground-truth')}
              >
                Start Experiments
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Best Practices */}
      <Accordion
        expanded={expandedSections.includes('best-practices')}
        onChange={handleAccordionChange('best-practices')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LightbulbIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Best Practices & Tips
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom color="success.main">
                    ✓ Do This
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Write detailed survey context"
                        secondary="Helps LLM understand domain and generate better responses"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Start with 50-100 profiles for testing"
                        secondary="Iterate quickly before committing to large runs"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Use clear, unambiguous questions"
                        secondary="Just like with human surveys"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Create distinct persona groups"
                        secondary="Meaningful demographic segmentation improves insights"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Export and save results"
                        secondary="CSV export for further analysis in Excel/R/Python"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Compare across multiple LLM models"
                        secondary="See which model works best for your use case"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom color="error.main">
                    ✗ Avoid This
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Don't skip the context field"
                        secondary="Without context, LLM responses will be generic"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Don't use vague reference statements"
                        secondary="SSR accuracy depends on clear semantic distinctions"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Don't over-interpret single runs"
                        secondary="Run multiple times to gauge consistency"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Don't treat as real survey data"
                        secondary="Synthetic responses are simulations, not actual human opinions"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Don't use very high LLM temperatures"
                        secondary="Above 1.0 can produce inconsistent results"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Don't ignore statistical validation"
                        secondary="Use ground truth testing for important decisions"
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 4 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Remember: Synthetic ≠ Real
              </Typography>
              <Typography variant="body2">
                S.A.G.E generates synthetic audience responses that can help with survey design,
                hypothesis exploration, and preliminary insights. However, these should not replace
                real human survey data for final decision-making, especially for high-stakes research.
              </Typography>
            </Alert>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* FAQ */}
      <Accordion
        expanded={expandedSections.includes('faq')}
        onChange={handleAccordionChange('faq')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InfoIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Frequently Asked Questions
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>How accurate are synthetic responses?</Typography>
              <Typography variant="body1">
                Accuracy depends on many factors: question clarity, LLM model quality, reference statement
                precision, and how well-defined your personas are. Ground truth testing can help measure
                accuracy. Generally, synthetic responses are useful for directional insights and survey
                testing, but should be validated with real data for critical decisions.
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>Which LLM provider should I use?</Typography>
              <Typography variant="body1">
                Each has strengths:
                <br />• <strong>OpenAI (GPT-4)</strong>: Very reliable, good for most use cases
                <br />• <strong>Anthropic (Claude)</strong>: Excellent reasoning, great for complex scenarios
                <br />• <strong>Ollama</strong>: Privacy-focused, no API costs, but requires more setup
                <br /><br />
                Try running the same survey on multiple providers and compare results.
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>How long does a survey take to run?</Typography>
              <Typography variant="body1">
                Depends on the number of profiles, questions, and LLM response time:
                <br />• 50 profiles: ~2-5 minutes
                <br />• 100 profiles: ~5-10 minutes
                <br />• 200+ profiles: ~10-20 minutes
                <br /><br />
                Watch the real-time progress indicator to track your run.
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>Can I export my results?</Typography>
              <Typography variant="body1">
                Yes! Every survey run has a "Download CSV" button that exports the full dataset including
                demographics, responses, probability distributions, and expected values. You can then
                analyze in Excel, R, Python, or your preferred tool.
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>What's the difference between LLM temp and SSR temp?</Typography>
              <Typography variant="body1">
                <strong>LLM Temperature</strong> (0.0-2.0): Controls how creative/random the LLM's text
                responses are. Higher = more varied responses.
                <br /><br />
                <strong>SSR Temperature</strong> (0.1-5.0): Controls how sharp the probability distributions
                are after SSR conversion. Lower = more confident/peaked distributions, higher = more spread
                out/uncertain.
                <br /><br />
                Recommended starting point: LLM=0.7, SSR=1.0
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>Do I need to provide ground truth data?</Typography>
              <Typography variant="body1">
                No, ground truth testing is completely optional. You can use S.A.G.E without any real survey
                data. Ground truth is only needed if you want to validate accuracy by comparing synthetic
                responses against real human responses.
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Technical Details Link */}
      <Paper sx={{ p: 4, mt: 3, bgcolor: 'grey.50', textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Need Technical Documentation?
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          For detailed information about the SSR methodology, data structures, and validation metrics,
          check out the System Overview page.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<CodeIcon />}
          onClick={() => navigate('/overview')}
        >
          View Technical Documentation
        </Button>
      </Paper>
    </Box>
  );
};

export default DocumentationPage;
