/**
 * Terms of Service Page
 * Legal terms and conditions for using S.A.G.E
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { PageHeader } from '../components/PageHeader';

const TermsOfServicePage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Terms of Service"
        subtitle="Legal terms and conditions for using S.A.G.E"
      />

      <Container maxWidth="md">
        <Paper sx={{ p: 4, mt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 600 }}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using S.A.G.E (Synthetic Audience Generation Engine), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            2. Use License
          </Typography>
          <Typography variant="body1" paragraph>
            Permission is granted to temporarily use S.A.G.E for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Typography component="li" variant="body1" paragraph>
              Modify or copy the materials
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Use the materials for any commercial purpose or for any public display
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Attempt to reverse engineer any software contained in S.A.G.E
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Remove any copyright or other proprietary notations from the materials
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            3. Research and Academic Use
          </Typography>
          <Typography variant="body1" paragraph>
            S.A.G.E is designed primarily for research and academic purposes. Users conducting research should:
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Typography component="li" variant="body1" paragraph>
              Properly cite and acknowledge the use of S.A.G.E in any publications or presentations
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Follow ethical guidelines for AI-generated synthetic audience research
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Ensure compliance with institutional review board (IRB) requirements where applicable
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            4. Data Privacy and AI Models
          </Typography>
          <Typography variant="body1" paragraph>
            S.A.G.E uses AI models from third-party providers (OpenAI, Anthropic, Ollama). Users acknowledge that:
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Typography component="li" variant="body1" paragraph>
              Survey data and prompts may be processed by external AI services
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Users are responsible for ensuring their data complies with applicable data protection laws
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Sensitive or personally identifiable information should not be included in surveys without proper safeguards
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            5. Disclaimer
          </Typography>
          <Typography variant="body1" paragraph>
            The materials on S.A.G.E are provided on an 'as is' basis. S.A.G.E makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </Typography>
          <Typography variant="body1" paragraph>
            S.A.G.E generates synthetic responses using AI models. These responses are simulated and should not be treated as real human opinions or factual information. Users should validate findings through traditional research methods.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            6. Limitations
          </Typography>
          <Typography variant="body1" paragraph>
            In no event shall S.A.G.E or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use S.A.G.E, even if S.A.G.E or an authorized representative has been notified orally or in writing of the possibility of such damage.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            7. API Usage and Rate Limits
          </Typography>
          <Typography variant="body1" paragraph>
            Users integrating with external AI service providers are responsible for:
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Typography component="li" variant="body1" paragraph>
              Managing their own API keys and credentials
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Monitoring and paying for API usage costs
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Complying with the terms of service of third-party AI providers
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Respecting rate limits and usage quotas
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            8. Modifications
          </Typography>
          <Typography variant="body1" paragraph>
            S.A.G.E may revise these terms of service at any time without notice. By using S.A.G.E you are agreeing to be bound by the then current version of these terms of service.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            9. Governing Law
          </Typography>
          <Typography variant="body1" paragraph>
            These terms and conditions are governed by and construed in accordance with the laws applicable in your jurisdiction, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            10. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms of Service, please contact us at contact@example.com
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsOfServicePage;
