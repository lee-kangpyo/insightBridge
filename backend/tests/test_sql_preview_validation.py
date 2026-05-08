import pytest

from app.utils.sql_preview_validation import prepare_admin_sql_preview


def test_prepare_select_wraps_limit():
    out = prepare_admin_sql_preview("  SELECT 1 AS x  ")
    assert "LIMIT 101" in out
    assert out.startswith("(")


def test_prepare_respects_existing_limit():
    out = prepare_admin_sql_preview("select 1 limit 5")
    assert out == "select 1 limit 5"


def test_prepare_rejects_insert():
    with pytest.raises(ValueError, match="only SELECT"):
        prepare_admin_sql_preview("insert into t values (1)")


def test_prepare_rejects_multi_statement():
    with pytest.raises(ValueError, match="single statement"):
        prepare_admin_sql_preview("select 1; select 2")


def test_prepare_allows_with_select():
    out = prepare_admin_sql_preview("with a as (select 1) select * from a")
    assert "LIMIT 101" in out


def test_prepare_empty():
    with pytest.raises(ValueError, match="empty_sql"):
        prepare_admin_sql_preview("   ")


def test_prepare_invalid_syntax():
    with pytest.raises(ValueError, match="invalid_sql"):
        prepare_admin_sql_preview("select * from")
