/**
 * Workflow Progress Component
 * Shows step-by-step progress through multi-step workflows
 */

import React from 'react';
import { Box, Step, StepLabel, Stepper, Typography} from '@mui/material';

interface WorkflowStep {
  label: string;
  description?: string;
}

interface WorkflowProgressProps {
  steps: WorkflowStep[];
  activeStep: number;
  orientation?: 'horizontal' | 'vertical';
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  steps,
  activeStep,
  orientation = 'horizontal'
}) => {
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel={orientation === 'horizontal'}
        orientation={orientation}
        sx={{
          '& .MuiStepLabel-label': {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          '& .MuiStepLabel-label.Mui-active': {
            fontWeight: 600,
            color: 'primary.main',
          },
          '& .MuiStepLabel-label.Mui-completed': {
            color: 'text.secondary',
          }
        }}
      >
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              {step.label}
              {step.description && (
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {step.description}
                </Typography>
              )}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default WorkflowProgress;
