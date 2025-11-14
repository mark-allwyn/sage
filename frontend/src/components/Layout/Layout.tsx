/**
 * Layout Component
 * Provides navigation and page structure
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Create as CreateIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  Science as ScienceIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactElement;
  divider?: boolean; // Add divider after this item
}

// Reorganized following UX best practices:
// 1. Overview/Getting Started section
// 2. Survey Creation workflow (Build → Preview → Test)
// 3. Survey Execution (Run → View Results)
// 4. Analysis & Validation
const navItems: NavItem[] = [
  // Getting Started
  { label: 'Home', path: '/', icon: <HomeIcon /> },
  { label: 'System Overview', path: '/overview', icon: <InfoIcon />, divider: true },

  // Survey Creation Workflow
  { label: 'Survey Builder', path: '/builder', icon: <CreateIcon /> },
  { label: 'Survey Preview', path: '/preview', icon: <VisibilityIcon />, divider: true },

  // Survey Execution
  { label: 'Run Survey', path: '/runner', icon: <PlayArrowIcon /> },
  { label: 'User View', path: '/user-view', icon: <PersonIcon />, divider: true },

  // Analysis & Results
  { label: 'Survey History', path: '/history', icon: <HistoryIcon /> },
  { label: 'Ground Truth Testing', path: '/ground-truth', icon: <ScienceIcon /> },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon color="primary" />
          <Typography variant="h6" noWrap component="div" color="primary">
            S.A.G.E
          </Typography>
        </Box>
      </Toolbar>
      <List>
        {navItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
            {item.divider && <Divider sx={{ my: 1 }} />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            {!isMobile && (
              <>
                <ScienceIcon />
                <Typography variant="h6" noWrap component="div">
                  S.A.G.E
                </Typography>
              </>
            )}
            {isMobile && (
              <Typography variant="h6" noWrap component="div">
                S.A.G.E
              </Typography>
            )}
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Synthetic Audience Generation Engine
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar /> {/* Spacer for app bar */}
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
