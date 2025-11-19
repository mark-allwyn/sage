"""
DeepEval Integration Module for SAGE
Provides LLM response evaluation using DeepEval metrics
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

from deepeval.metrics import (
    AnswerRelevancyMetric,
    BiasMetric,
    HallucinationMetric,
)
from deepeval.test_case import LLMTestCase
from deepeval import evaluate
from deepeval.evaluate import AsyncConfig

logger = logging.getLogger(__name__)


class EvaluationMetricType(str, Enum):
    """Available evaluation metrics"""
    ANSWER_RELEVANCY = "answer_relevancy"
    BIAS = "bias"
    HALLUCINATION = "hallucination"


class EvaluationConfig:
    """Configuration for evaluation metrics"""

    def __init__(
        self,
        metrics: List[EvaluationMetricType] = None,
        evaluator_model: str = "gpt-4o-mini",
        threshold: float = 0.5,
    ):
        self.metrics = metrics or [
            EvaluationMetricType.ANSWER_RELEVANCY,
            EvaluationMetricType.BIAS,
            EvaluationMetricType.HALLUCINATION,
        ]
        self.evaluator_model = evaluator_model
        self.threshold = threshold


class ResponseEvaluator:
    """Handles evaluation of LLM responses using DeepEval"""

    def __init__(self, config: EvaluationConfig = None):
        self.config = config or EvaluationConfig()
        self.results_dir = Path("evaluations")
        self.results_dir.mkdir(exist_ok=True)

    def _get_metrics(self) -> List[Any]:
        """Create DeepEval metric instances"""
        metrics = []

        for metric_type in self.config.metrics:
            if metric_type == EvaluationMetricType.ANSWER_RELEVANCY:
                metrics.append(
                    AnswerRelevancyMetric(
                        threshold=self.config.threshold,
                        model=self.config.evaluator_model,
                    )
                )
            elif metric_type == EvaluationMetricType.BIAS:
                metrics.append(
                    BiasMetric(
                        threshold=self.config.threshold,
                        model=self.config.evaluator_model,
                    )
                )
            elif metric_type == EvaluationMetricType.HALLUCINATION:
                metrics.append(
                    HallucinationMetric(
                        threshold=self.config.threshold,
                        model=self.config.evaluator_model,
                    )
                )

        return metrics

    def evaluate_response(
        self,
        input_text: str,
        actual_output: str,
        expected_output: Optional[str] = None,
        retrieval_context: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Evaluate a single LLM response

        Args:
            input_text: The original question/prompt
            actual_output: The LLM's response
            expected_output: Optional expected/ideal response
            retrieval_context: Optional context used for generation

        Returns:
            Dictionary with evaluation results
        """
        try:
            # Create test case
            test_case = LLMTestCase(
                input=input_text,
                actual_output=actual_output,
                expected_output=expected_output,
                retrieval_context=retrieval_context or [],
            )

            # Get metrics
            metrics = self._get_metrics()

            # Run evaluation with async disabled (fixes uvloop conflict)
            results = evaluate(
                test_cases=[test_case],
                metrics=metrics,
                async_config=AsyncConfig(run_async=False),
            )

            # Extract scores
            scores = {}
            for metric in metrics:
                metric_name = metric.__class__.__name__.replace("Metric", "").lower()
                scores[metric_name] = {
                    "score": metric.score,
                    "reason": metric.reason if hasattr(metric, "reason") else None,
                    "success": metric.is_successful() if hasattr(metric, "is_successful") else None,
                }

            return {
                "success": True,
                "scores": scores,
                "overall_score": sum(s["score"] for s in scores.values()) / len(scores) if scores else 0,
                "timestamp": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Error evaluating response: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
            }

    def evaluate_survey_responses(
        self,
        survey_id: str,
        responses: List[Dict[str, Any]],
        questions: List[Dict[str, Any]],
        sample_size: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Evaluate multiple survey responses

        Args:
            survey_id: Survey identifier
            responses: List of response objects with text_response and question_id
            questions: List of question objects with id and text
            sample_size: Optional number of responses to sample (default: 10% or all if <10)

        Returns:
            Aggregated evaluation results
        """
        # Create question lookup
        question_map = {q["id"]: q for q in questions}

        # Sample responses if needed
        total_responses = len(responses)
        if sample_size is None:
            sample_size = max(1, int(total_responses * 0.1))  # 10% default

        import random
        sampled_responses = random.sample(responses, min(sample_size, total_responses))

        # Evaluate each response
        evaluations = []
        for response in sampled_responses:
            question_id = response.get("question_id")
            question = question_map.get(question_id, {})
            question_text = question.get("text", "")

            # Build context from question and category info
            context = [question_text]
            if "category" in response:
                context.append(f"Category: {response['category']}")

            result = self.evaluate_response(
                input_text=question_text,
                actual_output=response.get("text_response", ""),
                retrieval_context=context,
            )

            result["question_id"] = question_id
            result["respondent_id"] = response.get("respondent_id")
            evaluations.append(result)

        # Aggregate results
        successful_evals = [e for e in evaluations if e.get("success")]

        if not successful_evals:
            return {
                "survey_id": survey_id,
                "success": False,
                "error": "No successful evaluations",
                "timestamp": datetime.utcnow().isoformat(),
            }

        # Calculate average scores per metric
        all_metric_names = set()
        for eval_result in successful_evals:
            all_metric_names.update(eval_result.get("scores", {}).keys())

        aggregated_scores = {}
        for metric_name in all_metric_names:
            scores = [
                e["scores"][metric_name]["score"]
                for e in successful_evals
                if metric_name in e.get("scores", {})
            ]
            if scores:
                aggregated_scores[metric_name] = {
                    "mean": sum(scores) / len(scores),
                    "min": min(scores),
                    "max": max(scores),
                    "count": len(scores),
                }

        result = {
            "survey_id": survey_id,
            "success": True,
            "total_responses": total_responses,
            "evaluated_responses": len(sampled_responses),
            "successful_evaluations": len(successful_evals),
            "aggregated_scores": aggregated_scores,
            "overall_mean_score": sum(s["mean"] for s in aggregated_scores.values()) / len(aggregated_scores) if aggregated_scores else 0,
            "individual_evaluations": evaluations,
            "timestamp": datetime.utcnow().isoformat(),
            "config": {
                "metrics": [m.value for m in self.config.metrics],
                "evaluator_model": self.config.evaluator_model,
                "threshold": self.config.threshold,
            },
        }

        # Save results
        self._save_evaluation(survey_id, result)

        return result

    def _save_evaluation(self, survey_id: str, results: Dict[str, Any]) -> None:
        """Save evaluation results to disk"""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{survey_id}_{timestamp}.json"
        filepath = self.results_dir / filename

        try:
            with open(filepath, "w") as f:
                json.dump(results, f, indent=2)
            logger.info(f"Saved evaluation results to {filepath}")
        except Exception as e:
            logger.error(f"Error saving evaluation results: {e}")

    def load_evaluation(self, evaluation_id: str) -> Optional[Dict[str, Any]]:
        """Load evaluation results from disk"""
        filepath = self.results_dir / f"{evaluation_id}.json"

        if not filepath.exists():
            return None

        try:
            with open(filepath, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading evaluation: {e}")
            return None

    def list_evaluations(self, survey_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all available evaluations, optionally filtered by survey_id"""
        evaluations = []

        for filepath in self.results_dir.glob("*.json"):
            try:
                with open(filepath, "r") as f:
                    data = json.load(f)

                # Filter by survey_id if provided
                if survey_id and data.get("survey_id") != survey_id:
                    continue

                evaluations.append({
                    "evaluation_id": filepath.stem,
                    "survey_id": data.get("survey_id"),
                    "timestamp": data.get("timestamp"),
                    "evaluated_responses": data.get("evaluated_responses"),
                    "overall_score": data.get("overall_mean_score"),
                    "success": data.get("success"),
                })
            except Exception as e:
                logger.error(f"Error reading evaluation file {filepath}: {e}")

        # Sort by timestamp descending
        evaluations.sort(key=lambda x: x["timestamp"], reverse=True)

        return evaluations

    def compare_evaluations(
        self,
        evaluation_ids: List[str],
    ) -> Dict[str, Any]:
        """Compare multiple evaluations to see trends over time or across models"""
        evaluations = []

        for eval_id in evaluation_ids:
            eval_data = self.load_evaluation(eval_id)
            if eval_data:
                evaluations.append(eval_data)

        if not evaluations:
            return {"success": False, "error": "No valid evaluations found"}

        # Extract metric trends
        metrics = {}
        for eval_data in evaluations:
            timestamp = eval_data.get("timestamp")
            config_model = eval_data.get("config", {}).get("evaluator_model")

            for metric_name, metric_data in eval_data.get("aggregated_scores", {}).items():
                if metric_name not in metrics:
                    metrics[metric_name] = []

                metrics[metric_name].append({
                    "timestamp": timestamp,
                    "model": config_model,
                    "mean_score": metric_data.get("mean"),
                    "evaluation_id": eval_data.get("evaluation_id"),
                })

        return {
            "success": True,
            "num_evaluations": len(evaluations),
            "metrics": metrics,
            "timestamp": datetime.utcnow().isoformat(),
        }


def create_evaluator(
    metrics: List[str] = None,
    evaluator_model: str = "gpt-4o-mini",
    threshold: float = 0.5,
) -> ResponseEvaluator:
    """
    Factory function to create a ResponseEvaluator instance

    Args:
        metrics: List of metric names to use
        evaluator_model: Model to use for evaluation
        threshold: Threshold for metric success

    Returns:
        Configured ResponseEvaluator instance
    """
    metric_types = []
    if metrics:
        for metric in metrics:
            try:
                metric_types.append(EvaluationMetricType(metric))
            except ValueError:
                logger.warning(f"Unknown metric type: {metric}")

    config = EvaluationConfig(
        metrics=metric_types if metric_types else None,
        evaluator_model=evaluator_model,
        threshold=threshold,
    )

    return ResponseEvaluator(config)
