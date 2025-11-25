"""
Working analysis endpoints for S.A.G.E
These endpoints provide survey analysis functionality
"""

import numpy as np
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


def calculate_summary(run_data: Dict, survey: Any) -> Dict:
    """Calculate analysis summary - survey findings and insights"""
    distributions = run_data.get("distributions", {})

    # Build question lookup by ID
    question_map = {q.id: q for q in survey.questions}

    # Collect key findings
    key_findings = []
    question_summaries = []

    num_questions = 0
    total_respondents = run_data.get("num_profiles", 0)

    for category, cat_data in distributions.items():
        for question_id, question_data in cat_data.items():
            num_questions += 1
            question = question_map.get(question_id)
            if not question:
                continue

            # Aggregate responses for this question
            scores = []
            for respondent_id, dist_data in question_data.items():
                if "expected_value" in dist_data:
                    scores.append(dist_data["expected_value"])

            if not scores:
                continue

            mean_score = float(np.mean(scores))
            median_score = float(np.median(scores))

            # Calculate actual response distribution FIRST
            distribution = {}
            if question.type == 'likert_5':
                distribution = {
                    'Strongly Disagree': len([s for s in scores if s < 1.5]),
                    'Disagree': len([s for s in scores if 1.5 <= s < 2.5]),
                    'Neutral': len([s for s in scores if 2.5 <= s < 3.5]),
                    'Agree': len([s for s in scores if 3.5 <= s < 4.5]),
                    'Strongly Agree': len([s for s in scores if s >= 4.5]),
                }
            elif question.type == 'likert_7':
                # Use scale labels if available (scale is a LikertScale object with .labels dict)
                if question.scale and hasattr(question.scale, 'labels'):
                    try:
                        distribution = {
                            question.scale.labels[1]: len([s for s in scores if s < 1.5]),
                            question.scale.labels[2]: len([s for s in scores if 1.5 <= s < 2.5]),
                            question.scale.labels[3]: len([s for s in scores if 2.5 <= s < 3.5]),
                            question.scale.labels[4]: len([s for s in scores if 3.5 <= s < 4.5]),
                            question.scale.labels[5]: len([s for s in scores if 4.5 <= s < 5.5]),
                            question.scale.labels[6]: len([s for s in scores if 5.5 <= s < 6.5]),
                            question.scale.labels[7]: len([s for s in scores if s >= 6.5]),
                        }
                    except (KeyError, TypeError, AttributeError):
                        # Fallback to numbers if scale access fails
                        distribution = {
                            '1': len([s for s in scores if s < 1.5]),
                            '2': len([s for s in scores if 1.5 <= s < 2.5]),
                            '3': len([s for s in scores if 2.5 <= s < 3.5]),
                            '4': len([s for s in scores if 3.5 <= s < 4.5]),
                            '5': len([s for s in scores if 4.5 <= s < 5.5]),
                            '6': len([s for s in scores if 5.5 <= s < 6.5]),
                            '7': len([s for s in scores if s >= 6.5]),
                        }
                else:
                    distribution = {
                        '1': len([s for s in scores if s < 1.5]),
                        '2': len([s for s in scores if 1.5 <= s < 2.5]),
                        '3': len([s for s in scores if 2.5 <= s < 3.5]),
                        '4': len([s for s in scores if 3.5 <= s < 4.5]),
                        '5': len([s for s in scores if 4.5 <= s < 5.5]),
                        '6': len([s for s in scores if 5.5 <= s < 6.5]),
                        '7': len([s for s in scores if s >= 6.5]),
                    }
            elif question.type == 'yes_no':
                distribution = {
                    'No': len([s for s in scores if s < 1.5]),
                    'Yes': len([s for s in scores if s >= 1.5]),
                }

            # Generate finding based on question type and ACTUAL distribution
            # Extract question intent for contextual findings
            q_text_lower = question.text.lower()

            if question.type == 'likert_5':
                # Analyze 5-point scale
                strongly_agree = len([s for s in scores if s >= 4.5]) / len(scores) * 100
                agree = len([s for s in scores if 3.5 <= s < 4.5]) / len(scores) * 100
                neutral = len([s for s in scores if 2.5 <= s < 3.5]) / len(scores) * 100
                disagree = len([s for s in scores if 1.5 <= s < 2.5]) / len(scores) * 100
                strongly_disagree = len([s for s in scores if s < 1.5]) / len(scores) * 100

                # Extract the question subject for contextual finding
                # Look for common patterns like "How [adjective]...", "Do you find...", etc.
                subject = None
                if "how appealing" in q_text_lower:
                    subject = "found it appealing"
                elif "how likely" in q_text_lower and "purchase" in q_text_lower:
                    subject = "would purchase"
                elif "how likely" in q_text_lower:
                    subject = "agreed"
                elif "how much" in q_text_lower:
                    subject = "agreed"
                elif "how" in q_text_lower:
                    subject = "agreed"
                else:
                    subject = "agreed"

                # Build comprehensive summary with context
                parts = []
                if strongly_agree + agree >= 50:
                    parts.append(f"{strongly_agree + agree:.0f}% {subject}")
                    if disagree + strongly_disagree > 10:
                        parts.append(f"{disagree + strongly_disagree:.0f}% disagreed")
                    if neutral > 15:
                        parts.append(f"{neutral:.0f}% neutral")
                elif disagree + strongly_disagree >= 50:
                    parts.append(f"{disagree + strongly_disagree:.0f}% disagreed")
                    if strongly_agree + agree > 10:
                        parts.append(f"{strongly_agree + agree:.0f}% {subject}")
                    if neutral > 15:
                        parts.append(f"{neutral:.0f}% neutral")
                else:
                    # Mixed responses
                    if strongly_agree + agree > 10:
                        parts.append(f"{strongly_agree + agree:.0f}% {subject}")
                    if neutral > 15:
                        parts.append(f"{neutral:.0f}% neutral")
                    if disagree + strongly_disagree > 10:
                        parts.append(f"{disagree + strongly_disagree:.0f}% disagreed")

                finding = ", ".join(parts) if parts else f"Mean: {mean_score:.1f}/5"

            elif question.type == 'likert_7':
                # Use the actual distribution labels and counts
                n = len(scores)
                parts = []

                # Extract context from question for better reporting
                context_phrase = ""
                if "how much excitement" in q_text_lower:
                    context_phrase = "rated excitement as "
                elif "how much" in q_text_lower or "how" in q_text_lower:
                    context_phrase = "responded "

                # Sort by count (descending) to report most common responses first
                sorted_dist = sorted(distribution.items(), key=lambda x: x[1], reverse=True)

                # Report responses that have >10% or are in top 3
                for idx, (label, count) in enumerate(sorted_dist):
                    pct = (count / n) * 100
                    if pct > 10 or idx < 3:  # Report if >10% or in top 3
                        if count > 0:  # Only report non-zero
                            parts.append(f"{pct:.0f}% {context_phrase}{label}")

                finding = ", ".join(parts) if parts else f"Mean: {mean_score:.1f}/7"

            elif question.type == 'yes_no':
                # Analyze yes/no
                yes_pct = len([s for s in scores if s >= 1.5]) / len(scores) * 100
                no_pct = 100 - yes_pct

                # Extract the question subject for contextual finding
                subject = None
                if "does this design look trustworthy" in q_text_lower or "does the design look trustworthy" in q_text_lower:
                    subject = "thought the design looked trustworthy and legitimate"
                elif "does" in q_text_lower or "is" in q_text_lower:
                    # Extract the predicate from the question
                    subject = "answered Yes"
                else:
                    subject = "answered Yes"

                if yes_pct >= 90:
                    if subject == "answered Yes":
                        finding = f"{yes_pct:.0f}% answered 'Yes'"
                    else:
                        finding = f"{yes_pct:.0f}% {subject}"
                elif no_pct >= 90:
                    finding = f"{no_pct:.0f}% answered 'No'"
                else:
                    finding = f"{yes_pct:.0f}% Yes, {no_pct:.0f}% No"

            elif question.type == 'preference_scale':
                # For category comparison questions
                if category != "General":
                    finding = f"Average rating: {mean_score:.1f} out of {question.scale and len(question.scale) or 10}"
                else:
                    finding = f"Mean response: {mean_score:.1f}"
            else:
                finding = f"Mean response: {mean_score:.1f}"

            question_summaries.append({
                'question': question.text,
                'question_id': question_id,
                'category': category,
                'type': question.type,
                'mean': mean_score,
                'median': median_score,
                'finding': finding,
                'n': len(scores),
                'distribution': distribution
            })

    # Generate top-level insights
    insights = []

    # Calculate normalized scores (as percentage of scale) for comparison
    for qs in question_summaries:
        # Determine max scale value
        if qs['type'] == 'likert_5':
            max_val = 5
            min_val = 1
        elif qs['type'] == 'likert_7':
            max_val = 7
            min_val = 1
        elif qs['type'] == 'yes_no':
            max_val = 2
            min_val = 1
        else:
            # For other types, estimate from question scale
            question = question_map.get(qs['question_id'])
            if question and question.scale:
                max_val = len(question.scale)
                min_val = 1
            else:
                max_val = 10
                min_val = 1

        # Normalize to 0-100%
        qs['normalized_score'] = ((qs['mean'] - min_val) / (max_val - min_val)) * 100

    # Most positive question (by normalized score)
    if question_summaries:
        top_question = max(question_summaries, key=lambda x: x['normalized_score'])
        insights.append(f"Most positive response: \"{top_question['question'][:80]}...\" ({top_question['normalized_score']:.0f}% of scale)")

        # Most negative question
        bottom_question = min(question_summaries, key=lambda x: x['normalized_score'])
        insights.append(f"Most negative response: \"{bottom_question['question'][:80]}...\" ({bottom_question['normalized_score']:.0f}% of scale)")

    # Category comparison if applicable - normalize within each category
    if survey.has_categories():
        category_data = {}
        for qs in question_summaries:
            cat = qs['category']
            if cat not in category_data:
                category_data[cat] = []
            category_data[cat].append(qs['normalized_score'])

        category_avgs = {cat: np.mean(scores) for cat, scores in category_data.items()}
        if len(category_avgs) > 1:
            best_cat = max(category_avgs.items(), key=lambda x: x[1])
            worst_cat = min(category_avgs.items(), key=lambda x: x[1])

            # Calculate preference percentage
            diff = best_cat[1] - worst_cat[1]
            insights.append(f"Respondents preferred '{best_cat[0]}' over '{worst_cat[0]}' by {diff:.0f} percentage points")

            # Show all category rankings if 3+
            if len(category_avgs) >= 3:
                sorted_cats = sorted(category_avgs.items(), key=lambda x: x[1], reverse=True)
                ranking = " > ".join([f"{cat} ({score:.0f}%)" for cat, score in sorted_cats[:5]])
                insights.append(f"Category ranking: {ranking}")

    # Check capabilities
    has_categories = survey.has_categories()
    has_demographics = False

    # Check if any distribution has demographic fields
    for category, cat_data in distributions.items():
        for question_id, question_data in cat_data.items():
            for respondent_id, dist_data in question_data.items():
                if "gender" in dist_data or "age_group" in dist_data:
                    has_demographics = True
                    break
            if has_demographics:
                break
        if has_demographics:
            break

    # Identify demographic fields
    demographic_fields = []
    if has_demographics:
        # Check first response for available fields
        for category, cat_data in distributions.items():
            for question_id, question_data in cat_data.items():
                for respondent_id, dist_data in question_data.items():
                    if "gender" in dist_data:
                        demographic_fields.append("gender")
                    if "age_group" in dist_data:
                        demographic_fields.append("age_group")
                    if "occupation" in dist_data:
                        demographic_fields.append("occupation")
                    if "persona_group" in dist_data:
                        demographic_fields.append("persona_group")
                    break
                break
            break

    return {
        "context": {
            "survey_type": "MULTI_CATEGORY" if has_categories else "GENERAL",
            "has_categories": has_categories,
            "has_demographics": has_demographics,
            "demographic_fields": list(set(demographic_fields)),
            "num_questions": num_questions,
            "sample_size": total_respondents
        },
        "has_categories": has_categories,
        "has_demographics": has_demographics,
        "executive_summary": {
            "total_questions": num_questions,
            "total_respondents": total_respondents,
            "key_insights": insights,
            "question_findings": question_summaries
        }
    }


