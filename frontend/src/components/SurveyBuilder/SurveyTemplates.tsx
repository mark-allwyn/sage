/**
 * Survey Templates Component
 * Provides pre-built survey templates for quick start
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Star as StarIcon,
  ShoppingCart as ShoppingCartIcon,
  Work as WorkIcon,
  Poll as PollIcon,
} from '@mui/icons-material';
import { SurveyBuilderState, Question, QuestionType } from '../../services/types';

interface SurveyTemplatesProps {
  onTemplateSelect: (templateData: Partial<SurveyBuilderState>) => void;
}

const templates = [
  {
    id: 'customer_satisfaction',
    name: 'Customer Satisfaction',
    description: 'Measure customer satisfaction with your product or service',
    icon: <StarIcon />,
    color: 'primary',
    data: {
      name: 'Customer Satisfaction Survey',
      description: 'Measure overall customer satisfaction and identify areas for improvement',
      context: 'Please answer the following questions about your recent experience with our product/service.',
      questions: [
        {
          id: 'q1',
          text: 'How satisfied are you with our product/service overall?',
          type: 'likert_5' as QuestionType,
          scale: {
            '1': 'Very Dissatisfied',
            '2': 'Dissatisfied',
            '3': 'Neutral',
            '4': 'Satisfied',
            '5': 'Very Satisfied'
          }
        },
        {
          id: 'q2',
          text: 'How likely are you to recommend us to a friend or colleague?',
          type: 'likert_5' as QuestionType,
          scale: {
            '1': 'Not at all likely',
            '2': 'Unlikely',
            '3': 'Neutral',
            '4': 'Likely',
            '5': 'Extremely likely'
          }
        },
        {
          id: 'q3',
          text: 'What aspect of our product/service do you value most?',
          type: 'multiple_choice' as QuestionType,
          options: ['Quality', 'Price', 'Customer Service', 'Convenience', 'Other']
        }
      ],
      persona_groups: [
        {
          name: 'Regular Customers',
          description: 'Customers who use the product/service frequently',
          weight: 0.6,
          personas: ['Frequent user with positive past experiences', 'Long-term customer seeking reliability'],
          target_demographics: {}
        },
        {
          name: 'New Customers',
          description: 'Customers who recently started using the product/service',
          weight: 0.4,
          personas: ['First-time user exploring features', 'Comparison shopper evaluating options'],
          target_demographics: {}
        }
      ]
    }
  },
  {
    id: 'product_feedback',
    name: 'Product Feedback',
    description: 'Gather detailed feedback on product features and usability',
    icon: <ShoppingCartIcon />,
    color: 'secondary',
    data: {
      name: 'Product Feedback Survey',
      description: 'Collect user feedback on product features and user experience',
      context: 'Help us improve by sharing your thoughts on our product.',
      questions: [
        {
          id: 'q1',
          text: 'How easy was it to use our product?',
          type: 'likert_5' as QuestionType,
          scale: {
            '1': 'Very Difficult',
            '2': 'Difficult',
            '3': 'Neutral',
            '4': 'Easy',
            '5': 'Very Easy'
          }
        },
        {
          id: 'q2',
          text: 'Which features do you use most frequently?',
          type: 'multiple_choice' as QuestionType,
          options: ['Core functionality', 'Advanced features', 'Integrations', 'Mobile app', 'Reporting']
        },
        {
          id: 'q3',
          text: 'What new features would you like to see?',
          type: 'multiple_choice' as QuestionType,
          options: ['Open-ended response']
        }
      ],
      persona_groups: [
        {
          name: 'Power Users',
          description: 'Advanced users who utilize many features',
          weight: 0.3,
          personas: ['Tech-savvy user maximizing product capabilities', 'Professional using advanced workflows'],
          target_demographics: {}
        },
        {
          name: 'Casual Users',
          description: 'Users who stick to basic features',
          weight: 0.7,
          personas: ['Occasional user with simple needs', 'Basic user focused on core functionality'],
          target_demographics: {}
        }
      ]
    }
  },
  {
    id: 'employee_engagement',
    name: 'Employee Engagement',
    description: 'Assess employee satisfaction and workplace culture',
    icon: <WorkIcon />,
    color: 'success',
    data: {
      name: 'Employee Engagement Survey',
      description: 'Measure employee satisfaction and engagement levels',
      context: 'Your honest feedback helps us create a better workplace.',
      questions: [
        {
          id: 'q1',
          text: 'How satisfied are you with your current role?',
          type: 'likert_5' as QuestionType,
          scale: {
            '1': 'Very Dissatisfied',
            '2': 'Dissatisfied',
            '3': 'Neutral',
            '4': 'Satisfied',
            '5': 'Very Satisfied'
          }
        },
        {
          id: 'q2',
          text: 'Do you feel your work is valued by the organization?',
          type: 'likert_5' as QuestionType,
          scale: {
            '1': 'Strongly Disagree',
            '2': 'Disagree',
            '3': 'Neutral',
            '4': 'Agree',
            '5': 'Strongly Agree'
          }
        },
        {
          id: 'q3',
          text: 'What aspect of your job do you find most fulfilling?',
          type: 'multiple_choice' as QuestionType,
          options: ['Meaningful work', 'Team collaboration', 'Professional growth', 'Work-life balance', 'Compensation']
        }
      ],
      persona_groups: [
        {
          name: 'Junior Staff',
          description: 'Entry-level and early-career employees',
          weight: 0.4,
          personas: ['Recent graduate learning the ropes', 'Early-career professional building skills'],
          target_demographics: {}
        },
        {
          name: 'Senior Staff',
          description: 'Experienced and leadership-level employees',
          weight: 0.6,
          personas: ['Experienced professional with leadership responsibilities', 'Long-tenured employee with institutional knowledge'],
          target_demographics: {}
        }
      ]
    }
  },
  {
    id: 'market_research',
    name: 'Market Research',
    description: 'Understand market needs and competitive positioning',
    icon: <PollIcon />,
    color: 'warning',
    data: {
      name: 'Market Research Survey',
      description: 'Gather insights on market preferences and competitive landscape',
      context: 'Help us understand your needs and preferences in this market.',
      questions: [
        {
          id: 'q1',
          text: 'How familiar are you with products in this category?',
          type: 'likert_5' as QuestionType,
          scale: {
            '1': 'Not familiar',
            '2': 'Slightly familiar',
            '3': 'Moderately familiar',
            '4': 'Very familiar',
            '5': 'Expert'
          }
        },
        {
          id: 'q2',
          text: 'What factors are most important when choosing a product in this category?',
          type: 'multiple_choice' as QuestionType,
          options: ['Price', 'Quality', 'Brand reputation', 'Features', 'Customer support']
        },
        {
          id: 'q3',
          text: 'Which brands have you considered or used?',
          type: 'multiple_choice' as QuestionType,
          options: ['Open-ended response']
        }
      ],
      persona_groups: [
        {
          name: 'Market Enthusiasts',
          description: 'Knowledgeable consumers actively tracking the market',
          weight: 0.3,
          personas: ['Early adopter tracking latest developments', 'Industry insider with deep market knowledge'],
          target_demographics: {}
        },
        {
          name: 'General Consumers',
          description: 'Typical consumers with basic market awareness',
          weight: 0.7,
          personas: ['Average consumer with practical needs', 'Budget-conscious shopper comparing options'],
          target_demographics: {}
        }
      ]
    }
  }
];

const SurveyTemplates: React.FC<SurveyTemplatesProps> = ({ onTemplateSelect }) => {
  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Quick Start Templates
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose a template to get started quickly, or continue with a blank survey
      </Typography>

      <Grid container spacing={2}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={3} key={template.id}>
            <Card variant="outlined">
              <CardActionArea onClick={() => onTemplateSelect(template.data)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ color: `${template.color}.main` }}>
                      {template.icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {template.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 40 }}>
                    {template.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Chip label={`${template.data.questions.length} questions`} size="small" variant="outlined" />
                    <Chip label={`${template.data.persona_groups.length} groups`} size="small" variant="outlined" />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default SurveyTemplates;
