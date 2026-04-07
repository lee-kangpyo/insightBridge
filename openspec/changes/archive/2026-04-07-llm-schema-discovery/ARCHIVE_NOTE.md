# 아카이브됨: 2026-04-07

이 스펙은 구현 완료 후 아카이브됨.

## 코드와 불일치 사항

| 항목 | 스펙 내용 | 실제 코드 |
|------|----------|----------|
| 흐름 | Function Calling: get_tables → get_columns 순차 호출 | 스키마 다이제스트 방식 (시스템 프롬프트에 전체 스키마 포함) |
| 도구 | get_tables, get_columns | get_full_schema, get_columns_batch |
| 태스크 | 3.1~3.4 미완료 | 미완료 태스크 그대로 |

## 결과

- 실제 아키텍처는 "LLM이 스키마를 직접 읽는" 방식이 아니라 "스키마를 시스템 프롬프트에 주입"하는 방식
- Function Calling 순차 호출은 현재 구현에 반영되지 않음

## 후속

- `langchain-refactoring` 스펙과合併하여 새 스펙에서 다시 검토 가능
