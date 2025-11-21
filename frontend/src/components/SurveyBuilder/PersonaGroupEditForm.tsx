/**
 * Persona Group Edit Form Component
 * Reusable form for creating and editing persona groups
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  OutlinedInput,
  Tooltip,
  Typography,
  Button,
} from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { PersonaGroup, AGE_GROUPS, GENDERS, OCCUPATIONS } from '../../services/types';

interface PersonaGroupEditFormProps {
  group: Partial<PersonaGroup>;
  setGroup: (group: Partial<PersonaGroup>) => void;
}

const PersonaGroupEditForm: React.FC<PersonaGroupEditFormProps> = ({ group, setGroup }) => {
  const [personaInput, setPersonaInput] = useState('');

  const handleAddPersona = () => {
    if (!personaInput.trim()) return;
    const personas = [...(group.personas || []), personaInput.trim()];
    setGroup({ ...group, personas });
    setPersonaInput('');
  };

  const handleRemovePersona = (index: number) => {
    const personas = group.personas?.filter((_, i) => i !== index) || [];
    setGroup({ ...group, personas });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <TextField
            fullWidth
            label="Group Name"
            value={group?.name || ''}
            onChange={(e) => setGroup({ ...group, name: e.target.value })}
            required
            helperText="Descriptive name for this respondent group"
          />
          <Tooltip title="Give this group a descriptive name (e.g., 'Tech-Savvy Millennials', 'Budget-Conscious Families')">
            <IconButton size="small" sx={{ mt: 1 }}>
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Grid>
      <Grid item xs={12} md={4}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <TextField
            fullWidth
            type="number"
            label="Weight"
            value={group?.weight || 1.0}
            onChange={(e) => setGroup({ ...group, weight: parseFloat(e.target.value) || 1.0 })}
            inputProps={{ min: 0, step: 0.1 }}
            helperText="Will be normalized with other groups"
          />
          <Tooltip title="Relative proportion of this group in your sample. Higher weights mean more respondents. Weights are automatically normalized to sum to 1.0 (e.g., weights of 3, 2, 1 become 50%, 33%, 17%)">
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
            value={group?.description || ''}
            onChange={(e) => setGroup({ ...group, description: e.target.value })}
            multiline
            rows={2}
            helperText="Brief description of this group's characteristics"
          />
          <Tooltip title="Describe what makes this group unique. This helps you stay organized and understand your sample composition.">
            <IconButton size="small" sx={{ mt: 1 }}>
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Grid>

      {/* Personas */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle2">
            Personas *
          </Typography>
          <Tooltip title="Define specific persona descriptions that characterize this group. Each persona is a short description of a respondent archetype (e.g., 'Sarah, 28, urban marketing professional who values sustainability'). The AI will use these to generate diverse but realistic profiles.">
            <IconButton size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Add persona description"
            value={personaInput}
            onChange={(e) => setPersonaInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddPersona()}
            helperText="Type a persona description and press Enter or click Add"
          />
          <Button onClick={handleAddPersona} variant="outlined">
            Add
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {group?.personas?.map((persona, i) => (
            <Chip
              key={i}
              label={persona}
              onDelete={() => handleRemovePersona(i)}
              size="small"
              color="primary"
            />
          ))}
        </Box>
        {(!group?.personas || group.personas.length === 0) && (
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
            value={group?.target_demographics?.gender || []}
            label="Genders"
            onChange={(e) => setGroup({
              ...group,
              target_demographics: {
                ...(group?.target_demographics || { age_group: [], occupation: [] }),
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
            value={group?.target_demographics?.age_group || []}
            label="Age Groups"
            onChange={(e) => setGroup({
              ...group,
              target_demographics: {
                ...(group?.target_demographics || { gender: [], occupation: [] }),
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
            value={group?.target_demographics?.occupation || []}
            label="Occupations"
            onChange={(e) => setGroup({
              ...group,
              target_demographics: {
                ...(group?.target_demographics || { gender: [], age_group: [] }),
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
  );
};

export default PersonaGroupEditForm;
