import json
from typing import Any, Optional


class MappingValidationError(ValueError):
    pass


def validate_mapping_json(mapping_json: Optional[dict[str, Any]]) -> None:
    """
    mapping_json 스키마를 검증합니다.
    
    Raises:
        MappingValidationError: 스키마가 올바르지 않은 경우
    """
    if mapping_json is None:
        return
    
    if not isinstance(mapping_json, dict):
        raise MappingValidationError("mapping_json must be an object")
    
    item_type = mapping_json.get("type")
    if item_type is None:
        raise MappingValidationError("mapping_json must have a 'type' field")
    
    if item_type not in ("chart", "grid", "card"):
        raise MappingValidationError(f"Invalid type: {item_type}. Must be one of: chart, grid, card")
    
    mapping = mapping_json.get("mapping")
    if mapping is not None and not isinstance(mapping, dict):
        raise MappingValidationError("mapping must be an object")
    
    if item_type == "chart":
        _validate_chart_mapping(mapping_json)
    elif item_type == "grid":
        _validate_grid_mapping(mapping_json)
    elif item_type == "card":
        _validate_card_mapping(mapping_json)


def _validate_chart_mapping(mapping_json: dict) -> None:
    chart_type = mapping_json.get("chartType")
    if chart_type is None:
        raise MappingValidationError("chart mapping must have a 'chartType' field")

    valid_chart_types = ("bar", "line", "pie", "area", "stacked_bar", "scatter", "donut", "treemap")
    if chart_type not in valid_chart_types:
        raise MappingValidationError(f"Invalid chartType: {chart_type}")

    mapping = mapping_json.get("mapping", {})
    if not isinstance(mapping, dict):
        raise MappingValidationError("chart mapping must have a 'mapping' object")

    if "categoryField" not in mapping:
        raise MappingValidationError("chart mapping must have a 'categoryField'")

    series = mapping.get("series")
    if series is not None:
        if isinstance(series, list):
            for i, s in enumerate(series):
                if not isinstance(s, dict):
                    raise MappingValidationError(f"series[{i}] must be an object")
                if "field" not in s:
                    raise MappingValidationError(f"series[{i}] must have a 'field'")
        elif isinstance(series, dict):
            for key, s in series.items():
                if not isinstance(s, dict):
                    raise MappingValidationError(f"series[{key}] must be an object")
                if "field" not in s:
                    raise MappingValidationError(f"series[{key}] must have a 'field'")
        else:
            raise MappingValidationError("series must be an array or object")


def _validate_grid_mapping(mapping_json: dict) -> None:
    mapping = mapping_json.get("mapping", {})
    if not isinstance(mapping, dict):
        raise MappingValidationError("grid mapping must have a 'mapping' object")

    columns = mapping.get("columns")
    if columns is not None:
        if isinstance(columns, list):
            for i, col in enumerate(columns):
                if not isinstance(col, dict):
                    raise MappingValidationError(f"columns[{i}] must be an object")
                if "field" not in col:
                    raise MappingValidationError(f"columns[{i}] must have a 'field'")
        elif isinstance(columns, dict):
            for key, col in columns.items():
                if not isinstance(col, dict):
                    raise MappingValidationError(f"columns[{key}] must be an object")
                if "field" not in col:
                    raise MappingValidationError(f"columns[{key}] must have a 'field'")
        else:
            raise MappingValidationError("columns must be an array or object")


def _validate_card_mapping(mapping_json: dict) -> None:
    mapping = mapping_json.get("mapping", {})
    if not isinstance(mapping, dict):
        raise MappingValidationError("card mapping must have a 'mapping' object")

    if "value" not in mapping and "items" not in mapping:
        raise MappingValidationError("card mapping must have 'value' or 'items'")

    items = mapping.get("items")
    if items is not None:
        if isinstance(items, list):
            for i, item in enumerate(items):
                if not isinstance(item, dict):
                    raise MappingValidationError(f"items[{i}] must be an object")
                if "field" not in item:
                    raise MappingValidationError(f"items[{i}] must have a 'field'")
        elif isinstance(items, dict):
            for key, item in items.items():
                if not isinstance(item, dict):
                    raise MappingValidationError(f"items[{key}] must be an object")
                if "field" not in item:
                    raise MappingValidationError(f"items[{key}] must have a 'field'")
        else:
            raise MappingValidationError("items must be an array or object")
