"""
S.A.G.E Analysis Module

Comprehensive survey results analysis system for synthetic audience data.
"""

from .core.detector import SurveyAnalysisDetector, AnalysisContext
from .core.metrics_calculator import MetricsCalculator
from .core.statistical_tests import StatisticalTester
from .analyzers.demographic_analyzer import DemographicAnalyzer
from .analyzers.correlation_analyzer import CorrelationAnalyzer
from .analyzers.category_comparator import CategoryComparator
from .reporters.insight_generator import InsightGenerator
from .visualizations.export_formatter import ExportFormatter

__all__ = [
    'SurveyAnalysisDetector',
    'AnalysisContext',
    'MetricsCalculator',
    'StatisticalTester',
    'DemographicAnalyzer',
    'CorrelationAnalyzer',
    'CategoryComparator',
    'InsightGenerator',
    'ExportFormatter',
]
