/**
 * 거버넌스 컴플라이언스 표 — `tq_screen_chart_block` + `tq_screen_chart_item`
 * - `block_code`: **COMPLIANCE** (동일 screen_code/ver/year/schl)
 * - 매핑: `item_label`→구분, `item_display_text`→항목명
 * - `item_note_text`: 우선 JSON 문자열
 *   `{"status":"compliant|pending|non-compliant","dueDate":"YYYY-MM-DD","responsibleParty":"부서명"}`
 *   파싱 실패 시 전체를 `status`만 사용하고 기한·책임부서는 빈 문자열
 */

const ALLOWED = new Set(['compliant', 'pending', 'non-compliant']);

function parseNote(noteText) {
  const raw = noteText == null ? '' : String(noteText).trim();
  if (!raw) {
    return { status: 'pending', dueDate: '', responsibleParty: '' };
  }
  if (raw.startsWith('{')) {
    try {
      const o = JSON.parse(raw);
      const status = ALLOWED.has(o.status) ? o.status : 'pending';
      return {
        status,
        dueDate: o.dueDate != null ? String(o.dueDate) : '',
        responsibleParty: o.responsibleParty != null ? String(o.responsibleParty) : '',
      };
    } catch {
      /* fall through */
    }
  }
  const status = ALLOWED.has(raw) ? raw : 'pending';
  return { status, dueDate: '', responsibleParty: '' };
}

/** @param {Array<{ order: number, label: string, displayText: string, noteText?: string }>} items */
export function mapThemeChartItemsToGovernanceCompliance(items) {
  if (!Array.isArray(items)) return [];
  return [...items]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((it) => {
      const { status, dueDate, responsibleParty } = parseNote(it.noteText);
      return {
        id: `governance-compliance-${it.order}-${it.label}`,
        category: it.label || '',
        itemName: it.displayText || '',
        status,
        dueDate,
        responsibleParty,
      };
    });
}
