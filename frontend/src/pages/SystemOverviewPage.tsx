/**
 * System Overview Page
 * Explains how the SSR Pipeline system works
 */

import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import {
  Info as InfoIcon,
  ShowChart as ChartIcon,
  Assessment as MetricsIcon,
} from '@mui/icons-material';
import SystemWorkflowDiagram from '../components/SystemWorkflowDiagram';
import ArchitectureDiagram from '../components/ArchitectureDiagram';

const SystemOverviewPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <InfoIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" component="h1">
              System Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Understanding the SSR Pipeline workflow and technical architecture
            </Typography>
          </Box>
        </Box>

        {/* System Workflow Diagram */}
        <SystemWorkflowDiagram />

        {/* Architecture Diagram */}
        <ArchitectureDiagram />

        {/* Metrics Guide */}
        <Paper sx={{ p: 4, mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <MetricsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4">
              Understanding the Metrics
            </Typography>
          </Box>

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
        </Paper>
      </Box>
    </Container>
  );
};

export default SystemOverviewPage;
