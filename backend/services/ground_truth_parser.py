"""
Ground Truth CSV Parser

Handles parsing and validation of ground truth data from CSV uploads.
Extracted from main.py parse_ground_truth_csv() to reduce complexity.

Original function: 233 lines, complexity ~25
Refactored into: 6 focused functions, max complexity ~8
"""
import csv
import io
import numpy as np
from typing import Dict, List, Tuple, Any, Set
from collections import defaultdict
from dataclasses import dataclass

from ssr_core.survey import Survey, Question
from constants import DEFAULT_CATEGORY


@dataclass
class ValidationMessage:
    """Validation error or warning"""
    line_number: int
    field: str
    message: str
    severity: str  # 'error' or 'warning'

    def to_dict(self) -> Dict:
        return {
            "line_number": self.line_number,
            "field": self.field,
            "message": self.message,
            "severity": self.severity
        }


@dataclass
class ParsedGroundTruth:
    """Parsed and validated ground truth data"""
    success: bool
    format_detected: str = "simple_answers"
    num_respondents: int = 0
    num_questions: int = 0
    num_categories: int = 0
    num_responses: int = 0
    categories: List[str] = None
    questions: List[str] = None
    sample_data: List[Dict] = None
    validation_errors: List[Dict] = None
    validation_warnings: List[Dict] = None
    aggregated_distributions: Dict = None
    raw_distributions: Dict = None

    def __post_init__(self):
        if self.categories is None:
            self.categories = []
        if self.questions is None:
            self.questions = []
        if self.sample_data is None:
            self.sample_data = []
        if self.validation_errors is None:
            self.validation_errors = []
        if self.validation_warnings is None:
            self.validation_warnings = []
        if self.aggregated_distributions is None:
            self.aggregated_distributions = {}
        if self.raw_distributions is None:
            self.raw_distributions = {}

    def to_dict(self) -> Dict:
        return {
            "success": self.success,
            "format_detected": self.format_detected,
            "num_respondents": self.num_respondents,
            "num_questions": self.num_questions,
            "num_categories": self.num_categories,
            "categories": self.categories,
            "questions": self.questions,
            "sample_data": self.sample_data,
            "validation_errors": self.validation_errors,
            "validation_warnings": self.validation_warnings,
            "aggregated_distributions": self.aggregated_distributions,
            "raw_distributions": self.raw_distributions,
            "num_responses": self.num_responses
        }


def validate_csv_structure(rows: List[Dict]) -> None:
    """
    Validate CSV has required columns and is not empty.

    Raises:
        ValueError: If CSV is empty or missing required columns
    """
    if not rows:
        raise ValueError("CSV file is empty")

    required_cols = {'Respondent ID', 'Question ID', 'Answer'}
    first_row_cols = set(rows[0].keys())

    if not required_cols.issubset(first_row_cols):
        missing = required_cols - first_row_cols
        raise ValueError(
            f"CSV missing required columns: {', '.join(missing)}. "
            f"Expected format: Respondent ID, Question ID, Answer, Category (optional), Demographics (optional)"
        )


def get_valid_range_for_question(question: Question) -> Tuple[int, int]:
    """
    Get the valid answer range for a question based on its type.

    Args:
        question: Survey question

    Returns:
        Tuple of (min_value, max_value)
    """
    if question.type == 'likert_5':
        return (1, 5)
    elif question.type == 'likert_7':
        return (1, 7)
    elif question.type == 'yes_no':
        return (1, 2)
    else:
        num_options = len(question.options) if question.options else 5
        return (1, num_options)


def get_num_ratings_for_question(question: Question) -> int:
    """
    Get the number of rating options for a question.

    Args:
        question: Survey question

    Returns:
        Number of rating options
    """
    if question.type == 'likert_5':
        return 5
    elif question.type == 'likert_7':
        return 7
    elif question.type == 'yes_no':
        return 2
    else:
        return len(question.options) if question.options else 5


