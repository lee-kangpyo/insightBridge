export function asNonEmptyString(v) {
  const s = (v ?? '').toString().trim();
  return s ? s : '';
}

export function validateContentsBeforeSave({ generalInfo, contentType, data }) {
  const errors = {
    generalInfo: {
      contentName: '',
      creator: '',
      createdAt: '',
      isDeleted: '',
      generatedAt: '',
    },
    chart: { chartType: '', xAxis: '', yAxis: '' },
    chartFields: { chartTitle: '', chartTitlePosition: '', legendPosition: '' },
    gridFields: { sectionTitle: '' },
    cardFields: { cardTitle: '', titlePosition: '' },
    grid: { columns: [], hasColumns: '' },
    card: { items: [], hasItems: '' },
    sql: { sql: '' },
  };

  if (!asNonEmptyString(generalInfo?.contentName)) errors.generalInfo.contentName = '필수값입니다.';
  if (!asNonEmptyString(generalInfo?.creator)) errors.generalInfo.creator = '필수값입니다.';
  if (!asNonEmptyString(generalInfo?.createdAt)) errors.generalInfo.createdAt = '필수값입니다.';
  if (!asNonEmptyString(generalInfo?.isDeleted)) errors.generalInfo.isDeleted = '필수값입니다.';
  if (!asNonEmptyString(generalInfo?.generatedAt)) errors.generalInfo.generatedAt = '필수값입니다.';

  if (contentType === 'sql') {
    if (!asNonEmptyString(data?.sql)) errors.sql.sql = '필수값입니다.';
  }

  if (contentType === 'grid') {
    if (!asNonEmptyString(data?.sectionTitle)) errors.gridFields.sectionTitle = '필수값입니다.';
    const cols = Array.isArray(data?.columns) ? data.columns : [];
    if (cols.length < 1) errors.grid.hasColumns = '컬럼을 1개 이상 추가하세요.';

    for (let i = 0; i < cols.length; i++) {
      const c = cols[i] || {};
      errors.grid.columns[i] = { displayName: '', dataKey: '' };
      if (!asNonEmptyString(c.displayName)) errors.grid.columns[i].displayName = '필수값입니다.';
      if (!asNonEmptyString(c.dataKey)) errors.grid.columns[i].dataKey = '필수값입니다.';
    }
  }

  if (contentType === 'card') {
    if (!asNonEmptyString(data?.cardTitle)) errors.cardFields.cardTitle = '필수값입니다.';
    if (!asNonEmptyString(data?.titlePosition)) errors.cardFields.titlePosition = '필수값입니다.';
    const items = Array.isArray(data?.items) ? data.items : [];
    if (items.length < 1) errors.card.hasItems = '항목을 1개 이상 추가하세요.';

    for (let i = 0; i < items.length; i++) {
      const it = items[i] || {};
      errors.card.items[i] = { label: '', content: '' };
      if (!asNonEmptyString(it.label)) errors.card.items[i].label = '필수값입니다.';
      if (!asNonEmptyString(it.content)) errors.card.items[i].content = '필수값입니다.';
    }
  }

  if (contentType === 'chart') {
    if (!asNonEmptyString(data?.chartTitle)) errors.chartFields.chartTitle = '필수값입니다.';
    if (!asNonEmptyString(data?.chartTitlePosition)) errors.chartFields.chartTitlePosition = '필수값입니다.';
    if (!asNonEmptyString(data?.legendPosition)) errors.chartFields.legendPosition = '필수값입니다.';

    const x = data?.xAxis;
    const y = data?.yAxis;

    const xList = Array.isArray(x)
      ? x.map(asNonEmptyString).filter(Boolean)
      : [asNonEmptyString(x)].filter(Boolean);
    const yList = Array.isArray(y)
      ? y.map(asNonEmptyString).filter(Boolean)
      : [asNonEmptyString(y)].filter(Boolean);

    if (xList.length < 1) errors.chart.xAxis = '필수값입니다.';
    if (yList.length < 1) errors.chart.yAxis = '필수값입니다.';
    if (!asNonEmptyString(data?.chartType)) errors.chart.chartType = '필수값입니다.';
  }

  const firstMessage =
    errors.generalInfo.contentName ||
    errors.generalInfo.creator ||
    errors.generalInfo.createdAt ||
    errors.generalInfo.isDeleted ||
    errors.generalInfo.generatedAt ||
    errors.sql.sql ||
    errors.chartFields.chartTitle ||
    errors.chartFields.chartTitlePosition ||
    errors.chartFields.legendPosition ||
    errors.grid.hasColumns ||
    errors.gridFields.sectionTitle ||
    (errors.grid.columns.find((c) => c?.displayName)?.displayName || '') ||
    (errors.grid.columns.find((c) => c?.dataKey)?.dataKey || '') ||
    errors.card.hasItems ||
    errors.cardFields.cardTitle ||
    errors.cardFields.titlePosition ||
    (errors.card.items.find((it) => it?.label)?.label || '') ||
    (errors.card.items.find((it) => it?.content)?.content || '') ||
    errors.chart.chartType ||
    errors.chart.xAxis ||
    errors.chart.yAxis ||
    '';

  return { ok: !firstMessage, message: firstMessage || '', errors };
}

