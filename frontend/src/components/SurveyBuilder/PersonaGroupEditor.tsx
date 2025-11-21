/**
 * Persona Group Editor Component
 * Add, edit, and remove persona groups with automatic weight normalization
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
  Alert,
  Divider,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, HelpOutline as HelpIcon } from '@mui/icons-material';
import { PersonaGroup } from '../../services/types';
import PersonaGroupEditorDialog from './PersonaGroupEditorDialog';

interface PersonaGroupEditorProps {
  personaGroups: PersonaGroup[];
  setPersonaGroups: (groups: PersonaGroup[]) => void;
}

const PersonaGroupEditor: React.FC<PersonaGroupEditorProps> = ({ personaGroups, setPersonaGroups }) => {
  const [editingGroup, setEditingGroup] = useState<Partial<PersonaGroup> | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Calculate total weight
  const totalWeight = personaGroups.reduce((sum, group) => sum + group.weight, 0);

  // Normalize weights so they sum to 1.0
  const normalizeWeights = (groups: PersonaGroup[]): PersonaGroup[] => {
    if (groups.length === 0) return groups;

    const total = groups.reduce((sum, group) => sum + group.weight, 0);
    if (total === 0) {
      // If all weights are 0, distribute equally
      const equalWeight = 1.0 / groups.length;
      return groups.map(group => ({ ...group, weight: equalWeight }));
    }

    // Normalize to sum to 1.0
    return groups.map(group => ({
      ...group,
      weight: group.weight / total,
    }));
  };

  const handleAdd = () => {
    setEditingGroup({
      name: '',
      description: '',
      personas: [],
      target_demographics: {
        gender: [],
        age_group: [],
        occupation: [],
      },
      weight: 1.0,
    });
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingGroup({ ...personaGroups[index] });
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingGroup || !editingGroup.name || !editingGroup.personas || editingGroup.personas.length === 0) return;

    const newGroup: PersonaGroup = {
      name: editingGroup.name,
      description: editingGroup.description || '',
      personas: editingGroup.personas,
      target_demographics: editingGroup.target_demographics || {
        gender: [],
        age_group: [],
        occupation: [],
      },
      weight: editingGroup.weight || 1.0,
    };

    let updatedGroups: PersonaGroup[];
    if (editingIndex !== null) {
      // Update existing group
      updatedGroups = personaGroups.map((group, i) => i === editingIndex ? newGroup : group);
    } else {
      // Add new group
      updatedGroups = [...personaGroups, newGroup];
    }

    // Normalize weights
    updatedGroups = normalizeWeights(updatedGroups);

    setPersonaGroups(updatedGroups);
    setEditingGroup(null);
    setEditingIndex(null);
    setDialogOpen(false);
  };

  const handleDelete = (index: number) => {
    const updated = personaGroups.filter((_, i) => i !== index);
    // Normalize weights after deletion
    const normalized = normalizeWeights(updated);
    setPersonaGroups(normalized);
  };

  const handleCancel = () => {
    setEditingGroup(null);
    setEditingIndex(null);
    setDialogOpen(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5">Persona Groups</Typography>
          <Tooltip title="Create groups of respondent types with specific characteristics (e.g., 'Young Professionals', 'Retirees'). Each group can have different demographics and will be weighted in your final sample.">
            <IconButton size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAdd}>
          Add Persona Group
        </Button>
      </Box>

      {/* Weight Summary */}
      {personaGroups.length > 0 && (
        <Alert
          severity={Math.abs(totalWeight - 1.0) < 0.01 ? "success" : "warning"}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            <strong>Total Weight:</strong> {totalWeight.toFixed(3)}
            {Math.abs(totalWeight - 1.0) >= 0.01 && ' (weights are automatically normalized to sum to 1.0 when saving)'}
          </Typography>
        </Alert>
      )}

      {/* Existing Persona Groups */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {personaGroups.map((group, index) => (
          <Grid item xs={12} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {group.name}
                    </Typography>
                    <Typography variant="body2" color="primary" gutterBottom>
                      Weight: {group.weight.toFixed(3)} ({(group.weight * 100).toFixed(1)}%)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {group.description}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Personas ({group.personas.length}):
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {group.personas.map((persona, i) => (
                        <Chip key={i} label={persona} size="small" variant="outlined" />
                      ))}
                    </Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Target Demographics:
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Genders:</strong> {group.target_demographics.gender?.join(', ') || 'All'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Ages:</strong> {group.target_demographics.age_group?.join(', ') || 'All'}
                        </Typography>
                      </Grid>
                      {group.target_demographics.occupation && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Occupations:</strong> {group.target_demographics.occupation.join(', ')}
                          </Typography>
                        </Grid>
                      )}
                      {group.target_demographics.income_level && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Income:</strong> {group.target_demographics.income_level.join(', ')}
                          </Typography>
                        </Grid>
                      )}
                      {group.target_demographics.tech_comfort_level && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Tech:</strong> {group.target_demographics.tech_comfort_level.join(', ')}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      onClick={() => handleEdit(index)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Persona Group Editor Dialog */}
      <PersonaGroupEditorDialog
        open={dialogOpen}
        group={editingGroup}
        isEditing={editingIndex !== null}
        onSave={handleSave}
        onCancel={handleCancel}
        onGroupChange={setEditingGroup}
      />

      {personaGroups.length === 0 && !editingGroup && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No persona groups added yet. Click "Add Persona Group" to get started.
        </Typography>
      )}
    </Paper>
  );
};

export default PersonaGroupEditor;
