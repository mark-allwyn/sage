/**
 * Survey History Page
 * View all previously run surveys with filtering and search
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useSurveyRuns, useDeleteSurveyRun, useSurveys } from '../services/hooks';
import { SurveyRunMetadata } from '../services/types';
import { ListSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import { exportSurveyHistoryToCSV } from '../utils/csvExport';

const SurveyHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSurveyFilter, setSelectedSurveyFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [runToDelete, setRunToDelete] = useState<string | null>(null);

  const { data: surveys } = useSurveys();
  const { data: runs, isLoading, error, refetch } = useSurveyRuns(selectedSurveyFilter || undefined);
  const deleteMutation = useDeleteSurveyRun({
    onSuccess: () => {
      refetch();
      setDeleteDialogOpen(false);
      setRunToDelete(null);
    },
  });

  const handleDeleteClick = (runId: string) => {
    setRunToDelete(runId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (runToDelete) {
      deleteMutation.mutate(runToDelete);
    }
  };

  const handleViewDetails = (runId: string) => {
    navigate(`/history/${runId}`);
  };

  const handleExportCSV = () => {
    if (!filteredRuns || filteredRuns.length === 0) return;
    exportSurveyHistoryToCSV(filteredRuns);
  };

  // Filter runs by search query
  const filteredRuns = runs?.filter((run) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      run.run_id.toLowerCase().includes(query) ||
      run.survey_id.toLowerCase().includes(query) ||
      run.config.model.toLowerCase().includes(query)
    );
  });

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Survey History"
        subtitle="View and manage previously run surveys with detailed results"
        icon={<HistoryIcon sx={{ fontSize: 28 }} />}
      />

      {/* Filters */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Survey</InputLabel>
            <Select
              value={selectedSurveyFilter}
              label="Filter by Survey"
              onChange={(e) => setSelectedSurveyFilter(e.target.value)}
            >
              <MenuItem value="">
                <em>All Surveys</em>
              </MenuItem>
              {surveys?.map((survey) => (
                <MenuItem key={survey.id} value={survey.id}>
                  {survey.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            placeholder="Search runs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />

          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            onClick={handleExportCSV}
            disabled={!filteredRuns || filteredRuns.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Paper>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading survey runs. Please ensure the backend API is running.
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredRuns && filteredRuns.length === 0 && (
        <Paper sx={{ mb: 3 }}>
          <EmptyState
            icon={<PlayArrowIcon />}
            title="No survey runs found"
            description={searchQuery || selectedSurveyFilter
              ? 'Try adjusting your filters to see more results'
              : 'Run a survey to see it appear here. Survey runs will be saved automatically.'}
            actions={[
              { label: "Run Survey", primary: true, href: "/runner" },
              ...(searchQuery || selectedSurveyFilter ? [{
                label: "Clear Filters",
                onClick: () => {
                  setSearchQuery('');
                  setSelectedSurveyFilter('');
                }
              }] : [])
            ]}
          />
        </Paper>
      )}

      {/* Results Table */}
      {!isLoading && !error && filteredRuns && filteredRuns.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Run ID</TableCell>
                <TableCell>Survey</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell align="center">Profiles</TableCell>
                <TableCell align="center">Responses</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Configuration</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRuns.map((run) => (
                <TableRow
                  key={run.run_id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleViewDetails(run.run_id)}
                >
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {run.run_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {run.survey_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(run.timestamp)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={run.num_profiles} size="small" color="primary" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={run.num_responses} size="small" color="secondary" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={run.config.model}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={`LLM T: ${run.config.llm_temperature}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`SSR T: ${run.config.ssr_temperature}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`Seed: ${run.config.seed}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(run.run_id);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(run.run_id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Summary */}
      {!isLoading && !error && filteredRuns && filteredRuns.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredRuns.length} run{filteredRuns.length !== 1 ? 's' : ''}
            {runs && runs.length !== filteredRuns.length && ` of ${runs.length} total`}
          </Typography>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Survey Run?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this survey run? This action cannot be undone.
          </DialogContentText>
          {runToDelete && (
            <Typography variant="body2" fontFamily="monospace" sx={{ mt: 2 }}>
              Run ID: {runToDelete}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SurveyHistoryPage;
