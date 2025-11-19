/**
 * Layout Component
 * Modern top navigation bar with professional SaaS-style design
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Create as CreateIcon,
  PlayArrow as PlayArrowIcon,
  Science as ScienceIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon,
  Assessment as AssessmentIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from '@mui/icons-material';
import { AppBreadcrumbs } from '../Breadcrumbs';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactElement;
  badge?: 'primary' | 'beta';
  description?: string;
  isSection?: boolean;
}

// Ultra-streamlined navigation: core workflow items
// Removed: Overview (accessible from Home page)
// Focus: Home → Create → Run → Results → Advanced
// Admin section requires authentication (will be added later)
const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: <HomeIcon />, description: 'Start here' },
  { label: 'Create', path: '/builder', icon: <CreateIcon />, description: 'Build surveys' },
  { label: 'Run', path: '/runner', icon: <PlayArrowIcon />, description: 'Execute surveys' },
  { label: 'Results', path: '/history', icon: <HistoryIcon />, description: 'View data' },
  { label: 'Experiments', path: '/ground-truth', icon: <ScienceIcon />, badge: 'beta', description: 'Ground truth testing' },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon />, description: 'System configuration' },
  { label: 'Admin', icon: <AdminPanelSettingsIcon />, isSection: true, description: 'Administrator tools' },
  { label: 'Evaluations', path: '/evaluations', icon: <AssessmentIcon />, badge: 'beta', description: 'LLM quality monitoring' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ScienceIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.25rem',
              color: 'text.primary',
            }}
          >
            S.A.G.E
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 2, py: 2 }}>
        {navItems.map((item, index) => {
          if (item.isSection) {
            // Render section header
            return (
              <React.Fragment key={item.label}>
                {index > 0 && <Divider sx={{ my: 2 }} />}
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton disabled sx={{ cursor: 'default', '&:hover': { bgcolor: 'transparent' } }}>
                    <ListItemIcon sx={{ fontSize: 22, minWidth: 40, color: 'text.secondary' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                      secondaryTypographyProps={{
                        fontSize: '0.7rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            );
          }

          // Check if this item is under a section (comes after a section header)
          const isUnderSection = index > 0 && navItems[index - 1]?.isSection;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path!)}
                aria-label={`Navigate to ${item.label}`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
                sx={{
                  minHeight: 48,
                  borderRadius: 1.5,
                  pl: isUnderSection ? 4 : 2,
                  '& .MuiListItemIcon-root': {
                    minWidth: 40,
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  },
                }}
              >
                <ListItemIcon sx={{ fontSize: 22 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                  primaryTypographyProps={{
                    fontSize: '0.9375rem',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      bgcolor: item.badge === 'primary' ? 'primary.main' : 'secondary.main',
                      color: 'white',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <ScienceIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 600,
                fontSize: '1.25rem',
                color: 'text.primary',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              S.A.G.E
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              gap: 1,
              alignItems: 'center',
            }}
          >
            {navItems.map((item, index) => {
              if (item.isSection) {
                // Render section divider with label
                return (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        letterSpacing: 0.5,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                );
              }

              return (
                <Box key={item.path} sx={{ position: 'relative' }}>
                  <Button
                    onClick={() => handleNavigation(item.path!)}
                    aria-label={`Navigate to ${item.label}`}
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                    startIcon={item.icon}
                    sx={{
                      color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                      bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.9375rem',
                      '&:hover': {
                        bgcolor: location.pathname === item.path ? 'action.selected' : 'action.hover',
                      },
                      '& .MuiButton-startIcon': {
                        mr: 1,
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        bgcolor: item.badge === 'primary' ? 'primary.main' : 'secondary.main',
                        color: 'white',
                        '& .MuiChip-label': {
                          px: 0.75,
                        }
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open navigation menu"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{
              display: { lg: 'none' },
              color: 'text.primary',
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: { xs: 3, sm: 4, md: 5 },
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <AppBreadcrumbs />
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          py: { xs: 4, md: 6 },
          mt: 'auto',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 4, md: 6 } }}>
            {/* Brand Section */}
            <Box sx={{ flex: '1 1 auto', maxWidth: { xs: '100%', md: '300px' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <ScienceIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  S.A.G.E
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                Synthetic Audience Generation Engine for cutting-edge market research using AI and Semantic Similarity Rating.
              </Typography>
            </Box>

            {/* Integrations */}
            <Box sx={{ flex: '0 0 auto' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                Integrations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'none', px: 0, minWidth: 0 }}
                  component="a"
                  href="https://openai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenAI
                </Button>
                <Button
                  sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'none', px: 0, minWidth: 0 }}
                  component="a"
                  href="https://anthropic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Anthropic
                </Button>
                <Button
                  sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'none', px: 0, minWidth: 0 }}
                  component="a"
                  href="https://ollama.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ollama
                </Button>
              </Box>
            </Box>

            {/* Resources Links */}
            <Box sx={{ flex: '0 0 auto' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                Resources
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'none', px: 0, minWidth: 0 }}
                  onClick={() => navigate('/documentation')}
                >
                  Documentation
                </Button>
                <Button
                  sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'none', px: 0, minWidth: 0 }}
                  onClick={() => navigate('/overview')}
                >
                  System Overview
                </Button>
                <Button
                  sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'none', px: 0, minWidth: 0 }}
                  component="a"
                  href="https://arxiv.org/abs/2510.08338"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Research Paper
                </Button>
                <Button
                  sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'none', px: 0, minWidth: 0 }}
                  component="a"
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </Button>
              </Box>
            </Box>

            {/* Legal Links */}
            <Box sx={{ flex: '0 0 auto' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'none', px: 0, minWidth: 0 }}
                  component="a"
                  href="#privacy"
                >
                  Privacy Policy
                </Button>
                <Button
                  sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'none', px: 0, minWidth: 0 }}
                  component="a"
                  href="#terms"
                >
                  Terms of Service
                </Button>
                <Button
                  sx={{ justifyContent: 'flex-start', color: 'text.secondary', textTransform: 'none', px: 0, minWidth: 0 }}
                  component="a"
                  href="#license"
                >
                  License
                </Button>
              </Box>
            </Box>

            {/* Connect Section */}
            <Box sx={{ flex: '0 0 auto' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                Connect
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                  component="a"
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <GitHubIcon />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                  component="a"
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                  component="a"
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                  component="a"
                  href="mailto:contact@example.com"
                  aria-label="Email"
                >
                  <EmailIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Bottom Row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} S.A.G.E. All rights reserved.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Built with AI-powered synthetic audience technology
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
