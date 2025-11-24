# S.A.G.E Data Analysis Module
## Comprehensive Survey Results Analysis System

## Overview
Build a professional data analysis module for S.A.G.E (Synthetic Audience Generation Engine) that automatically analyzes survey results, generates statistical insights, and produces publication-quality reports. The module will support all survey types and leverage the existing SSR probability distribution data for rich statistical analysis.

---

## Phase 1: Core Analysis Engine (Backend)

### 1.1 Module Structure
```
backend/analysis/
├── __init__.py
├── core/
│   ├── __init__.py
│   ├── detector.py              # Survey type detection
│   ├── aggregator.py            # Data aggregation and preprocessing
│   ├── statistical_tests.py     # t-tests, ANOVA, effect sizes, confidence intervals
│   └── metrics_calculator.py    # KPIs and derived metrics
├── analyzers/
│   ├── __init__.py
│   ├── demographic_analyzer.py  # Segment analysis and comparisons
│   ├── distribution_analyzer.py # SSR distribution-specific analysis
│   ├── correlation_analyzer.py  # Correlation and driver analysis
│   └── text_analyzer.py         # Text response analytics
├── reporters/
│   ├── __init__.py
│   ├── insight_generator.py     # Natural language insight generation
│   ├── summary_builder.py       # Executive summary creation
│   └── recommendation_engine.py # Actionable recommendations
└── visualizations/
    ├── __init__.py
    ├── chart_generator.py       # Chart data preparation
    └── export_formatter.py      # CSV/Excel export formatting
```

### 1.2 Survey Type Detection & Analysis Strategy

**File: `core/detector.py`**

```python
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class AnalysisContext:
    """Context for analysis decisions"""
    survey_type: str
    has_categories: bool
    num_categories: int
    has_demographics: bool
    has_text_responses: bool
    question_types: List[str]
    recommended_analyses: List[str]

class SurveyAnalysisDetector:
    """Intelligently detect survey structure and recommend analysis approaches"""

    def detect_analysis_context(self, survey, run_data) -> AnalysisContext:
        """Analyze survey structure to determine analysis strategy"""

        has_categories = survey.categories and len(survey.categories) > 0
        num_categories = len(survey.categories) if has_categories else 0

        # Determine survey type
        if not has_categories:
            survey_type = "GENERAL"
        elif num_categories == 1:
            survey_type = "SINGLE_CATEGORY"
        else:
            survey_type = "MULTI_CATEGORY"

        # Check data availability
        has_demographics = self._has_demographic_data(run_data)
        has_text = self._has_text_responses(run_data)

        # Recommend analyses
        recommended = self._recommend_analyses(
            survey_type,
            has_demographics,
            has_text,
            num_categories
        )

        return AnalysisContext(
            survey_type=survey_type,
            has_categories=has_categories,
            num_categories=num_categories,
            has_demographics=has_demographics,
            has_text_responses=has_text,
            question_types=self._classify_questions(survey),
            recommended_analyses=recommended
        )

    def _recommend_analyses(self, survey_type, has_demo, has_text, num_cat):
        """Recommend which analyses to perform"""
        analyses = [
            "descriptive_statistics",
            "question_performance",
            "distribution_analysis"
        ]

        if has_demo:
            analyses.extend([
                "demographic_segmentation",
                "target_audience_identification"
            ])

        if survey_type == "MULTI_CATEGORY":
            analyses.extend([
                "category_comparison",
                "competitive_positioning",
                "winner_analysis"
            ])

        if has_text:
            analyses.extend([
                "text_analytics",
                "sentiment_analysis",
                "theme_extraction"
            ])

        # Always useful
        analyses.extend([
            "correlation_analysis",
            "key_drivers"
        ])

        return analyses
```

---

## Phase 2: Statistical Analysis Components

### 2.1 Descriptive Statistics & Metrics

**File: `core/metrics_calculator.py`**