def calculate_question_analysis(run_data: Dict, survey: Any) -> List[Dict]:
    """Calculate question-level analysis"""
    distributions = run_data.get("distributions", {})
    question_analyses = []

    # Group by question
    questions_by_id = {}
    for category, cat_data in distributions.items():
        for question_id, question_data in cat_data.items():
            if question_id not in questions_by_id:
                questions_by_id[question_id] = []

            for respondent_id, dist_data in question_data.items():
                questions_by_id[question_id].append(dist_data)

    # Calculate metrics for each question
    for question in survey.questions:
        q_id = question.id
        if q_id not in questions_by_id:
            continue

        responses = questions_by_id[q_id]
        scores = [r["expected_value"] for r in responses if "expected_value" in r]

        if not scores:
            continue

        mean_score = float(np.mean(scores))
        std_score = float(np.std(scores))

        # Top/bottom box
        top_box = (len([s for s in scores if s >= 6]) / len(scores) * 100) if scores else 0
        bottom_box = (len([s for s in scores if s <= 2]) / len(scores) * 100) if scores else 0

        # Calculate 95% confidence interval
        from scipy import stats as scipy_stats
        import math
        if len(scores) > 1:
            ci = scipy_stats.t.interval(0.95, len(scores)-1, loc=mean_score, scale=scipy_stats.sem(scores))
            ci_95_lower = float(ci[0]) if not math.isnan(ci[0]) else mean_score
            ci_95_upper = float(ci[1]) if not math.isnan(ci[1]) else mean_score
        else:
            ci_95_lower = mean_score
            ci_95_upper = mean_score

        # Assign grade (assuming 1-7 scale)
        if mean_score >= 6.0:
            grade = "A"
        elif mean_score >= 5.5:
            grade = "A-"
        elif mean_score >= 5.0:
            grade = "B+"
        elif mean_score >= 4.5:
            grade = "B"
        elif mean_score >= 4.0:
            grade = "C+"
        elif mean_score >= 3.5:
            grade = "C"
        else:
            grade = "D"

        # Calculate probability distribution
        if "probabilities" in responses[0]:
            prob_arrays = [r["probabilities"] for r in responses]
            mean_distribution = np.mean(prob_arrays, axis=0).tolist()
        else:
            mean_distribution = []

        # Get category from question
        category = question.category if hasattr(question, 'category') else None

        question_analyses.append({
            "question_id": q_id,
            "question_text": question.text,
            "mean": mean_score,
            "std": std_score,
            "top_box_pct": top_box,
            "bottom_box_pct": bottom_box,
            "net_score": top_box - bottom_box,
            "sample_size": len(scores),
            "mean_distribution": mean_distribution,
            "ci_95_lower": ci_95_lower,
            "ci_95_upper": ci_95_upper,
            "grade": grade,
            "category": category
        })

    return question_analyses


