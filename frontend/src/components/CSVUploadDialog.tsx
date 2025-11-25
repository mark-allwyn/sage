/**
 * CSV Upload Dialog Component
 *
 * Dialog for uploading ground truth data from CSV files.
 * Extracted from GroundTruthTestingPage.tsx to reduce component complexity.
 *
 * Features:
 * - Upload CSV file with ground truth data
 * - Configure name and description
 * - Display upload progress
 * - Show error messages
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Divider,
  Alert,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface CSVUploadDialogProps {
  open: boolean;
  onClose: () => void;
  uploadName: string;
  uploadDescription: string;
  uploadFile: File | null;
  uploadProgress: number;
  uploadError: string | null;
  isUploading: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

const CSVUploadDialog: React.FC<CSVUploadDialogProps> = ({
  open,
  onClose,
  uploadName,
  uploadDescription,
  uploadFile,
  uploadProgress,
  uploadError,
  isUploading,
  onNameChange,
  onDescriptionChange,
  onFileSelect,
  onUpload,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Upload Ground Truth from CSV</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Upload ground truth data from real survey results in CSV format. The file should contain actual answers from respondents (not probability distributions).
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Ground Truth Name"
                fullWidth
                required
                value={uploadName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g., Real Survey Results Q1 2024"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={uploadDescription}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Optional: Describe the source of this data"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                CSV File
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{ py: 2 }}
              >
                {uploadFile ? uploadFile.name : 'Choose CSV File'}
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={onFileSelect}
                />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Required columns: Respondent ID, Question ID, Answer. Optional: Category, Gender, Age Group, Persona Group, Occupation
              </Typography>
            </Grid>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} sx={{ flexGrow: 1 }} />
                  <Typography variant="body2">{uploadProgress}%</Typography>
                </Box>
              </Grid>
            )}

            {uploadError && (
              <Grid item xs={12}>
                <Alert severity="error">
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Upload Error
                  </Typography>
                  <Typography variant="body2">{uploadError}</Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isUploading} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={onUpload}
          variant="contained"
          disabled={!uploadFile || !uploadName || isUploading}
          startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        >
          {isUploading ? 'Uploading...' : 'Upload Ground Truth'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CSVUploadDialog;
