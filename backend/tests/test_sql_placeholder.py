import pytest

from app.utils.sql_placeholder import substitute_placeholders


def test_normal_substitution():
    sql = "SELECT * FROM t WHERE base_year = '{{base_year}}'"
    result = substitute_placeholders(sql, {"base_year": 2025})
    assert result == "SELECT * FROM t WHERE base_year = '2025'"


def test_multiple_occurrences():
    sql = "WHERE a = {{base_year}} AND b = {{base_year}}"
    result = substitute_placeholders(sql, {"base_year": 2024})
    assert result == "WHERE a = 2024 AND b = 2024"


def test_unknown_placeholder_rejected():
    sql = "SELECT * FROM t WHERE x = '{{unknown_var}}'"
    with pytest.raises(ValueError, match="Unknown placeholder"):
        substitute_placeholders(sql, {"unknown_var": "test"})


def test_out_of_range_rejected():
    sql = "SELECT * FROM t WHERE base_year = {{base_year}}"
    with pytest.raises(ValueError, match="out of range"):
        substitute_placeholders(sql, {"base_year": 100})


def test_non_integer_rejected():
    sql = "SELECT * FROM t WHERE base_year = {{base_year}}"
    with pytest.raises(ValueError, match="Invalid integer"):
        substitute_placeholders(sql, {"base_year": "abc"})


def test_no_placeholder_passes_through():
    sql = "SELECT * FROM t"
    result = substitute_placeholders(sql, {"base_year": 2025})
    assert result == sql


def test_none_ctx_passes_through():
    sql = "SELECT * FROM t WHERE base_year = {{base_year}}"
    result = substitute_placeholders(sql, None)
    assert result == sql


def test_empty_ctx_with_no_placeholder_passes_through():
    sql = "SELECT * FROM t"
    result = substitute_placeholders(sql, {})
    assert result == sql


def test_missing_value_rejected():
    sql = "SELECT * FROM t WHERE base_year = {{base_year}}"
    with pytest.raises(ValueError, match="Missing value"):
        substitute_placeholders(sql, {})