```python
import numpy as np
from scipy import stats
from typing import Dict, List, Tuple

class MetricsCalculator:
    """Calculate comprehensive metrics from SSR distributions"""

    def calculate_question_metrics(self, distributions: List[Dict]) -> Dict:
        """
        Calculate metrics for a single question across respondents

        Args:
            distributions: List of SSR probability distributions

        Returns:
            Comprehensive metrics dictionary
        """
        # Extract expected values (already calculated in SSR)
        expected_values = [d['expected_value'] for d in distributions]
        modes = [d['mode'] for d in distributions]
        entropies = [d['entropy'] for d in distributions]

        # Aggregate probability distributions
        prob_matrix = np.array([d['probabilities'] for d in distributions])
        mean_distribution = np.mean(prob_matrix, axis=0)
        std_distribution = np.std(prob_matrix, axis=0)

        # Calculate metrics
        mean_score = np.mean(expected_values)
        median_score = np.median(expected_values)
        std_score = np.std(expected_values)

        # Calculate Top Box (top 2) and Bottom Box (bottom 2) %
        top_box_pct = self._calculate_top_box(prob_matrix)
        bottom_box_pct = self._calculate_bottom_box(prob_matrix)

        # Net Score (Top Box - Bottom Box)
        net_score = top_box_pct - bottom_box_pct

        # Confidence interval (95%)
        ci_95 = stats.t.interval(
            0.95,
            len(expected_values) - 1,
            loc=mean_score,
            scale=stats.sem(expected_values)
        )

        # Average entropy (measure of uncertainty)
        mean_entropy = np.mean(entropies)

        # Mode distribution
        mode_distribution = self._mode_distribution(modes)

        return {
            "mean": mean_score,
            "median": median_score,
            "std": std_score,
            "ci_95_lower": ci_95[0],
            "ci_95_upper": ci_95[1],
            "margin_of_error": (ci_95[1] - ci_95[0]) / 2,
            "top_box_pct": top_box_pct,
            "bottom_box_pct": bottom_box_pct,
            "net_score": net_score,
            "mean_distribution": mean_distribution.tolist(),
            "std_distribution": std_distribution.tolist(),
            "mean_entropy": mean_entropy,
            "mode_distribution": mode_distribution,
            "sample_size": len(distributions),
            "grade": self._assign_grade(mean_score)
        }

    def _calculate_top_box(self, prob_matrix):
        """Calculate % who gave top 2 ratings"""
        # Sum last 2 columns of probability matrix
        top_2_probs = prob_matrix[:, -2:].sum(axis=1)
        return float(np.mean(top_2_probs) * 100)

    def _calculate_bottom_box(self, prob_matrix):
        """Calculate % who gave bottom 2 ratings"""
        bottom_2_probs = prob_matrix[:, :2].sum(axis=1)
        return float(np.mean(bottom_2_probs) * 100)

    def _assign_grade(self, mean_score):
        """Assign letter grade based on mean score (assuming 1-7 scale)"""
        if mean_score >= 6.0:
            return "A"
        elif mean_score >= 5.5:
            return "A-"
        elif mean_score >= 5.0:
            return "B+"
        elif mean_score >= 4.5:
            return "B"
        elif mean_score >= 4.0:
            return "C+"
        elif mean_score >= 3.5:
            return "C"
        else:
            return "D"
```

### 2.2 Statistical Testing

**File: `core/statistical_tests.py`**

