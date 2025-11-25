"""
Ground Truth Comparison Metrics

Functions for comparing survey run distributions against ground truth data.
Includes statistical distance metrics and comparison utilities.

IMPORTANT: This module performs POPULATION-LEVEL distribution comparisons.
It compares:
  - Ground Truth: Frequency distribution from real survey answers (e.g., 30% chose rating 4)
  - Test Run: Averaged probability distributions from SSR model output

This measures: "Does the SSR model capture the overall population preference distribution?"
NOT: "Can the model predict individual answers?" (respondents are different)

Example:
  Ground Truth: 20 people answered [4,2,5,3,4,1,5,4,3,2...]
                → Distribution: [10%, 20%, 15%, 30%, 25%]
  Test Run: 50 synthetic profiles → Avg distribution: [12%, 18%, 20%, 28%, 22%]
  Comparison: KL divergence, JS divergence, etc. to measure similarity
"""

import numpy as np
from typing import Dict, List, Any
from scipy import stats
from scipy.spatial.distance import jensenshannon
from scipy.stats import wasserstein_distance


def kl_divergence(p: np.ndarray, q: np.ndarray, epsilon: float = 1e-10) -> float:
    """
    Calculate Kullback-Leibler divergence between two probability distributions.

    Args:
        p: True distribution (ground truth)
        q: Approximate distribution (test run)
        epsilon: Small value to avoid log(0)

    Returns:
        KL divergence value (lower is better, 0 = identical)
    """
    p = np.asarray(p) + epsilon
    q = np.asarray(q) + epsilon

    # Normalize
    p = p / p.sum()
    q = q / q.sum()

    return np.sum(p * np.log(p / q))


def js_divergence(p: np.ndarray, q: np.ndarray) -> float:
    """
    Calculate Jensen-Shannon divergence (symmetric version of KL divergence).

    Args:
        p: First probability distribution
        q: Second probability distribution

    Returns:
        JS divergence value in [0, 1] (0 = identical, 1 = completely different)
    """
    p = np.asarray(p)
    q = np.asarray(q)

    # Normalize
    p = p / p.sum()
    q = q / q.sum()

    return jensenshannon(p, q)


def wasserstein_dist(p: np.ndarray, q: np.ndarray) -> float:
    """
    Calculate Wasserstein distance (Earth Mover's Distance).
    Measures how much "work" is needed to transform one distribution into another.

    Args:
        p: First probability distribution
        q: Second probability distribution

    Returns:
        Wasserstein distance (lower is better, 0 = identical)
    """
    p = np.asarray(p)
    q = np.asarray(q)

    # Create value positions (0, 1, 2, ... n-1)
    positions = np.arange(len(p))

    return wasserstein_distance(positions, positions, p, q)


def chi_squared_test(p: np.ndarray, q: np.ndarray, sample_size: int = 100) -> Dict[str, float]:
    """
    Perform chi-squared test to determine if distributions are significantly different.

    Args:
        p: Ground truth distribution
        q: Test distribution
        sample_size: Sample size for test distribution

    Returns:
        Dictionary with chi_squared statistic and p_value.
        Returns None values if test cannot be performed.
    """
    try:
        p = np.asarray(p)
        q = np.asarray(q)

        # Normalize
        p = p / p.sum()
        q = q / q.sum()

        # Convert to expected vs observed counts
        expected = p * sample_size
        observed = q * sample_size

        # Validate chi-squared test assumptions
        # Chi-squared requires all expected frequencies > 0, ideally > 5
        min_expected = np.min(expected)
        if min_expected < 1.0:
            # Too many cells with low expected counts - test is invalid
            return {
                "chi_squared": None,
                "p_value": None,
                "significant": False
            }

        # Perform chi-squared test
        chi2_stat, p_value = stats.chisquare(observed, expected)

        # Check for invalid results (NaN, inf)
        if not np.isfinite(chi2_stat) or not np.isfinite(p_value):
            return {
                "chi_squared": None,
                "p_value": None,
                "significant": False
            }

        return {
            "chi_squared": float(chi2_stat),
            "p_value": float(p_value),
            "significant": p_value < 0.05  # Reject null hypothesis if p < 0.05
        }

    except (ValueError, RuntimeWarning, Exception) as e:
        # Chi-squared test failed - return None values
        # This can happen with edge cases like all zeros or invalid distributions
        return {
            "chi_squared": None,
            "p_value": None,
            "significant": False
        }


def mean_absolute_error(p: np.ndarray, q: np.ndarray) -> float:
    """
    Calculate mean absolute error between probability distributions.

    Args:
        p: Ground truth distribution
        q: Test distribution

    Returns:
        MAE value (lower is better, 0 = identical)
    """
    p = np.asarray(p)
    q = np.asarray(q)

    # Normalize
    p = p / p.sum()
    q = q / q.sum()

    return np.mean(np.abs(p - q))


