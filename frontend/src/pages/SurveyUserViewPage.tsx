/**
 * Survey Test Mode (Respondent Simulation)
 * Allows testing the survey experience as an actual respondent would see it
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  LinearProgress,
  Grid,
  Divider,
} from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircle } from '@mui/icons-material';
import { useSurveys, useSurvey } from '../services/hooks';

const SurveyUserViewPage: React.FC = () => {
  const { surveyId: urlSurveyId } = useParams<{ surveyId?: string }>();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(urlSurveyId || '');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const { data: surveys, isLoading: surveysLoading, error: surveysError } = useSurveys();
  const {
    data: survey,
    isLoading: surveyLoading,
    error: surveyError,
  } = useSurvey(selectedSurveyId, { enabled: !!selectedSurveyId });

  const handleSurveyChange = (event: any) => {
    const newSurveyId = event.target.value;
    setSelectedSurveyId(newSurveyId);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsComplete(false);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (survey && currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsComplete(true);
  };

  const progress = survey ? ((currentQuestionIndex + 1) / survey.questions.length) * 100 : 0;
  const currentQuestion = survey?.questions[currentQuestionIndex];
  const isAnswered = currentQuestion ? !!answers[currentQuestion.id] : false;

  if (isComplete) {
    return (
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            User View
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Experience the survey as a respondent would see it
          </Typography>
        </Box>

        <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Survey Complete
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Thank you for completing the survey.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setIsComplete(false);
              setCurrentQuestionIndex(0);
              setAnswers({});
            }}
          >
            Start Over
          </Button>
        </Paper>

        {/* Survey Results Summary */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Your Responses
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Here's a summary of your answers
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {survey?.questions.map((question, index) => (
              <Box key={question.id}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Question {index + 1}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  {question.text}
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'primary.50',
                    borderRadius: 1,
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {answers[question.id] || 'No answer provided'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Test Survey (Respondent Mode)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Experience exactly what a survey respondent would see - test questions, flow, and formatting
        </Typography>
      </Box>

      {/* Survey Selector */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Select Survey
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a survey to preview the respondent experience
          </Typography>
        </Box>
        <FormControl fullWidth>
          <InputLabel>Survey</InputLabel>
          <Select
            value={selectedSurveyId}
            label="Survey"
            onChange={handleSurveyChange}
            disabled={surveysLoading}
          >
            <MenuItem value="">
              <em>Choose a survey...</em>
            </MenuItem>
            {surveys?.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Loading States */}
      {surveysLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error States */}
      {surveysError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading surveys. Please ensure the backend API is running.
        </Alert>
      )}

      {surveyError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading survey details.
        </Alert>
      )}

      {/* Survey View */}
      {survey && !surveyLoading && (
        <Box>
          {/* Progress */}
          <Paper sx={{ p: 4, mb: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {survey.name}
              </Typography>
              {survey.description && (
                <Typography variant="body2" color="text.secondary">
                  {survey.description}
                </Typography>
              )}
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Question {currentQuestionIndex + 1} of {survey.questions.length}
            </Typography>
          </Paper>

          {/* Current Question */}
          {currentQuestion && (
            <Paper sx={{ p: 4, mb: 3 }}>
              {/* Category Context */}
              {currentQuestion.category && survey.categories && (() => {
                const category = survey.categories.find(c => c.id === currentQuestion.category);
                return category ? (
                  <Box sx={{ mb: 3, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {category.name}
                    </Typography>
                    {category.media_type === 'image' && (category.media_url || category.media_path) && (
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                        <img
                          src={category.media_url || category.media_path}
                          alt={category.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            borderRadius: '8px',
                            objectFit: 'contain'
                          }}
                        />
                      </Box>
                    )}
                    {category.description && (
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    )}
                  </Box>
                ) : null;
              })()}

              {/* Categories Compared */}
              {currentQuestion.categories_compared && currentQuestion.categories_compared.length > 0 && survey.categories && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Comparing
                  </Typography>
                  <Grid container spacing={2}>
                    {currentQuestion.categories_compared.map((catId) => {
                      const category = survey.categories?.find(c => c.id === catId);
                      return category ? (
                        <Grid item xs={12} md={6} key={catId}>
                          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, height: '100%' }}>
                            <Typography variant="subtitle1" gutterBottom>
                              {category.name}
                            </Typography>
                            {category.media_type === 'image' && (category.media_url || category.media_path) && (
                              <Box sx={{ mb: 1.5 }}>
                                <img
                                  src={category.media_url || category.media_path}
                                  alt={category.name}
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    borderRadius: '8px',
                                    objectFit: 'contain'
                                  }}
                                />
                              </Box>
                            )}
                            {category.description && (
                              <Typography variant="caption" color="text.secondary">
                                {category.description}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      ) : null;
                    })}
                  </Grid>
                </Box>
              )}

              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                {currentQuestion.text}
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                >
                  {(() => {
                    let answerOptions: string[] = [];

                    if (currentQuestion.options && currentQuestion.options.length > 0) {
                      answerOptions = currentQuestion.options;
                    } else if (currentQuestion.scale && Object.keys(currentQuestion.scale).length > 0) {
                      answerOptions = Object.values(currentQuestion.scale);
                    }

                    if (answerOptions.length === 0) {
                      return (
                        <Alert severity="error">
                          This question has no answer options defined.
                        </Alert>
                      );
                    }

                    return answerOptions.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={option}
                        control={<Radio />}
                        label={
                          <Typography variant="body2">
                            {option}
                          </Typography>
                        }
                        sx={{
                          border: '1px solid',
                          borderColor: answers[currentQuestion.id] === option ? 'primary.main' : 'divider',
                          borderRadius: 1,
                          mb: 1,
                          mx: 0,
                          px: 2,
                          py: 1.5,
                          transition: 'all 0.2s',
                          bgcolor: answers[currentQuestion.id] === option ? 'action.selected' : 'transparent',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'primary.main',
                          },
                        }}
                      />
                    ));
                  })()}
                </RadioGroup>
              </FormControl>
            </Paper>
          )}

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            {currentQuestionIndex < survey.questions.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={handleNext}
                disabled={!isAnswered}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<CheckCircle />}
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== survey.questions.length}
              >
                Submit Survey
              </Button>
            )}
          </Box>

          {/* Question Progress Grid */}
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Jump to any question in the survey
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {survey.questions.map((q, index) => (
                <Box
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  sx={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid',
                    borderColor: currentQuestionIndex === index ? 'primary.main' : answers[q.id] ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    bgcolor: currentQuestionIndex === index ? 'primary.main' : answers[q.id] ? 'primary.50' : 'transparent',
                    color: currentQuestionIndex === index ? 'white' : answers[q.id] ? 'primary.main' : 'text.secondary',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: currentQuestionIndex === index ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  {index + 1}
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default SurveyUserViewPage;
