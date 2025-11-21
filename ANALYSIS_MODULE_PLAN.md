# Professional Market Research Analysis & Reporting System
## Kantar-Style Comprehensive Research Reports with Advanced Analytics

## Overview
Build a professional market research analysis module that automatically generates Kantar-quality reports with statistical rigor, auto-generated insights, text analytics, and advanced visualizations. Supports all survey types: Single Category Evaluation, Multi-Category Comparison, Category-Free Surveys, and Time-Series Tracking.

---

## Phase 1: Backend - Adaptive Analysis Engine

### 1.1 Module Structure
```
backend/analysis/
├── __init__.py
├── detector.py              # Survey type detection
├── aggregation.py           # Data prep for all types
├── statistics.py            # Statistical tests (t-tests, ANOVA, effect sizes)
├── segmentation.py          # Demographic analysis
├── insights.py              # Natural language generation
├── metrics.py               # KPIs (Top Box, Net Score, etc.)
├── drivers.py               # Key driver analysis (regression/correlation)
├── text_analytics.py        # NEW: Word clouds, sentiment, themes
├── perceptual_mapping.py    # NEW: MDS positioning maps
├── report_types/            # Report generators by type
│   ├── __init__.py
│   ├── single_evaluation.py     # Single category reports
│   ├── multi_comparison.py      # A vs B vs C reports
│   ├── category_free.py         # General survey reports
│   └── time_series.py           # Tracking study reports
└── templates/               # PDF templates
```

### 1.2 Survey Type Auto-Detection
**File: `detector.py`**

```python
def detect_report_type(survey, run_data):
    """Intelligently detect what type of report to generate"""

    has_categories = survey.categories and len(survey.categories) > 0
    num_categories = len(survey.categories) if has_categories else 0

    if not has_categories:
        return "CATEGORY_FREE"  # General survey
    elif num_categories == 1:
        return "SINGLE_EVALUATION"  # One product/concept test
    elif num_categories >= 2:
        return "MULTI_COMPARISON"  # A vs B (vs C...)

def detect_tracking_study(run_ids):
    """Check if multiple runs of same survey for time-series"""
    if len(run_ids) > 1 and all_same_survey(run_ids):
        return "TIME_SERIES"
```

---

## Phase 2: Report Type Implementations

### 2.1 Single Category Evaluation Report
**File: `report_types/single_evaluation.py`**

**Report Sections (40-50 pages):**

1. **Cover Page** - Product/concept name, date, branding
2. **Table of Contents** - Hyperlinked
3. **Executive Summary (2-3 pages)**
   - Overall performance verdict (Strong/Good/Moderate/Weak)
   - Top 3 strengths with scores
   - Top 3 areas for improvement
   - Key demographic insights
   - Top recommendations
4. **Methodology (1-2 pages)**
   - Sample size and composition
   - Demographics table
   - Statistical approach
   - Confidence levels (95% CI, margin of error)
5. **Overall Performance Dashboard (1 page)**
   - KPI cards: Mean score, Top Box %, Grade (A-F)
   - Performance gauge visualization
   - Score distribution chart
6. **Strengths & Weaknesses Analysis (2-3 pages)**
   - Ranked horizontal bar chart (all attributes sorted)
   - Performance tiers (Strong/Moderate/Weak)
   - Auto-insight: "The product excels in [X, Y, Z] but needs improvement in [A, B]"
7. **Question-by-Question Analysis (3-5 pages per question)**
   - Question text prominent
   - Distribution bar chart
   - Statistical summary table (mean, median, std, top box, CI)
   - Auto-generated insight paragraph
   - Demographic breakdown (if significant differences)
8. **Target Audience Identification (3-4 pages)**
   - "Who likes it most?" heatmap (demographics × scores)
   - Ranked segment table
   - Segment profiles
   - Auto-insight: "Males 55-64 are the most favorable segment (mean: 6.2)"
   - Marketing recommendations
9. **Demographic Deep-Dive (4-6 pages)**
   - Age group analysis
   - Gender analysis
   - Occupation analysis
   - Statistical significance indicators
10. **Text Analytics (2-3 pages)** - NEW
    - Word cloud from text responses
    - Most frequent positive/negative terms
    - Theme extraction
    - Representative verbatim quotes
11. **Key Drivers (2-3 pages)**
    - Which attributes drive overall satisfaction?
    - Relative importance chart
    - Correlation matrix
12. **Benchmarking (if data provided)**
    - Score vs industry average
    - Percentile ranking
    - Competitive context
13. **Recommendations (1-2 pages)**
    - Action items based on weaknesses
    - Quick wins vs long-term improvements
14. **Appendix**
    - Full data tables
    - Statistical methodology notes
    - Glossary

