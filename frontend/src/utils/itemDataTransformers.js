/**
 * Item Data Transformers
 * Pure utility functions to transform SQL results and mapping JSON into widget data structures.
 * No React dependencies - can be used in any context.
 */

export function normalizeMappingItems(mappingItems) {
  if (!mappingItems) return [];
  if (Array.isArray(mappingItems)) return mappingItems.filter(Boolean);
  if (typeof mappingItems === 'object') return Object.values(mappingItems).filter(Boolean);
  return [];
}

export function normalizeMappingColumns(mappingColumns) {
  if (!mappingColumns) return [];
  if (Array.isArray(mappingColumns)) return mappingColumns.filter(Boolean);
  if (typeof mappingColumns === 'object') {
    return Object.entries(mappingColumns)
      .map(([dataKey, v]) => ({ dataKey, ...(v || {}) }))
      .filter(Boolean);
  }
  return [];
}

export function normalizeMappingSeries(series) {
  if (!series) return [];
  if (Array.isArray(series)) return series.filter(Boolean);
  if (typeof series === 'object') {
    return Object.entries(series)
      .map(([name, v]) => ({ name, ...(v || {}) }))
      .filter(Boolean);
  }
  return [];
}

export function getRowValue(row, field) {
  if (!row || field == null) return null;
  const v = row[field];
  if (v === undefined) return null;
  return v;
}

export function buildGridPreviewModel(itemType, item, shapeContent, preview) {
  if (itemType !== 'grid') return { columns: [], rows: [] };

  const mj = item?.mapping_json;
  const m = mj && typeof mj === 'object' ? mj.mapping || {} : null;
  if (!m || typeof m !== 'object') return { columns: [], rows: [] };

  const mappedColumns = normalizeMappingColumns(m.columns);
  const usableMappings = mappedColumns
    .map((c) => ({
      dataKey: typeof c?.dataKey === 'string' ? c.dataKey : null,
      field: typeof c?.field === 'string' ? c.field : null,
    }))
    .filter((c) => !!c.dataKey && !!c.field);

  if (usableMappings.length === 0) return { columns: [], rows: [] };

  const shapeCols = Array.isArray(shapeContent?.data?.columns) ? shapeContent.data.columns : [];
  const shapeByKey = new Map(
    shapeCols
      .map((c) => {
        const dataKey = c?.dataKey || c?.field;
        if (!dataKey) return null;
        const header = c?.displayName || c?.header || c?.title || dataKey;
        return [String(dataKey), { header: String(header), dataKey: String(dataKey) }];
      })
      .filter(Boolean)
  );

  const columns = usableMappings.map(({ dataKey }) => {
    const meta = shapeByKey.get(dataKey);
    return { dataKey, header: meta?.header || dataKey };
  });

  const sqlRows = Array.isArray(preview?.rows) ? preview.rows : [];
  const rows = sqlRows.map((row) => {
    const out = {};
    for (const { dataKey, field } of usableMappings) {
      out[dataKey] = getRowValue(row, field);
    }
    return out;
  });

  return { columns, rows };
}

export function buildChartPreviewModel(itemType, item, shapeContent, preview) {
  if (itemType !== 'chart') return { chartType: null, data: [], chartConfig: null };

  const mj = item?.mapping_json;
  const chartType = mj?.chartType;
  if (typeof chartType !== 'string' || !chartType.trim()) {
    return { chartType: null, data: [], chartConfig: null };
  }

  const mapping = mj?.mapping;
  if (!mapping || typeof mapping !== 'object') {
    return { chartType, data: [], chartConfig: null };
  }

  const categoryField = mapping.categoryField;
  const seriesList = normalizeMappingSeries(mapping.series);

  if (typeof categoryField !== 'string' || !categoryField.trim()) {
    return { chartType, data: [], chartConfig: null };
  }

  const sqlRows = Array.isArray(preview?.rows) ? preview.rows : [];
  if (sqlRows.length === 0) {
    return { chartType, data: [], chartConfig: null };
  }

  const title = shapeContent?.data?.chartTitle || item?.item_nm || '';

  const long = [];
  for (const row of sqlRows) {
    const category = getRowValue(row, categoryField);
    if (category == null) continue;

    if (seriesList.length === 0) {
      continue;
    }

    for (const s of seriesList) {
      const seriesName = (s?.name || s?.label || '').toString() || '';
      const field = s?.field;
      if (typeof field !== 'string' || !field.trim()) continue;
      const v = getRowValue(row, field);
      long.push({ category: String(category), series: seriesName || field, value: v == null ? null : Number(v) });
    }
  }

  const data = long;
  if (data.length === 0) {
    return { chartType, data: [], chartConfig: null };
  }

  const chartConfig = {
    type: chartType,
    title,
    x: 'category',
    y: 'value',
    group: 'series',
  };

  return { chartType, data, chartConfig };
}

export function buildCardPreviewModel(itemType, item, shapeContent, preview) {
  const rows = preview?.rows || [];
  const row0 = rows[0] || null;

  if (itemType !== 'card') return null;

  const mj = item?.mapping_json;
  const m = mj && typeof mj === 'object' ? mj.mapping || {} : null;
  if (!m || typeof m !== 'object') return null;
  if (!row0) return null;

  const title = shapeContent?.data?.cardTitle || item?.item_nm || '카드';
  const sources = [];

  if (m.value && typeof m.value === 'string') {
    const v = getRowValue(row0, m.value);
    sources.push(`mapping.value = ${m.value}`);
    return { title, headline: v, rows: [], sources };
  }

  const mappedItems = normalizeMappingItems(m.items);
  if (mappedItems.length === 0) return null;

  let headline = null;
  let headlineTaken = false;
  const outRows = [];

  mappedItems.slice(0, 12).forEach((it, idx) => {
    const field = typeof it?.field === 'string' ? it.field : null;
    const labelRaw = it?.label || shapeContent?.data?.items?.[idx]?.label || '';
    const label = typeof labelRaw === 'string' ? labelRaw : String(labelRaw || '');
    const labelTrim = label.trim();
    const v = field ? getRowValue(row0, field) : null;

    if (field) sources.push(`mapping.items[${idx}].field = ${field}`);
    else sources.push(`mapping.items[${idx}]`);

    if (!labelTrim && !headlineTaken) {
      headline = v;
      headlineTaken = true;
      return;
    }

    outRows.push({
      label: labelTrim ? label : '',
      value: v,
      kind: labelTrim ? 'labeled' : 'valueOnly',
    });
  });

  return { title, headline, rows: outRows, sources };
}
