/**
 * TypeScript interfaces for SSR Pipeline Demo Application
 * These types match the backend API schemas
 */

// Survey Types
export interface Survey {
  name: string;
  description: string;
  context: string;
  questions: Question[];
  persona_groups: PersonaGroup[];
  categories?: Category[];
  demographics: string[];
}

export interface SurveyListItem {
  id: string;
  name: string;
  description: string;
  num_questions: number;
  num_persona_groups: number;
  has_categories: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  scale?: { [key: number]: string };
  options?: string[];
  category?: string;
  categories_compared?: string[];
}

export type QuestionType = 'yes_no' | 'likert_5' | 'likert_7' | 'multiple_choice' | 'preference_scale';

export interface PersonaGroup {
  name: string;
  description: string;
  personas: string[];
  target_demographics: {
    gender?: string[];
    age_group?: string[];
    occupation?: string[];
    income_level?: string[];
    tech_comfort_level?: string[];
  };
  weight: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  context: string;
  // Multi-modal fields
  media_type?: 'image' | 'webpage';
  media_url?: string;
  media_path?: string;
}

// Response Types
export interface RespondentProfile {
  respondent_id: string;
  description: string;
  gender: string;
  age_group: string;
  persona_group: string;
  occupation: string;
}

export interface Response {
  respondent_id: string;
  question_id: string;
  text_response: string;
  respondent_profile: RespondentProfile;
  category?: string;
}

// SSR Types
export interface RatingDistribution {
  probabilities: number[];
  mode: number;
  expected_value: number;
  entropy: number;
  text_response: string;
  gender: string;
  age_group: string;
  persona_group: string;
  persona_description: string;
  occupation: string;
}

export interface DistributionData {
  [category: string]: {
    [question_id: string]: {
      [respondent_id: string]: RatingDistribution;
    };
  };
}

// API Request Types
export interface CreateSurveyRequest {
  yaml_content: string;
  filename: string;
}

export interface GenerateProfilesRequest {
  survey_id: string;
  num_profiles: number;
}

export interface GenerateResponsesRequest {
  survey_id: string;
  profiles: RespondentProfile[];
  llm_provider: 'openai' | 'anthropic';
  model: string;
  temperature: number;
}

export interface ApplySSRRequest {
  survey_id: string;
  responses: Response[];
  temperature: number;
  normalize_method: 'paper' | 'softmax' | 'linear';
}

export interface RunSurveyRequest {
  survey_id: string;
  num_profiles: number;
  llm_provider: 'openai' | 'anthropic';
  model: string;
  llm_temperature: number;
  ssr_temperature: number;
  normalize_method: 'paper' | 'softmax' | 'linear';
  seed: number;
}

// API Response Types
export interface GenerateProfilesResponse {
  survey_id: string;
  num_profiles: number;
  profiles: RespondentProfile[];
}

export interface GenerateResponsesResponse {
  survey_id: string;
  num_responses: number;
  responses: Response[];
}

export interface ApplySSRResponse {
  survey_id: string;
  num_distributions: number;
  distributions: DistributionData;
}

export interface RunSurveyResponse {
  run_id: string;
  survey_id: string;
  num_profiles: number;
  num_responses: number;
  num_distributions: number;
  distributions: DistributionData;
  config: {
    llm_provider: string;
    model: string;
    llm_temperature: number;
    ssr_temperature: number;
    normalize_method: string;
    seed: number;
  };
}

// UI State Types
export interface SurveyBuilderState {
  name: string;
  description: string;
  context: string;
  questions: Question[];
  persona_groups: PersonaGroup[];
  categories: Category[];
  demographics: string[];
}

export interface RunSurveyConfig {
  survey_id: string;
  num_profiles: number;
  llm_provider: 'openai' | 'anthropic';
  model: string;
  llm_temperature: number;
  ssr_temperature: number;
  normalize_method: 'paper' | 'softmax' | 'linear';
  seed: number;
}

export interface RunStatus {
  status: 'idle' | 'running' | 'complete' | 'error';
  progress: number;
  message?: string;
  error?: string;
}

// Constants
export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'yes_no', label: 'Yes/No' },
  { value: 'likert_5', label: 'Likert 5-Point Scale' },
  { value: 'likert_7', label: 'Likert 7-Point Scale' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'preference_scale', label: 'Preference Scale (Comparative)' },
];

export type LLMProvider = 'openai' | 'anthropic';

export const LLM_PROVIDERS: { value: LLMProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
];