**Auto-Generated Insights Example:**
```
"The product demonstrates strong overall performance with a mean rating of 5.8
(95% CI: 5.6-6.0), placing it in the 'Very Good' tier. Key strengths include
Visual Appeal (6.2) and Attention-Grabbing (6.0), with 78% of respondents
rating these attributes in the top 2 boxes.

Opportunities for improvement exist in Memorability (4.2), which scored below
the neutral midpoint and represents the lowest-performing attribute.

Demographic analysis reveals males aged 55-64 show particularly strong affinity
(mean: 6.5, significantly higher than overall, p<0.001), suggesting this segment
as the priority target for marketing efforts. Conversely, females 18-24 rated
the product notably lower (mean: 4.8), indicating potential for messaging
optimization for this demographic."
```

### 2.2 Multi-Category Comparison Report
**File: `report_types/multi_comparison.py`**

**Report Sections (50-70 pages):**

1. **Cover Page** - "Advertisement A vs B Comparison Study"
2. **Table of Contents**
3. **Executive Summary (2-3 pages)**
   - Overall winner identification
   - Win/loss/tie breakdown (# questions won)
   - Key differentiators (biggest differences)
   - Statistical significance summary
   - Recommendations (go with winner, optimize loser, etc.)
4. **Methodology**
5. **Head-to-Head Dashboard (1 page)**
   - Side-by-side KPI comparison
   - Scoreboard: "Category A won 14 of 20 questions"
   - Overall preference metric
   - Visual winner badge
6. **Category Performance Profiles (2 pages)**
   - Radar/spider chart comparing all attributes
   - Strengths table for each category
   - Competitive positioning
7. **Question-by-Question Comparison (4-6 pages per question)**
   - Side-by-side bar charts
   - Difference metrics (absolute & percentage)
   - Statistical test results (p-value, effect size)
   - Significance badges (*, **, ***)
   - Auto-insight: "Category A significantly outperformed B on Visual Appeal..."
8. **Perceptual Mapping (1-2 pages)** - NEW
   - 2D positioning map showing how categories relate
   - Based on multidimensional scaling of all attributes
   - Helps visualize competitive space
   - Auto-insight: "Category A is perceived as stronger on premium attributes..."
9. **Winning Attributes Analysis (2 pages)**
   - Table: Which category wins on what
   - Margin of victory for each
   - Pattern identification
10. **Demographic Preferences (4-6 pages)**
    - Which segments prefer which category?
    - Cross-tab heatmap (demographics × categories)
    - Statistical significance by segment
    - Auto-insight: "Category A performs better with older demographics..."
11. **Text Analytics Comparison (2-3 pages)** - NEW
    - Side-by-side word clouds
    - Sentiment comparison
    - Theme differences
12. **Key Differentiators (2 pages)**
    - Questions with largest differences
    - Statistical and practical significance
    - Business implications
13. **Overall Winner & Recommendations (1-2 pages)**
    - Final verdict with evidence
    - Action plan
14. **Appendix**

**Auto-Generated Insights Example:**
```
"Advertisement A emerged as the clear winner, outperforming Advertisement B
on 16 of 22 questions (73% win rate). The overall mean score for Advertisement A
was 5.8 versus 4.3 for Advertisement B, representing a 35% performance advantage
(p<0.001, Cohen's d = 1.4, large effect).

The strongest differentiation occurred on Visual Appeal, where Advertisement A
scored 6.2 versus 4.0 (55% higher, p<0.001). This represents a statistically
significant and practically meaningful difference that clearly distinguishes
the advertisements.

However, Advertisement B showed competitive performance on Attention-Grabbing
(5.1 vs 5.3, difference not statistically significant), suggesting this attribute
is not a key differentiator and both advertisements perform similarly in
capturing attention.

Demographic analysis reveals Advertisement A performs particularly well with
males aged 55-64 (mean: 6.5), while Advertisement B resonates more strongly
with females 25-34 (mean: 5.2). This suggests different creative approaches
may be optimal for different target audiences."
```

### 2.3 Category-Free Survey Report
**File: `report_types/category_free.py`**

**Report Sections (30-40 pages):**

1. **Cover Page**
2. **Table of Contents**
3. **Executive Summary**
   - Key findings (top 5-10 insights)
   - Overall sentiment
   - Notable patterns
4. **Methodology**
5. **Response Overview**
   - Sample demographics
   - Completion statistics
6. **Question-by-Question Analysis**
   - Each question analyzed independently
   - Distribution charts
   - Statistical summaries
   - Auto-generated insights
7. **Correlation Analysis (2-3 pages)**
   - Which questions relate to each other?
   - Correlation matrix heatmap
   - Pattern identification
   - Auto-insight: "Strong relationship between X and Y (r=0.78)"
8. **Demographic Differences (3-4 pages)**
   - Significant differences by segment
   - Cross-tabs for key questions
9. **Text Analytics (2-3 pages)** - NEW
   - Word clouds
   - Theme extraction
   - Sentiment analysis
10. **Key Themes & Patterns**
11. **Recommendations**
12. **Appendix**

### 2.4 Time-Series Tracking Report
**File: `report_types/time_series.py`**

**Report Sections (40-60 pages):**

1. **Cover Page** - "Wave 1-3 Tracking Study"
2. **Table of Contents**
3. **Executive Summary**
   - Key trends (up/down/stable)
   - Significant changes identified
   - Momentum assessment (gaining/losing)
   - Inflection points
4. **Methodology**
   - Wave dates and sample sizes
   - Consistency across waves
5. **Trend Dashboard (1 page)**
   - Overall metric trends (line charts)
   - Wave-over-wave change percentages
   - Directional indicators (↑↓→)
6. **Question-Level Trends (3-4 pages per question)**
   - Multi-wave line chart
   - Change table (Wave 1→2, 2→3, 1→3)
   - Statistical significance of changes (paired t-tests)
   - Auto-insight: "Purchase intent increased 12% from Wave 1 to Wave 2 (p<0.05)"
7. **Demographic Trend Analysis (4-6 pages)**
   - Which segments changed most?
   - Trend divergence (segments moving differently)
   - Emerging patterns
8. **Inflection Point Analysis (2 pages)**
   - When did significant changes occur?
   - What might have caused them?
9. **Text Analytics Evolution (2-3 pages)** - NEW
   - How language/themes changed over time
   - Emerging topics
   - Sentiment trends
10. **Forecast & Projections (1-2 pages)**
    - If 3+ waves: trend extrapolation
    - Predicted Wave 4 scores
    - Confidence bands
11. **Momentum Analysis**
    - Accelerating/decelerating metrics
    - Volatility assessment
12. **Recommendations**
    - Actions based on trends
    - What to monitor closely
13. **Appendix**

**Auto-Generated Insights Example:**
```
"Purchase intent has shown a positive upward trend across 3 waves, with an
overall increase of +18% from Wave 1 (4.8) to Wave 3 (5.7). This improvement
is statistically significant (p=0.003) and represents a meaningful shift in
consumer attitudes.

The strongest growth occurred between Wave 2 and Wave 3 (+8%), suggesting
recent marketing efforts may have influenced perceptions. If current trends
continue, we project purchase intent could reach 6.0 in Wave 4.

However, Visual Appeal has remained stable across all waves (5.9→6.0→5.9,
p=0.89), indicating this attribute is consistently strong and not a driver
of the overall improvement.

Demographic analysis reveals males 55-64 showed the largest increase (+28%
from Wave 1 to 3), while females 18-24 remained relatively flat (+3%),
suggesting differential response to recent initiatives."
```

---

## Phase 3: Advanced Analytics Modules

### 3.1 Text Analytics Engine
**File: `text_analytics.py`** - NEW

```python
import nltk
from wordcloud import WordCloud
from collections import Counter
import re

class TextAnalytics:
    def __init__(self, text_responses):
        self.responses = text_responses

    def generate_word_cloud(self, width=800, height=400):
        """Generate word cloud from all text responses"""
        all_text = " ".join(self.responses)
        cleaned = self._clean_text(all_text)

        wordcloud = WordCloud(
            width=width,
            height=height,
            background_color='white',
            colormap='viridis',
            stopwords=self._get_stopwords()
        ).generate(cleaned)

        return wordcloud.to_image()

    def extract_themes(self, num_themes=5):
        """Extract top themes/topics from responses"""
        # Use TF-IDF or simple frequency
        words = self._tokenize_all()
        common = Counter(words).most_common(num_themes)
        return [{"theme": word, "frequency": count} for word, count in common]

    def sentiment_analysis(self):
        """Analyze sentiment of text responses"""
        from textblob import TextBlob

        sentiments = []
        for response in self.responses:
            blob = TextBlob(response)
            sentiments.append(blob.sentiment.polarity)

        avg_sentiment = sum(sentiments) / len(sentiments)
        return {
            "average": avg_sentiment,
            "positive_pct": sum(1 for s in sentiments if s > 0.1) / len(sentiments) * 100,
            "neutral_pct": sum(1 for s in sentiments if -0.1 <= s <= 0.1) / len(sentiments) * 100,
            "negative_pct": sum(1 for s in sentiments if s < -0.1) / len(sentiments) * 100
        }

    def get_representative_quotes(self, num_quotes=5):
        """Select representative verbatim quotes"""
        # Sample diverse responses (positive, neutral, negative)
        sentiments = [(TextBlob(r).sentiment.polarity, r) for r in self.responses]
        sentiments.sort()

        # Pick from different sentiment ranges
        quotes = []
        segments = len(sentiments) // num_quotes
        for i in range(num_quotes):
            idx = i * segments
            quotes.append(sentiments[idx][1])

        return quotes

    def compare_text_corpora(self, corpus_a, corpus_b):
        """Compare two sets of text (e.g., Category A vs B)"""
        words_a = Counter(self._tokenize_all(corpus_a))
        words_b = Counter(self._tokenize_all(corpus_b))

        # Find distinctive words for each
        unique_a = {w: c for w, c in words_a.items() if c > words_b.get(w, 0) * 2}
        unique_b = {w: c for w, c in words_b.items() if c > words_a.get(w, 0) * 2}

        return {
            "corpus_a_distinctive": unique_a,
            "corpus_b_distinctive": unique_b,
            "shared_terms": set(words_a.keys()) & set(words_b.keys())
        }
```

### 3.2 Perceptual Mapping
**File: `perceptual_mapping.py`** - NEW

```python
from sklearn.manifold import MDS
import numpy as np
import matplotlib.pyplot as plt

class PerceptualMapper:
    def __init__(self, categories, question_data):
        self.categories = categories
        self.data = question_data

    def generate_positioning_map(self):
        """Create 2D perceptual map using MDS"""

        # Build distance matrix between categories
        # Based on how differently they score across all attributes
        n_categories = len(self.categories)
        distance_matrix = np.zeros((n_categories, n_categories))

        for i in range(n_categories):
            for j in range(i+1, n_categories):
                # Calculate distance (dissimilarity) between categories
                distance = self._calculate_category_distance(
                    self.categories[i],
                    self.categories[j]
                )
                distance_matrix[i, j] = distance
                distance_matrix[j, i] = distance

        # Apply MDS to get 2D coordinates
        mds = MDS(n_components=2, dissimilarity='precomputed', random_state=42)
        coords = mds.fit_transform(distance_matrix)

        # Create visualization
        fig, ax = plt.subplots(figsize=(10, 8))

        for i, category in enumerate(self.categories):
            ax.scatter(coords[i, 0], coords[i, 1], s=200)
            ax.annotate(
                category.name,
                (coords[i, 0], coords[i, 1]),
                fontsize=12,
                ha='center'
            )

        ax.set_xlabel('Dimension 1', fontsize=12)
        ax.set_ylabel('Dimension 2', fontsize=12)
        ax.set_title('Perceptual Positioning Map', fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3)
        ax.axhline(y=0, color='k', linewidth=0.5)
        ax.axvline(x=0, color='k', linewidth=0.5)

        return fig

    def _calculate_category_distance(self, cat_a, cat_b):
        """Calculate Euclidean distance between categories across all questions"""
        distances = []

        for question_id in self.data:
            score_a = self.data[question_id][cat_a.id]['mean']
            score_b = self.data[question_id][cat_b.id]['mean']
            distances.append((score_a - score_b) ** 2)

        return np.sqrt(sum(distances))

    def interpret_dimensions(self):
        """Try to label what each dimension represents"""
        # Correlate dimension positions with attribute scores
        # Return interpretation like "Dimension 1: Premium vs Value"
        pass
```

---

## Phase 4: Natural Language Insight Generation

### 4.1 Insight Templates & Generation
**File: `insights.py`**

```python
class InsightGenerator:
    def __init__(self, survey_type, data, survey):
        self.survey_type = survey_type
        self.data = data
        self.survey = survey

    def generate_executive_summary(self):
        """2-3 paragraph executive summary"""

        insights = self._generate_all_insights()
        ranked = self._rank_insights(insights)
        top_insights = ranked[:10]

        # Structure: Overall → Strengths → Weaknesses → Demographics → Recommendations

        para1 = self._overall_performance_paragraph()
        para2 = self._key_findings_paragraph(top_insights)
        para3 = self._recommendations_paragraph()

        return f"{para1}\n\n{para2}\n\n{para3}"

    def generate_question_insight(self, question, stats):
        """Natural language insight for single question"""

        # Select template based on score
        if stats.mean >= 6.0:
            template = "strong_positive"
        elif stats.mean >= 5.0:
            template = "moderate_positive"
        elif stats.mean >= 4.0:
            template = "neutral"
        else:
            template = "weak"

        interpretation = self._interpret_score(stats.mean, question.scale)
        demographic_insight = self._demographic_insight(stats)

        templates = {
            "strong_positive": f"Respondents expressed strong positive sentiment on {question.text}, with {stats.top_box:.0f}% rating in the top 2 boxes. The mean score of {stats.mean:.1f} indicates {interpretation}. {demographic_insight}",

            "moderate_positive": f"Performance on {question.text} was moderately positive with a mean score of {stats.mean:.1f} ({interpretation}). While {stats.top_box:.0f}% rated positively, there is room for improvement as {stats.bottom_box:.0f}% rated in the bottom 2 boxes. {demographic_insight}",

            "neutral": f"Responses to {question.text} were mixed, with a mean score of {stats.mean:.1f} near the neutral midpoint. {stats.top_box:.0f}% rated positively while {stats.bottom_box:.0f}% rated negatively, suggesting divided opinions. {demographic_insight}",

            "weak": f"{question.text} showed weak performance with only {stats.top_box:.0f}% positive ratings and a mean score of {stats.mean:.1f}, falling below neutral. This represents an opportunity area for improvement. {demographic_insight}"
        }

        return templates[template]

    def generate_comparison_insight(self, question, cat_a, cat_b, test_results):
        """Comparative insight with statistical language"""

        winner = cat_a if cat_a.mean > cat_b.mean else cat_b
        loser = cat_b if winner == cat_a else cat_a

        diff_abs = abs(winner.mean - loser.mean)
        diff_pct = diff_abs / loser.mean * 100

        # Significance language
        if test_results.p_value < 0.001:
            sig_text = "highly significantly"
            sig_note = " (p<0.001)"
        elif test_results.p_value < 0.01:
            sig_text = "significantly"
            sig_note = " (p<0.01)"
        elif test_results.p_value < 0.05:
            sig_text = "significantly"
            sig_note = " (p<0.05)"
        else:
            sig_text = "not significantly"
            sig_note = f" (p={test_results.p_value:.3f}, n.s.)"

        # Effect size interpretation
        effect_desc = self._interpret_effect_size(test_results.cohens_d)

        return f"""{winner.name} {sig_text} outperformed {loser.name} on {question.text}, scoring {winner.mean:.1f} versus {loser.mean:.1f} ({diff_pct:.0f}% higher{sig_note}). This represents a {effect_desc} effect size, indicating a {self._practical_significance(effect_desc)} difference in practical terms. {winner.name} received {winner.top_box:.0f}% top box ratings compared to {loser.top_box:.0f}% for {loser.name}."""

    def _rank_insights(self, insights):
        """Prioritize insights by importance"""
        scored = []

        for insight in insights:
            score = 0

            # Statistical significance
            if insight.get('p_value', 1.0) < 0.001:
                score += 30
            elif insight.get('p_value', 1.0) < 0.05:
                score += 20

            # Effect size
            if insight.get('effect_size', 0) > 0.8:
                score += 30
            elif insight.get('effect_size', 0) > 0.5:
                score += 20

            # Business relevance
            if insight.get('question_type') in ['purchase_intent', 'satisfaction', 'preference']:
                score += 25

            scored.append((score, insight))

        return [ins for score, ins in sorted(scored, reverse=True)]
```

---

## Phase 5: Adaptive Metrics & KPIs

**File: `metrics.py`**

```python
class AdaptiveMetrics:
    def __init__(self, survey_type):
        self.survey_type = survey_type

    def calculate_kpis(self, data):
        """Returns relevant KPIs based on survey type"""

        base_kpis = {
            "mean_score": calculate_mean(data),
            "top_box": calculate_top_box(data),
            "bottom_box": calculate_bottom_box(data),
            "sample_size": len(data)
        }

        if self.survey_type == "SINGLE_EVALUATION":
            return {
                **base_kpis,
                "performance_grade": grade_performance(base_kpis["mean_score"]),
                "strength_count": count_strong_attributes(data),
                "weakness_count": count_weak_attributes(data),
                "target_segment": identify_best_segment(data)
            }

        elif self.survey_type == "MULTI_COMPARISON":
            return {
                **base_kpis,
                "winner": identify_winner(data),
                "win_margin": calculate_margin(data),
                "questions_won": count_wins(data),
                "competitive_parity": count_ties(data)
            }

        elif self.survey_type == "CATEGORY_FREE":
            return {
                **base_kpis,
                "agreement_rate": calculate_agreement(data),
                "polarization_index": calculate_polarization(data),
                "consensus_questions": find_consensus(data)
            }

        elif self.survey_type == "TIME_SERIES":
            return {
                **base_kpis,
                "trend_direction": calculate_trend(data),
                "change_pct": calculate_change(data),
                "momentum": calculate_momentum(data),
                "volatility": calculate_volatility(data)
            }
```

---

## Phase 6: Frontend Analysis Interface

### 6.1 Adaptive Analysis Dashboard
**Page: `AnalysisDetailPage.tsx`**

```typescript
const AnalysisDetailPage = () => {
  const { runId } = useParams();
  const [reportType, setReportType] = useState<ReportType>();
  const [analysisData, setAnalysisData] = useState<any>();

  useEffect(() => {
    // Backend auto-detects report type
    api.getAnalysisSummary(runId).then(data => {
      setReportType(data.report_type);
      setAnalysisData(data);
    });
  }, [runId]);

  // Adaptive tab rendering
  const tabs = useMemo(() => {
    const common = ['Overview', 'Questions', 'Demographics', 'Text Analytics', 'Export'];

    if (reportType === 'SINGLE_EVALUATION') {
      return [...common, 'Strengths & Weaknesses', 'Target Audience', 'Drivers'];
    } else if (reportType === 'MULTI_COMPARISON') {
      return [...common, 'Head-to-Head', 'Perceptual Map', 'Winner Analysis'];
    } else if (reportType === 'TIME_SERIES') {
      return [...common, 'Trends', 'Forecast'];
    }

    return common;
  }, [reportType]);

  return (
    <Box>
      <Breadcrumbs />
      <PageHeader title={analysisData?.survey_name} />

      {/* KPI Cards - Adaptive metrics */}
      <Grid container spacing={2}>
        {analysisData?.kpis.map(kpi => (
          <Grid item xs={12} md={3}>
            <KPICard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Tabbed interface */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        {tabs.map(tab => <Tab label={tab} />)}
      </Tabs>

      {/* Tab panels render different components based on report type */}
      <TabPanel value="Overview">
        <ExecutiveSummary insights={analysisData.executive_summary} />
        <OverallDistributionChart data={analysisData.overall} />
      </TabPanel>

      {reportType === 'SINGLE_EVALUATION' && (
        <TabPanel value="Strengths & Weaknesses">
          <StrengthsWeaknessesChart data={analysisData.ranked_questions} />
        </TabPanel>
      )}

      {reportType === 'MULTI_COMPARISON' && (
        <TabPanel value="Perceptual Map">
          <PerceptualMapView data={analysisData.perceptual_map} />
        </TabPanel>
      )}

      <TabPanel value="Text Analytics">
        <WordCloudDisplay data={analysisData.text_analytics.word_cloud} />
        <ThemeExtraction themes={analysisData.text_analytics.themes} />
        <SentimentChart sentiment={analysisData.text_analytics.sentiment} />
        <VerbatimQuotes quotes={analysisData.text_analytics.quotes} />
      </TabPanel>
    </Box>
  );
};
```

### 6.2 New Visualization Components

**WordCloudDisplay.tsx** - NEW
```typescript
// Display word cloud image from backend
<Box sx={{ textAlign: 'center', p: 3 }}>
  <Typography variant="h6">Word Cloud - Text Response Analysis</Typography>
  <img src={wordCloudUrl} alt="Word Cloud" style={{ maxWidth: '100%' }} />
  <Typography variant="body2" color="text.secondary">
    Size indicates frequency of terms in responses
  </Typography>
</Box>
```

**PerceptualMapView.tsx** - NEW
```typescript
// Interactive scatter plot showing category positioning
<Box sx={{ p: 3 }}>
  <Typography variant="h6">Perceptual Positioning Map</Typography>
  <Typography variant="body2" gutterBottom>
    Shows how categories relate based on all attributes
  </Typography>
  <ResponsiveContainer width="100%" height={500}>
    <ScatterChart>
      <XAxis dataKey="dimension1" label="Dimension 1" />
      <YAxis dataKey="dimension2" label="Dimension 2" />
      <Scatter data={positioningData} fill="#1f77b4">
        {data.map((entry, index) => (
          <Cell key={index}>
            <Label value={entry.name} position="top" />
          </Cell>
        ))}
      </Scatter>
    </ScatterChart>
  </ResponsiveContainer>
</Box>
```

**StrengthsWeaknessesChart.tsx**
```typescript
// Horizontal bar chart with questions ranked by score
<ResponsiveContainer width="100%" height={600}>
  <BarChart data={rankedQuestions} layout="horizontal">
    <XAxis type="number" domain={[0, 7]} />
    <YAxis type="category" dataKey="question" width={200} />
    <Bar dataKey="mean" fill={(entry) =>
      entry.mean >= 5.5 ? '#4caf50' : // Green for strengths
      entry.mean >= 4.5 ? '#ff9800' : // Orange for moderate
      '#f44336' // Red for weaknesses
    }>
      <LabelList dataKey="mean" position="right" formatter={(v) => v.toFixed(1)} />
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

---

## Phase 7: PDF Report Generation

### 7.1 Professional Report Builder
**Using ReportLab for publication-quality PDFs**

```python
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether
)
from reportlab.lib import colors
import matplotlib.pyplot as plt

