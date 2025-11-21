/**
 * CSV Export Utilities
 * Helper functions for exporting data to CSV format
 */

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return '';

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = csvHeaders.join(',');

  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];
      // Handle null/undefined
      if (value === null || value === undefined) return '';
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export survey run data to CSV
 */
export function exportSurveyRunToCSV(run: any, survey: any): void {
  console.log('exportSurveyRunToCSV called with:', { run, survey });

  if (!run) {
    console.error('No run data provided to CSV export');
    alert('Cannot export: No run data available');
    return;
  }

  if (!survey) {
    console.error('No survey data provided to CSV export');
    alert('Cannot export: No survey data available');
    return;
  }

  const data: any[] = [];

  // Check if distributions are nested by category or flat
  const distributions = run.distributions || {};
  const firstKey = Object.keys(distributions)[0];
  const isNestedByCategory = firstKey && distributions[firstKey] &&
    typeof distributions[firstKey] === 'object' &&
    !Array.isArray(distributions[firstKey]) &&
    !distributions[firstKey].by_demographics;

  if (isNestedByCategory) {
    // Handle nested format: category -> question -> respondent -> probabilities
    Object.entries(distributions).forEach(([categoryKey, categoryData]: [string, any]) => {
      Object.entries(categoryData || {}).forEach(([questionKey, questionData]: [string, any]) => {
        // Find the question details
        const question = survey.questions.find((q: any) =>
          q.id === questionKey || q.question_id === questionKey
        );

        // Each respondent has their own probabilities
        Object.entries(questionData || {}).forEach(([respondentId, respData]: [string, any]) => {
          if (!respData || !respData.probabilities) return;

          const row: any = {
            run_id: run.run_id,
            survey_id: run.survey_id,
            survey_name: run.survey_name || survey.name,
            category: categoryKey,
            question_id: questionKey,
            question_text: question?.text || question?.question_text || questionKey,
            question_type: question?.type || question?.question_type || 'rating',
            respondent_id: respondentId,
          };

          // Build option labels array for this question
          const optionLabels: string[] = [];
          if (question) {
            if (question.type === 'multiple_choice' && question.options) {
              optionLabels.push(...question.options);
            } else if (question.type === 'yes_no') {
              optionLabels.push('No', 'Yes');
            } else if ((question.type === 'likert_5' || question.type === 'likert_7' || question.type === 'preference_scale') && question.scale) {
              // Extract labels from scale object in order
              const numOptions = question.type === 'likert_5' ? 5 : question.type === 'likert_7' ? 7 : Object.keys(question.scale).length;
              for (let i = 1; i <= numOptions; i++) {
                optionLabels.push(question.scale[i.toString()] || `Option ${i}`);
              }
            }
          }

          // Add option labels as a single column (pipe-separated for readability)
          row.option_labels = optionLabels.join(' | ');

          // Add probability columns (stable column names)
          if (Array.isArray(respData.probabilities)) {
            respData.probabilities.forEach((prob: number, idx: number) => {
              row[`prob_${idx + 1}`] = typeof prob === 'number' ? prob.toFixed(4) : prob;
            });
          }

          data.push(row);
        });
      });
    });
  } else {
    // Handle flat format: question -> by_demographics -> demographic_key -> probabilities
    Object.entries(distributions).forEach(([questionKey, dist]: [string, any]) => {
      // Find the question details
      const question = survey.questions.find((q: any) =>
        q.question_id === questionKey ||
        `${q.category_id}_${q.question_id}` === questionKey
      );

      // Get demographic groups
      const demoGroups = Object.keys(dist.by_demographics || {});

      demoGroups.forEach(demoKey => {
        const demographics = dist.by_demographics[demoKey];
        const probability = demographics.probabilities;

        // Parse demographic key (format: "age:18-24,income:low")
        const demoObj: any = {};
        demoKey.split(',').forEach(pair => {
          const [key, value] = pair.split(':');
          demoObj[key] = value;
        });

        // Build option labels array for this question
        const optionLabels: string[] = [];
        if (question) {
          if (question.question_type === 'multiple_choice' && question.options) {
            optionLabels.push(...question.options);
          } else if (question.question_type === 'yes_no') {
            optionLabels.push('No', 'Yes');
          } else if ((question.question_type === 'likert_5' || question.question_type === 'likert_7' || question.question_type === 'preference_scale') && question.scale) {
            // Extract labels from scale object in order
            const numOptions = question.question_type === 'likert_5' ? 5 : question.question_type === 'likert_7' ? 7 : Object.keys(question.scale).length;
            for (let i = 1; i <= numOptions; i++) {
              optionLabels.push(question.scale[i.toString()] || `Option ${i}`);
            }
          }
        }

        // Create probability columns (stable column names)
        const probColumns: any = {};
        Object.entries(probability).forEach(([option, prob]: [string, any]) => {
          probColumns[`prob_${option}`] = typeof prob === 'number' ? prob.toFixed(4) : prob;
        });

        const row = {
          run_id: run.run_id,
          survey_id: run.survey_id,
          survey_name: run.survey_name || survey.name,
          question_id: questionKey,
          question_text: question?.question_text || questionKey,
          question_type: question?.question_type || 'rating',
          category: question?.category_id || '',
          option_labels: optionLabels.join(' | '),
          ...demoObj,
          mode: demographics.mode,
          expected_value: demographics.expected_value?.toFixed(4) || '',
          entropy: demographics.entropy?.toFixed(4) || '',
          ...probColumns,
        };

        data.push(row);
      });
    });
  }

  if (data.length === 0) {
    console.warn('No data to export - distributions may be empty');
    console.log('Run distributions:', run.distributions);
    alert('Cannot export: No distribution data available in this survey run');
    return;
  }

  console.log(`Exporting ${data.length} rows to CSV`);
  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadCSV(csv, `survey_run_${run.run_id}_${timestamp}.csv`);
  console.log('CSV export completed successfully');
}

