/**
 * Category Editor Component
 * Add, edit, and remove survey categories
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
import { Category, MediaUploadResponse } from '../../services/types';
import axios from 'axios';

interface CategoryEditorProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

const CategoryEditor: React.FC<CategoryEditorProps> = ({ categories, setCategories }) => {
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');

  const handleAdd = () => {
    setEditingCategory({
      id: `cat${categories.length + 1}`,
      name: '',
      description: '',
      context: '',
    });
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    setEditingCategory({ ...categories[index] });
    setEditingIndex(index);
  };

  const handleSave = () => {
    if (!editingCategory || !editingCategory.id || !editingCategory.name) return;

    const newCategory: Category = {
      id: editingCategory.id,
      name: editingCategory.name,
      description: editingCategory.description || '',
      context: editingCategory.context || '',
      // Include media fields
      media_type: editingCategory.media_type,
      media_url: editingCategory.media_url,
      media_path: editingCategory.media_path,
    };

    if (editingIndex !== null) {
      // Update existing category
      const updated = [...categories];
      updated[editingIndex] = newCategory;
      setCategories(updated);
    } else {
      // Add new category
      setCategories([...categories, newCategory]);
    }

    setEditingCategory(null);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setEditingIndex(null);
    setMediaUrl('');
    setUploadError(null);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingCategory) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Send old media path so backend can delete the old file
      if (editingCategory.media_path) {
        formData.append('old_media_path', editingCategory.media_path);
      }

      const response = await axios.post<MediaUploadResponse>(
        'http://localhost:8000/api/upload/image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        setEditingCategory({
          ...editingCategory,
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
    if (!mediaUrl || !editingCategory) return;

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
        setEditingCategory({
          ...editingCategory,
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
    if (!editingCategory) return;
    setEditingCategory({
      ...editingCategory,
      media_type: undefined,
      media_url: undefined,
      media_path: undefined,
    });
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5">Categories</Typography>
          <Tooltip title="Categories represent products, brands, or concepts you want to compare in your survey. For example, if comparing smartphones, each phone model would be a category. You can attach images or webpages to provide visual context.">
            <IconButton size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAdd}>
          Add Category
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Optional: Add categories to compare multiple products, services, or concepts in your survey.
      </Typography>

      {/* Existing Categories */}
      <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
        {categories.map((cat, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {cat.id}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {cat.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {cat.description}
                    </Typography>
                    {cat.context && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                        Context: {cat.context.substring(0, 50)}{cat.context.length > 50 ? '...' : ''}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton onClick={() => handleEdit(index)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(index)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Display media preview if present */}
                {cat.media_type === 'image' && (cat.media_url || cat.media_path) && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={cat.media_url || cat.media_path}
                      alt={cat.name}
                      style={{
                        width: '100%',
                        maxHeight: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                      }}
                    />
                  </Box>
                )}

                {cat.media_type === 'webpage' && cat.media_url && (
                  <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                    <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                      Webpage URL:
                    </Typography>
                    <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                      {cat.media_url}
                    </Typography>
                  </Box>
                )}

                {cat.media_type && (
                  <Box sx={{ mt: 1.5 }}>
                    <Chip
                      label={`${cat.media_type.replace('_', ' ').toUpperCase()} attached`}
                      size="small"
                      color="success"
                      variant="outlined"
                      icon={cat.media_type === 'image' ? <ImageIcon /> : <LinkIcon />}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Form */}
      {editingCategory && (
        <Card sx={{ mt: 2, backgroundColor: '#f9f9f9' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {editingIndex !== null ? 'Edit Category' : 'New Category'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Category ID"
                    value={editingCategory.id || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, id: e.target.value })}
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
                    value={editingCategory.name || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
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
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
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
                    value={editingCategory.context || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, context: e.target.value })}
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

                {editingCategory.media_type ? (
                  <Card variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#e8f5e9' }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Media Type: {editingCategory.media_type?.replace('_', ' ').toUpperCase()}
                      </Typography>

                      {/* Display Image Preview */}
                      {editingCategory.media_type === 'image' && (editingCategory.media_url || editingCategory.media_path) && (
                        <Box sx={{ mt: 2, mb: 2 }}>
                          <img
                            src={editingCategory.media_url || editingCategory.media_path}
                            alt={editingCategory.name || 'Category image'}
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
                      {editingCategory.media_type === 'webpage' && editingCategory.media_url && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                          <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                            Webpage URL:
                          </Typography>
                          <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                            {editingCategory.media_url}
                          </Typography>
                        </Box>
                      )}

                      {editingCategory.media_path && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          Path: {editingCategory.media_path}
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
          </CardContent>
          <CardActions>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} disabled={!editingCategory.id || !editingCategory.name}>
              {editingIndex !== null ? 'Update Category' : 'Add Category'}
            </Button>
          </CardActions>
        </Card>
      )}
    </Paper>
  );
};

export default CategoryEditor;