class ProfessionalReportGenerator:
    def __init__(self, run_data, survey, options=None):
        self.run_data = run_data
        self.survey = survey
        self.options = options or {}
        self.report_type = detect_report_type(survey, run_data)

        # Style configuration
        self.primary_color = colors.HexColor(options.get('primary_color', '#1f77b4'))
        self.styles = getSampleStyleSheet()
        self._customize_styles()

    def generate_pdf(self, output_path):
        """Generate complete PDF report"""

        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            topMargin=1*inch,
            bottomMargin=1*inch
        )

        story = []

        # Build report based on type
        if self.report_type == "SINGLE_EVALUATION":
            story.extend(self._build_single_eval_report())
        elif self.report_type == "MULTI_COMPARISON":
            story.extend(self._build_comparison_report())
        elif self.report_type == "CATEGORY_FREE":
            story.extend(self._build_general_report())
        elif self.report_type == "TIME_SERIES":
            story.extend(self._build_tracking_report())

        doc.build(story, onFirstPage=self._header_footer, onLaterPages=self._header_footer)

        return output_path

    def _build_single_eval_report(self):
        """Build single category evaluation report"""
        story = []

        # Cover page
        story.extend(self._cover_page())
        story.append(PageBreak())

        # Table of contents
        story.extend(self._table_of_contents())
        story.append(PageBreak())

        # Executive summary
        story.append(Paragraph("Executive Summary", self.styles['Heading1']))
        story.append(Spacer(1, 0.2*inch))

        exec_summary = self.insights_generator.generate_executive_summary()
        for para in exec_summary.split('\n\n'):
            story.append(Paragraph(para, self.styles['BodyText']))
            story.append(Spacer(1, 0.15*inch))

        story.append(PageBreak())

        # Methodology
        story.extend(self._methodology_section())
        story.append(PageBreak())

        # Overall performance
        story.append(Paragraph("Overall Performance", self.styles['Heading1']))
        story.append(self._kpi_dashboard())
        story.append(PageBreak())

        # Strengths & Weaknesses
        story.append(Paragraph("Strengths & Weaknesses Analysis", self.styles['Heading1']))
        story.append(self._strengths_weaknesses_chart())
        story.append(Spacer(1, 0.2*inch))

        insight = self.insights_generator.generate_strengths_weaknesses_insight()
        story.append(Paragraph(insight, self.styles['BodyText']))
        story.append(PageBreak())

        # Question-by-question
        for question in self.survey.questions:
            story.extend(self._question_analysis_page(question))
            story.append(PageBreak())

        # Demographic analysis
        story.extend(self._demographic_section())
        story.append(PageBreak())

        # Text analytics
        story.extend(self._text_analytics_section())
        story.append(PageBreak())

        # Key drivers
        story.extend(self._driver_analysis_section())
        story.append(PageBreak())

        # Recommendations
        story.extend(self._recommendations_section())

        return story

    def _question_analysis_page(self, question):
        """Full page analysis for single question"""
        story = []

        # Question text - prominent
        story.append(Paragraph(question.text, self.styles['QuestionTitle']))
        story.append(Spacer(1, 0.3*inch))

        # Distribution chart (300 DPI)
        chart_path = self._generate_distribution_chart(question, dpi=300)
        story.append(Image(chart_path, width=6*inch, height=3.5*inch))
        story.append(Spacer(1, 0.2*inch))

        # Statistics table
        stats_table = self._create_stats_table(question)
        story.append(stats_table)
        story.append(Spacer(1, 0.2*inch))

        # Auto-generated insight
        insight = self.insights_generator.generate_question_insight(question, stats)
        story.append(Paragraph(insight, self.styles['BodyText']))

        return story

    def _generate_distribution_chart(self, question, dpi=300):
        """Generate high-quality chart for PDF"""
        fig, ax = plt.subplots(figsize=(8, 5))

        # Bar chart with professional styling
        categories = list(question.scale.values())
        values = [self.data[question.id][i] for i in range(len(categories))]

        bars = ax.bar(categories, values, color=self.primary_color, edgecolor='black', linewidth=0.5)

        # Add data labels on bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{height:.1f}%',
                   ha='center', va='bottom', fontsize=10, fontweight='bold')

        ax.set_ylabel('Percentage', fontsize=12, fontweight='bold')
        ax.set_title(f'Distribution: {question.text}', fontsize=14, fontweight='bold', pad=20)
        ax.set_ylim(0, max(values) * 1.15)
        ax.grid(axis='y', alpha=0.3)

        # Save at high DPI
        chart_path = f'/tmp/chart_{question.id}.png'
        plt.savefig(chart_path, dpi=dpi, bbox_inches='tight')
        plt.close()

        return chart_path
