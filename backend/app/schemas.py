from pydantic import BaseModel
from typing import Any, Optional


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    data: Optional[list[dict[str, Any]]] = None
    sql: Optional[str] = None
    message: Optional[str] = None


class SchoolItem(BaseModel):
    school_name: str
    school_code: str
    establishment_type: str
    region: str


class IndicatorItem(BaseModel):
    id: str
    label: str


class RankingItem(BaseModel):
    indicator: str
    value: Any
    rank: Optional[int]


class ComparisonResponse(BaseModel):
    school_name: str
    year: int
    rankings: list[RankingItem]


class OverviewUnit(BaseModel):
    xUnitCode: str
    yUnitCode: str


class OverviewMatrixPoint(BaseModel):
    id: str
    name: str
    x: float
    y: float
    colorHex: str
    quadrantCode: str
    quadrantName: str
    rawX: float
    rawY: float
    xDisplayText: str
    yDisplayText: str
    unit: OverviewUnit


class OverviewMatrixResponse(BaseModel):
    title: str
    xAxisLabel: str
    yAxisLabel: str
    points: list[OverviewMatrixPoint]


class RiskTableIndicator(BaseModel):
    code: str
    name: str
    year: int
    displayOrder: int


class RiskTableCell(BaseModel):
    valueNum: float
    displayText: str
    unitCode: str
    statusCode: str
    statusName: str
    colorHex: str
    comparisonDirectionCode: str


class RiskTableJudgment(BaseModel):
    displayText: str
    statusCode: str
    statusName: str
    colorHex: str


class RiskTableRow(BaseModel):
    indicator: RiskTableIndicator
    regional: RiskTableCell
    national: RiskTableCell
    overall: RiskTableJudgment


class RiskTableLegendItem(BaseModel):
    statusCode: str
    statusName: str
    colorHex: str


class OverviewRiskTableResponse(BaseModel):
    title: str
    items: list[RiskTableRow]
    legend: list[RiskTableLegendItem]
