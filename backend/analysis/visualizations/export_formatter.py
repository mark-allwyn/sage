"""
Export Formatting

Format analysis results for CSV/Excel export with proper structure and formatting.
"""

import csv
import io
from typing import Dict, List, Optional
from datetime import datetime


class ExportFormatter:
    """Format analysis results for export"""

    def __init__(self, run_data: Dict, survey_data: Dict, analysis_results: Dict):
        """
        Initialize export formatter

        Args:
            run_data: Survey run data
            survey_data: Survey configuration
            analysis_results: Complete analysis results
        """
        self.run_data = run_data
        self.survey_data = survey_data
        self.analysis = analysis_results

    def export_to_csv(self, sections: Optional[List[str]] = None) -> str:
        """
        Export analysis to CSV format

        Args:
            sections: List of sections to include (None = all)

        Returns:
            CSV string
        """
        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow(['S.A.G.E Survey Analysis Report'])
        writer.writerow(['Survey:', self.survey_data.get('name', 'Untitled')])
        writer.writerow(['Run ID:', self.run_data.get('id', 'N/A')])
        writer.writerow(['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
        writer.writerow([])

        # Determine which sections to include
        if sections is None:
            sections = ['summary', 'questions', 'demographics', 'correlations', 'insights']

        # Export each section
        if 'summary' in sections:
            self._export_summary_csv(writer)

        if 'questions' in sections:
            self._export_questions_csv(writer)

        if 'demographics' in sections and self.analysis.get('has_demographics'):
            self._export_demographics_csv(writer)

        if 'correlations' in sections:
            self._export_correlations_csv(writer)

        if 'insights' in sections:
            self._export_insights_csv(writer)

        return output.getvalue()

    def export_question_data_csv(self) -> str:
        """
        Export detailed question-level data for further analysis

        Returns:
            CSV string with raw question metrics
        """
        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow([
            'Question ID',
            'Question Text',
            'Category',
            'Mean Score',
            'Median',
            'Std Dev',
            'Top Box %',
            'Bottom Box %',
            'Net Score',
            'Grade',
            'Sample Size',
            'CI Lower (95%)',
            'CI Upper (95%)'
        ])

        # Question data
        questions = self.analysis.get('questions', [])
        for question in questions:
            writer.writerow([
                question.get('question_id', ''),
                question.get('question_text', ''),
                question.get('category', ''),
                f"{question.get('mean', 0):.2f}",
                f"{question.get('median', 0):.2f}",
                f"{question.get('std', 0):.2f}",
                f"{question.get('top_box_pct', 0):.1f}",
                f"{question.get('bottom_box_pct', 0):.1f}",
                f"{question.get('net_score', 0):.1f}",
                question.get('grade', ''),
                question.get('sample_size', 0),
                f"{question.get('ci_95_lower', 0):.2f}",
                f"{question.get('ci_95_upper', 0):.2f}"
            ])

        return output.getvalue()

    def export_demographic_data_csv(self, demographic_field: str) -> str:
        """
        Export demographic segment data

        Args:
            demographic_field: Which demographic to export

        Returns:
            CSV string with demographic breakdown
        """
        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow([
            'Segment',
            'Mean Score',
            'Top Box %',
            'Sample Size',
            'Rank'
        ])

        # Get demographic data
        demographics = self.analysis.get('demographics', {})
        field_data = demographics.get(demographic_field, {})
        segment_metrics = field_data.get('segment_metrics', {})

        # Sort by mean score
        sorted_segments = sorted(
            segment_metrics.items(),
            key=lambda x: x[1].get('mean', 0),
            reverse=True
        )

        # Write data
        for rank, (segment_name, metrics) in enumerate(sorted_segments, 1):
            writer.writerow([
                segment_name,
                f"{metrics.get('mean', 0):.2f}",
                f"{metrics.get('top_box_pct', 0):.1f}",
                metrics.get('sample_size', 0),
                rank
            ])

        return output.getvalue()

    def export_category_comparison_csv(self) -> str:
        """
        Export category comparison data

        Returns:
            CSV string with category rankings
        """
        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow([
            'Category',
            'Mean Score',
            'Grade',
            'Rank',
            'Questions Won',
            'Sample Size'
        ])

        # Get category data
        categories = self.analysis.get('category_comparison', {})
        ranked_categories = categories.get('ranked_categories', [])

        # Write data
        for category in ranked_categories:
            writer.writerow([
                category.get('category_name', ''),
                f"{category.get('mean', 0):.2f}",
                category.get('grade', ''),
                category.get('rank', 0),
                category.get('questions_won', 0),
                category.get('sample_size', 0)
            ])

        return output.getvalue()

    def _export_summary_csv(self, writer):
        """Export executive summary section"""
        writer.writerow(['EXECUTIVE SUMMARY'])
        writer.writerow([])

        summary = self.analysis.get('executive_summary', {})

        # Overall metrics
        writer.writerow(['Overall Performance'])
        writer.writerow(['Mean Score:', f"{summary.get('overall_mean', 0):.2f}"])
        writer.writerow(['Grade:', summary.get('overall_grade', 'N/A')])
        writer.writerow(['Top Box %:', f"{summary.get('top_box_pct', 0):.1f}%"])
        writer.writerow(['Net Score:', f"{summary.get('net_score', 0):.1f}"])
        writer.writerow(['Sample Size:', summary.get('sample_size', 0)])
        writer.writerow([])

        # Key insights
        insights = summary.get('key_insights', [])
        if insights:
            writer.writerow(['Key Insights'])
            for idx, insight in enumerate(insights, 1):
                writer.writerow([f"{idx}.", insight])
            writer.writerow([])

        # Recommendations
        recommendations = summary.get('recommendations', [])
        if recommendations:
            writer.writerow(['Recommendations'])
            for idx, rec in enumerate(recommendations, 1):
                priority = rec.get('priority', 'medium').upper()
                writer.writerow([f"{idx}. [{priority}]", rec.get('recommendation', '')])
            writer.writerow([])

        writer.writerow([])

    def _export_questions_csv(self, writer):
        """Export question analysis section"""
        writer.writerow(['QUESTION ANALYSIS'])
        writer.writerow([])

        writer.writerow([
            'Question',
            'Mean',
            'Std Dev',
            'Top Box %',
            'Bottom Box %',
            'Net Score',
            'Grade',
            'Sample Size'
        ])

        questions = self.analysis.get('questions', [])
        for question in questions:
            writer.writerow([
                question.get('question_text', '')[:50] + '...',
                f"{question.get('mean', 0):.2f}",
                f"{question.get('std', 0):.2f}",
                f"{question.get('top_box_pct', 0):.1f}",
                f"{question.get('bottom_box_pct', 0):.1f}",
                f"{question.get('net_score', 0):.1f}",
                question.get('grade', ''),
                question.get('sample_size', 0)
            ])

        writer.writerow([])

    def _export_demographics_csv(self, writer):
        """Export demographic analysis section"""
        writer.writerow(['DEMOGRAPHIC ANALYSIS'])
        writer.writerow([])

        demographics = self.analysis.get('demographics', {})
        target_audience = self.analysis.get('target_audience', {})

        # Top segments
        top_segments = target_audience.get('top_segments', [])
        if top_segments:
            writer.writerow(['Top Performing Segments'])
            writer.writerow(['Rank', 'Demographic', 'Segment', 'Mean Score', 'Sample Size'])

            for idx, segment in enumerate(top_segments[:5], 1):
                writer.writerow([
                    idx,
                    segment.get('demographic_field', ''),
                    segment.get('segment', ''),
                    f"{segment.get('mean_score', 0):.2f}",
                    segment.get('sample_size', 0)
                ])

            writer.writerow([])

    def _export_correlations_csv(self, writer):
        """Export correlation analysis section"""
        writer.writerow(['CORRELATION ANALYSIS'])
        writer.writerow([])

        correlations = self.analysis.get('correlations', {})
        strong_correlations = correlations.get('strong_correlations', [])

        if strong_correlations:
            writer.writerow(['Strong Correlations (|r| > 0.6)'])
            writer.writerow(['Question A', 'Question B', 'Correlation', 'Strength', 'Direction'])

            for corr in strong_correlations[:10]:  # Top 10
                writer.writerow([
                    corr.get('question_a', ''),
                    corr.get('question_b', ''),
                    f"{corr.get('correlation', 0):.3f}",
                    corr.get('strength', ''),
                    corr.get('direction', '')
                ])

            writer.writerow([])

        # Key drivers
        drivers = self.analysis.get('key_drivers', {})
        driver_list = drivers.get('drivers', [])

        if driver_list:
            writer.writerow(['Key Drivers'])
            writer.writerow(['Rank', 'Question', 'Importance', 'Correlation'])

            for idx, driver in enumerate(driver_list[:5], 1):
                writer.writerow([
                    idx,
                    driver.get('question', ''),
                    f"{driver.get('importance', 0):.3f}",
                    f"{driver.get('correlation', 0):.3f}"
                ])

            writer.writerow([])

    def _export_insights_csv(self, writer):
        """Export insights section"""
        writer.writerow(['INSIGHTS'])
        writer.writerow([])

        insights_data = self.analysis.get('insights', {})
        insights_list = insights_data.get('insights', [])

        for insight in insights_list:
            writer.writerow([insight.get('title', '')])
            writer.writerow([insight.get('insight', '')])
            writer.writerow(['Severity:', insight.get('severity', 'medium').upper()])
            writer.writerow([])

    def create_response_level_export(self) -> str:
        """
        Export individual response-level data

        Returns:
            CSV string with one row per response
        """
        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow([
            'Response ID',
            'Profile ID',
            'Question ID',
            'Question Text',
            'Category',
            'Expected Value',
            'Mode',
            'Entropy',
            'Profile Gender',
            'Profile Age Group',
            'Profile Persona Group'
        ])

        # Build profile lookup
        profiles_by_id = {
            profile['id']: profile
            for profile in self.run_data.get('profiles', [])
        }

        # Build question lookup
        questions_by_id = {
            question['id']: question
            for question in self.survey_data.get('questions', [])
        }

        # Write response data
        for response in self.run_data.get('responses', []):
            profile_id = response.get('profile_id')
            question_id = response.get('question_id')
            ssr_dist = response.get('ssr_distribution', {})

            profile = profiles_by_id.get(profile_id, {})
            question = questions_by_id.get(question_id, {})

            writer.writerow([
                response.get('id', ''),
                profile_id,
                question_id,
                question.get('text', '')[:100],
                question.get('category_id', ''),
                ssr_dist.get('expected_value', ''),
                ssr_dist.get('mode', ''),
                ssr_dist.get('entropy', ''),
                profile.get('gender', ''),
                profile.get('age_group', ''),
                profile.get('persona_group', '')
            ])

        return output.getvalue()

    def create_summary_report(self) -> str:
        """
        Create a formatted text summary report

        Returns:
            Multi-line summary report string
        """
        lines = []

        lines.append("=" * 80)
        lines.append("S.A.G.E SURVEY ANALYSIS REPORT")
        lines.append("=" * 80)
        lines.append("")

        # Survey info
        lines.append(f"Survey: {self.survey_data.get('name', 'Untitled')}")
        lines.append(f"Run ID: {self.run_data.get('id', 'N/A')}")
        lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append("")

        # Executive summary
        summary = self.analysis.get('executive_summary', {})
        lines.append("EXECUTIVE SUMMARY")
        lines.append("-" * 80)
        lines.append(f"Overall Score: {summary.get('overall_mean', 0):.2f} (Grade {summary.get('overall_grade', 'N/A')})")
        lines.append(f"Top Box: {summary.get('top_box_pct', 0):.1f}% | Net Score: {summary.get('net_score', 0):.1f}")
        lines.append(f"Sample Size: {summary.get('sample_size', 0)} respondents")
        lines.append("")

        # One-sentence summary
        one_sentence = summary.get('summary', '')
        if one_sentence:
            lines.append(f"Summary: {one_sentence}")
            lines.append("")

        # Key insights
        insights_list = summary.get('key_insights', [])
        if insights_list:
            lines.append("KEY INSIGHTS:")
            for idx, insight in enumerate(insights_list, 1):
                lines.append(f"  {idx}. {insight}")
            lines.append("")

        # Recommendations
        recommendations = summary.get('recommendations', [])
        if recommendations:
            lines.append("RECOMMENDATIONS:")
            for idx, rec in enumerate(recommendations, 1):
                priority = rec.get('priority', 'medium').upper()
                lines.append(f"  {idx}. [{priority}] {rec.get('recommendation', '')}")
            lines.append("")

        lines.append("=" * 80)
        lines.append("End of Report")
        lines.append("=" * 80)

        return "\n".join(lines)
