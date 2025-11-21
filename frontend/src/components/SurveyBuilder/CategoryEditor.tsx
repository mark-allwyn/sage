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
  Grid,
  IconButton,
  Card,
  CardContent,
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
import { Category } from '../../services/types';
import CategoryEditorDialog from './CategoryEditorDialog';

interface CategoryEditorProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

const CategoryEditor: React.FC<CategoryEditorProps> = ({ categories, setCategories }) => {
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAdd = () => {
    setEditingCategory({
      id: `cat${categories.length + 1}`,
      name: '',
      description: '',
      context: '',
    });
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingCategory({ ...categories[index] });
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingCategory || !editingCategory.id || !editingCategory.name) return;

    const newCategory: Category = {
      id: editingCategory.id,
      name: editingCategory.name,
      description: editingCategory.description || '',
      context: editingCategory.context || '',
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
    setDialogOpen(false);
  };

  const handleDelete = (index: number) => {
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setEditingIndex(null);
    setDialogOpen(false);
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

      {/* Category Editor Dialog */}
      <CategoryEditorDialog
        open={dialogOpen}
        category={editingCategory}
        isEditing={editingIndex !== null}
        onSave={handleSave}
        onCancel={handleCancel}
        onCategoryChange={setEditingCategory}
      />
    </Paper>
  );
};

export default CategoryEditor;
