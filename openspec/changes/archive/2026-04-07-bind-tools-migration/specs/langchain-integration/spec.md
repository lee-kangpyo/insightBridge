## MODIFIED Requirements

### Requirement: LCEL Chain with bind_tools for SQL Generation

The system SHALL use LCEL Chain with `llm.bind_tools()` to handle multi-step tool calling for database queries.

#### Scenario: LCEL Chain processes user question with tool_calls response
- **WHEN** user asks "월별 매출 보여줘"
- **AND** LLM responds with `tool_calls` containing `execute_sql`
- **THEN** system extracts SQL from `tool_calls[0].function.arguments`
- **AND** system returns the generated SQL (actual execution happens at API layer)

#### Scenario: LCEL Chain processes user question without tool_calls
- **WHEN** user asks "월별 매출 보여줘"
- **AND** LLM responds with `content` but no `tool_calls`
- **THEN** system attempts to extract SQL pattern from `content`
- **AND** if valid SQL found, returns it for API layer execution
- **AND** if no valid SQL found, falls back to existing AgentExecutor

#### Scenario: LCEL Chain handles tool execution loop
- **WHEN** LLM responds with tool call (e.g., `get_full_schema`)
- **THEN** system executes the tool
- **AND** system passes tool result back to LLM
- **AND** system continues until LLM provides final `execute_sql` call or non-tool response

#### Scenario: LCEL Chain handles invalid SQL response
- **WHEN** LLM responds with content but no valid SQL pattern
- **AND** fallback to AgentExecutor also fails to produce valid SQL
- **THEN** system raises `ValueError` indicating model did not submit SQL via `execute_sql` tool

---

### Requirement: SQL Capture from tool_calls

The system SHALL extract SQL directly from `tool_calls` structure when LLM responds with tool calls.

#### Scenario: Extract SQL from execute_sql tool_call
- **WHEN** LLM responds with `tool_calls` containing `execute_sql`
- **THEN** system extracts SQL from `tool_calls[0].function.arguments["sql"]`
- **AND** validates SQL is a plausible SELECT/WITH/INSERT/UPDATE/DELETE statement
- **AND** returns normalized SQL string

#### Scenario: Extract SQL from content fallback
- **WHEN** LLM responds without `tool_calls`
- **AND** `content` contains SQL-like pattern
- **THEN** system extracts SQL using regex patterns (SELECT...FROM, WITH...SELECT, etc.)
- **AND** validates extracted text is a plausible SQL statement
- **AND** returns normalized SQL string

---

## REMOVED Requirements

### Requirement: create_openai_tools_agent AgentExecutor Pattern

**Reason**: Replaced by LCEL Chain with explicit bind_tools and tool execution loop
**Migration**: Use new `app/services/chain.py` LCEL Chain implementation

---

### Requirement: ReAct Agent Pattern

**Reason**: Legacy pattern that produced free text instead of structured tool calls with MiniMax
**Migration**: Use new LCEL Chain with bind_tools approach; `create_sql_react_agent_executor` retained for A-B comparison only
