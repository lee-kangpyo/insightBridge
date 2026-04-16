import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from app.services.chain import (
    _levenshtein_distance,
    _find_closest_column,
    validate_chart_config,
    _format_numeric_value,
    _format_dataframe_numbers,
)


class TestLevenshteinDistance:
    def test_same_strings(self):
        assert _levenshtein_distance("hello", "hello") == 0

    def test_one_char_diff(self):
        assert _levenshtein_distance("hello", "hallo") == 1

    def test_insertion(self):
        assert _levenshtein_distance("hello", "helllo") == 1

    def test_deletion(self):
        assert _levenshtein_distance("hello", "helo") == 1

    def test_completely_different(self):
        assert _levenshtein_distance("abc", "xyz") == 3

    def test_empty_string(self):
        assert _levenshtein_distance("", "abc") == 3
        assert _levenshtein_distance("abc", "") == 3

    def test_korean_strings(self):
        assert _levenshtein_distance("학교", "학교") == 0
        assert _levenshtein_distance("학교", "학교명") == 1


class TestFindClosestColumn:
    def test_exact_match(self):
        cols = ["base_year", "schl_nm", "dropout_rate"]
        assert _find_closest_column("schl_nm", cols) == "schl_nm"

    def test_typo_match(self):
        cols = ["base_year", "schl_nm", "dropout_rate"]
        assert _find_closest_column("schlname", cols) == "schl_nm"

    def test_no_match_above_threshold(self):
        cols = ["base_year", "schl_nm", "dropout_rate"]
        assert _find_closest_column("xyz", cols) is None

    def test_missing_in_list(self):
        cols = ["base_year", "schl_nm", "dropout_rate"]
        assert _find_closest_column("missing", cols) is None

    def test_case_sensitive(self):
        cols = ["base_year", "schl_nm"]
        assert _find_closest_column("SCHL_NM", cols) == "schl_nm"


class TestValidateChartConfig:
    def test_none_config(self):
        df = pd.DataFrame({"a": [1, 2, 3], "b": [4, 5, 6]})
        assert validate_chart_config(None, df) is None

    def test_empty_config(self):
        df = pd.DataFrame({"a": [1, 2, 3], "b": [4, 5, 6]})
        assert validate_chart_config({}, df) is not None

    def test_exact_column_match(self):
        df = pd.DataFrame({"base_year": [2020, 2021], "dropout_rate": [1.5, 2.0]})
        config = {"type": "line", "x": "base_year", "y": "dropout_rate"}
        result = validate_chart_config(config, df)
        assert result["x"] == "base_year"
        assert result["y"] == "dropout_rate"

    def test_typo_column_x_match(self):
        df = pd.DataFrame({"base_year": [2020, 2021], "dropout_rate": [1.5, 2.0]})
        config = {"type": "line", "x": "baseyear", "y": "dropout_rate"}
        result = validate_chart_config(config, df)
        assert result["x"] == "base_year"

    def test_typo_column_y_match(self):
        df = pd.DataFrame({"base_year": [2020, 2021], "dropout_rate": [1.5, 2.0]})
        config = {"type": "line", "x": "base_year", "y": "dropoutrate"}
        result = validate_chart_config(config, df)
        assert result["y"] == "dropout_rate"

    def test_group_field_matched(self):
        df = pd.DataFrame(
            {"base_year": [2020], "dropout_rate": [1.5], "schl_nm": ["서울대"]}
        )
        config = {
            "type": "line",
            "x": "base_year",
            "y": "dropout_rate",
            "group": "school_name",
        }
        result = validate_chart_config(config, df)
        assert result["group"] == "schl_nm"

    def test_invalid_type_fallback_to_bar(self):
        df = pd.DataFrame({"a": [1, 2], "b": [3, 4]})
        config = {"type": "invalid_type", "x": "a", "y": "b"}
        result = validate_chart_config(config, df)
        assert result["type"] == "bar"

    def test_all_null_column_excluded_from_y(self):
        df = pd.DataFrame({"x_col": [1, 2], "y_good": [3, 4], "y_bad": [None, None]})
        config = {"type": "line", "x": "x_col", "y": "y_bad,y_good"}
        result = validate_chart_config(config, df)
        assert result["y"] == "y_good"

    def test_multi_series_y_columns(self):
        df = pd.DataFrame({"x": [1, 2], "col_a": [3, 4], "col_b": [5, 6]})
        config = {"type": "line", "x": "x", "y": "col_a,col_b"}
        result = validate_chart_config(config, df)
        assert result["y"] == "col_a,col_b"

    def test_none_chart_config_returns_none(self):
        df = pd.DataFrame({"a": [1]})
        assert validate_chart_config(None, df) is None


class TestFormatNumericValue:
    def test_integer_value(self):
        assert _format_numeric_value(100.0) == 100

    def test_float_value(self):
        assert _format_numeric_value(1.5) == 1.5

    def test_trailing_zeros_removed(self):
        assert _format_numeric_value(1.50) == 1.5

    def test_many_decimal_places(self):
        result = _format_numeric_value(1.2345678900)
        assert result == 1.23456789

    def test_whole_number_from_float(self):
        assert _format_numeric_value(42.000) == 42

    def test_none_value(self):
        assert _format_numeric_value(None) is None

    def test_string_number(self):
        assert _format_numeric_value("123.45") == 123.45

    def test_invalid_string(self):
        assert _format_numeric_value("not_a_number") == "not_a_number"


class TestFormatDataframeNumbers:
    def test_integers_preserved(self):
        df = pd.DataFrame({"a": [1, 2, 3], "b": [4, 5, 6]})
        result = _format_dataframe_numbers(df)
        assert result["a"].tolist() == [1, 2, 3]

    def test_floats_cleaned(self):
        df = pd.DataFrame({"a": [1.0, 2.0, 3.0], "b": [1.5, 2.5, 3.5]})
        result = _format_dataframe_numbers(df)
        assert result["a"].tolist() == [1, 2, 3]
        assert result["b"].tolist() == [1.5, 2.5, 3.5]

    def test_null_handled(self):
        df = pd.DataFrame({"a": [1.0, None, 3.0]})
        result = _format_dataframe_numbers(df)
        assert pd.isna(result["a"][1]) or result["a"][1] is None

    def test_string_columns_unchanged(self):
        df = pd.DataFrame({"a": ["hello", "world"], "b": [1, 2]})
        result = _format_dataframe_numbers(df)
        assert result["a"].tolist() == ["hello", "world"]