def parse_csv_rows(
    rows: List[Dict],
    survey: Survey
) -> Tuple[Dict, List[ValidationMessage], List[ValidationMessage], Set, Set, Set]:
    """
    Parse CSV rows and validate against survey structure.

    Args:
        rows: CSV rows as dictionaries
        survey: Survey to validate against

    Returns:
        Tuple of (raw_answers, errors, warnings, categories, questions, respondent_ids)
    """
    raw_answers = defaultdict(lambda: defaultdict(lambda: defaultdict(dict)))
    validation_errors = []
    validation_warnings = []
    categories = set()
    questions = set()
    respondent_ids = set()

    # Build survey question map for O(1) lookup
    survey_questions = {q.id: q for q in survey.questions}

    for line_num, row in enumerate(rows, start=2):  # Line 2 because of header
        try:
            respondent_id = row.get('Respondent ID', '').strip()
            question_id = row.get('Question ID', '').strip()
            answer = int(row.get('Answer', '0'))
            category = row.get('Category', DEFAULT_CATEGORY).strip()

            # Optional demographics
            demographics = {
                'gender': row.get('Gender', '').strip(),
                'age_group': row.get('Age Group', '').strip(),
                'persona_group': row.get('Persona Group', '').strip(),
                'occupation': row.get('Occupation', '').strip()
            }

            # Validate required fields
            if not respondent_id or not question_id:
                validation_errors.append(ValidationMessage(
                    line_number=line_num,
                    field="Respondent ID or Question ID",
                    message="Respondent ID and Question ID are required",
                    severity="error"
                ))
                continue

            # Validate question exists in survey
            if question_id not in survey_questions:
                validation_errors.append(ValidationMessage(
                    line_number=line_num,
                    field="Question ID",
                    message=f"Question '{question_id}' not found in survey",
                    severity="error"
                ))
                continue

            question = survey_questions[question_id]

            # Validate answer is within valid range
            valid_range = get_valid_range_for_question(question)
            if not (valid_range[0] <= answer <= valid_range[1]):
                validation_errors.append(ValidationMessage(
                    line_number=line_num,
                    field="Answer",
                    message=f"Answer {answer} out of valid range {valid_range} for question type {question.type}",
                    severity="error"
                ))
                continue

            # Validate category if present
            if question.category and category != question.category:
                validation_warnings.append(ValidationMessage(
                    line_number=line_num,
                    field="Category",
                    message=f"Category mismatch: CSV has '{category}', survey expects '{question.category}'",
                    severity="warning"
                ))

            # Collect valid data
            categories.add(category)
            questions.add(question_id)
            respondent_ids.add(respondent_id)

            # Store answer with demographics
            raw_answers[respondent_id][category][question_id] = {
                "answer": answer,
                **demographics
            }

        except (ValueError, KeyError) as e:
            validation_errors.append(ValidationMessage(
                line_number=line_num,
                field="unknown",
                message=f"Parse error: {str(e)}",
                severity="error"
            ))

    return raw_answers, validation_errors, validation_warnings, categories, questions, respondent_ids


def calculate_distributions(
    raw_answers: Dict,
    categories: Set[str],
    questions: Set[str],
    respondent_ids: Set[str],
    survey_questions: Dict[str, Question]
) -> Tuple[Dict, Dict]:
    """
    Calculate frequency distributions and statistics from raw answers.

    Args:
        raw_answers: Nested dict of respondent -> category -> question -> answer
        categories: Set of categories found in data
        questions: Set of questions found in data
        respondent_ids: Set of respondent IDs
        survey_questions: Dict mapping question IDs to Question objects

    Returns:
        Tuple of (aggregated_distributions, raw_distributions)
    """
    aggregated_distributions = defaultdict(lambda: defaultdict(dict))
    raw_distributions = defaultdict(lambda: defaultdict(lambda: defaultdict(dict)))

    for category in categories:
        for question_id in questions:
            if question_id not in survey_questions:
                continue

            question = survey_questions[question_id]
            num_ratings = get_num_ratings_for_question(question)

            # Collect all answers for this question
            answers_list = []
            for respondent_id in respondent_ids:
                if category in raw_answers[respondent_id] and question_id in raw_answers[respondent_id][category]:
                    answer_data = raw_answers[respondent_id][category][question_id]
                    answer = answer_data["answer"]
                    answers_list.append(answer)

                    # Store raw answer (not as distribution)
                    raw_distributions[category][question_id][respondent_id] = answer_data

            if answers_list:
                # Calculate frequency distribution from answers
                answer_counts = defaultdict(int)
                for ans in answers_list:
                    answer_counts[ans] += 1

                # Convert counts to probabilities (frequencies)
                total = len(answers_list)
                freq_probs = [answer_counts.get(i+1, 0) / total for i in range(num_ratings)]

                # Calculate statistics from answers
                mean_answer = float(np.mean(answers_list))
                std_answer = float(np.std(answers_list))
                mode_answer = int(max(answer_counts.items(), key=lambda x: x[1])[0]) if answer_counts else 0

                # Calculate expected value from frequency distribution
                mean_expected_value = float(sum((i+1) * freq_probs[i] for i in range(len(freq_probs))))

                # Calculate entropy from frequency distribution
                mean_entropy = float(-sum(p * np.log(p + 1e-10) for p in freq_probs if p > 0))

                # Calculate std of probabilities (variance across rating options)
                std_probs = [0.0] * num_ratings  # No per-rating std for simple answers

                # Store in SSR-compatible format
                aggregated_distributions[category][question_id] = {
                    "mean_probabilities": freq_probs,
                    "std_probabilities": std_probs,
                    "sample_size": total,
                    "mean_mode": float(mode_answer),
                    "mean_expected_value": mean_expected_value,
                    "mean_entropy": mean_entropy,
                    # Additional metadata for ground truth
                    "answer_counts": dict(answer_counts),
                    "mean_answer": mean_answer,
                    "std_answer": std_answer,
                    "source": "uploaded_answers"
                }

    return dict(aggregated_distributions), dict(raw_distributions)


