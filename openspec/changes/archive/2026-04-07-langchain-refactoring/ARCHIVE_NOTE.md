# 아카이브됨: 2026-04-07

이 스펙은 구현 완료 후 아카이브됨.

## 코드와 불일치 사항

| 항목 | 스펙 내용 | 실제 코드 |
|------|----------|----------|
| 도구 | get_tables, get_columns, execute_sql | get_full_schema, get_columns_batch, execute_sql |
| max_iterations | 5 | 12 |
| Agent 유형 | create_react_agent (ReAct 텍스트 파싱) | create_openai_tools_agent (OpenAI tools/bind_tools 스타일) |
| 에이전트 함수 | create_agent_executor 하나 | create_agent_executor (OAI tools) + create_sql_react_agent_executor (legacy) |
| SQL 캡처 | on_tool_call 사용 | on_tool_start 사용 (LangChain 권장) |

## 결과

- 구현은 **bind_tools/OpenAI tools agent** 방식으로 이미 전환됨
- ReAct 스타일은 `create_sql_react_agent_executor`로 legacy로 밀려남
- MiniMax 모델이 OpenAI tools 방식에서도 ReAct처럼 자유 텍스트로 답변하는 문제 발생 (2026-04-07 로그 참조)

## 후속

- 새 스펙 `bind-tools-migration`에서 재구현 예정
- bind_tools 방식에서 MiniMax가 도구 호출을 제대로 하는지 검증 필요