export const OPENAI_MODELS = [
  { value: 'gpt-5.1-instant', label: 'GPT-5.1 Instant (Latest, Most Capable)', supportsVision: true },
  { value: 'gpt-5.1-thinking', label: 'GPT-5.1 Thinking (Advanced Reasoning)', supportsVision: true },
  { value: 'gpt-4o', label: 'GPT-4o', supportsVision: true },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cost-Effective)', supportsVision: true },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', supportsVision: true },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Cheapest, Text-Only)', supportsVision: false },
];

export const ANTHROPIC_MODELS = [
  { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5 (Latest, Most Capable)', supportsVision: true },
  { value: 'claude-haiku-4-5-20251015', label: 'Claude Haiku 4.5 (Fast & Cost-Effective)', supportsVision: true },
  { value: 'claude-opus-4-1-20250805', label: 'Claude Opus 4.1 (Advanced Reasoning)', supportsVision: true },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', supportsVision: true },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', supportsVision: true },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus', supportsVision: true },
];

// Helper function to check if a model supports vision
export const isVisionCapableModel = (provider: LLMProvider, model: string): boolean => {
  let models;
  if (provider === 'openai') {
    models = OPENAI_MODELS;
  } else if (provider === 'anthropic') {
    models = ANTHROPIC_MODELS;
  } else {
    return false;
  }
  const modelInfo = models.find(m => m.value === model);
  return modelInfo?.supportsVision || false;
};

export const NORMALIZE_METHODS: { value: 'paper' | 'softmax' | 'linear'; label: string; description: string }[] = [
  { value: 'paper', label: 'Paper Method', description: 'Normalization method from original SSR paper' },
  { value: 'softmax', label: 'Softmax', description: 'Standard softmax normalization' },
  { value: 'linear', label: 'Linear', description: 'Simple linear normalization' },
];

export const AGE_GROUPS = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

export const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];

export const OCCUPATIONS = [
  'Student',
  'Professional',
  'Manager',
  'Technical',
  'Service',
  'Sales',
  'Administrative',
  'Skilled Trade',
  'Retired',
  'Self-employed',
  'Other',
];

export const DEMOGRAPHICS_OPTIONS = ['age_group', 'gender', 'occupation', 'income_level', 'tech_comfort_level', 'persona_group'];

// Survey History Types
export interface SurveyRunMetadata {
  run_id: string;
  survey_id: string;
  timestamp: string;
  num_profiles: number;
  num_responses: number;
  config: {
    llm_provider: string;
    model: string;
    llm_temperature: number;
    ssr_temperature: number;
    normalize_method: string;
    seed: number;
  };
}

export interface SurveyRunDetail extends SurveyRunMetadata {
  survey_name: string;
  num_distributions: number;
  distributions: DistributionData;
}

// Ground Truth Types
export interface GroundTruthMetadata {
  id: string;
  name: string;
  survey_id: string;
  source: 'ssr_generated' | 'uploaded';
  created_at: string;
  num_profiles: number;
  num_responses: number;
  generation_config?: {
    num_profiles: number;
    llm_provider: string;
    model: string;
    llm_temperature: number;
    ssr_temperature: number;
    normalize_method: string;
    seed: number;
    persona_groups: string[];
    persona_distribution: { [persona: string]: number };
  };
}

export interface AggregatedDistribution {
  mean_probabilities: number[];
  std_probabilities: number[];
  sample_size: number;
  mean_mode: number;
  mean_expected_value: number;
  mean_entropy: number;
}

export interface GroundTruth extends GroundTruthMetadata {
  description: string;
  survey_name: string;
  aggregated_distributions: {
    [category: string]: {
      [question_id: string]: AggregatedDistribution;
    };
  };
  raw_distributions?: DistributionData;
}

export interface CreateGroundTruthFromSSRRequest {
  survey_id: string;
  name: string;
  description: string;
  num_profiles: number;
  llm_provider: 'openai' | 'anthropic';
  model: string;
  llm_temperature: number;
  ssr_temperature: number;
  normalize_method: 'paper' | 'softmax' | 'linear';
  seed: number;
}

export interface UploadGroundTruthRequest {
  survey_id: string;
  name: string;
  description: string;
  distributions: { [key: string]: any };
}

// Comparison Metrics Types
export interface QuestionMetrics {
  kl_divergence: number;
  js_divergence: number;
  wasserstein_distance: number;
  chi_squared: number;
  chi_squared_p_value: number;
  significant_difference: boolean;
  mean_absolute_error: number;
}

