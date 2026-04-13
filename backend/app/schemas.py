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


class OverviewKpiComparison(BaseModel):
    value: str
    status: str


class OverviewLargeKpiItem(BaseModel):
    id: str
    label: str
    value: str
    year: int
    accentColor: str
    regionalComparison: OverviewKpiComparison
    nationalComparison: OverviewKpiComparison


class OverviewSmallKpiItem(BaseModel):
    id: str
    label: str
    value: str
    subLabel: str
    status: str


class OverviewKpisResponse(BaseModel):
    large: list[OverviewLargeKpiItem]
    small: list[OverviewSmallKpiItem]


class OverviewDetailGridItem(BaseModel):
    metricCode: str
    metricName: str
    metricYear: int
    displayOrder: int
    metricUnitCode: str
    metricUnitName: str

    myValueNum: float
    myValueDisplay: str

    regionAvgNum: float
    regionAvgDisplay: str

    nationalAvgNum: float
    nationalAvgDisplay: str

    sourceTableName: str
    sourceColumnExpr: str


class OverviewDetailGridResponse(BaseModel):
    title: str
    items: list[OverviewDetailGridItem]


class OverviewProgressMetricItem(BaseModel):
    label: str
    current: str
    target: str
    percentage: int
    color: str


class OverviewProgressMetricsResponse(BaseModel):
    title: str
    items: list[OverviewProgressMetricItem]


class OverviewInsightsResponse(BaseModel):
    title: str
    strengths: Optional[str] = None
    risks: Optional[str] = None
    actions: list[str] = []


class InsightLine(BaseModel):
    no: int
    role: str
    text: str


class InsightBlock(BaseModel):
    code: str
    areaName: str
    title: str
    displayOrder: int
    lines: list[InsightLine] = []


class InsightCoreResponse(BaseModel):
    # 프론트 `InsightsPanel`과 호환되는 필드들
    title: str
    strengths: Optional[str] = None
    risks: Optional[str] = None
    actions: list[str] = []

    # 화면 레이아웃용 텍스트 (요청 block_code 기반)
    headerContext: Optional[str] = None
    summaryJudgment: Optional[str] = None

    # 원본 구조(블록/라인)도 함께 제공
    blocks: list[InsightBlock] = []


class ThemeKpiCardAux(BaseModel):
    label: Optional[str] = None
    text: Optional[str] = None


class ThemeKpiCardSource(BaseModel):
    tableName: Optional[str] = None
    columnExpr: Optional[str] = None


class ThemeKpiCardItem(BaseModel):
    metricCode: str
    title: str
    year: int
    myValue: str
    regionAvg: str
    nationalAvg: str
    comparisonDirectionCode: str
    aux: ThemeKpiCardAux = ThemeKpiCardAux()
    accentColorHex: Optional[str] = None
    source: ThemeKpiCardSource = ThemeKpiCardSource()


class ThemeKpiCardsResponse(BaseModel):
    title: str
    items: list[ThemeKpiCardItem]


class ThemeDetailGridAux(BaseModel):
    label: Optional[str] = None
    text: Optional[str] = None


class ThemeDetailGridSource(BaseModel):
    tableName: Optional[str] = None
    columnExpr: Optional[str] = None


class ThemeDetailGridItem(BaseModel):
    metricCode: str
    metricName: str
    metricYear: int
    displayOrder: int

    myValueDisplay: str
    regionAvgDisplay: str
    nationalAvgDisplay: str

    comparisonDirectionCode: str
    aux: ThemeDetailGridAux = ThemeDetailGridAux()
    accentColorHex: Optional[str] = None
    source: ThemeDetailGridSource = ThemeDetailGridSource()


class ThemeDetailGridResponse(BaseModel):
    title: str
    items: list[ThemeDetailGridItem]


class ThemeChartItem(BaseModel):
    order: int
    label: str
    valueNum: Optional[float] = None
    displayText: str
    noteText: str
    colorHex: str
    # 막대 비율 표시/파싱용 (예: "3.5%") — DB `bar_ratio_display_text`
    barRatioDisplayText: Optional[str] = None


class ThemeChartBlock(BaseModel):
    blockCode: str
    title: str
    subtitle: str
    style: str
    displayOrder: int
    items: list[ThemeChartItem]


class ThemeChartBlocksResponse(BaseModel):
    blocks: list[ThemeChartBlock]


class ThemeTextLine(BaseModel):
    no: int
    role: str
    text: str


class ThemeTextBlock(BaseModel):
    blockCode: str
    areaName: str
    title: str
    displayOrder: int
    lines: list[ThemeTextLine]


class ThemeTextBlocksResponse(BaseModel):
    blocks: list[ThemeTextBlock]


class ThemeSourceRefItem(BaseModel):
    order: int
    tableName: str
    columnExpr: str
    note: str


class ThemeSourceRefsResponse(BaseModel):
    refs: list[ThemeSourceRefItem]


class AdmissionEnrollmentRateItem(BaseModel):
    type: str
    currentYear: float
    previousYear: Optional[float] = None


class AdmissionEnrollmentRatesResponse(BaseModel):
    title: str
    subtitle: Optional[str] = None
    items: list[AdmissionEnrollmentRateItem]


class AdmissionOpportunityBalanceItem(BaseModel):
    category: str
    # 막대 너비(0~100): `bar_ratio_display_text`에서만 파싱, 실패 시 0
    ratio: float
    previousRatio: Optional[float] = None
    # DB `bar_ratio_display_text` 원문(우측 표시 + 비율 파싱 소스)
    bar_ratio_display_text: Optional[str] = None


class AdmissionOpportunityBalanceResponse(BaseModel):
    title: str
    subtitle: Optional[str] = None
    items: list[AdmissionOpportunityBalanceItem]


class AdmissionInsightItem(BaseModel):
    text: str


class LoginRequest(BaseModel):
    email: str
    password: str


class InstitutionChips(BaseModel):
    schl_tp: str
    estb_gb: str
    region: str
    stts: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    univ_nm: Optional[str] = None
    institution_chips: Optional[InstitutionChips] = None


class OAuth2TokenResponse(BaseModel):
    """RFC 6749-style token response; `univ_nm` is an extension for this API."""

    access_token: str
    token_type: str = "bearer"
    univ_nm: Optional[str] = None
    institution_chips: Optional[InstitutionChips] = None


class TokenPayload(BaseModel):
    sub: str
    univ_nm: str
    exp: int