def calculate_category_comparison(run_data: Dict, survey: Any) -> Dict:
    """Calculate category comparison"""
    if not survey.has_categories():
        return {}

    distributions = run_data.get("distributions", {})
    category_data = {}

    # Calculate metrics for each category
    for category_obj in survey.categories:
        cat_name = category_obj.name
        cat_id = category_obj.id

        # Find data for this category
        cat_data = distributions.get(cat_id, {})

        scores = []
        question_scores = {}  # Track scores by question

        for question_id, question_data in cat_data.items():
            q_scores = []
            for respondent_id, dist_data in question_data.items():
                if "expected_value" in dist_data:
                    score = dist_data["expected_value"]
                    scores.append(score)
                    q_scores.append(score)

            if q_scores:
                question_scores[question_id] = {
                    "mean": float(np.mean(q_scores)),
                    "question_id": question_id
                }

        if scores:
            # Sort questions by mean score
            sorted_questions = sorted(question_scores.items(), key=lambda x: x[1]["mean"], reverse=True)

            category_data[cat_name] = {
                "name": cat_name,
                "mean": float(np.mean(scores)),
                "std": float(np.std(scores)),
                "sample_size": len(scores),
                "num_questions": len(question_scores),
                "top_questions": [
                    {"question_id": q_id, "mean": data["mean"]}
                    for q_id, data in sorted_questions[:3]
                ],
                "bottom_questions": [
                    {"question_id": q_id, "mean": data["mean"]}
                    for q_id, data in sorted_questions[-3:]
                ]
            }

    # Find winner and rank categories
    if category_data:
        ranked = sorted(category_data.items(), key=lambda x: x[1]["mean"], reverse=True)

        # Add rank to each category
        ranked_categories = []
        for rank, (cat_name, data) in enumerate(ranked, 1):
            data["rank"] = rank
            ranked_categories.append(data)

        winner_name = ranked[0][0]
        winner_data = ranked[0][1]

        return {
            "winner": {
                "name": winner_name,
                "mean": winner_data["mean"],
                "sample_size": winner_data["sample_size"]
            },
            "ranked_categories": ranked_categories,
            "category_performance": {name: data for name, data in category_data.items()}
        }

    return {}


