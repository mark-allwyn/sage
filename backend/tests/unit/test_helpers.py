"""
Unit Tests for Helper Functions in main.py

Tests for utility functions extracted during refactoring.
"""
import pytest
from ssr_core.llm_client import Response, RespondentProfile


class TestBuildResponseLookup:
    """Tests for build_response_lookup function (N+1 optimization)"""

    def test_empty_responses(self):
        """Test with empty response list"""
        from main import build_response_lookup

        result = build_response_lookup([])
        assert result == {}

    def test_single_response(self):
        """Test with a single response"""
        from main import build_response_lookup

        response = Response(
            respondent_id="resp_1",
            question_id="q1",
            response_text="Test",
            category="general",
            respondent_profile=RespondentProfile(id="resp_1", characteristics={})
        )

        result = build_response_lookup([response])
        assert len(result) == 1
        assert ("resp_1", "q1") in result
        assert result[("resp_1", "q1")] == response

    def test_multiple_responses(self):
        """Test with multiple responses"""
        from main import build_response_lookup

        responses = [
            Response(
                respondent_id=f"resp_{i}",
                question_id=f"q{i}",
                response_text=f"Test {i}",
                category="general",
                respondent_profile=RespondentProfile(id=f"resp_{i}", characteristics={})
            )
            for i in range(5)
        ]

        result = build_response_lookup(responses)
        assert len(result) == 5
        for i in range(5):
            key = (f"resp_{i}", f"q{i}")
            assert key in result
            assert result[key].respondent_id == f"resp_{i}"
            assert result[key].question_id == f"q{i}"

    def test_lookup_performance(self):
        """Test O(1) lookup performance"""
        from main import build_response_lookup

        # Create 1000 responses
        responses = [
            Response(
                respondent_id=f"resp_{i}",
                question_id=f"q{i % 10}",  # 10 questions
                response_text=f"Test {i}",
                category="general",
                respondent_profile=RespondentProfile(id=f"resp_{i}", characteristics={})
            )
            for i in range(1000)
        ]

        lookup = build_response_lookup(responses)

        # Verify we can retrieve any response in O(1)
        assert lookup[("resp_500", "q0")].respondent_id == "resp_500"
        assert lookup[("resp_999", "q9")].respondent_id == "resp_999"

    def test_duplicate_keys_last_wins(self):
        """Test that duplicate (respondent_id, question_id) keeps last value"""
        from main import build_response_lookup

        responses = [
            Response(
                respondent_id="resp_1",
                question_id="q1",
                response_text="First",
                category="general",
                respondent_profile=RespondentProfile(id="resp_1", characteristics={})
            ),
            Response(
                respondent_id="resp_1",
                question_id="q1",
                response_text="Second",
                category="general",
                respondent_profile=RespondentProfile(id="resp_1", characteristics={})
            ),
        ]

        result = build_response_lookup(responses)
        assert len(result) == 1
        assert result[("resp_1", "q1")].response_text == "Second"


class TestConvertNumpyTypes:
    """Tests for convert_numpy_types function"""

    def test_converts_numpy_integer(self):
        """Test conversion of numpy integers"""
        import numpy as np
        from main import convert_numpy_types

        assert convert_numpy_types(np.int64(42)) == 42
        assert isinstance(convert_numpy_types(np.int64(42)), int)

    def test_converts_numpy_float(self):
        """Test conversion of numpy floats"""
        import numpy as np
        from main import convert_numpy_types

        assert convert_numpy_types(np.float64(3.14)) == 3.14
        assert isinstance(convert_numpy_types(np.float64(3.14)), float)

    def test_converts_nan_to_none(self):
        """Test that NaN values become None"""
        import numpy as np
        from main import convert_numpy_types

        assert convert_numpy_types(np.float64(np.nan)) is None

    def test_converts_nested_dict(self):
        """Test conversion of nested dictionaries"""
        import numpy as np
        from main import convert_numpy_types

        data = {
            "int": np.int64(42),
            "float": np.float64(3.14),
            "nested": {
                "value": np.int32(100)
            }
        }

        result = convert_numpy_types(data)
        assert result["int"] == 42
        assert isinstance(result["int"], int)
        assert result["nested"]["value"] == 100

    def test_converts_list(self):
        """Test conversion of lists"""
        import numpy as np
        from main import convert_numpy_types

        data = [np.int64(1), np.int64(2), np.int64(3)]
        result = convert_numpy_types(data)

        assert result == [1, 2, 3]
        assert all(isinstance(x, int) for x in result)
