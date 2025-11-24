"""
Insight Generation

Generate natural language insights and executive summaries from analysis results.
"""

from typing import Dict, List, Optional
from ..core.detector import SurveyAnalysisDetector, AnalysisContext
from ..core.metrics_calculator import MetricsCalculator
from ..core.statistical_tests import StatisticalTester
from ..analyzers.demographic_analyzer import DemographicAnalyzer
from ..analyzers.correlation_analyzer import CorrelationAnalyzer
from ..analyzers.category_comparator import CategoryComparator


class InsightGenerator:
    """Generate natural language insights from survey analysis"""

    def __init__(self, run_data: Dict, survey_data: Dict):
        """
        Initialize insight generator

        Args:
            run_data: Survey run data with responses
            survey_data: Survey configuration
        """
        self.run_data = run_data
        self.survey_data = survey_data

        # Add survey to run_data for analyzers that need it
        self.run_data['survey'] = survey_data

        # Initialize analyzers
        self.detector = SurveyAnalysisDetector()
        self.calculator = MetricsCalculator()
        self.tester = StatisticalTester()
        self.demographic_analyzer = DemographicAnalyzer(run_data, self.tester)
        self.correlation_analyzer = CorrelationAnalyzer(run_data)
        self.category_comparator = CategoryComparator(run_data, self.tester)

        # Detect survey context
        self.context = self.detector.detect_analysis_context(survey_data, run_data)

    def generate_executive_summary(self) -> Dict:
        """
        Generate comprehensive executive summary

        Returns:
            Executive summary with key insights
        """
        insights = []

        # 1. Overall Performance Insight
        overall_insight = self._generate_overall_performance_insight()
        if overall_insight:
            insights.append(overall_insight)

        # 2. Category Performance (if applicable)
        if self.context.has_categories:
            category_insight = self._generate_category_insight()
            if category_insight:
                insights.append(category_insight)

        # 3. Demographic Insights
        demographic_insight = self._generate_demographic_insight()
        if demographic_insight:
            insights.append(demographic_insight)

        # 4. Key Drivers Insight
        driver_insight = self._generate_driver_insight()
        if driver_insight:
            insights.append(driver_insight)

        # 5. Recommendations
        recommendations = self._generate_recommendations()

        return {
            "survey_id": self.survey_data.get("id"),
            "survey_name": self.survey_data.get("name"),
            "run_id": self.run_data.get("id"),
            "context": {
                "survey_type": self.context.survey_type,
                "sample_size": self.context.sample_size,
                "num_questions": len(self.survey_data.get("questions", [])),
                "has_categories": self.context.has_categories,
                "has_demographics": self.context.has_demographics
            },
            "insights": insights,
            "recommendations": recommendations,
            "summary": self._generate_one_sentence_summary(insights)
        }

    def generate_detailed_insights(self) -> Dict:
        """
        Generate detailed insights for all analysis areas

        Returns:
            Comprehensive insight report
        """
        return {
            "overall_performance": self._generate_detailed_performance_insights(),
            "question_analysis": self._generate_question_insights(),
            "demographic_analysis": self._generate_detailed_demographic_insights(),
            "correlation_analysis": self._generate_detailed_correlation_insights(),
            "category_analysis": self._generate_detailed_category_insights() if self.context.has_categories else None,
            "key_findings": self._generate_key_findings(),
            "action_items": self._generate_action_items()
        }

    def _generate_overall_performance_insight(self) -> Optional[Dict]:
        """Generate insight about overall survey performance"""
        # Calculate overall metrics across all questions
        all_distributions = []
        for response in self.run_data.get('responses', []):
            ssr_dist = response.get('ssr_distribution')
            if ssr_dist:
                all_distributions.append(ssr_dist)

        if not all_distributions:
            return None

        metrics = self.calculator.calculate_question_metrics(all_distributions)

        # Generate insight text
        insight_text = (
            f"Overall survey performance scores {metrics['grade']} with a mean rating of "
            f"{metrics['mean']:.2f}/10. "
        )

        if metrics['top_box_pct'] > 50:
            insight_text += (
                f"Strong positive sentiment with {metrics['top_box_pct']:.1f}% of responses "
                f"in the top rating categories (8-10). "
            )
        elif metrics['bottom_box_pct'] > 30:
            insight_text += (
                f"Concerning: {metrics['bottom_box_pct']:.1f}% of responses fall in the "
                f"bottom rating categories (1-3), indicating areas needing attention. "
            )
        else:
            insight_text += (
                f"Mixed sentiment with {metrics['top_box_pct']:.1f}% positive "
                f"and {metrics['bottom_box_pct']:.1f}% negative responses. "
            )

        return {
            "type": "overall_performance",
            "title": "Overall Performance",
            "insight": insight_text,
            "metrics": metrics,
            "severity": "high"
        }

    def _generate_category_insight(self) -> Optional[Dict]:
        """Generate insight about category performance"""
        comparison = self.category_comparator.compare_all_categories()

        if comparison['num_categories'] == 0:
            return None

        winner = comparison.get('winner')
        ranked = comparison.get('ranked_categories', [])

        if not winner or len(ranked) < 2:
            return None

        # Generate insight
        insight_text = comparison.get('interpretation', '')

        # Add actionable context
        if len(ranked) > 2:
            loser = ranked[-1]
            gap = winner['mean'] - loser['mean']
            if gap > 1.0:
                insight_text += (
                    f" The performance gap of {gap:.2f} points suggests significant "
                    f"differences in how {winner['category_name']} and {loser['category_name']} "
                    f"are perceived."
                )

        return {
            "type": "category_performance",
            "title": "Category Comparison",
            "insight": insight_text,
            "winner": winner,
            "ranked_categories": ranked,
            "severity": "high" if len(ranked) > 1 and (ranked[0]['mean'] - ranked[-1]['mean']) > 1.5 else "medium"
        }

    def _generate_demographic_insight(self) -> Optional[Dict]:
        """Generate insight about demographic segments"""
        if not self.context.has_demographics:
            return None

        # Get all question IDs
        question_ids = [q['id'] for q in self.survey_data.get('questions', [])]

        if not question_ids:
            return None

        # Identify target audience
        target_audience = self.demographic_analyzer.identify_target_audience(question_ids)

        top_segments = target_audience.get('top_segments', [])

        if not top_segments:
            return None

        top = top_segments[0]

        insight_text = (
            f"The {top['segment']} segment ({top['demographic_field']}) shows the strongest "
            f"performance with a mean score of {top['mean_score']:.2f}. "
        )

        if len(top_segments) > 1:
            bottom = top_segments[-1]
            gap = top['mean_score'] - bottom['mean_score']
            if gap > 1.0:
                insight_text += (
                    f"This represents a {gap:.2f}-point advantage over the "
                    f"{bottom['segment']} segment, suggesting clear targeting opportunities."
                )

        return {
            "type": "demographic_targeting",
            "title": "Target Audience Insights",
            "insight": insight_text,
            "top_segments": top_segments[:3],
            "severity": "high"
        }

    def _generate_driver_insight(self) -> Optional[Dict]:
        """Generate insight about key drivers"""
        questions = self.survey_data.get('questions', [])

        if len(questions) < 2:
            return None

        # Use first question as outcome (often overall satisfaction/intent)
        outcome_question = questions[0]['id']
        predictor_questions = [q['id'] for q in questions[1:]]

        driver_analysis = self.correlation_analyzer.identify_key_drivers(
            outcome_question,
            predictor_questions
        )

        drivers = driver_analysis.get('drivers', [])

        if not drivers:
            return None

        top_driver = drivers[0]

        insight_text = driver_analysis.get('interpretation', '')

        # Add actionable context
        if top_driver['importance'] > 0.5:
            insight_text += (
                f" This driver accounts for {top_driver.get('relative_importance', 0):.1f}% "
                f"of the relative importance, making it a critical factor to optimize."
            )

        return {
            "type": "key_drivers",
            "title": "Key Performance Drivers",
            "insight": insight_text,
            "top_drivers": drivers[:3],
            "outcome_question": outcome_question,
            "severity": "high"
        }

    def _generate_recommendations(self) -> List[Dict]:
        """Generate actionable recommendations"""
        recommendations = []

        # Question-level recommendations
        questions = self.survey_data.get('questions', [])

        for question in questions:
            question_responses = [
                r for r in self.run_data.get('responses', [])
                if r.get('question_id') == question['id']
            ]

            distributions = [
                r.get('ssr_distribution')
                for r in question_responses
                if r.get('ssr_distribution')
            ]

            if distributions:
                metrics = self.calculator.calculate_question_metrics(distributions)

                if metrics['grade'] in ['D', 'C']:
                    recommendations.append({
                        "priority": "high",
                        "area": "question_performance",
                        "question_id": question['id'],
                        "recommendation": (
                            f"Question '{question.get('text', question['id'])}' is underperforming "
                            f"(Grade {metrics['grade']}). Consider revising the approach or "
                            f"investigating specific pain points."
                        ),
                        "current_score": metrics['mean']
                    })

        # Category recommendations
        if self.context.has_categories:
            comparison = self.category_comparator.compare_all_categories()
            ranked = comparison.get('ranked_categories', [])

            if len(ranked) >= 2:
                worst = ranked[-1]
                if worst['mean'] < 5.0:
                    recommendations.append({
                        "priority": "high",
                        "area": "category_performance",
                        "category": worst['category_name'],
                        "recommendation": (
                            f"Category '{worst['category_name']}' requires immediate attention "
                            f"with a mean score of {worst['mean']:.2f}. Review the entire category "
                            f"strategy and consider competitive positioning."
                        ),
                        "current_score": worst['mean']
                    })

        # Demographic recommendations
        if self.context.has_demographics:
            question_ids = [q['id'] for q in questions]
            target_audience = self.demographic_analyzer.identify_target_audience(question_ids)
            top_segments = target_audience.get('top_segments', [])

            if len(top_segments) >= 3:
                top = top_segments[0]
                recommendations.append({
                    "priority": "medium",
                    "area": "targeting",
                    "recommendation": (
                        f"Focus marketing efforts on the {top['segment']} segment "
                        f"({top['demographic_field']}), which shows {top['mean_score']:.2f} "
                        f"mean performance. This represents your most receptive audience."
                    ),
                    "target_segment": top['segment']
                })

        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        recommendations.sort(key=lambda x: priority_order.get(x['priority'], 3))

        return recommendations[:5]  # Top 5 recommendations

    def _generate_one_sentence_summary(self, insights: List[Dict]) -> str:
        """Generate a one-sentence executive summary"""
        if not insights:
            return "Survey analysis complete with no significant insights identified."

        # Find the most critical insight
        high_severity = [i for i in insights if i.get('severity') == 'high']

        if high_severity:
            primary = high_severity[0]
            return primary['insight'].split('.')[0] + '.'

        return insights[0]['insight'].split('.')[0] + '.'

    def _generate_detailed_performance_insights(self) -> Dict:
        """Generate detailed performance insights"""
        # Calculate metrics for each question
        question_insights = []

        for question in self.survey_data.get('questions', []):
            responses = [
                r for r in self.run_data.get('responses', [])
                if r.get('question_id') == question['id']
            ]

            distributions = [
                r.get('ssr_distribution')
                for r in responses
                if r.get('ssr_distribution')
            ]

            if distributions:
                metrics = self.calculator.calculate_question_metrics(distributions)

                question_insights.append({
                    "question_id": question['id'],
                    "question_text": question.get('text', question['id']),
                    "performance": metrics['grade'],
                    "mean": metrics['mean'],
                    "insight": self._generate_question_insight_text(question, metrics)
                })

        return {
            "question_insights": question_insights,
            "overall_grade": self._calculate_overall_grade(question_insights)
        }

    def _generate_question_insights(self) -> List[Dict]:
        """Generate insights for individual questions"""
        insights = []

        for question in self.survey_data.get('questions', []):
            responses = [
                r for r in self.run_data.get('responses', [])
                if r.get('question_id') == question['id']
            ]

            distributions = [
                r.get('ssr_distribution')
                for r in responses
                if r.get('ssr_distribution')
            ]

            if distributions:
                metrics = self.calculator.calculate_question_metrics(distributions)

                insights.append({
                    "question_id": question['id'],
                    "insight": self._generate_question_insight_text(question, metrics),
                    "metrics": metrics
                })

        return insights

    def _generate_question_insight_text(self, question: Dict, metrics: Dict) -> str:
        """Generate insight text for a single question"""
        text = f"Scores {metrics['grade']} with {metrics['mean']:.2f}/10 mean. "

        if metrics['top_box_pct'] > 60:
            text += f"Strong performance: {metrics['top_box_pct']:.1f}% top-box."
        elif metrics['bottom_box_pct'] > 30:
            text += f"Needs improvement: {metrics['bottom_box_pct']:.1f}% bottom-box."
        else:
            text += f"Moderate performance with {metrics['net_score']:.1f} net score."

        return text

    def _generate_detailed_demographic_insights(self) -> Dict:
        """Generate detailed demographic insights"""
        if not self.context.has_demographics:
            return {"available": False}

        question_ids = [q['id'] for q in self.survey_data.get('questions', [])]
        target_audience = self.demographic_analyzer.identify_target_audience(question_ids)

        return {
            "available": True,
            "target_segments": target_audience.get('top_segments', [])[:5],
            "profile": target_audience.get('target_audience_profile'),
            "insight": self._generate_targeting_insight_text(target_audience)
        }

    def _generate_targeting_insight_text(self, target_audience: Dict) -> str:
        """Generate targeting insight text"""
        profile = target_audience.get('target_audience_profile')

        if not profile:
            return "No clear target audience identified."

        return profile.get('recommendation', 'Target audience analysis available.')

    def _generate_detailed_correlation_insights(self) -> Dict:
        """Generate detailed correlation insights"""
        question_ids = [q['id'] for q in self.survey_data.get('questions', [])]

        if len(question_ids) < 2:
            return {"available": False}

        correlation_matrix = self.correlation_analyzer.calculate_correlation_matrix(question_ids)

        return {
            "available": True,
            "strong_correlations": correlation_matrix.get('strong_correlations', [])[:5],
            "interpretation": correlation_matrix.get('interpretation', '')
        }

    def _generate_detailed_category_insights(self) -> Dict:
        """Generate detailed category insights"""
        comparison = self.category_comparator.compare_all_categories()
        strengths_weaknesses = self.category_comparator.identify_category_strengths_weaknesses()

        return {
            "comparison": comparison,
            "strengths_weaknesses": strengths_weaknesses,
            "insight": comparison.get('interpretation', '')
        }

    def _generate_key_findings(self) -> List[str]:
        """Generate list of key findings"""
        findings = []

        # Overall performance finding
        all_distributions = [
            r.get('ssr_distribution')
            for r in self.run_data.get('responses', [])
            if r.get('ssr_distribution')
        ]

        if all_distributions:
            metrics = self.calculator.calculate_question_metrics(all_distributions)
            findings.append(
                f"Overall survey performance: {metrics['mean']:.2f}/10 (Grade {metrics['grade']})"
            )

        # Category finding
        if self.context.has_categories:
            comparison = self.category_comparator.compare_all_categories()
            winner = comparison.get('winner')
            if winner:
                findings.append(
                    f"Best performing category: {winner['category_name']} ({winner['mean']:.2f})"
                )

        # Target audience finding
        if self.context.has_demographics:
            question_ids = [q['id'] for q in self.survey_data.get('questions', [])]
            target_audience = self.demographic_analyzer.identify_target_audience(question_ids)
            top_segments = target_audience.get('top_segments', [])
            if top_segments:
                top = top_segments[0]
                findings.append(
                    f"Top performing segment: {top['segment']} ({top['demographic_field']}) "
                    f"with {top['mean_score']:.2f} mean score"
                )

        return findings

    def _generate_action_items(self) -> List[str]:
        """Generate actionable next steps"""
        actions = []

        # Add actions based on performance
        questions = self.survey_data.get('questions', [])

        low_performing = []
        for question in questions:
            responses = [
                r for r in self.run_data.get('responses', [])
                if r.get('question_id') == question['id']
            ]

            distributions = [
                r.get('ssr_distribution')
                for r in responses
                if r.get('ssr_distribution')
            ]

            if distributions:
                metrics = self.calculator.calculate_question_metrics(distributions)
                if metrics['mean'] < 5.0:
                    low_performing.append(question['id'])

        if low_performing:
            actions.append(
                f"Investigate and address {len(low_performing)} underperforming questions"
            )

        # Category actions
        if self.context.has_categories:
            comparison = self.category_comparator.compare_all_categories()
            ranked = comparison.get('ranked_categories', [])
            if len(ranked) >= 2 and ranked[-1]['mean'] < 5.5:
                actions.append(
                    f"Develop improvement plan for {ranked[-1]['category_name']} category"
                )

        # Targeting action
        if self.context.has_demographics:
            actions.append("Refine targeting strategy based on top-performing segments")

        return actions

    def _calculate_overall_grade(self, question_insights: List[Dict]) -> str:
        """Calculate overall grade from question insights"""
        if not question_insights:
            return "N/A"

        mean_scores = [q['mean'] for q in question_insights]
        overall_mean = sum(mean_scores) / len(mean_scores)

        if overall_mean >= 6.0:
            return "A"
        elif overall_mean >= 5.5:
            return "A-"
        elif overall_mean >= 5.0:
            return "B+"
        elif overall_mean >= 4.5:
            return "B"
        elif overall_mean >= 4.0:
            return "B-"
        elif overall_mean >= 3.5:
            return "C+"
        elif overall_mean >= 3.0:
            return "C"
        else:
            return "D"