```python
from scipy import stats
import numpy as np
from typing import Dict, List, Tuple

class StatisticalTester:
    """Perform statistical significance tests"""

    def compare_two_groups(
        self,
        group_a: List[float],
        group_b: List[float]
    ) -> Dict:
        """
        Compare two groups (e.g., demographics or categories)

        Returns t-test results with interpretation
        """
        # Independent samples t-test
        t_stat, p_value = stats.ttest_ind(group_a, group_b)

        # Effect size (Cohen's d)
        cohens_d = self._cohens_d(group_a, group_b)

        # Means and difference
        mean_a = np.mean(group_a)
        mean_b = np.mean(group_b)
        diff = mean_a - mean_b
        pct_diff = (diff / mean_b) * 100 if mean_b != 0 else 0

        return {
            "mean_a": mean_a,
            "mean_b": mean_b,
            "difference": diff,
            "pct_difference": pct_diff,
            "t_statistic": t_stat,
            "p_value": p_value,
            "is_significant": p_value < 0.05,
            "cohens_d": cohens_d,
            "effect_size_interpretation": self._interpret_effect_size(cohens_d),
            "significance_level": self._significance_level(p_value)
        }

    def compare_multiple_groups(
        self,
        groups: Dict[str, List[float]]
    ) -> Dict:
        """
        Compare multiple groups using ANOVA

        Args:
            groups: Dict mapping group names to value lists
        """
        group_data = list(groups.values())
        group_names = list(groups.keys())

        # One-way ANOVA
        f_stat, p_value = stats.f_oneway(*group_data)

        # Post-hoc pairwise comparisons (if significant)
        pairwise_results = {}
        if p_value < 0.05:
            for i in range(len(group_names)):
                for j in range(i + 1, len(group_names)):
                    pair_key = f"{group_names[i]}_vs_{group_names[j]}"
                    pairwise_results[pair_key] = self.compare_two_groups(
                        group_data[i],
                        group_data[j]
                    )

        return {
            "f_statistic": f_stat,
            "p_value": p_value,
            "is_significant": p_value < 0.05,
            "group_means": {name: np.mean(data) for name, data in groups.items()},
            "pairwise_comparisons": pairwise_results
        }

    def _cohens_d(self, group_a, group_b):
        """Calculate Cohen's d effect size"""
        n_a, n_b = len(group_a), len(group_b)
        var_a, var_b = np.var(group_a, ddof=1), np.var(group_b, ddof=1)
        pooled_std = np.sqrt(((n_a - 1) * var_a + (n_b - 1) * var_b) / (n_a + n_b - 2))
        return (np.mean(group_a) - np.mean(group_b)) / pooled_std

    def _interpret_effect_size(self, d):
        """Interpret Cohen's d"""
        abs_d = abs(d)
        if abs_d < 0.2:
            return "negligible"
        elif abs_d < 0.5:
            return "small"
        elif abs_d < 0.8:
            return "medium"
        else:
            return "large"

    def _significance_level(self, p_value):
        """Return significance level notation"""
        if p_value < 0.001:
            return "***"
        elif p_value < 0.01:
            return "**"
        elif p_value < 0.05:
            return "*"
        else:
            return "n.s."
```

---

## Phase 3: Specialized Analyzers

### 3.1 Demographic Analysis

**File: `analyzers/demographic_analyzer.py`**

```python
class DemographicAnalyzer:
    """Analyze survey results by demographic segments"""

    def __init__(self, run_data, statistical_tester):
        self.run_data = run_data
        self.tester = statistical_tester

    def analyze_segments(self, question_id: str, segment_field: str) -> Dict:
        """
        Analyze question performance by demographic segment

        Args:
            question_id: Question to analyze
            segment_field: 'gender', 'age_group', 'occupation', etc.

        Returns:
            Segment analysis with statistical tests
        """
        # Group responses by segment
        segments = self._group_by_segment(question_id, segment_field)

        # Calculate metrics for each segment
        segment_metrics = {}
        for segment_name, distributions in segments.items():
            expected_values = [d['expected_value'] for d in distributions]
            segment_metrics[segment_name] = {
                "mean": np.mean(expected_values),
                "n": len(expected_values),
                "top_box": self._calculate_top_box_for_segment(distributions)
            }

        # Statistical comparison
        if len(segments) == 2:
            # Two groups - t-test
            groups = list(segments.values())
            comparison = self.tester.compare_two_groups(
                [d['expected_value'] for d in groups[0]],
                [d['expected_value'] for d in groups[1]]
            )
        else:
            # Multiple groups - ANOVA
            groups = {
                name: [d['expected_value'] for d in dists]
                for name, dists in segments.items()
            }
            comparison = self.tester.compare_multiple_groups(groups)

        # Identify best and worst segments
        ranked_segments = sorted(
            segment_metrics.items(),
            key=lambda x: x[1]['mean'],
            reverse=True
        )

        return {
            "segment_field": segment_field,
            "segment_metrics": segment_metrics,
            "statistical_comparison": comparison,
            "best_segment": ranked_segments[0][0],
            "worst_segment": ranked_segments[-1][0],
            "ranked_segments": [s[0] for s in ranked_segments]
        }

    def identify_target_audience(self, survey_questions: List[str]) -> Dict:
        """
        Identify which demographic segments are most favorable overall

        Returns:
            Target audience analysis with segment profiles
        """
        demographic_fields = ['gender', 'age_group', 'occupation', 'persona_group']

        segment_scores = {}

        for field in demographic_fields:
            field_analysis = {}

            # Calculate average score across all questions for each segment
            segments = self._get_unique_segments(field)

            for segment in segments:
                segment_responses = self._get_segment_responses(field, segment)
                all_scores = []

                for question_id in survey_questions:
                    q_responses = [
                        r for r in segment_responses
                        if r['question_id'] == question_id
                    ]
                    if q_responses:
                        scores = [r['expected_value'] for r in q_responses]
                        all_scores.extend(scores)

                if all_scores:
                    field_analysis[segment] = {
                        "mean_score": np.mean(all_scores),
                        "sample_size": len(all_scores),
                        "consistency": 1 - (np.std(all_scores) / np.mean(all_scores))
                    }

            segment_scores[field] = field_analysis

        # Identify top segments across all demographics
        top_segments = self._rank_all_segments(segment_scores)

        return {
            "by_demographic": segment_scores,
            "top_segments": top_segments[:5],
            "target_audience_profile": self._create_segment_profile(top_segments[0])
        }
```

