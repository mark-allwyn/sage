"""
Statistical Testing

Perform statistical significance tests for survey data analysis.
"""

from scipy import stats
import numpy as np
from typing import Dict, List, Tuple


class StatisticalTester:
    """Perform statistical significance tests"""

    def compare_two_groups(
        self,
        group_a: List[float],
        group_b: List[float],
        group_a_name: str = "Group A",
        group_b_name: str = "Group B"
    ) -> Dict:
        """
        Compare two groups (e.g., demographics or categories)

        Args:
            group_a: List of scores for group A
            group_b: List of scores for group B
            group_a_name: Name of group A
            group_b_name: Name of group B

        Returns:
            Dict with t-test results and interpretation
        """
        if not group_a or not group_b:
            return self._empty_comparison_result(group_a_name, group_b_name)

        # Independent samples t-test
        t_stat, p_value = stats.ttest_ind(group_a, group_b)

        # Effect size (Cohen's d)
        cohens_d = self._cohens_d(group_a, group_b)

        # Means and difference
        mean_a = float(np.mean(group_a))
        mean_b = float(np.mean(group_b))
        diff = mean_a - mean_b
        pct_diff = (diff / mean_b) * 100 if mean_b != 0 else 0

        # Determine winner
        winner = group_a_name if mean_a > mean_b else group_b_name
        is_tie = abs(diff) < 0.1  # Consider scores within 0.1 as a tie

        return {
            "group_a_name": group_a_name,
            "group_b_name": group_b_name,
            "mean_a": mean_a,
            "mean_b": mean_b,
            "difference": float(diff),
            "pct_difference": float(pct_diff),
            "t_statistic": float(t_stat),
            "p_value": float(p_value),
            "is_significant": p_value < 0.05,
            "cohens_d": float(cohens_d),
            "effect_size_interpretation": self._interpret_effect_size(cohens_d),
            "significance_level": self._significance_level(p_value),
            "winner": winner if not is_tie else "tie",
            "is_tie": is_tie,
            "sample_size_a": len(group_a),
            "sample_size_b": len(group_b)
        }

    def compare_multiple_groups(
        self,
        groups: Dict[str, List[float]]
    ) -> Dict:
        """
        Compare multiple groups using ANOVA

        Args:
            groups: Dict mapping group names to value lists

        Returns:
            Dict with ANOVA results and pairwise comparisons
        """
        if len(groups) < 2:
            return self._empty_anova_result()

        group_data = list(groups.values())
        group_names = list(groups.keys())

        # One-way ANOVA
        f_stat, p_value = stats.f_oneway(*group_data)

        # Calculate group means
        group_means = {name: float(np.mean(data)) for name, data in groups.items()}

        # Post-hoc pairwise comparisons (if significant)
        pairwise_results = {}
        if p_value < 0.05:
            for i in range(len(group_names)):
                for j in range(i + 1, len(group_names)):
                    pair_key = f"{group_names[i]}_vs_{group_names[j]}"
                    pairwise_results[pair_key] = self.compare_two_groups(
                        group_data[i],
                        group_data[j],
                        group_names[i],
                        group_names[j]
                    )

        # Identify best performing group
        best_group = max(group_means.items(), key=lambda x: x[1])[0]

        return {
            "f_statistic": float(f_stat),
            "p_value": float(p_value),
            "is_significant": p_value < 0.05,
            "significance_level": self._significance_level(p_value),
            "group_means": group_means,
            "best_group": best_group,
            "num_groups": len(groups),
            "pairwise_comparisons": pairwise_results
        }

    def _cohens_d(self, group_a: List[float], group_b: List[float]) -> float:
        """
        Calculate Cohen's d effect size

        Cohen's d measures the difference between two means in standard deviation units.
        """
        n_a, n_b = len(group_a), len(group_b)

        if n_a < 2 or n_b < 2:
            return 0.0

        var_a, var_b = np.var(group_a, ddof=1), np.var(group_b, ddof=1)

        # Pooled standard deviation
        pooled_std = np.sqrt(((n_a - 1) * var_a + (n_b - 1) * var_b) / (n_a + n_b - 2))

        if pooled_std == 0:
            return 0.0

        return (np.mean(group_a) - np.mean(group_b)) / pooled_std

    def _interpret_effect_size(self, d: float) -> str:
        """
        Interpret Cohen's d effect size

        Guidelines:
        - < 0.2: negligible
        - 0.2-0.5: small
        - 0.5-0.8: medium
        - >= 0.8: large
        """
        abs_d = abs(d)
        if abs_d < 0.2:
            return "negligible"
        elif abs_d < 0.5:
            return "small"
        elif abs_d < 0.8:
            return "medium"
        else:
            return "large"

    def _significance_level(self, p_value: float) -> str:
        """
        Return significance level notation

        - ***: p < 0.001 (highly significant)
        - **: p < 0.01 (very significant)
        - *: p < 0.05 (significant)
        - n.s.: not significant
        """
        if p_value < 0.001:
            return "***"
        elif p_value < 0.01:
            return "**"
        elif p_value < 0.05:
            return "*"
        else:
            return "n.s."

    def _empty_comparison_result(self, group_a_name: str, group_b_name: str) -> Dict:
        """Return empty comparison result structure"""
        return {
            "group_a_name": group_a_name,
            "group_b_name": group_b_name,
            "mean_a": 0.0,
            "mean_b": 0.0,
            "difference": 0.0,
            "pct_difference": 0.0,
            "t_statistic": 0.0,
            "p_value": 1.0,
            "is_significant": False,
            "cohens_d": 0.0,
            "effect_size_interpretation": "negligible",
            "significance_level": "n.s.",
            "winner": "tie",
            "is_tie": True,
            "sample_size_a": 0,
            "sample_size_b": 0
        }

    def _empty_anova_result(self) -> Dict:
        """Return empty ANOVA result structure"""
        return {
            "f_statistic": 0.0,
            "p_value": 1.0,
            "is_significant": False,
            "significance_level": "n.s.",
            "group_means": {},
            "best_group": None,
            "num_groups": 0,
            "pairwise_comparisons": {}
        }
