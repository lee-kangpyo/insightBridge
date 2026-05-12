import pytest


from app.services.item_renderer import _format_card_value


@pytest.mark.parametrize(
    "value,spec,expected",
    [
        # rounding boundary (JS toFixed/toLocaleString is effectively HALF_UP)
        ("1.005", {"format": "number", "decimalPlaces": 2, "thousandSeparator": False}, "1.01"),
        ("-1.005", {"format": "number", "decimalPlaces": 2, "thousandSeparator": False}, "-1.01"),
        # negative zero should not be shown
        ("-0.004", {"format": "number", "decimalPlaces": 2, "thousandSeparator": False}, "0.00"),
        ("-0.0001", {"format": "number", "decimalPlaces": 0, "thousandSeparator": False}, "0"),
        # grouping on/off
        ("1234.5", {"format": "number", "decimalPlaces": 2, "thousandSeparator": True}, "1,234.50"),
        ("1234.5", {"format": "number", "decimalPlaces": 2, "thousandSeparator": False}, "1234.50"),
        # string with commas
        ("1,234.5", {"format": "number", "decimalPlaces": 1, "thousandSeparator": True}, "1,234.5"),
        # percent base conversion (0to1 => *100)
        ("0.126", {"format": "percent", "percentBase": "0to1", "decimalPlaces": 1, "thousandSeparator": False}, "12.6%"),
        ("12.6", {"format": "percent", "percentBase": "0to100", "decimalPlaces": 1, "thousandSeparator": False}, "12.6%"),
        # currency default prefix
        ("1234", {"format": "currency", "decimalPlaces": 0, "thousandSeparator": True}, "₩1,234"),
        # null display
        (None, {"format": "number", "decimalPlaces": 2, "thousandSeparator": True, "nullDisplay": "-"}, "-"),
    ],
)
def test_card_value_format_matches_frontend_rounding_and_grouping(value, spec, expected):
    assert _format_card_value(value, spec) == expected