### 3.2 Category Comparison (Multi-Category Surveys)

**File: `analyzers/category_comparator.py`**

```python
class CategoryComparator:
    """Compare performance across survey categories"""

    def __init__(self, survey, run_data, statistical_tester):
        self.survey = survey
        self.run_data = run_data
        self.tester = statistical_tester

    def compare_all_categories(self) -> Dict:
        """
        Comprehensive comparison of all categories

        Returns:
            Winner analysis, question-by-question comparison, overall verdict
        """
        categories = self.survey.categories

        # Overall performance by category
        category_performance = {}
        for category in categories:
            scores = self._get_category_scores(category.id)
            category_performance[category.name] = {
                "mean_score": np.mean(scores),
                "questions_won": 0,  # Will be filled in
                "sample_size": len(scores)
            }

        # Question-by-question comparison
        question_comparisons = {}
        for question in self.survey.questions:
            q_comparison = self._compare_question_across_categories(question)
            question_comparisons[question.id] = q_comparison

            # Update win count
            winner = q_comparison['winner']
            if winner:
                category_performance[winner]['questions_won'] += 1

        # Overall winner
        overall_winner = max(
            category_performance.items(),
            key=lambda x: x[1]['mean_score']
        )[0]

        # Calculate margins
        scores_by_cat = {
            name: perf['mean_score']
            for name, perf in category_performance.items()
        }
        max_score = max(scores_by_cat.values())
        margins = {
            name: ((max_score - score) / score * 100)
            for name, score in scores_by_cat.items()
        }

        return {
            "overall_winner": overall_winner,
            "category_performance": category_performance,
            "question_comparisons": question_comparisons,
            "competitive_margins": margins,
            "total_questions": len(self.survey.questions)
        }

    def _compare_question_across_categories(self, question) -> Dict:
        """Compare single question across all categories"""
        category_scores = {}

        for category in self.survey.categories:
            distributions = self._get_question_category_distributions(
                question.id,
                category.id
            )
            scores = [d['expected_value'] for d in distributions]
            category_scores[category.name] = scores

        # Determine winner
        means = {name: np.mean(scores) for name, scores in category_scores.items()}
        winner = max(means.items(), key=lambda x: x[1])[0]

        # Statistical test
        if len(category_scores) == 2:
            cat_names = list(category_scores.keys())
            comparison = self.tester.compare_two_groups(
                category_scores[cat_names[0]],
                category_scores[cat_names[1]]
            )
        else:
            comparison = self.tester.compare_multiple_groups(category_scores)

        return {
            "question_text": question.text,
            "category_means": means,
            "winner": winner if comparison['is_significant'] else None,
            "is_significant": comparison['is_significant'],
            "statistical_test": comparison
        }
```

### 3.3 Correlation & Driver Analysis

**File: `analyzers/correlation_analyzer.py`**