/**
 * Export survey history to CSV
 */
export function exportSurveyHistoryToCSV(runs: any[]): void {
  const data = runs.map(run => ({
    run_id: run.run_id,
    survey_id: run.survey_id,
    survey_name: run.survey_name,
    timestamp: run.timestamp,
    num_profiles: run.num_profiles,
    num_responses: run.num_responses,
    num_distributions: run.num_distributions,
    llm_provider: run.config?.llm_provider || '',
    model: run.config?.model || '',
    llm_temperature: run.config?.llm_temperature || '',
    ssr_temperature: run.config?.ssr_temperature || '',
    seed: run.config?.seed || '',
    normalize_method: run.config?.normalize_method || '',
  }));

  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadCSV(csv, `survey_history_${timestamp}.csv`);
}

/**
 * Export comparison results to CSV
 */
export function exportComparisonToCSV(comparisonResults: any, runId: string): void {
  const data: any[] = [];

  // Add overall metrics
  const overall = comparisonResults.comparison.overall_metrics;
  data.push({
    type: 'overall',
    metric_type: 'KL Divergence',
    mean: overall.mean_kl_divergence?.toFixed(4) || 'N/A',
    std: overall.std_kl_divergence?.toFixed(4) || 'N/A',
  });
  data.push({
    type: 'overall',
    metric_type: 'JS Divergence',
    mean: overall.mean_js_divergence?.toFixed(4) || 'N/A',
    std: overall.std_js_divergence?.toFixed(4) || 'N/A',
  });
  data.push({
    type: 'overall',
    metric_type: 'Wasserstein Distance',
    mean: overall.mean_wasserstein?.toFixed(4) || 'N/A',
    std: overall.std_wasserstein?.toFixed(4) || 'N/A',
  });
  data.push({
    type: 'overall',
    metric_type: 'Mean Absolute Error',
    mean: overall.mean_mae?.toFixed(4) || 'N/A',
    std: overall.std_mae?.toFixed(4) || 'N/A',
  });

  // Add by-question metrics
  Object.entries(comparisonResults.comparison.by_question || {}).forEach(([questionKey, metrics]: [string, any]) => {
    data.push({
      type: 'question',
      question: questionKey,
      kl_divergence: metrics.kl_divergence?.toFixed(4) || 'N/A',
      js_divergence: metrics.js_divergence?.toFixed(4) || 'N/A',
      wasserstein_distance: metrics.wasserstein_distance?.toFixed(4) || 'N/A',
      mean_absolute_error: metrics.mean_absolute_error?.toFixed(4) || 'N/A',
      chi_squared: metrics.chi_squared?.toFixed(2) || 'N/A',
      significant_difference: metrics.significant_difference ? 'Yes' : 'No',
    });
  });

  // Add by-category metrics
  Object.entries(comparisonResults.comparison.by_category || {}).forEach(([category, metrics]: [string, any]) => {
    data.push({
      type: 'category',
      category: category,
      mean_kl_divergence: metrics.mean_kl_divergence?.toFixed(4) || 'N/A',
      mean_js_divergence: metrics.mean_js_divergence?.toFixed(4) || 'N/A',
      mean_wasserstein: metrics.mean_wasserstein?.toFixed(4) || 'N/A',
      mean_mae: metrics.mean_mae?.toFixed(4) || 'N/A',
    });
  });

  const csv = convertToCSV(data);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadCSV(csv, `comparison_${runId}_${timestamp}.csv`);
}
