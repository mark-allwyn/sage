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
  Info as InfoIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { AppBreadcrumbs } from '../Breadcrumbs';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactElement;
  badge?: 'primary' | 'beta';
  description?: string;
}

// Ultra-streamlined navigation: 5 core workflow items
// Removed: Overview (accessible from Home page)
// Focus: Home → Create → Run → Results → Advanced
const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: <HomeIcon />, description: 'Start here' },
  { label: 'Create', path: '/builder', icon: <CreateIcon />, description: 'Build surveys' },
  { label: 'Run', path: '/runner', icon: <PlayArrowIcon />, description: 'Execute surveys' },
  { label: 'Results', path: '/history', icon: <HistoryIcon />, description: 'View data' },
  { label: 'Experiments', path: '/ground-truth', icon: <ScienceIcon />, badge: 'beta', description: 'Ground truth testing' },
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
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              aria-label={`Navigate to ${item.label}`}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              sx={{
                minHeight: 48,
                borderRadius: 1.5,
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
        ))}
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
            {navItems.map((item) => (
              <Box key={item.path} sx={{ position: 'relative' }}>
                <Button
                  onClick={() => handleNavigation(item.path)}
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
            ))}
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
    </Box>
  );
};

export default Layout;