```python
class CorrelationAnalyzer:
    """Identify relationships between questions and key drivers"""

    def calculate_correlation_matrix(self, questions: List[str]) -> Dict:
        """
        Calculate correlations between all questions

        Returns:
            Correlation matrix and significant relationships
        """
        # Build data matrix (respondents × questions)
        data_matrix = []

        for respondent_id in self._get_all_respondents():
            respondent_scores = []
            for question_id in questions:
                score = self._get_respondent_score(respondent_id, question_id)
                respondent_scores.append(score)
            data_matrix.append(respondent_scores)

        data_matrix = np.array(data_matrix)

        # Calculate Pearson correlations
        corr_matrix = np.corrcoef(data_matrix.T)

        # Find strong correlations (|r| > 0.6)
        strong_correlations = []
        for i in range(len(questions)):
            for j in range(i + 1, len(questions)):
                r = corr_matrix[i, j]
                if abs(r) > 0.6:
                    strong_correlations.append({
                        "question_a": questions[i],
                        "question_b": questions[j],
                        "correlation": r,
                        "strength": self._interpret_correlation(r)
                    })

        return {
            "correlation_matrix": corr_matrix.tolist(),
            "questions": questions,
            "strong_correlations": sorted(
                strong_correlations,
                key=lambda x: abs(x['correlation']),
                reverse=True
            )
        }

    def identify_key_drivers(
        self,
        outcome_question: str,
        predictor_questions: List[str]
    ) -> Dict:
        """
        Identify which questions drive the outcome question

        Uses multiple regression to determine relative importance
        """
        from sklearn.linear_model import LinearRegression

        # Prepare data
        X, y = self._prepare_driver_analysis_data(
            predictor_questions,
            outcome_question
        )

        # Fit regression model
        model = LinearRegression()
        model.fit(X, y)

        # Calculate relative importance
        importance_scores = np.abs(model.coef_)
        normalized_importance = importance_scores / importance_scores.sum()

        # Rank drivers
        drivers = []
        for i, question_id in enumerate(predictor_questions):
            drivers.append({
                "question": question_id,
                "importance": float(normalized_importance[i]),
                "coefficient": float(model.coef_[i]),
                "correlation": float(np.corrcoef(X[:, i], y)[0, 1])
            })

        drivers.sort(key=lambda x: x['importance'], reverse=True)

        return {
            "outcome_question": outcome_question,
            "r_squared": float(model.score(X, y)),
            "drivers": drivers,
            "top_driver": drivers[0]['question'],
            "interpretation": self._interpret_drivers(drivers)
        }
```

---

## Phase 4: Frontend Analysis Interface

### 4.1 Analysis Dashboard Page

**File: `frontend/src/pages/AnalysisPage.tsx`**

```typescript
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Box, Typography, Grid, Card, CardContent,
  Tabs, Tab, CircularProgress, Alert, Button
} from '@mui/material';
import { Assessment, BarChart, PieChart, TrendingUp } from '@mui/icons-material';

interface AnalysisData {
  context: AnalysisContext;
  summary: ExecutiveSummary;
  questions: QuestionAnalysis[];
  demographics?: DemographicAnalysis;
  categories?: CategoryComparison;
  correlations?: CorrelationMatrix;
}

export const AnalysisPage: React.FC = () => {
  const { runId } = useParams();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, [runId]);

  const loadAnalysis = async () => {
    try {
      const data = await api.getAnalysis(runId);
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!analysis) {
    return <Alert severity="error">Failed to load analysis</Alert>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Survey Analysis: {analysis.summary.survey_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {analysis.summary.run_date} • {analysis.summary.sample_size} respondents
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Overall Score"
            value={analysis.summary.overall_mean.toFixed(2)}
            grade={analysis.summary.grade}
            icon={<Assessment />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Top Box %"
            value={`${analysis.summary.top_box_pct.toFixed(1)}%`}
            subtitle="Top 2 ratings"
            icon={<TrendingUp />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Net Score"
            value={analysis.summary.net_score.toFixed(1)}
            subtitle="Top - Bottom Box"
            icon={<BarChart />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Confidence"
            value="95%"
            subtitle={`±${analysis.summary.margin_of_error.toFixed(2)}`}
            icon={<PieChart />}
          />
        </Grid>
      </Grid>

      {/* Executive Summary */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Executive Summary
          </Typography>
          <Typography variant="body1" paragraph>
            {analysis.summary.executive_summary}
          </Typography>

          {/* Key Insights */}
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Key Insights:
          </Typography>
          <Box component="ul">
            {analysis.summary.key_insights.map((insight, idx) => (
              <li key={idx}>
                <Typography variant="body2">{insight}</Typography>
              </li>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Tabbed Analysis */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Questions" />
          {analysis.demographics && <Tab label="Demographics" />}
          {analysis.categories && <Tab label="Category Comparison" />}
          <Tab label="Correlations" />
          <Tab label="Export" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <QuestionAnalysisTab questions={analysis.questions} />
      )}

      {activeTab === 1 && analysis.demographics && (
        <DemographicAnalysisTab data={analysis.demographics} />
      )}

      {activeTab === 2 && analysis.categories && (
        <CategoryComparisonTab data={analysis.categories} />
      )}

      {activeTab === 3 && (
        <CorrelationTab data={analysis.correlations} />
      )}

      {activeTab === 4 && (
        <ExportTab runId={runId} analysis={analysis} />
      )}
    </Container>
  );
};
```