export interface CategoryMetrics {
  mean_kl_divergence: number;
  mean_js_divergence: number;
  mean_wasserstein: number;
  mean_mae: number;
  num_questions: number;
}

export interface OverallMetrics {
  mean_kl_divergence: number;
  std_kl_divergence: number;
  mean_js_divergence: number;
  std_js_divergence: number;
  mean_wasserstein: number;
  std_wasserstein: number;
  mean_mae: number;
  std_mae: number;
  num_questions_compared: number;
}

export interface ComparisonResults {
  id?: string; // Optional for backwards compatibility
  run_id: string;
  ground_truth_id: string;
  survey_id: string;
  created_at?: string; // ISO timestamp
  comparison: {
    overall_metrics: OverallMetrics;
    by_category: { [category: string]: CategoryMetrics };
    by_question: { [questionKey: string]: QuestionMetrics };
  };
  // Distribution data for visualizations
  test_run_distributions?: DistributionData;
  ground_truth_distributions?: {
    [category: string]: {
      [question_id: string]: AggregatedDistribution;
    };
  };
}

// Comparison History Item (summary for listing)
export interface ComparisonHistoryItem {
  id: string;
  run_id: string;
  ground_truth_id: string;
  ground_truth_name: string;
  survey_id: string;
  created_at: string; // ISO timestamp
  num_questions_compared: number;
  mean_kl_divergence: number | null;
}

// Media Upload Types
export interface MediaUploadResponse {
  success: boolean;
  media_type: 'image' | 'webpage';
  media_path?: string;
  media_url?: string;
  filename?: string;
  message?: string;
}

// Settings Types
export interface ProviderConfig {
  enabled: boolean;
  api_key?: string;
  models: string[];
}

export interface SystemSettings {
  providers: {
    openai: ProviderConfig;
    anthropic: ProviderConfig;
  };
}

export interface UpdateSettingsRequest {
  provider: LLMProvider;
  enabled: boolean;
  api_key?: string;
  models: string[];
}

// Evaluation Types
export type EvaluationMetricType = 'answer_relevancy' | 'bias' | 'hallucination';

export interface MetricScore {
  score: number;
  reason?: string;
  success?: boolean;
}

export interface EvaluationScores {
  [metricName: string]: MetricScore;
}

export interface AggregatedMetricScore {
  mean: number;
  min: number;
  max: number;
  count: number;
}

export interface EvaluationResult {
  success: boolean;
  question_id?: string;
  respondent_id?: string;
  scores?: EvaluationScores;
  timestamp: string;
  error?: string;
}

export interface EvaluationConfig {
  metrics: string[];
  evaluator_model: string;
  threshold: number;
}

export interface SurveyEvaluation {
  survey_id: string;
  run_id?: string;
  success: boolean;
  total_responses: number;
  evaluated_responses: number;
  successful_evaluations: number;
  aggregated_scores: {
    [metricName: string]: AggregatedMetricScore;
  };
  individual_evaluations: EvaluationResult[];
  timestamp: string;
  config: EvaluationConfig;
  error?: string;
}

export interface EvaluationListItem {
  evaluation_id: string;
  survey_id: string;
  run_id?: string;
  timestamp: string;
  evaluated_responses: number;
  success: boolean;
}

export interface EvaluateResponsesRequest {
  survey_id: string;
  run_id?: string;
  sample_size?: number;
  metrics?: string[];
  evaluator_model?: string;
  threshold?: number;
}

export interface MetricTrend {
  timestamp: string;
  survey_id: string;
  model: string;
  mean_score: number;
  min_score: number;
  max_score: number;
  count: number;
  evaluation_id: string;
}

export interface ModelPerformance {
  [metricName: string]: {
    mean: number;
    count: number;
  };
}

export interface SurveyPerformance {
  [metricName: string]: {
    mean: number;
    count: number;
  };
}

export interface EvaluationComparison {
  success: boolean;
  num_evaluations: number;
  metrics: {
    [metricName: string]: MetricTrend[];
  };
  model_averages: {
    [model: string]: ModelPerformance;
  };
  survey_averages: {
    [surveyId: string]: SurveyPerformance;
  };
  timestamp: string;
  error?: string;
}

export const EVALUATION_METRICS: { value: EvaluationMetricType; label: string; description: string }[] = [
  {
    value: 'answer_relevancy',
    label: 'Answer Relevancy',
    description: 'Measures how relevant the response is to the question',
  },
  {
    value: 'bias',
    label: 'Bias Detection',
    description: 'Detects potential biases in the response',
  },
  {
    value: 'hallucination',
    label: 'Hallucination Detection',
    description: 'Detects if the response contains fabricated information',
  },
];

