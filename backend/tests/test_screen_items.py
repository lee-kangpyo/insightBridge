import pytest
import sys
import os
from unittest.mock import AsyncMock, patch, MagicMock
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestMappingValidator:
    def test_valid_chart_mapping(self):
        from app.services.mapping_validator import validate_mapping_json
        
        mapping = {
            "type": "chart",
            "chartType": "bar",
            "mapping": {
                "categoryField": "base_year",
                "series": [{"field": "nmbr_tot", "name": "졸업생수"}]
            }
        }
        validate_mapping_json(mapping)  # Should not raise

    def test_valid_grid_mapping(self):
        from app.services.mapping_validator import validate_mapping_json
        
        mapping = {
            "type": "grid",
            "mapping": {
                "columns": [
                    {"field": "base_year", "header": "년도", "width": 100}
                ]
            }
        }
        validate_mapping_json(mapping)  # Should not raise

    def test_invalid_type(self):
        from app.services.mapping_validator import validate_mapping_json, MappingValidationError
        
        with pytest.raises(MappingValidationError):
            validate_mapping_json({"type": "invalid"})

    def test_missing_type(self):
        from app.services.mapping_validator import validate_mapping_json, MappingValidationError
        
        with pytest.raises(MappingValidationError):
            validate_mapping_json({"mapping": {}})

    def test_chart_missing_category_field(self):
        from app.services.mapping_validator import validate_mapping_json, MappingValidationError
        
        with pytest.raises(MappingValidationError):
            validate_mapping_json({
                "type": "chart",
                "chartType": "bar",
                "mapping": {}
            })


class TestScreenItems:
    @pytest.mark.asyncio
    async def test_create_item(self):
        from app.services.screen_items import create_item
        
        pool_mock = MagicMock()
        conn_mock = AsyncMock()
        pool_mock.acquire.return_value.__aenter__ = AsyncMock(return_value=conn_mock)
        pool_mock.acquire.return_value.__aexit__ = AsyncMock(return_value=False)
        
        conn_mock.fetchrow.return_value = {"item_id": 1}
        
        with patch("app.services.screen_items.get_pool", return_value=pool_mock):
            result = await create_item("테스트 아이템", 1, 2, {
                "type": "chart",
                "chartType": "bar",
                "mapping": {
                    "categoryField": "base_year",
                    "series": [{"field": "nmbr_tot", "name": "졸업생수"}]
                }
            })
            assert result == 1

    @pytest.mark.asyncio
    async def test_create_item_with_invalid_mapping(self):
        from app.services.screen_items import create_item
        
        with pytest.raises(ValueError, match="invalid_mapping_json"):
            await create_item("테스트", mapping_json={"type": "invalid"})

    @pytest.mark.asyncio
    async def test_get_item(self):
        from app.services.screen_items import get_item
        
        with patch("app.services.screen_items.fetch_df", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = pd.DataFrame([{
                "item_id": 1,
                "item_nm": "테스트",
                "shape_cnts_id": 1,
                "sql_cnts_id": 2,
                "mapping_json": '{"type": "chart"}',
                "reg_dt": "2024-01-01",
                "mod_dt": "2024-01-01"
            }])
            
            result = await get_item(1)
            assert result["item_id"] == 1
            assert result["mapping_json"]["type"] == "chart"

    @pytest.mark.asyncio
    async def test_list_items(self):
        from app.services.screen_items import list_items
        
        with patch("app.services.screen_items.fetch_df", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = pd.DataFrame([
                {"item_id": 1, "item_nm": "아이템1", "mapping_json": None},
                {"item_id": 2, "item_nm": "아이템2", "mapping_json": None}
            ])
            
            result = await list_items()
            assert len(result) == 2

    @pytest.mark.asyncio
    async def test_save_screen_slots(self):
        from app.services.screen_items import save_screen_slots
        
        pool_mock = MagicMock()
        conn_mock = AsyncMock()
        transaction_mock = AsyncMock()
        transaction_mock.__aenter__ = AsyncMock(return_value=None)
        transaction_mock.__aexit__ = AsyncMock(return_value=False)
        conn_mock.transaction = MagicMock(return_value=transaction_mock)
        pool_mock.acquire.return_value.__aenter__ = AsyncMock(return_value=conn_mock)
        pool_mock.acquire.return_value.__aexit__ = AsyncMock(return_value=False)
        
        with patch("app.services.screen_items.get_pool", return_value=pool_mock):
            await save_screen_slots("screen_1", [
                {"slot_id": "slot_1", "item_id": 1},
                {"slot_id": "slot_2", "item_id": None}
            ])

    @pytest.mark.asyncio
    async def test_get_screen_slots(self):
        from app.services.screen_items import get_screen_slots
        
        with patch("app.services.screen_items.fetch_df", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = pd.DataFrame([
                {"scr_id": "screen_1", "slot_id": "slot_1", "item_id": 1, "item_nm": "아이템1"}
            ])
            
            result = await get_screen_slots("screen_1")
            assert len(result) == 1
            assert result[0]["slot_id"] == "slot_1"

    @pytest.mark.asyncio
    async def test_get_screen_with_template(self):
        from app.services.screen_items import get_screen_with_template
        
        with patch("app.services.screen_items.fetch_df", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = pd.DataFrame([{
                "scr_id": "screen_1",
                "scr_nm": "테스트 화면",
                "template_id": 1
            }])
            
            result = await get_screen_with_template("screen_1")
            assert result["template_id"] == 1



