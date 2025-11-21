/**
 * Category Edit Form Component
 * Reusable form for creating and editing categories with media upload
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Alert,
  CircularProgress,
  Card,
  Button,
  Chip,
} from '@mui/material';
import {
  HelpOutline as HelpIcon,
  Image as ImageIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { Category, MediaUploadResponse } from '../../services/types';
import axios from 'axios';

interface CategoryEditFormProps {
  category: Partial<Category>;
  setCategory: (category: Partial<Category>) => void;
}

const CategoryEditForm: React.FC<CategoryEditFormProps> = ({ category, setCategory }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<MediaUploadResponse>(
        'http://localhost:8000/api/upload/image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        setCategory({
          ...category,
          media_type: 'image',
          media_path: response.data.media_path,
          media_url: response.data.media_url,
        });
      }
    } catch (error: any) {
      setUploadError(error.response?.data?.detail || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleWebpageUrlProcess = async () => {
    if (!mediaUrl) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('media_url', mediaUrl);

      const response = await axios.post<MediaUploadResponse>(
        'http://localhost:8000/api/process/webpage-url',
        formData
      );

      if (response.data.success) {
        setCategory({
          ...category,
          media_type: 'webpage',
          media_url: mediaUrl,
        });
        setMediaUrl('');
      }
    } catch (error: any) {
      setUploadError(error.response?.data?.detail || 'Failed to process webpage URL');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setCategory({
      ...category,
      media_type: undefined,
      media_url: undefined,
      media_path: undefined,
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <TextField
            fullWidth
            label="Category ID"
            value={category.id || ''}
            onChange={(e) => setCategory({ ...category, id: e.target.value })}
            required
            helperText="Unique identifier (e.g., 'product_a', 'brand1')"
          />
          <Tooltip title="Short, unique ID for this category. Use lowercase with underscores.">
            <IconButton size="small" sx={{ mt: 1 }}>
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <TextField
            fullWidth
            label="Category Name"
            value={category.name || ''}
            onChange={(e) => setCategory({ ...category, name: e.target.value })}
            required
            helperText="Display name for the category"
          />
          <Tooltip title="Human-readable name that will be shown in questions and results (e.g., 'iPhone 15 Pro', 'Coca-Cola')">
            <IconButton size="small" sx={{ mt: 1 }}>
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <TextField
            fullWidth
            label="Description"
            value={category.description || ''}
            onChange={(e) => setCategory({ ...category, description: e.target.value })}
            multiline
            rows={2}
            helperText="Brief overview of this category"
          />
          <Tooltip title="A short description to help identify and differentiate this category.">
            <IconButton size="small" sx={{ mt: 1 }}>
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <TextField
            fullWidth
            label="Context"
            value={category.context || ''}
            onChange={(e) => setCategory({ ...category, context: e.target.value })}
            multiline
            rows={4}
            helperText="Detailed information about this category for AI understanding"
          />
          <Tooltip title="Provide comprehensive details about this category. This could include features, pricing, target audience, or any information that would help the AI generate realistic responses. The more context, the better the responses.">
            <IconButton size="small" sx={{ mt: 1 }}>
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Grid>

      {/* Media Upload Section */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Typography variant="subtitle1">
            Media Content (Optional)
          </Typography>
          <Tooltip title="Attach an image or webpage URL to provide visual context for this category. Vision-capable AI models (like GPT-4 Vision or Claude 3) can analyze these visuals when generating responses, making them more accurate and contextual.">
            <IconButton size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Upload images or provide webpage URLs. Requires vision-capable AI models.
        </Typography>

        {uploadError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
            {uploadError}
          </Alert>
        )}

        {category.media_type ? (
          <Card variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#e8f5e9' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Media Type: {category.media_type?.replace('_', ' ').toUpperCase()}
              </Typography>

              {/* Display Image Preview */}
              {category.media_type === 'image' && (category.media_url || category.media_path) && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <img
                    src={category.media_url || category.media_path}
                    alt={category.name || 'Category image'}
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                    }}
                  />
                </Box>
              )}

              {/* Display Webpage URL */}
              {category.media_type === 'webpage' && category.media_url && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                    Webpage URL:
                  </Typography>
                  <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                    {category.media_url}
                  </Typography>
                </Box>
              )}

              {category.media_path && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Path: {category.media_path}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleRemoveMedia} color="error" size="small" variant="outlined">
                Remove Media
              </Button>
            </Box>
          </Card>
        ) : (
          <Box>
            {/* Image Upload */}
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                disabled={uploading}
                fullWidth
              >
                Upload Image (JPG, PNG, WebP)
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            </Box>

            {/* Webpage URL */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Webpage URL"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://example.com"
                helperText="Enter a webpage URL to capture as context"
                disabled={uploading}
              />
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<LinkIcon />}
                  onClick={handleWebpageUrlProcess}
                  disabled={uploading || !mediaUrl}
                  fullWidth
                >
                  Process Webpage URL
                </Button>
              </Box>
            </Box>

            {uploading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="caption">Processing media...</Typography>
              </Box>
            )}
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default CategoryEditForm;
