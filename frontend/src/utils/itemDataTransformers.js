/**
 * Item Data Transformers
 * Pure utility functions to transform SQL results and mapping JSON into widget data structures.
 * No React dependencies - can be used in any context.
 */

/** 백엔드 SQL 미리보기와 동일한 상한(행). 그 이상은 UI/선택 로직에서 처리하지 않습니다. */
export const SQL_PREVIEW_MAX_ROWS = 100;

export function clampPreviewRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  if (rows.length <= SQL_PREVIEW_MAX_ROWS) return rows;
  return rows.slice(0, SQL_PREVIEW_MAX_ROWS);
}

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

function toComparableValue(v) {
  if (v == null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const asNumber = Number(v);
  if (Number.isFinite(asNumber) && String(v).trim() !== '') return asNumber;
  const asTime = Date.parse(String(v));
  if (!Number.isNaN(asTime)) return asTime;
  return String(v);
}

function normalizeWhereConditions(where) {
  if (!Array.isArray(where)) return [];
  return where
    .map((cond) => {
      const field = typeof cond?.field === 'string' ? cond.field.trim() : '';
      const value = cond?.value;
      if (!field) return null;
      return { field, value: value == null ? '' : String(value) };
    })
    .filter(Boolean);
}

function matchesWhere(row, conditions) {
  if (!row || !Array.isArray(conditions) || conditions.length === 0) return false;
  return conditions.every((cond) => String(getRowValue(row, cond.field) ?? '') === String(cond.value ?? ''));
}

export function selectCardRow(rows, selector) {
  if (!Array.isArray(rows) || rows.length === 0) return { row: null, reason: 'empty' };
  if (!selector || typeof selector !== 'object') return { row: rows[0], reason: 'default:first' };

  const modeRaw = selector.mode;
  const mode = typeof modeRaw === 'string' ? modeRaw.trim() : '';
  const field = typeof selector.field === 'string' ? selector.field.trim() : '';
  const value = selector.value;
  const where = normalizeWhereConditions(selector.where);

  if (!mode || mode === 'first') return { row: rows[0], reason: 'selector:first' };
  if (mode === 'last') return { row: rows[rows.length - 1], reason: 'selector:last' };

  if ((mode === 'max' || mode === 'min') && !field) {
    return { row: rows[0], reason: `selector:${mode}:fallback(no-field)` };
  }
  if (mode === 'equals' && !field) {
    return { row: rows[0], reason: 'selector:equals:fallback(no-field)' };
  }
  if ((mode === 'where' || mode === 'equalsAll') && where.length === 0) {
    return { row: rows[0], reason: `selector:${mode}:fallback(no-conditions)` };
  }

  if (mode === 'equals') {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const fromObject = Object.entries(value)
        .map(([k, v]) => ({
          field: typeof k === 'string' ? k.trim() : '',
          value: v == null ? '' : String(v),
        }))
        .filter((cond) => !!cond.field);
      if (fromObject.length > 0) {
        const foundByObject = rows.find((r) => matchesWhere(r, fromObject));
        return foundByObject
          ? {
              row: foundByObject,
              reason: `selector:equals:object(${fromObject.map((c) => `${c.field}=${c.value}`).join('&')})`,
            }
          : { row: rows[0], reason: 'selector:equals:fallback(not-found:object)' };
      }
    }

    const target = String(value ?? '');
    const found = rows.find((r) => String(getRowValue(r, field) ?? '') === target);
    return found
      ? { row: found, reason: `selector:equals:${field}=${target}` }
      : { row: rows[0], reason: `selector:equals:fallback(not-found:${field}=${target})` };
  }

  if (mode === 'where' || mode === 'equalsAll') {
    const found = rows.find((r) => matchesWhere(r, where));
    const reasonExpr = where.map((c) => `${c.field}=${c.value}`).join('&');
    return found
      ? { row: found, reason: `selector:${mode}:${reasonExpr}` }
      : { row: rows[0], reason: `selector:${mode}:fallback(not-found:${reasonExpr})` };
  }

  if (mode === 'max' || mode === 'min') {
    let chosen = null;
    let chosenComp = null;
    for (const r of rows) {
      const raw = getRowValue(r, field);
      const comp = toComparableValue(raw);
      if (comp == null) continue;
      if (chosen == null) {
        chosen = r;
        chosenComp = comp;
        continue;
      }
      if (mode === 'max' ? comp > chosenComp : comp < chosenComp) {
        chosen = r;
        chosenComp = comp;
      }
    }
    return chosen
      ? { row: chosen, reason: `selector:${mode}:${field}` }
      : { row: rows[0], reason: `selector:${mode}:fallback(no-comparable:${field})` };
  }

  return { row: rows[0], reason: `selector:fallback(unknown-mode:${mode})` };
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

  const sqlRows = clampPreviewRows(Array.isArray(preview?.rows) ? preview.rows : []);
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

  const sqlRows = clampPreviewRows(Array.isArray(preview?.rows) ? preview.rows : []);
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
  const rows = clampPreviewRows(Array.isArray(preview?.rows) ? preview.rows : []);

  if (itemType !== 'card') return null;

  const mj = item?.mapping_json;
  const m = mj && typeof mj === 'object' ? mj.mapping || {} : null;
  if (!m || typeof m !== 'object') return null;

  const title = shapeContent?.data?.cardTitle || item?.item_nm || '카드';
  const defaultSelected = selectCardRow(rows, m.rowSelector);
  const defaultRow = defaultSelected.row;
  const sources = [`rowSelector = ${defaultSelected.reason}`];

  if (m.value && typeof m.value === 'string') {
    const valueSelector =
      m.valueRowSelector && typeof m.valueRowSelector === 'object' ? m.valueRowSelector : m.rowSelector;
    const selectedForValue = selectCardRow(rows, valueSelector);
    const targetRow = selectedForValue.row;
    if (!targetRow) return null;
    const v = getRowValue(targetRow, m.value);
    sources.push(`value.rowSelector = ${selectedForValue.reason}`);
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
    const itemSelector = it?.rowSelector && typeof it.rowSelector === 'object' ? it.rowSelector : m.rowSelector;
    const selectedForItem = selectCardRow(rows, itemSelector);
    const itemRow = selectedForItem.row || defaultRow;
    const v = field && itemRow ? getRowValue(itemRow, field) : null;

    if (field) sources.push(`mapping.items[${idx}].field = ${field}`);
    else sources.push(`mapping.items[${idx}]`);
    sources.push(`mapping.items[${idx}].rowSelector = ${selectedForItem.reason}`);

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