### 4.2 Visualization Components

**QuestionAnalysisCard.tsx**
```typescript
const QuestionAnalysisCard: React.FC<{question: QuestionAnalysis}> = ({ question }) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {question.text}
        </Typography>

        {/* Metrics Row */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Mean</Typography>
            <Typography variant="h6">{question.mean.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Top Box</Typography>
            <Typography variant="h6">{question.top_box_pct.toFixed(1)}%</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">Grade</Typography>
            <Chip label={question.grade} color={getGradeColor(question.grade)} />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2" color="text.secondary">95% CI</Typography>
            <Typography variant="body2">
              {question.ci_95_lower.toFixed(2)} - {question.ci_95_upper.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>

        {/* Distribution Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={question.distribution_chart_data}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="percentage" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>

        {/* Auto-Generated Insight */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            {question.generated_insight}
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};
```

---

## Phase 5: API Endpoints

```python
# Analysis endpoints
GET /api/analysis/{run_id}
    → Full analysis data for frontend

GET /api/analysis/{run_id}/summary
    → Executive summary and KPIs

GET /api/analysis/{run_id}/questions
    → Question-by-question analysis

GET /api/analysis/{run_id}/demographics/{segment_field}
    → Demographic analysis for specific field

GET /api/analysis/{run_id}/category-comparison
    → Category comparison (multi-category only)

GET /api/analysis/{run_id}/correlations
    → Correlation matrix and key drivers

POST /api/analysis/{run_id}/export
    Body: { format: 'csv' | 'excel' | 'pdf', sections: [...] }
    → Export analysis report

POST /api/analysis/compare-runs
    Body: { run_ids: [...] }
    → Compare multiple survey runs (tracking)
```

---

## Phase 6: Implementation Plan (6 weeks)

### Week 1: Core Foundation
- Survey type detection
- Metrics calculator
- Statistical tests module
- Basic API endpoints

### Week 2: Statistical Analysis
- Demographic analyzer
- Distribution analyzer
- Correlation analysis
- Confidence intervals

### Week 3: Specialized Analyzers
- Category comparator (multi-category surveys)
- Target audience identification
- Key driver analysis

### Week 4: Insight Generation
- Natural language insight templates
- Executive summary builder
- Recommendation engine

### Week 5: Frontend Interface
- Analysis dashboard page
- Visualization components
- KPI cards
- Tabbed interface

### Week 6: Export & Polish
- CSV/Excel export
- PDF report generation (basic)
- Testing and refinement
- Documentation

---

## Success Criteria

✅ Automatically analyzes survey results based on structure
✅ Generates comprehensive statistical metrics (mean, CI, top box, etc.)
✅ Performs demographic segmentation analysis
✅ Compares categories with statistical significance tests
✅ Identifies correlations and key drivers
✅ Generates natural language insights
✅ Creates executive summaries automatically
✅ Provides actionable recommendations
✅ Exports to CSV/Excel with proper formatting
✅ Clean, intuitive frontend interface
✅ Complete analysis in <10 seconds for typical survey

---

## Key Features

### Analysis Types
1. **Descriptive Statistics** - Comprehensive metrics for each question
2. **Demographic Analysis** - Performance by segment with significance tests
3. **Category Comparison** - Head-to-head analysis for multi-category surveys
4. **Correlation Analysis** - Identify relationships between questions
5. **Driver Analysis** - Determine what predicts outcomes
6. **Target Audience** - Identify best-performing segments

### Statistical Rigor
- Confidence intervals (95%)
- P-values and significance testing
- Cohen's d effect sizes
- Top Box / Bottom Box / Net Score
- ANOVA for multi-group comparisons
- Multiple regression for driver analysis

### Outputs
- Interactive web dashboard
- Auto-generated insights
- Executive summaries
- CSV/Excel exports
- Publication-ready charts
- Statistical test results

This plan provides a comprehensive data analysis module specifically tailored for S.A.G.E survey results!