def calculate_demographic_analysis(run_data: Dict, survey: Any, demographic_field: str) -> Dict:
    """Calculate distribution analysis broken down by a demographic field"""
    from scipy import stats as scipy_stats
    from collections import Counter

    distributions = run_data.get("distributions", {})

    # Build question info map (type and scale labels)
    question_info = {}
    for question in survey.questions:
        scale_labels = {}
        if hasattr(question, 'scale') and question.scale:
            scale_labels = question.scale
        question_info[question.id] = {
            "type": question.type,
            "text": question.text,
            "scale": scale_labels
        }

    # Group raw response distributions by demographic value
    demographic_distributions = {}

    for category, cat_data in distributions.items():
        for question_id, question_data in cat_data.items():
            q_info = question_info.get(question_id, {})

            for respondent_id, dist_data in question_data.items():
                demo_value = dist_data.get(demographic_field, 'Unknown')
                if demo_value not in demographic_distributions:
                    demographic_distributions[demo_value] = {}

                if question_id not in demographic_distributions[demo_value]:
                    demographic_distributions[demo_value][question_id] = {
                        "question_text": q_info.get("text", question_id),
                        "question_type": q_info.get("type", "likert_7"),
                        "scale_labels": q_info.get("scale", {}),
                        "responses": []
                    }

                # Store the probability distribution
                if "probabilities" in dist_data:
                    demographic_distributions[demo_value][question_id]["responses"].append({
                        "probabilities": dist_data["probabilities"],
                        "expected_value": dist_data.get("expected_value")
                    })

    # Calculate aggregate distributions for each demographic segment
    segment_data = {}

    for demo_value, questions in demographic_distributions.items():
        segment_data[demo_value] = {
            "sample_size": 0,
            "questions": []
        }

        for question_id, q_data in questions.items():
            responses = q_data["responses"]
            sample_size = len(responses)
            segment_data[demo_value]["sample_size"] = max(segment_data[demo_value]["sample_size"], sample_size)

            # Aggregate distributions across all responses for this question
            if responses:
                # Average the probability distributions
                aggregated_probs = []
                for response in responses:
                    probs = response["probabilities"]
                    if not aggregated_probs:
                        aggregated_probs = [0.0] * len(probs)
                    for i, prob in enumerate(probs):
                        aggregated_probs[i] += prob

                # Normalize to average
                aggregated_probs = [p / len(responses) for p in aggregated_probs]

                segment_data[demo_value]["questions"].append({
                    "question_id": question_id,
                    "question_text": q_data["question_text"],
                    "question_type": q_data["question_type"],
                    "scale_labels": q_data["scale_labels"],
                    "probabilities": aggregated_probs,
                    "sample_size": sample_size
                })

    # Perform statistical tests if we have 2+ segments
    statistical_tests = {}
    if len(segment_data) >= 2:
        from scipy.stats import chi2_contingency

        # For each question, test if distributions differ across segments
        all_question_ids = set()
        for demo_value, data in segment_data.items():
            for q in data["questions"]:
                all_question_ids.add(q["question_id"])

        for question_id in all_question_ids:
            # Build contingency table
            segments_list = []
            observed = []

            for demo_value, data in segment_data.items():
                q_data = next((q for q in data["questions"] if q["question_id"] == question_id), None)
                if q_data:
                    segments_list.append(demo_value)
                    # Convert probabilities to counts
                    probs = q_data["probabilities"]
                    sample_size = q_data["sample_size"]
                    counts = [prob * sample_size for prob in probs]
                    observed.append(counts)

            if len(observed) >= 2:
                try:
                    chi2, p_value, dof, expected = chi2_contingency(observed)
                    statistical_tests[question_id] = {
                        "chi2": float(chi2),
                        "p_value": float(p_value),
                        "significant": bool(p_value < 0.05)
                    }
                except:
                    pass

    return {
        "demographic_field": demographic_field,
        "segments": segment_data,
        "statistical_tests": statistical_tests
    }


def get_insights_stub(run_data: Dict, survey: Any) -> Dict:
    """Generate simple insights"""
    summary = calculate_summary(run_data, survey)
    exec_summary = summary["executive_summary"]

    # Return the key insights already generated by calculate_summary
    return {
        "key_insights": exec_summary.get("key_insights", []),
        "summary": f"Survey completed with {exec_summary['total_respondents']} respondents across {exec_summary['total_questions']} questions."
    }
