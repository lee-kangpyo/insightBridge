## 1. LCEL Chain Implementation

- [x] 1.1 Create `app/services/chain.py` with LCEL Chain structure
- [x] 1.2 Implement `create_sql_chain()` function with `llm.bind_tools()`
- [x] 1.3 Add tool execution loop (LLM → tool_calls → execute tool → LLM)
- [x] 1.4 Implement `extract_sql_from_tool_calls()` function

## 2. Fallback Logic

- [x] 2.1 Implement `extract_sql_from_content()` with regex patterns
- [x] 2.2 Add fallback to existing `create_agent_executor()` when LCEL fails
- [x] 2.3 Implement `is_valid_sql_candidate()` check in chain context

## 3. LLM Service Integration

- [x] 3.1 Add `USE_LCEL_CHAIN` config option (default: false for gradual rollout)
- [x] 3.2 Modify `generate_sql()` to try LCEL Chain first if enabled
- [x] 3.3 Add detailed logging for tool_calls response detection
- [x] 3.4 Update `reset_agent_executor_cache()` to handle LCEL Chain

## 4. Testing & Verification

- [x] 4.1 Test LCEL Chain with MiniMax - verify tool_calls response
- [x] 4.2 Test fallback behavior when tool_calls absent
- [x] 4.3 Test fallback to existing AgentExecutor on failure
- [x] 4.4 End-to-end test with "대학별 재학생수" query
