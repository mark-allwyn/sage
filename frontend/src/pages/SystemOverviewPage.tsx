/**
 * System Overview Page
 * Explains how the SSR Pipeline system works
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ShowChart as ChartIcon,
  Assessment as MetricsIcon,
  Architecture as ArchitectureIcon,
  AccountTree as FlowIcon,
  Storage as DataIcon,
  Dataset as DatasetIcon,
} from '@mui/icons-material';
import SystemWorkflowDiagram from '../components/SystemWorkflowDiagram';
import ArchitectureDiagram from '../components/ArchitectureDiagram';

const SystemOverviewPage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSections(prev =>
      isExpanded
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
            System Overview
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.5 }}>
            Understanding the SSR Pipeline workflow and technical architecture
          </Typography>
        </Box>

        {/* Workflow Section */}
        <Accordion
          expanded={expandedSections.includes('workflow')}
          onChange={handleAccordionChange('workflow')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FlowIcon sx={{ fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                System Workflow
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <SystemWorkflowDiagram />
          </AccordionDetails>
        </Accordion>

        {/* Architecture Section */}
        <Accordion
          expanded={expandedSections.includes('architecture')}
          onChange={handleAccordionChange('architecture')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArchitectureIcon sx={{ fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                Technical Architecture
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <ArchitectureDiagram />
          </AccordionDetails>
        </Accordion>

        {/* Data Dictionary Section */}
        <Accordion
          expanded={expandedSections.includes('data')}
          onChange={handleAccordionChange('data')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DataIcon sx={{ fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                Data Dictionary
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ p: 2 }}>
              {/* Ground Truth Dataset */}
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <DatasetIcon sx={{ fontSize: 24, color: 'success.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Ground Truth Dataset Structure
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  Ground truth datasets contain aggregated probability distributions from high-fidelity survey runs,
                  used as reference data for validating and comparing test runs.
                </Alert>

                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Field</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '65%' }}>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell><code>id</code></TableCell>
                        <TableCell><Chip label="string" size="small" /></TableCell>
                        <TableCell>Unique identifier for the ground truth (e.g., "gt_20231214_143022")</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>name</code></TableCell>
                        <TableCell><Chip label="string" size="small" /></TableCell>
                        <TableCell>Human-readable name for the ground truth dataset</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>description</code></TableCell>
                        <TableCell><Chip label="string" size="small" /></TableCell>
                        <TableCell>Detailed description of what this ground truth represents</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>survey_id</code></TableCell>
                        <TableCell><Chip label="string" size="small" /></TableCell>
                        <TableCell>Reference to the survey configuration used</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>survey_name</code></TableCell>
                        <TableCell><Chip label="string" size="small" /></TableCell>
                        <TableCell>Name of the associated survey</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>source</code></TableCell>
                        <TableCell><Chip label="string" size="small" /></TableCell>
                        <TableCell>Source type: "ssr_generated" (from LLM) or "uploaded" (real survey data)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>created_at</code></TableCell>
                        <TableCell><Chip label="datetime" size="small" /></TableCell>
                        <TableCell>ISO 8601 timestamp of creation</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>generation_config</code></TableCell>
                        <TableCell><Chip label="object" size="small" /></TableCell>
                        <TableCell>Configuration used for generation (LLM model, temperature, sample size, etc.)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>aggregated_distributions</code></TableCell>
                        <TableCell><Chip label="object" size="small" color="primary" /></TableCell>
                        <TableCell>
                          Nested object containing aggregated probability distributions by category and question.
                          Structure: <code>{`{category: {question_id: {mean_probabilities, std_probabilities, sample_size, ...}}}`}</code>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>raw_distributions</code></TableCell>
                        <TableCell><Chip label="object" size="small" color="secondary" /></TableCell>
                        <TableCell>
                          (Optional) Individual respondent-level distributions for detailed analysis.
                          Structure: <code>{`{category: {question_id: {respondent_id: {...}}}}`}</code>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Example: Aggregated Distribution for a Question
                  </Typography>
                  <Box component="pre" sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace'
                  }}>
{`{
  "category_A": {
    "Q1_satisfaction": {
      "mean_probabilities": [0.05, 0.10, 0.15, 0.35, 0.35],
      "std_probabilities": [0.02, 0.03, 0.04, 0.05, 0.04],
      "sample_size": 500,
      "mean_mode": 5,
      "mean_expected_value": 3.85,
      "mean_entropy": 1.42
    }
  }
}`}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    This shows that across 500 respondents, the average probability distribution for Q1
                    leans toward ratings 4 and 5 (35% each), with an expected value of 3.85.
                  </Typography>
                </Paper>
              </Box>

              {/* LLM Survey Run Dataset */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <DatasetIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    LLM Survey Run Dataset Structure
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  Survey run datasets contain the complete output from running a survey with LLM-generated
                  respondents, including text responses and SSR probability distributions.
                </Alert>

                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Field</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '65%' }}>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell><code>run_id</code></TableCell>
                        <TableCell><Chip label="string" size="small" /></TableCell>
                        <TableCell>Unique identifier for the survey run (e.g., "run_20231214_143022")</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>survey_id</code></TableCell>
                        <TableCell><Chip label="string" size="small" /></TableCell>
                        <TableCell>Reference to the survey configuration used</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>survey_name</code></TableCell>
                        <TableCell><Chip label="string" size="small" /></TableCell>
                        <TableCell>Name of the survey that was run</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>timestamp</code></TableCell>
                        <TableCell><Chip label="datetime" size="small" /></TableCell>
                        <TableCell>ISO 8601 timestamp when the run was executed</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>num_profiles</code></TableCell>
                        <TableCell><Chip label="integer" size="small" /></TableCell>
                        <TableCell>Number of synthetic respondent profiles generated</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>num_responses</code></TableCell>
                        <TableCell><Chip label="integer" size="small" /></TableCell>
                        <TableCell>Total number of LLM text responses generated (profiles × questions)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>num_distributions</code></TableCell>
                        <TableCell><Chip label="integer" size="small" /></TableCell>
                        <TableCell>Total number of SSR probability distributions calculated</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>config</code></TableCell>
                        <TableCell><Chip label="object" size="small" /></TableCell>
                        <TableCell>
                          Run configuration including: <code>llm_provider</code>, <code>model</code>,
                          <code>llm_temperature</code>, <code>ssr_temperature</code>, <code>normalize_method</code>, <code>seed</code>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code>distributions</code></TableCell>
                        <TableCell><Chip label="object" size="small" color="primary" /></TableCell>
                        <TableCell>
                          Nested object containing individual respondent distributions by category and question.
                          Structure: <code>{`{category: {question_id: {respondent_id: {...}}}}`}</code>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Example: Individual Respondent Distribution
                  </Typography>
                  <Box component="pre" sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace'
                  }}>
{`{
  "category_A": {
    "Q1_satisfaction": {
      "R001": {
        "probabilities": [0.02, 0.08, 0.15, 0.40, 0.35],
        "mode": 4,
        "expected_value": 3.98,
        "entropy": 1.35,
        "text_response": "I'm quite satisfied with the product overall...",
        "gender": "Female",
        "age_group": "25-34",
        "persona_group": "Early Adopters",
        "occupation": "Software Engineer"
      },
      "R002": {
        "probabilities": [0.05, 0.12, 0.23, 0.35, 0.25],
        "mode": 4,
        "expected_value": 3.63,
        "entropy": 1.52,
        "text_response": "It's good but there's room for improvement...",
        "gender": "Male",
        "age_group": "35-44",
        "persona_group": "Mainstream Users",
        "occupation": "Teacher"
      }
    }
  }
}`}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Each respondent's entry includes their probability distribution, derived metrics,
                    original text response, and demographic information.
                  </Typography>
                </Paper>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Key Differences: Ground Truth vs. Survey Run
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Aspect</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Ground Truth</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Survey Run</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Data Level</strong></TableCell>
                          <TableCell>Aggregated (averaged across respondents)</TableCell>
                          <TableCell>Individual respondent level</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Purpose</strong></TableCell>
                          <TableCell>Reference/validation dataset</TableCell>
                          <TableCell>Test data to be analyzed</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Sample Size</strong></TableCell>
                          <TableCell>Typically large (500-2000 profiles)</TableCell>
                          <TableCell>Variable (10-500 profiles)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Text Responses</strong></TableCell>
                          <TableCell>Not stored (only distributions)</TableCell>
                          <TableCell>Stored with each response</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Demographics</strong></TableCell>
                          <TableCell>Summarized in generation_config</TableCell>
                          <TableCell>Stored per respondent</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* CSV Export Examples */}
                <Box sx={{ mt: 5 }}>
                  <Divider sx={{ mb: 4 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    📄 CSV Export Format Examples
                  </Typography>

                  {/* Ground Truth CSV Export */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      Ground Truth Aggregated Data (CSV Export)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      This format is used when exporting ground truth data for analysis in Excel, R, or Python.
                    </Typography>

                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                      <Table size="small" sx={{
                        '& th': { bgcolor: 'success.light', color: 'success.contrastText', fontWeight: 'bold', fontSize: '0.75rem' },
                        '& td': { fontSize: '0.75rem', fontFamily: 'monospace' }
                      }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>category</TableCell>
                            <TableCell>question_id</TableCell>
                            <TableCell>prob_1</TableCell>
                            <TableCell>prob_2</TableCell>
                            <TableCell>prob_3</TableCell>
                            <TableCell>prob_4</TableCell>
                            <TableCell>prob_5</TableCell>
                            <TableCell>mean_mode</TableCell>
                            <TableCell>mean_expected_value</TableCell>
                            <TableCell>mean_entropy</TableCell>
                            <TableCell>sample_size</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>category_A</TableCell>
                            <TableCell>Q1_satisfaction</TableCell>
                            <TableCell>0.05</TableCell>
                            <TableCell>0.10</TableCell>
                            <TableCell>0.15</TableCell>
                            <TableCell>0.35</TableCell>
                            <TableCell>0.35</TableCell>
                            <TableCell>5</TableCell>
                            <TableCell>3.85</TableCell>
                            <TableCell>1.42</TableCell>
                            <TableCell>500</TableCell>
                          </TableRow>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell>category_A</TableCell>
                            <TableCell>Q2_recommend</TableCell>
                            <TableCell>0.08</TableCell>
                            <TableCell>0.12</TableCell>
                            <TableCell>0.20</TableCell>
                            <TableCell>0.30</TableCell>
                            <TableCell>0.30</TableCell>
                            <TableCell>4</TableCell>
                            <TableCell>3.62</TableCell>
                            <TableCell>1.51</TableCell>
                            <TableCell>500</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>category_B</TableCell>
                            <TableCell>Q1_satisfaction</TableCell>
                            <TableCell>0.10</TableCell>
                            <TableCell>0.15</TableCell>
                            <TableCell>0.25</TableCell>
                            <TableCell>0.28</TableCell>
                            <TableCell>0.22</TableCell>
                            <TableCell>4</TableCell>
                            <TableCell>3.37</TableCell>
                            <TableCell>1.58</TableCell>
                            <TableCell>500</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Note:</strong> Each row represents the aggregated distribution for one question in one category.
                      Probabilities (prob_1 to prob_5) sum to 1.0 for each row.
                    </Typography>
                  </Box>

                  {/* Survey Run CSV Export */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Survey Run Individual Responses (CSV Export)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      This format includes all respondent-level data with demographics and full text responses.
                    </Typography>

                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, maxWidth: '100%', overflowX: 'auto' }}>
                      <Table size="small" sx={{
                        '& th': { bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold', fontSize: '0.7rem', whiteSpace: 'nowrap' },
                        '& td': { fontSize: '0.7rem', fontFamily: 'monospace', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }
                      }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>respondent_id</TableCell>
                            <TableCell>category</TableCell>
                            <TableCell>question_id</TableCell>
                            <TableCell>text_response</TableCell>
                            <TableCell>prob_1</TableCell>
                            <TableCell>prob_2</TableCell>
                            <TableCell>prob_3</TableCell>
                            <TableCell>prob_4</TableCell>
                            <TableCell>prob_5</TableCell>
                            <TableCell>mode</TableCell>
                            <TableCell>expected_value</TableCell>
                            <TableCell>entropy</TableCell>
                            <TableCell>gender</TableCell>
                            <TableCell>age_group</TableCell>
                            <TableCell>persona_group</TableCell>
                            <TableCell>occupation</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>R001</TableCell>
                            <TableCell>category_A</TableCell>
                            <TableCell>Q1_satisfaction</TableCell>
                            <TableCell>I'm quite satisfied...</TableCell>
                            <TableCell>0.02</TableCell>
                            <TableCell>0.08</TableCell>
                            <TableCell>0.15</TableCell>
                            <TableCell>0.40</TableCell>
                            <TableCell>0.35</TableCell>
                            <TableCell>4</TableCell>
                            <TableCell>3.98</TableCell>
                            <TableCell>1.35</TableCell>
                            <TableCell>Female</TableCell>
                            <TableCell>25-34</TableCell>
                            <TableCell>Early Adopters</TableCell>
                            <TableCell>Software Engineer</TableCell>
                          </TableRow>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell>R002</TableCell>
                            <TableCell>category_A</TableCell>
                            <TableCell>Q1_satisfaction</TableCell>
                            <TableCell>It's good but...</TableCell>
                            <TableCell>0.05</TableCell>
                            <TableCell>0.12</TableCell>
                            <TableCell>0.23</TableCell>
                            <TableCell>0.35</TableCell>
                            <TableCell>0.25</TableCell>
                            <TableCell>4</TableCell>
                            <TableCell>3.63</TableCell>
                            <TableCell>1.52</TableCell>
                            <TableCell>Male</TableCell>
                            <TableCell>35-44</TableCell>
                            <TableCell>Mainstream Users</TableCell>
                            <TableCell>Teacher</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>R001</TableCell>
                            <TableCell>category_A</TableCell>
                            <TableCell>Q2_recommend</TableCell>
                            <TableCell>Absolutely would...</TableCell>
                            <TableCell>0.01</TableCell>
                            <TableCell>0.05</TableCell>
                            <TableCell>0.10</TableCell>
                            <TableCell>0.30</TableCell>
                            <TableCell>0.54</TableCell>
                            <TableCell>5</TableCell>
                            <TableCell>4.31</TableCell>
                            <TableCell>1.15</TableCell>
                            <TableCell>Female</TableCell>
                            <TableCell>25-34</TableCell>
                            <TableCell>Early Adopters</TableCell>
                            <TableCell>Software Engineer</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Note:</strong> Each row represents one respondent's answer to one question.
                      Multiple rows per respondent (one per question). Text responses are truncated in this view.
                    </Typography>
                  </Box>

                  {/* Comparison Summary CSV */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                      Comparison Results Summary (CSV Export)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      This format is generated when comparing a survey run against ground truth.
                    </Typography>

                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                      <Table size="small" sx={{
                        '& th': { bgcolor: 'warning.light', color: 'warning.contrastText', fontWeight: 'bold', fontSize: '0.75rem' },
                        '& td': { fontSize: '0.75rem', fontFamily: 'monospace' }
                      }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>category</TableCell>
                            <TableCell>question_id</TableCell>
                            <TableCell>pearson_correlation</TableCell>
                            <TableCell>spearman_correlation</TableCell>
                            <TableCell>mean_absolute_error</TableCell>
                            <TableCell>confusion_matrix_diagonal</TableCell>
                            <TableCell>sample_size_test</TableCell>
                            <TableCell>sample_size_ground_truth</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>category_A</TableCell>
                            <TableCell>Q1_satisfaction</TableCell>
                            <TableCell>0.82</TableCell>
                            <TableCell>0.79</TableCell>
                            <TableCell>0.43</TableCell>
                            <TableCell>0.68</TableCell>
                            <TableCell>100</TableCell>
                            <TableCell>500</TableCell>
                          </TableRow>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell>category_A</TableCell>
                            <TableCell>Q2_recommend</TableCell>
                            <TableCell>0.76</TableCell>
                            <TableCell>0.74</TableCell>
                            <TableCell>0.51</TableCell>
                            <TableCell>0.62</TableCell>
                            <TableCell>100</TableCell>
                            <TableCell>500</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>category_B</TableCell>
                            <TableCell>Q1_satisfaction</TableCell>
                            <TableCell>0.71</TableCell>
                            <TableCell>0.69</TableCell>
                            <TableCell>0.58</TableCell>
                            <TableCell>0.55</TableCell>
                            <TableCell>100</TableCell>
                            <TableCell>500</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Note:</strong> Each row shows validation metrics for one question, comparing test run against ground truth.
                      Higher correlations and lower MAE indicate better agreement.
                    </Typography>
                  </Box>

                  <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      <strong>How to export:</strong> Look for the "Download CSV" or export button on the Survey History
                      and Ground Truth Testing pages. Each export will include column headers and all relevant data in the format shown above.
                    </Typography>
                  </Alert>
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Metrics Guide */}
        <Accordion
          expanded={expandedSections.includes('metrics')}
          onChange={handleAccordionChange('metrics')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MetricsIcon sx={{ fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                Understanding the Metrics
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ p: 2 }}>

          <Alert severity="info" sx={{ mb: 3 }}>
            S.A.G.E uses Semantic Similarity Rating (SSR) to convert natural language responses into quantitative probability distributions. This guide explains how to interpret the key metrics.
          </Alert>

          <Grid container spacing={3}>
            {/* Probability Distribution */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChartIcon color="primary" />
                Probability Distribution
              </Typography>
              <Typography variant="body1" paragraph>
                The core output of SSR is a <strong>probability distribution</strong> across your rating scale (e.g., 1-5 for Likert scales).
              </Typography>
              <Box sx={{ pl: 3, mb: 2 }}>
                <Typography variant="body2" paragraph>
                  <strong>What it means:</strong> Instead of forcing a single rating, SSR assigns probabilities to each scale point based on semantic similarity between the text response and reference statements.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Example:</strong> A response "I really like it" might produce:
                </Typography>
                <Box component="ul" sx={{ mt: 1 }}>
                  <li><Typography variant="body2">Rating 3: 5% probability</Typography></li>
                  <li><Typography variant="body2">Rating 4: 35% probability</Typography></li>
                  <li><Typography variant="body2">Rating 5: 60% probability</Typography></li>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                  The probabilities always sum to 100%
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Expected Value */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary">
                Expected Value (E[X])
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>What it is:</strong> The weighted average of all scale points, calculated as: (1×p₁) + (2×p₂) + ... + (5×p₅)
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>How to use it:</strong> Treat this like a traditional rating score. You can average expected values across respondents, compare groups, and run statistical tests.
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Range:</strong> For a 1-5 scale, E[X] will be between 1.0 and 5.0
              </Typography>
              <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Example Interpretation:
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  E[X] = 4.55 → "The average sentiment is between 'Satisfied' (4) and 'Very Satisfied' (5), leaning strongly toward 5"
                </Typography>
              </Box>
            </Grid>

            {/* Mode */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary">
                Mode
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>What it is:</strong> The scale point with the highest probability (the "most likely" rating)
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>How to use it:</strong> Use when you need a single categorical answer. The mode tells you which rating the response most closely resembles.
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Note:</strong> The mode can be the same even if distributions differ significantly - always check the full distribution for context.
              </Typography>
              <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Example:
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Mode = 5 means "Most similar to the 'Very Satisfied' reference statement"
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Entropy */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary">
                Entropy (Uncertainty)
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>What it is:</strong> A measure of how spread out or concentrated the probability distribution is. Calculated using Shannon entropy: -Σ(pᵢ × log₂(pᵢ))
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>How to interpret:</strong>
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 2 }}>
                <li><Typography variant="body2"><strong>Low entropy (0.0 - 0.5):</strong> High certainty - probabilities concentrated on one or two points</Typography></li>
                <li><Typography variant="body2"><strong>Medium entropy (0.5 - 1.5):</strong> Moderate uncertainty - some spread across scale</Typography></li>
                <li><Typography variant="body2"><strong>High entropy (1.5 - 2.3):</strong> High uncertainty - uniform or very spread distribution</Typography></li>
              </Box>
              <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  When to use it:
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  High entropy signals ambiguous responses or poor reference statements. If many responses show high entropy, consider revising your question or reference statements.
                </Typography>
              </Box>
            </Grid>

            {/* Standard Deviation */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary">
                Standard Deviation (σ)
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>What it is:</strong> Measures the spread of the distribution around the expected value
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>How to interpret:</strong>
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 2 }}>
                <li><Typography variant="body2"><strong>Low σ (&lt; 0.5):</strong> Very concentrated response - high confidence in rating</Typography></li>
                <li><Typography variant="body2"><strong>Medium σ (0.5 - 1.0):</strong> Typical spread for most responses</Typography></li>
                <li><Typography variant="body2"><strong>High σ (&gt; 1.0):</strong> Very spread out - indicates uncertainty or ambivalence</Typography></li>
              </Box>
              <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  Compare with traditional surveys:
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Standard deviation works the same as with traditional numeric ratings, enabling familiar statistical analyses
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Correlation Metrics */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChartIcon color="primary" />
                Ground Truth Validation Metrics
              </Typography>
              <Typography variant="body1" paragraph>
                When comparing SSR results against ground truth ratings, use these metrics to evaluate performance:
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Pearson Correlation (r)
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Range:</strong> -1 to +1
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Measures:</strong> Linear relationship between SSR expected values and ground truth ratings
                </Typography>
                <Box component="ul" sx={{ fontSize: '0.875rem' }}>
                  <li>r &gt; 0.7: Strong agreement</li>
                  <li>r = 0.4 - 0.7: Moderate agreement</li>
                  <li>r &lt; 0.4: Weak agreement</li>
                </Box>
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                  Best for: Overall linear trend analysis
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Spearman Correlation (ρ)
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Range:</strong> -1 to +1
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Measures:</strong> Monotonic relationship (rankings) between SSR and ground truth
                </Typography>
                <Box component="ul" sx={{ fontSize: '0.875rem' }}>
                  <li>ρ &gt; 0.7: Strong ranking agreement</li>
                  <li>ρ = 0.4 - 0.7: Moderate ranking agreement</li>
                  <li>ρ &lt; 0.4: Weak ranking agreement</li>
                </Box>
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                  Best for: Rank-order comparisons (less sensitive to outliers)
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Mean Absolute Error (MAE)
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Range:</strong> 0 to scale range (e.g., 0-4 for 1-5 scale)
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Measures:</strong> Average absolute difference between SSR E[X] and ground truth
                </Typography>
                <Box component="ul" sx={{ fontSize: '0.875rem' }}>
                  <li>MAE &lt; 0.5: Excellent accuracy</li>
                  <li>MAE = 0.5 - 1.0: Good accuracy</li>
                  <li>MAE &gt; 1.0: Poor accuracy</li>
                </Box>
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                  Best for: Direct measure of prediction accuracy
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Distribution Distance Metrics */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <ChartIcon color="primary" />
                Distribution Distance Metrics
              </Typography>
              <Typography variant="body1" paragraph>
                These metrics measure the similarity between probability distributions (comparing full distributions, not just point estimates):
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  KL Divergence (DKL)
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Range:</strong> 0 to ∞ (not symmetric)
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Measures:</strong> Kullback-Leibler divergence - how much one probability distribution differs from a reference distribution
                </Typography>
                <Box component="ul" sx={{ fontSize: '0.875rem' }}>
                  <li>DKL = 0: Identical distributions</li>
                  <li>DKL &lt; 0.1: Very similar distributions</li>
                  <li>DKL = 0.1 - 0.5: Moderate difference</li>
                  <li>DKL &gt; 0.5: Significant difference</li>
                </Box>
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                  Best for: Information theory applications. Note: Not symmetric - DKL(P||Q) ≠ DKL(Q||P)
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  JS Divergence (DJS)
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Range:</strong> 0 to 1 (symmetric)
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Measures:</strong> Jensen-Shannon divergence - symmetric version of KL divergence, bounded between 0 and 1
                </Typography>
                <Box component="ul" sx={{ fontSize: '0.875rem' }}>
                  <li>DJS = 0: Identical distributions</li>
                  <li>DJS &lt; 0.1: Very similar</li>
                  <li>DJS = 0.1 - 0.3: Moderate difference</li>
                  <li>DJS &gt; 0.3: Significant difference</li>
                </Box>
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                  Best for: General distribution comparison. Symmetric and bounded, making it easier to interpret than KL
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Wasserstein Distance (W)
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Range:</strong> 0 to max scale distance
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Measures:</strong> Earth Mover's Distance - minimum "work" needed to transform one distribution into another
                </Typography>
                <Box component="ul" sx={{ fontSize: '0.875rem' }}>
                  <li>W = 0: Identical distributions</li>
                  <li>W &lt; 0.5: Very similar (for 1-5 scale)</li>
                  <li>W = 0.5 - 1.0: Moderate difference</li>
                  <li>W &gt; 1.0: Significant difference</li>
                </Box>
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                  Best for: Ordered distributions (like Likert scales). Accounts for distance between scale points
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>When to use distribution metrics:</strong> Use these when comparing full probability distributions rather than just point estimates (E[X]).
                  They capture the entire shape and spread of the distribution, making them ideal for validating SSR output quality.
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Confusion Matrix */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Confusion Matrix
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>What it shows:</strong> A heatmap comparing SSR mode (most likely rating) against ground truth ratings across all scale points
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>How to read it:</strong>
              </Typography>
              <Box component="ul" sx={{ mb: 2 }}>
                <li><Typography variant="body2"><strong>Diagonal cells (dark):</strong> Perfect matches - SSR mode = ground truth</Typography></li>
                <li><Typography variant="body2"><strong>Adjacent cells:</strong> Off by 1 - often acceptable</Typography></li>
                <li><Typography variant="body2"><strong>Distant cells:</strong> Significant misclassification - investigate these cases</Typography></li>
              </Box>
              <Alert severity="success" sx={{ mt: 2 }}>
                <strong>Good performance:</strong> Strong diagonal with values tapering off as you move away from the diagonal
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Best Practices */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="h6" gutterBottom>
                  Best Practices for Metric Interpretation
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" paragraph>
                      <strong>1. Always examine distributions</strong><br />
                      Don't rely solely on E[X] - look at the full probability distribution to understand response certainty
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>2. Compare multiple metrics</strong><br />
                      Use E[X] for point estimates, entropy for uncertainty, and correlations for validation
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>3. Consider context</strong><br />
                      High entropy isn't always bad - it might reflect genuine ambivalence in responses
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" paragraph>
                      <strong>4. Aggregate appropriately</strong><br />
                      Average E[X] values across respondents, but also report distribution of entropies
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>5. Validate with ground truth</strong><br />
                      For important surveys, collect ground truth samples to verify SSR accuracy
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>6. Iterate on reference statements</strong><br />
                      If correlations are low, revise your reference statements for better semantic coverage
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
};

export default SystemOverviewPage;