// CSV Upload Types
export interface CSVValidationError {
  line_number?: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CSVUploadPreview {
  success: boolean;
  format_detected: 'raw' | 'aggregated';
  num_respondents?: number;
  num_questions: number;
  num_categories: number;
  categories: string[];
  questions: string[];
  sample_data: Array<{
    category: string;
    question_id: string;
    respondent_id?: string;
    rating: number;
    probability: number;
  }>;
  validation_errors: CSVValidationError[];
  validation_warnings: CSVValidationError[];
  metadata?: {
    name?: string;
    description?: string;
  };
}

export interface UploadGroundTruthCSVResponse {
  success: boolean;
  ground_truth_id?: string;
  preview?: CSVUploadPreview;
  message?: string;
  errors?: CSVValidationError[];
}

// Analysis Types
export interface AnalysisContext {
  survey_type: 'single_category' | 'multi_category' | 'comparative';
  has_demographics: boolean;
  demographic_fields: string[];
  num_questions: number;
  num_categories: number;
  num_respondents: number;
}

export interface QuestionAnalysis {
  question_id: string;
  question_text: string;
  category?: string;
  mean: number;
  median: number;
  std: number;
  top_box_pct: number;
  bottom_box_pct: number;
  net_score: number;
  grade: string;
  sample_size: number;
  ci_95_lower: number;
  ci_95_upper: number;
  distribution: number[];
}

export interface QuestionDistribution {
  question_id: string;
  question_text: string;
  question_type: string;
  scale_labels: {
    scale_type?: string;
    labels?: { [key: string]: string };
  };
  probabilities: number[];
  sample_size: number;
}

export interface DemographicSegment {
  sample_size: number;
  questions: QuestionDistribution[];
}

export interface DemographicAnalysis {
  demographic_field: string;
  segments: { [segment: string]: DemographicSegment };
  statistical_tests: {
    [question_id: string]: {
      chi2: number;
      p_value: number;
      significant: boolean;
    };
  };
}

export interface LegacyDemographicSegmentMetrics {
  mean_pct: number;
  median_pct: number;
  std: number;
  top_box_pct: number;
  sample_size: number;
  ci_95_lower: number;
  ci_95_upper: number;
}

export interface LegacyDemographicAnalysis {
  demographic_field: string;
  segment_metrics: { [segment: string]: LegacyDemographicSegmentMetrics };
  top_segment: {
    segment: string;
    mean_pct: number;
    sample_size: number;
  };
  bottom_segment: {
    segment: string;
    mean_pct: number;
    sample_size: number;
  };
  statistical_significance: boolean;
  p_value: number;
  effect_size: number;
}

export interface CorrelationItem {
  question_a: string;
  question_b: string;
  correlation: number;
  p_value: number;
  strength: string;
  direction: string;
}

export interface CorrelationAnalysis {
  strong_correlations: CorrelationItem[];
  correlation_matrix: { [key: string]: { [key: string]: number } };
}

export interface CategoryComparison {
  category_name: string;
  mean: number;
  grade: string;
  rank: number;
  questions_won: number;
  sample_size: number;
  top_questions: Array<{ question_text: string; mean: number }>;
  bottom_questions: Array<{ question_text: string; mean: number }>;
}

export interface CategoryComparisonResult {
  ranked_categories: CategoryComparison[];
  winner: {
    category_name: string;
    mean: number;
    margin: number;
  };
  statistical_significance: boolean;
  p_value: number;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  rationale: string;
}

export interface QuestionFinding {
  question: string;
  question_id: string;
  category: string;
  type: string;
  mean: number;
  median: number;
  finding: string;
  n: number;
  distribution?: { [key: string]: number };
}

export interface ExecutiveSummary {
  total_questions: number;
  total_respondents: number;
  key_insights: string[];
  question_findings: QuestionFinding[];
}

export interface DetailedInsight {
  title: string;
  insight: string;
  severity: 'info' | 'warning' | 'critical';
  recommendations: string[];
}

export interface InsightReport {
  executive_summary: ExecutiveSummary;
  insights: DetailedInsight[];
}

export interface AnalysisSummary {
  context: AnalysisContext;
  executive_summary: ExecutiveSummary;
  has_demographics: boolean;
  has_categories: boolean;
}