def create_sample_data(
    raw_answers: Dict,
    respondent_ids: Set[str],
    categories: Set[str],
    max_respondents: int = 5,
    max_questions_per_respondent: int = 3
) -> List[Dict]:
    """
    Create sample data for preview (first N respondents, M questions each).

    Args:
        raw_answers: Nested dict of answers
        respondent_ids: Set of respondent IDs
        categories: Set of categories
        max_respondents: Maximum number of respondents to include
        max_questions_per_respondent: Maximum questions per respondent

    Returns:
        List of sample answer dictionaries
    """
    sample_data = []
    for respondent_id in list(respondent_ids)[:max_respondents]:
        for category in list(categories):
            if category in raw_answers[respondent_id]:
                for question_id in list(raw_answers[respondent_id][category].keys())[:max_questions_per_respondent]:
                    answer_data = raw_answers[respondent_id][category][question_id]
                    sample_data.append({
                        "category": category,
                        "question_id": question_id,
                        "respondent_id": respondent_id,
                        "answer": answer_data["answer"]
                    })

    return sample_data[:10]  # Limit to 10 rows total


def parse_ground_truth_csv(csv_content: str, survey: Survey) -> ParsedGroundTruth:
    """
    Parse CSV ground truth data (simple answer format) and validate against survey structure.

    This is the main entry point that orchestrates the parsing process using
    the smaller helper functions above.

    Args:
        csv_content: CSV file content as string
        survey: Survey object to validate against

    Returns:
        ParsedGroundTruth object with validation results and distributions
    """
    try:
        # Parse CSV
        csv_file = io.StringIO(csv_content)
        reader = csv.DictReader(csv_file)
        rows = list(reader)

        # Validate structure
        validate_csv_structure(rows)

        # Parse and validate rows
        raw_answers, errors, warnings, categories, questions, respondent_ids = parse_csv_rows(rows, survey)

        # If there were validation errors, return early
        if errors:
            return ParsedGroundTruth(
                success=False,
                validation_errors=[e.to_dict() for e in errors],
                validation_warnings=[w.to_dict() for w in warnings],
                num_responses=len(rows)
            )

        # Build survey question map
        survey_questions = {q.id: q for q in survey.questions}

        # Calculate distributions
        aggregated_dist, raw_dist = calculate_distributions(
            raw_answers,
            categories,
            questions,
            respondent_ids,
            survey_questions
        )

        # Create sample data for preview
        sample_data = create_sample_data(raw_answers, respondent_ids, categories)

        # Return successful result
        return ParsedGroundTruth(
            success=True,
            format_detected="simple_answers",
            num_respondents=len(respondent_ids),
            num_questions=len(questions),
            num_categories=len(categories),
            num_responses=len(rows),
            categories=sorted(list(categories)),
            questions=sorted(list(questions)),
            sample_data=sample_data,
            validation_errors=[e.to_dict() for e in errors],
            validation_warnings=[w.to_dict() for w in warnings],
            aggregated_distributions=aggregated_dist,
            raw_distributions=raw_dist
        )

    except ValueError as e:
        # Structure validation errors
        return ParsedGroundTruth(
            success=False,
            validation_errors=[{
                "line_number": 1,
                "field": "structure",
                "message": str(e),
                "severity": "error"
            }]
        )
