/**
 * Category Comparison Panel
 * Rankings and comparisons across survey categories
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { CategoryComparisonResult } from '../../services/types';

interface CategoryComparisonPanelProps {
  categories?: CategoryComparisonResult;
}

const CategoryComparisonPanel: React.FC<CategoryComparisonPanelProps> = ({ categories }) => {
  if (!categories) {
    return (
      <Alert severity="info">
        Category comparison data is not available yet.
      </Alert>
    );
  }

  const getGradeColor = (grade: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    switch (grade) {
      case 'A':
        return 'success';
      case 'B':
        return 'info';
      case 'C':
        return 'warning';
      case 'D':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRankColor = (rank: number, total: number): 'success' | 'warning' | 'error' | 'default' => {
    if (rank === 1) return 'success';
    if (rank === total) return 'error';
    return 'default';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Category Comparison
      </Typography>

      {/* Winner Card */}
      {categories.winner && (
        <Card sx={{ mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrophyIcon sx={{ mr: 1, fontSize: 40 }} />
              <Typography variant="h5">Winner</Typography>
            </Box>
            <Typography variant="h3" gutterBottom>
              {categories.winner.category_name}
            </Typography>
            <Typography variant="h6">
              Mean Score: {categories.winner.mean.toFixed(2)}
            </Typography>
            {categories.winner.margin !== undefined && (
              <Typography variant="body2">
                Margin of victory: {categories.winner.margin.toFixed(2)} points
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistical Significance */}
      {categories.statistical_significance !== undefined && (
        <Alert
          severity={categories.statistical_significance ? 'warning' : 'info'}
          sx={{ mb: 3 }}
        >
          {categories.statistical_significance ? (
            <>
              Differences between categories are <strong>statistically significant</strong>
              {categories.p_value && ` (p = ${categories.p_value.toFixed(4)})`}
            </>
          ) : (
            <>
              Differences between categories are <strong>not statistically significant</strong>
              {categories.p_value && ` (p = ${categories.p_value.toFixed(4)})`}
            </>
          )}
        </Alert>
      )}

      {/* Category Rankings Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">Mean Score</TableCell>
              <TableCell align="center">Grade</TableCell>
              <TableCell align="center">Questions Won</TableCell>
              <TableCell align="center">Sample Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.ranked_categories.map((category) => (
              <TableRow
                key={category.category_name}
                hover
                sx={{
                  bgcolor: category.rank === 1 ? 'success.lighter' : undefined,
                }}
              >
                <TableCell>
                  <Chip
                    label={category.rank}
                    color={getRankColor(category.rank, categories.ranked_categories.length)}
                    size="small"
                    icon={category.rank === 1 ? <TrophyIcon /> : undefined}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight={category.rank === 1 ? 'bold' : 'normal'}>
                    {category.category_name}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body1" fontWeight="bold">
                    {category.mean.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip label={category.grade} color={getGradeColor(category.grade)} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{category.questions_won || 0}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{category.sample_size}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detailed Breakdowns */}
      <Grid container spacing={2}>
        {categories.ranked_categories.map((category) => (
          <Grid item xs={12} md={6} lg={4} key={category.category_name}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{category.category_name}</Typography>
                  <Chip label={`#${category.rank}`} size="small" />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Mean Score
                  </Typography>
                  <Typography variant="h5">{category.mean.toFixed(2)}</Typography>
                  <Chip label={`Grade ${category.grade}`} color={getGradeColor(category.grade)} size="small" />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Top Questions */}
                {category.top_questions && category.top_questions.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="bold">
                        Top Questions
                      </Typography>
                    </Box>
                    <List dense>
                      {category.top_questions.slice(0, 3).map((q, idx) => (
                        <ListItem key={idx}>
                          <ListItemText
                            primary={
                              <Typography variant="caption" noWrap>
                                {q.question_text}
                              </Typography>
                            }
                            secondary={`${q.mean.toFixed(2)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Bottom Questions */}
                {category.bottom_questions && category.bottom_questions.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="bold">
                        Areas to Improve
                      </Typography>
                    </Box>
                    <List dense>
                      {category.bottom_questions.slice(0, 3).map((q, idx) => (
                        <ListItem key={idx}>
                          <ListItemText
                            primary={
                              <Typography variant="caption" noWrap>
                                {q.question_text}
                              </Typography>
                            }
                            secondary={`${q.mean.toFixed(2)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryComparisonPanel;
