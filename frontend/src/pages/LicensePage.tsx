/**
 * License Page
 * Software license information for S.A.G.E
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import { PageHeader } from '../components/PageHeader';

const LicensePage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="License"
        subtitle="Software license and usage rights for S.A.G.E"
      />

      <Container maxWidth="md">
        <Paper sx={{ p: 4, mt: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            MIT License
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Copyright (c) {new Date().getFullYear()} S.A.G.E Contributors
          </Typography>

          <Alert severity="info" sx={{ mb: 4 }}>
            S.A.G.E is open-source software released under the MIT License, which is one of the most permissive licenses available.
          </Alert>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body1" paragraph sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
{`Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 600 }}>
            What This Means
          </Typography>
          <Typography variant="body1" paragraph>
            The MIT License grants you broad permissions to use S.A.G.E:
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Typography component="li" variant="body1" paragraph>
              <strong>Commercial Use:</strong> You can use S.A.G.E for commercial purposes
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Modification:</strong> You can modify the source code to suit your needs
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Distribution:</strong> You can distribute the original or modified software
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Private Use:</strong> You can use S.A.G.E privately without sharing modifications
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Sublicensing:</strong> You can grant sublicenses to others
            </Typography>
          </Box>

          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            The only requirement is that you include the original copyright notice and license text in any copies or substantial portions of the software.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            No Warranty
          </Typography>
          <Typography variant="body1" paragraph>
            S.A.G.E is provided "as is" without any warranties. The developers are not liable for any damages or issues arising from the use of the software. You use S.A.G.E at your own risk.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Third-Party Licenses
          </Typography>
          <Typography variant="body1" paragraph>
            S.A.G.E uses various open-source libraries and frameworks, each with their own licenses:
          </Typography>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 600 }}>
            Frontend Dependencies
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Typography component="li" variant="body1">
              React (MIT License)
            </Typography>
            <Typography component="li" variant="body1">
              Material-UI (MIT License)
            </Typography>
            <Typography component="li" variant="body1">
              React Router (MIT License)
            </Typography>
            <Typography component="li" variant="body1">
              Recharts (MIT License)
            </Typography>
            <Typography component="li" variant="body1">
              TanStack Query (MIT License)
            </Typography>
          </Box>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 600 }}>
            Backend Dependencies
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Typography component="li" variant="body1">
              FastAPI (MIT License)
            </Typography>
            <Typography component="li" variant="body1">
              Pydantic (MIT License)
            </Typography>
            <Typography component="li" variant="body1">
              OpenAI Python SDK (Apache 2.0 License)
            </Typography>
            <Typography component="li" variant="body1">
              Anthropic Python SDK (MIT License)
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            AI Service Provider Terms
          </Typography>
          <Typography variant="body1" paragraph>
            When using S.A.G.E with external AI services, you must comply with their respective terms of service:
          </Typography>
          <Box component="ul" sx={{ pl: 4 }}>
            <Typography component="li" variant="body1" paragraph>
              <strong>OpenAI:</strong> https://openai.com/policies/terms-of-use
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Anthropic:</strong> https://anthropic.com/legal/terms
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              <strong>Ollama:</strong> https://ollama.ai/license
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Academic Citation
          </Typography>
          <Typography variant="body1" paragraph>
            If you use S.A.G.E in academic research, we appreciate (but do not require) citation. Please cite:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'action.hover' }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              S.A.G.E: Synthetic Audience Generation Engine
              <br />
              https://github.com/your-repo/sage
              <br />
              {new Date().getFullYear()}
            </Typography>
          </Paper>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Contributing
          </Typography>
          <Typography variant="body1" paragraph>
            Contributions to S.A.G.E are welcome! By contributing to this project, you agree that your contributions will be licensed under the MIT License.
          </Typography>
          <Typography variant="body1" paragraph>
            For contribution guidelines, please see the CONTRIBUTING.md file in the project repository.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Questions?
          </Typography>
          <Typography variant="body1" paragraph>
            If you have questions about licensing, please contact us at contact@example.com or open an issue on GitHub.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LicensePage;
