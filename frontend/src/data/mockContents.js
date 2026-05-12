/**
 * 컨텐츠 목록 Mock 데이터
 * - ContentsList 전용 정적 샘플 (DB 연동 전 UI 개발용)
 * - 필드 구조는 ContentsCreate.handleSave() 결과물과 동일
 *   { ...generalInfo, contentType, data: { 타입별 상세 } }
 */
export const mockContents = [
  {
    contentId: 'CNT-001',
    contentName: '연도별 신입생충원율 라인차트',
    creator: '차트킴',
    createdAt: '2026-04-20T15:30',
    isDeleted: 'N',
    generatedAt: '2026-04-20T15:21',
    memo: '입학처 요청. 최근 5개년 데이터 기준으로 작성.',
    contentType: 'chart',
    data: {
      chartTitle: '연도별 신입생충원율',
      chartTitlePosition: 'top',
      chartType: 'line',
      xAxis: 'base_year',
      yAxis: 'admission_rate',
      legendPosition: 'right',
    },
  },
  {
    contentId: 'CNT-002',
    contentName: '연도별 취업률 라인차트',
    creator: '데이터박',
    createdAt: '2026-04-18T11:00',
    isDeleted: 'N',
    generatedAt: '',
    memo: '',
    contentType: 'chart',
    data: {
      chartTitle: '연도별 취업률',
      chartTitlePosition: 'top',
      chartType: 'line',
      xAxis: 'base_year',
      yAxis: 'employment_rate',
      legendPosition: 'bottom',
    },
  },
  {
    contentId: 'CNT-003',
    contentName: '학과별 취업률(2025년)',
    creator: '데이터박',
    createdAt: '2026-04-15T09:30',
    isDeleted: 'N',
    generatedAt: '',
    memo: '학생처 요청. 학과별 2025년 기준.',
    contentType: 'grid',
    data: {
      sectionTitle: '학과별 취업률 현황',
      columns: [
        { displayName: '학과명', dataKey: 'department_nm', alignment: 'left', isAmount: false },
        { displayName: '단과대', dataKey: 'college_nm', alignment: 'left', isAmount: false },
        { displayName: '취업률(%)', dataKey: 'employment_rate', alignment: 'right', isAmount: false },
      ],
    },
  },
  {
    contentId: 'CNT-004',
    contentName: '신입생 지역별 출신현황(2025년)',
    creator: '차트킴',
    createdAt: '2026-04-14T14:00',
    isDeleted: 'N',
    generatedAt: '',
    memo: '',
    contentType: 'grid',
    data: {
      sectionTitle: '신입생 지역별 출신 현황',
      columns: [
        { displayName: '출신지역', dataKey: 'region_nm', alignment: 'left', isAmount: false },
        { displayName: '인원', dataKey: 'student_count', alignment: 'right', isAmount: false },
        { displayName: '비율(%)', dataKey: 'ratio', alignment: 'right', isAmount: false },
      ],
    },
  },
  {
    contentId: 'CNT-005',
    contentName: '전임교원확보율(2025년)',
    creator: '관리자',
    createdAt: '2026-04-10T10:00',
    isDeleted: 'N',
    generatedAt: '',
    memo: '교무처 요청. 카드형 요약.',
    contentType: 'card',
    data: {
      cardTitle: '전임교원확보율 현황',
      titlePosition: 'left-top',
      items: [
        { label: '전임교원 수', content: '312명', color: '#002c5a' },
        { label: '확보율', content: '98.7%', color: '#006492' },
        { label: '기준연도', content: '2025년', color: '#003509' },
      ],
    },
  },
  {
    contentId: 'CNT-006',
    contentName: '전임교원 확보율조회 SQL(2025년)',
    creator: '데이터박',
    createdAt: '2026-04-08T16:00',
    isDeleted: 'N',
    generatedAt: '',
    memo: 'AI 생성 SQL. 검수 필요.',
    contentType: 'sql',
    data: {
      sql: `SELECT
    d.department_nm,
    c.college_nm,
    COUNT(f.faculty_id) AS full_time_count,
    ROUND(COUNT(f.faculty_id)::numeric / t.required_count * 100, 1) AS securing_rate
FROM dim_faculty f
JOIN dim_department d ON f.dept_id = d.dept_id
JOIN dim_college c ON d.college_id = c.college_id
JOIN fact_faculty_required t ON d.dept_id = t.dept_id
WHERE f.base_year = 2025
  AND f.faculty_type = 'FULL_TIME'
GROUP BY d.department_nm, c.college_nm, t.required_count
ORDER BY securing_rate DESC;`,
    },
  },
];
