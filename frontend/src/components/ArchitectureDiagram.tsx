/**
 * Architecture Diagram Component
 * Technical architecture visualization for SAGE system
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Cloud as CloudIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Api as ApiIcon,
  Web as WebIcon,
  DataObject as DataObjectIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

const ArchitectureDiagram: React.FC = () => {
  return (
    <Paper sx={{ p: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          System Architecture
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Technical stack and component architecture of the SAGE platform
        </Typography>
      </Box>

      {/* Architecture Layers */}
      <Stack spacing={3}>
        {/* Frontend Layer */}
        <Card sx={{ bgcolor: '#e3f2fd', borderLeft: 4, borderColor: '#2196f3' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <WebIcon sx={{ fontSize: 36, color: '#2196f3' }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Frontend Layer
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  React + TypeScript Single Page Application
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    UI Framework
                  </Typography>
                  <Stack spacing={0.5}>
                    <Chip label="React 18" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Material-UI (MUI)" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="TypeScript" size="small" sx={{ justifyContent: 'flex-start' }} />
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    State Management
                  </Typography>
                  <Stack spacing={0.5}>
                    <Chip label="React Query (TanStack)" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="React Hooks" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Context API" size="small" sx={{ justifyContent: 'flex-start' }} />
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Visualization
                  </Typography>
                  <Stack spacing={0.5}>
                    <Chip label="Recharts" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="React Router" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Axios" size="small" sx={{ justifyContent: 'flex-start' }} />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* API Layer */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: -1 }}>
          <Box sx={{
            width: 2,
            height: 40,
            bgcolor: 'divider',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: -4,
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '8px solid',
              borderTopColor: 'divider',
            }
          }} />
        </Box>

        <Card sx={{ bgcolor: '#f3e5f5', borderLeft: 4, borderColor: '#9c27b0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <ApiIcon sx={{ fontSize: 36, color: '#9c27b0' }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  API Layer
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  RESTful API with Server-Sent Events (SSE) for real-time updates
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    API Framework
                  </Typography>
                  <Stack spacing={0.5}>
                    <Chip label="FastAPI (Python)" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Pydantic Validation" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="CORS Middleware" size="small" sx={{ justifyContent: 'flex-start' }} />
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Endpoints
                  </Typography>
                  <Stack spacing={0.5}>
                    <Chip label="Survey Management" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Pipeline Execution" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Ground Truth Testing" size="small" sx={{ justifyContent: 'flex-start' }} />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Processing Layer */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: -1 }}>
          <Box sx={{
            width: 2,
            height: 40,
            bgcolor: 'divider',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: -4,
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '8px solid',
              borderTopColor: 'divider',
            }
          }} />
        </Box>

        <Card sx={{ bgcolor: '#fff3e0', borderLeft: 4, borderColor: '#ff9800' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <SpeedIcon sx={{ fontSize: 36, color: '#ff9800' }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Core Processing Layer
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  SSR Pipeline and business logic implementation
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Profile Generation
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Synthetic profile generation based on persona groups and demographics
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    <Chip label="Weighted Sampling" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Demographic Distribution" size="small" sx={{ justifyContent: 'flex-start' }} />
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    LLM Integration
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Multi-modal response generation with vision-capable models
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    <Chip label="OpenAI API" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Anthropic API" size="small" sx={{ justifyContent: 'flex-start' }} />
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    SSR Engine
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Semantic similarity rating and distribution calculation
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    <Chip label="Embedding Models" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Statistical Analysis" size="small" sx={{ justifyContent: 'flex-start' }} />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* External Services */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: -1 }}>
          <Box sx={{
            width: 2,
            height: 40,
            bgcolor: 'divider',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: -4,
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '8px solid',
              borderTopColor: 'divider',
            }
          }} />
        </Box>

        <Card sx={{ bgcolor: '#e8f5e9', borderLeft: 4, borderColor: '#4caf50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <CloudIcon sx={{ fontSize: 36, color: '#4caf50' }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  External Services & AI Models
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Third-party LLM providers and embedding models
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <AutoAwesomeIcon sx={{ color: '#4caf50', mb: 1 }} />
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    OpenAI
                  </Typography>
                  <Stack spacing={0.5}>
                    <Chip label="GPT-5.1 Instant" size="small" variant="outlined" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="GPT-5.1 Thinking" size="small" variant="outlined" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="GPT-4o / GPT-4o Mini" size="small" variant="outlined" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Text Embeddings" size="small" variant="outlined" sx={{ justifyContent: 'flex-start' }} />
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <AutoAwesomeIcon sx={{ color: '#4caf50', mb: 1 }} />
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Anthropic
                  </Typography>
                  <Stack spacing={0.5}>
                    <Chip label="Claude Sonnet 4.5" size="small" variant="outlined" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Claude Haiku 4.5" size="small" variant="outlined" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Claude Opus 4.1" size="small" variant="outlined" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Vision Capabilities" size="small" variant="outlined" sx={{ justifyContent: 'flex-start' }} />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Data Layer */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: -1 }}>
          <Box sx={{
            width: 2,
            height: 40,
            bgcolor: 'divider',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: -4,
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '8px solid',
              borderTopColor: 'divider',
            }
          }} />
        </Box>

        <Card sx={{ bgcolor: '#fce4ec', borderLeft: 4, borderColor: '#e91e63' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <StorageIcon sx={{ fontSize: 36, color: '#e91e63' }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Data & Storage Layer
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  File-based storage and data persistence
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Survey Storage
                  </Typography>
                  <Stack spacing={0.5}>
                    <Chip label="YAML Configuration" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Local File System" size="small" sx={{ justifyContent: 'flex-start' }} />
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Results Storage
                  </Typography>
                  <Stack spacing={0.5}>
                    <Chip label="JSON Data Files" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Run Metadata" size="small" sx={{ justifyContent: 'flex-start' }} />
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Media Storage
                  </Typography>
                  <Stack spacing={0.5}>
                    <Chip label="Image Uploads" size="small" sx={{ justifyContent: 'flex-start' }} />
                    <Chip label="Static File Serving" size="small" sx={{ justifyContent: 'flex-start' }} />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>

      {/* Key Architecture Features */}
      <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Key Architecture Features
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <SecurityIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Secure API Keys
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Environment-based configuration for LLM API credentials
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <SpeedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Real-time Progress
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  SSE streaming for live pipeline execution updates
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <DataObjectIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Type Safety
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Full TypeScript on frontend, Pydantic on backend
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <WebIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  SPA Architecture
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Client-side routing with React Router for smooth navigation
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Technology Stack Summary */}
      <Box sx={{ mt: 3, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Technology Stack Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" display="block">
              Frontend
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              React + TypeScript
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" display="block">
              Backend
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              FastAPI + Python
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" display="block">
              AI Models
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              GPT-5 / Claude 4
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" display="block">
              Data Format
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              YAML / JSON
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ArchitectureDiagram;
