/**
 * Main App Component
 * Provides routing and theme configuration for S.A.G.E
 * (Synthetic Audience Generation Engine)
 * Uses modular theme system from ./theme directory
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';

// Layout components
import Layout from './components/Layout/Layout';

// Page components
import HomePage from './pages/HomePage';
import SurveyBuilderPage from './pages/SurveyBuilderPage';
import SurveyPreviewPage from './pages/SurveyPreviewPage';
import SurveyRunnerPage from './pages/SurveyRunnerPage';
import SurveyUserViewPage from './pages/SurveyUserViewPage';
import SurveyHistoryPage from './pages/SurveyHistoryPage';
import SurveyRunDetailPage from './pages/SurveyRunDetailPage';
import GroundTruthTestingPage from './pages/GroundTruthTestingPage';
import SystemOverviewPage from './pages/SystemOverviewPage';
import DocumentationPage from './pages/DocumentationPage';
import SettingsPage from './pages/SettingsPage';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              {/* Home page */}
              <Route path="/" element={<HomePage />} />

              {/* Documentation - user guide and how-to */}
              <Route path="/documentation" element={<DocumentationPage />} />

              {/* System Overview - technical documentation */}
              <Route path="/overview" element={<SystemOverviewPage />} />

              {/* Survey Builder - create/edit surveys */}
              <Route path="/builder" element={<SurveyBuilderPage />} />

              {/* Survey Preview - view survey structure */}
              <Route path="/preview" element={<SurveyPreviewPage />} />
              <Route path="/preview/:surveyId" element={<SurveyPreviewPage />} />

              {/* Survey Runner - run surveys and view results */}
              <Route path="/runner" element={<SurveyRunnerPage />} />
              <Route path="/runner/:surveyId" element={<SurveyRunnerPage />} />

              {/* Survey User View - respondent experience */}
              <Route path="/user-view" element={<SurveyUserViewPage />} />
              <Route path="/user-view/:surveyId" element={<SurveyUserViewPage />} />

              {/* Survey History - view past runs */}
              <Route path="/history" element={<SurveyHistoryPage />} />
              <Route path="/history/:runId" element={<SurveyRunDetailPage />} />

              {/* Ground Truth Testing - experimentation */}
              <Route path="/ground-truth" element={<GroundTruthTestingPage />} />

              {/* Settings - system configuration and status */}
              <Route path="/settings" element={<SettingsPage />} />

              {/* Redirect unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
