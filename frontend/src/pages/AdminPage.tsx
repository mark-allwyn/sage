/**
 * Admin Page
 * Central hub for administrative tasks and system management
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';

interface AdminTask {
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
  badge?: string;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  enabled: boolean;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  const adminTasks: AdminTask[] = [
    {
      title: 'Evaluations',
      description: 'Monitor and evaluate LLM response quality using DeepEval metrics. Track answer relevancy, bias, and hallucination detection.',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      path: '/evaluations',
      badge: 'Beta',
      badgeColor: 'secondary',
      enabled: true,
    },
    {
      title: 'User Management',
      description: 'Manage user accounts, permissions, and access control. Configure roles and authentication settings.',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/admin/users',
      badge: 'Coming Soon',
      badgeColor: 'warning',
      enabled: false,
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings, API keys, model providers, and default configurations.',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      path: '/admin/system',
      badge: 'Coming Soon',
      badgeColor: 'warning',
      enabled: false,
    },
    {
      title: 'Security & Audit',
      description: 'View security logs, audit trails, and system access history. Configure security policies.',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      path: '/admin/security',
      badge: 'Coming Soon',
      badgeColor: 'warning',
      enabled: false,
    },
    {
      title: 'Data Management',
      description: 'Manage survey data, results storage, backup configurations, and data retention policies.',
      icon: <StorageIcon sx={{ fontSize: 40 }} />,
      path: '/admin/data',
      badge: 'Coming Soon',
      badgeColor: 'warning',
      enabled: false,
    },
    {
      title: 'Analytics & Reports',
      description: 'System usage analytics, performance metrics, and comprehensive reporting dashboards.',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      path: '/admin/analytics',
      badge: 'Coming Soon',
      badgeColor: 'warning',
      enabled: false,
    },
  ];

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Administration"
        subtitle="System management and administrative tools"
      />

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Welcome to the administration dashboard. Access various administrative
          tools and system management features below.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
          Note: This section will require authentication in future releases.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {adminTasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s',
                opacity: task.enabled ? 1 : 0.6,
                '&:hover': task.enabled
                  ? {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    }
                  : {},
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      color: task.enabled ? 'primary.main' : 'text.disabled',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {task.icon}
                  </Box>
                  {task.badge && (
                    <Chip
                      label={task.badge}
                      size="small"
                      color={task.badgeColor}
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>

                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: task.enabled ? 'text.primary' : 'text.disabled',
                  }}
                >
                  {task.title}
                </Typography>

                <Typography
                  variant="body2"
                  color={task.enabled ? 'text.secondary' : 'text.disabled'}
                  sx={{ lineHeight: 1.6 }}
                >
                  {task.description}
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant={task.enabled ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => task.enabled && navigate(task.path)}
                  disabled={!task.enabled}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {task.enabled ? 'Open' : 'Coming Soon'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminPage;
