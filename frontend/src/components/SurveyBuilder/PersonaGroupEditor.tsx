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
  TextField,
  Grid,
  IconButton,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { PersonaGroup, AGE_GROUPS, GENDERS, OCCUPATIONS } from '../../services/types';

interface PersonaGroupEditorProps {
  personaGroups: PersonaGroup[];
  setPersonaGroups: (groups: PersonaGroup[]) => void;
}

const PersonaGroupEditor: React.FC<PersonaGroupEditorProps> = ({ personaGroups, setPersonaGroups }) => {
  const [editingGroup, setEditingGroup] = useState<Partial<PersonaGroup> | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [personaInput, setPersonaInput] = useState('');

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
  };

  const handleEdit = (index: number) => {
    setEditingGroup({ ...personaGroups[index] });
    setEditingIndex(index);
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
    setPersonaInput('');
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
    setPersonaInput('');
  };

  const handleAddPersona = () => {
    if (!editingGroup || !personaInput.trim()) return;
    const personas = [...(editingGroup.personas || []), personaInput.trim()];
    setEditingGroup({ ...editingGroup, personas });
    setPersonaInput('');
  };

  const handleRemovePersona = (index: number) => {
    if (!editingGroup) return;
    const personas = editingGroup.personas?.filter((_, i) => i !== index) || [];
    setEditingGroup({ ...editingGroup, personas });
  };

  // Render the edit/add form
  function renderEditForm() {
    return (
      <Card sx={{ mt: 2, backgroundColor: '#f9f9f9', border: '2px solid #1976d2' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {editingIndex !== null ? 'Edit Persona Group' : 'New Persona Group'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Group Name"
                value={editingGroup?.name || ''}
                onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Weight"
                value={editingGroup?.weight || 1.0}
                onChange={(e) => setEditingGroup({ ...editingGroup, weight: parseFloat(e.target.value) || 1.0 })}
                inputProps={{ min: 0, step: 0.1 }}
                helperText="Will be normalized with other groups"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={editingGroup?.description || ''}
                onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>

            {/* Personas */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Personas *
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add persona description"
                  value={personaInput}
                  onChange={(e) => setPersonaInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPersona()}
                />
                <Button onClick={handleAddPersona} variant="outlined">
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {editingGroup?.personas?.map((persona, i) => (
                  <Chip
                    key={i}
                    label={persona}
                    onDelete={() => handleRemovePersona(i)}
                    size="small"
                    color="primary"
                  />
                ))}
              </Box>
              {(!editingGroup?.personas || editingGroup.personas.length === 0) && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                  At least one persona is required
                </Typography>
              )}
            </Grid>

            {/* Target Demographics */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Target Demographics
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Genders</InputLabel>
                <Select
                  multiple
                  value={editingGroup?.target_demographics?.gender || []}
                  label="Genders"
                  onChange={(e) => setEditingGroup({
                    ...editingGroup,
                    target_demographics: {
                      ...(editingGroup?.target_demographics || { age_group: [], occupation: [] }),
                      gender: e.target.value as string[],
                    },
                  })}
                  input={<OutlinedInput label="Genders" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {GENDERS.map((gender) => (
                    <MenuItem key={gender} value={gender}>
                      {gender}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Age Groups</InputLabel>
                <Select
                  multiple
                  value={editingGroup?.target_demographics?.age_group || []}
                  label="Age Groups"
                  onChange={(e) => setEditingGroup({
                    ...editingGroup,
                    target_demographics: {
                      ...(editingGroup?.target_demographics || { gender: [], occupation: [] }),
                      age_group: e.target.value as string[],
                    },
                  })}
                  input={<OutlinedInput label="Age Groups" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {AGE_GROUPS.map((age) => (
                    <MenuItem key={age} value={age}>
                      {age}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Occupations</InputLabel>
                <Select
                  multiple
                  value={editingGroup?.target_demographics?.occupation || []}
                  label="Occupations"
                  onChange={(e) => setEditingGroup({
                    ...editingGroup,
                    target_demographics: {
                      ...(editingGroup?.target_demographics || { gender: [], age_group: [] }),
                      occupation: e.target.value as string[],
                    },
                  })}
                  input={<OutlinedInput label="Occupations" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {OCCUPATIONS.map((occ) => (
                    <MenuItem key={occ} value={occ}>
                      {occ}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!editingGroup?.name || !editingGroup?.personas || editingGroup.personas.length === 0}
          >
            {editingIndex !== null ? 'Save Changes' : 'Add Persona Group'}
          </Button>
        </CardActions>
      </Card>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Persona Groups</Typography>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAdd} disabled={!!editingGroup}>
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
          <React.Fragment key={index}>
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ bgcolor: editingIndex === index ? '#f0f7ff' : 'inherit' }}>
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
                            <strong>Genders:</strong> {group.target_demographics.gender.join(', ') || 'All'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Ages:</strong> {group.target_demographics.age_group.join(', ') || 'All'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Occupations:</strong> {group.target_demographics.occupation.join(', ') || 'All'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        onClick={() => handleEdit(index)}
                        color="primary"
                        size="small"
                        disabled={!!editingGroup}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(index)}
                        color="error"
                        size="small"
                        disabled={!!editingGroup}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Edit Form - appears right after the group being edited */}
            {editingGroup && editingIndex === index && (
              <Grid item xs={12}>{renderEditForm()}</Grid>
            )}
          </React.Fragment>
        ))}
      </Grid>

      {/* Add Form - appears at the bottom when adding new group */}
      {editingGroup && editingIndex === null && renderEditForm()}

      {personaGroups.length === 0 && !editingGroup && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No persona groups added yet. Click "Add Persona Group" to get started.
        </Typography>
      )}
    </Paper>
  );
};

export default PersonaGroupEditor;