def compare_distributions(
    ground_truth_dist: List[float],
    test_dist: List[float],
    sample_size: int = 100
) -> Dict[str, Any]:
    """
    Compare two probability distributions using multiple metrics.

    Args:
        ground_truth_dist: Ground truth probability distribution
        test_dist: Test probability distribution to compare
        sample_size: Sample size for chi-squared test

    Returns:
        Dictionary with all comparison metrics
    """
    gt = np.array(ground_truth_dist)
    test = np.array(test_dist)

    # Normalize both
    gt = gt / gt.sum()
    test = test / test.sum()

    chi2_result = chi_squared_test(gt, test, sample_size)

    return {
        "kl_divergence": float(kl_divergence(gt, test)),
        "js_divergence": float(js_divergence(gt, test)),
        "wasserstein_distance": float(wasserstein_dist(gt, test)),
        "chi_squared": chi2_result["chi_squared"],
        "chi_squared_p_value": chi2_result["p_value"],
        "significant_difference": chi2_result["significant"],
        "mean_absolute_error": float(mean_absolute_error(gt, test))
    }


def compare_survey_runs(
    ground_truth: Dict[str, Any],
    test_run: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Compare a complete survey run against ground truth.

    This performs POPULATION-LEVEL comparison, not individual prediction accuracy.
    It measures whether the SSR model's averaged distributions match the real
    population's preference distribution from ground truth answers.

    Args:
        ground_truth: Ground truth data with aggregated_distributions
                     - If uploaded: Contains frequency distributions from real answers
                     - If SSR-generated: Contains averaged SSR probability distributions
        test_run: Test run data with distributions (SSR model output)

    Returns:
        Comprehensive comparison results with per-question and overall metrics.
        Lower divergence values = better match to ground truth population distribution.
    """
    gt_distributions = ground_truth.get("aggregated_distributions", {})
    test_distributions = test_run.get("distributions", {})

    results = {
        "overall_metrics": {},
        "by_category": {},
        "by_question": {}
    }

    all_kl = []
    all_js = []
    all_wasserstein = []
    all_mae = []

    # Compare each question
    for category in gt_distributions:
        if category not in test_distributions:
            continue

        results["by_category"][category] = {}
        category_metrics = []

        for question_id in gt_distributions[category]:
            if question_id not in test_distributions[category]:
                continue

            gt_mean_probs = np.array(gt_distributions[category][question_id]["mean_probabilities"])

            # Aggregate test distribution (average across all respondents)
            test_question_dists = test_distributions[category][question_id]
            test_probs_list = [
                np.array(resp["probabilities"])
                for resp in test_question_dists.values()
            ]
            test_mean_probs = np.mean(test_probs_list, axis=0)

            # Calculate metrics for this question
            question_metrics = compare_distributions(
                gt_mean_probs.tolist(),
                test_mean_probs.tolist(),
                sample_size=len(test_probs_list)
            )

            results["by_question"][f"{category}_{question_id}"] = question_metrics
            category_metrics.append(question_metrics)

            # Collect for overall stats
            all_kl.append(question_metrics["kl_divergence"])
            all_js.append(question_metrics["js_divergence"])
            all_wasserstein.append(question_metrics["wasserstein_distance"])
            all_mae.append(question_metrics["mean_absolute_error"])

        # Category-level aggregates
        if category_metrics:
            results["by_category"][category] = {
                "mean_kl_divergence": float(np.mean([m["kl_divergence"] for m in category_metrics])),
                "mean_js_divergence": float(np.mean([m["js_divergence"] for m in category_metrics])),
                "mean_wasserstein": float(np.mean([m["wasserstein_distance"] for m in category_metrics])),
                "mean_mae": float(np.mean([m["mean_absolute_error"] for m in category_metrics])),
                "num_questions": len(category_metrics)
            }

    # Overall aggregates
    if all_kl:
        results["overall_metrics"] = {
            "mean_kl_divergence": float(np.mean(all_kl)),
            "std_kl_divergence": float(np.std(all_kl)),
            "mean_js_divergence": float(np.mean(all_js)),
            "std_js_divergence": float(np.std(all_js)),
            "mean_wasserstein": float(np.mean(all_wasserstein)),
            "std_wasserstein": float(np.std(all_wasserstein)),
            "mean_mae": float(np.mean(all_mae)),
            "std_mae": float(np.std(all_mae)),
            "num_questions_compared": len(all_kl)
        }

    return results