```

---

## Phase 8: API Endpoints

```python
# Analysis endpoints
GET /api/analysis/runs/{run_id}/summary
    → { report_type, kpis, executive_summary, key_insights, text_analytics }

GET /api/analysis/runs/{run_id}/detailed
    → Full analysis data for UI

GET /api/analysis/runs/{run_id}/text-analytics
    → { word_cloud_url, themes, sentiment, quotes }

GET /api/analysis/runs/{run_id}/perceptual-map
    → Positioning map data (for multi-category only)

# Multi-run comparison
POST /api/analysis/compare-runs
    Body: { run_ids: [...] }
    → Time-series analysis

# Report generation
POST /api/analysis/export/professional-report
    Body: {
        run_id: "...",
        options: {
            branding: { logo_path, primary_color, client_name },
            sections: [...],
            benchmark_data: {...}
        }
    }
    → Returns PDF file (auto-detects type and generates appropriate report)
```

---

## Required Dependencies

**Backend (Python):**
```txt
reportlab>=4.0.0           # PDF generation
pillow>=10.0.0             # Image processing
matplotlib>=3.8.0          # Chart generation
seaborn>=0.12.0            # Enhanced visualizations
scipy>=1.11.0              # Statistical tests
scikit-learn>=1.3.0        # MDS, clustering
statsmodels>=0.14.0        # Advanced statistics
numpy>=1.24.0
pandas>=2.1.0
wordcloud>=1.9.0           # NEW: Word clouds
nltk>=3.8.0                # NEW: Text processing
textblob>=0.17.0           # NEW: Sentiment analysis
```

**Frontend:**
```json
{
  "recharts": "^2.10.0",
  "@visx/visx": "^3.0.0",
  "react-wordcloud": "^1.2.7",
  "d3": "^7.8.0"
}
```

---

## Implementation Timeline (8 weeks)

**Week 1: Backend Foundation**
- Survey type detection
- Metrics.py (adaptive KPIs)
- Statistics.py (tests, CIs)
- Basic API endpoints

**Week 2: Single Evaluation Report**
- single_evaluation.py
- Strengths/weaknesses analysis
- Target audience identification
- Insight generation templates

**Week 3: Multi-Comparison Report**
- multi_comparison.py
- Head-to-head comparison
- Winner identification
- Comparative insights

**Week 4: Text Analytics & Perceptual Mapping**
- text_analytics.py (word clouds, sentiment, themes)
- perceptual_mapping.py (MDS positioning)
- Integration with report generators

**Week 5: Category-Free & Time-Series**
- category_free.py
- time_series.py (trends, forecasting)
- Correlation analysis

**Week 6: Frontend UI**
- AnalysisDetailPage (adaptive)
- All visualization components
- Text analytics displays
- Perceptual map view

**Week 7: PDF Generation**
- ReportLab implementation for all types
- Chart rendering (300 DPI)
- Professional templates
- Branding customization

**Week 8: Testing & Polish**
- Test all report types
- Validate statistics
- User testing
- Documentation

---

## Success Criteria

✅ Auto-detects survey type and generates appropriate report
✅ Reports match Kantar quality standards
✅ Auto-generated insights are accurate and actionable
✅ Statistical rigor (significance tests, effect sizes, CIs)
✅ Text analytics provide meaningful themes and sentiment
✅ Perceptual maps visualize competitive positioning
✅ PDF exports are publication-ready (300 DPI)
✅ Customizable branding (logos, colors)
✅ Complete in <60 seconds for typical survey
✅ All 4 report types work seamlessly
✅ Natural language insights are grammatically correct

---

## Key Features Summary

### Report Types (Auto-Detected)
1. **Single Category Evaluation** - Test one product/concept with strengths/weaknesses
2. **Multi-Category Comparison** - A vs B vs C head-to-head analysis
3. **Category-Free Survey** - General attitude/opinion surveys
4. **Time-Series Tracking** - Wave-over-wave trend analysis

### Core Capabilities
- ✅ Auto-generated natural language insights
- ✅ Statistical significance testing (t-tests, ANOVA, effect sizes)
- ✅ Demographic segmentation with target audience ID
- ✅ Key driver analysis (what predicts outcomes)
- ✅ Text analytics (word clouds, sentiment, themes)
- ✅ Perceptual mapping (MDS positioning)
- ✅ Professional PDF reports (40-70 pages)
- ✅ Publication-ready charts (300 DPI)
- ✅ Executive summaries with top insights
- ✅ Methodology sections
- ✅ Recommendations

### Statistical Rigor
- Confidence intervals (95%)
- P-values with significance indicators
- Cohen's d effect sizes
- Top Box / Bottom Box / Net Score
- Mean, median, mode, standard deviation
- Correlation matrices
- ANOVA for multi-group comparisons

This is a complete professional market research platform matching Kantar standards!
