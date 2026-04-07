## ADDED Requirements

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

### Requirement: Provider-Agnostic Configuration

The system SHALL support multiple LLM providers through LangChain ChatModel wrappers.

#### Scenario: OpenAI provider configuration
- **WHEN** `LLM_PROVIDER=openai` is set
- **THEN** system uses `ChatOpenAI` with configured API key and base URL

#### Scenario: MiniMax provider configuration
- **WHEN** `LLM_PROVIDER=minimax` is set
- **THEN** system uses MiniMax-compatible ChatModel via endpoint configuration

#### Scenario: Provider switching
- **WHEN** provider configuration changes
- **THEN** system automatically uses new provider without code changes

---

### Requirement: Custom Tool Definition

The system SHALL define database tools using LangChain's `@tool` decorator.

#### Scenario: get_tables tool
- **WHEN** Agent needs to discover available tables
- **THEN** `get_tables()` tool is available
- **AND** returns list of tables with their COMMENT descriptions
- **AND** returns JSON formatted string

#### Scenario: get_columns tool
- **WHEN** Agent needs column information for a table
- **THEN** `get_columns(table_name)` tool is available
- **AND** returns list of columns with data types and COMMENT descriptions
- **AND** returns JSON formatted string

#### Scenario: execute_sql tool (SQL Generation)
- **WHEN** Agent has determined the appropriate SQL query
- **THEN** `execute_sql(sql)` tool is available
- **AND** returns the generated SQL string (for API layer execution)
- **AND** does NOT execute the SQL directly
- **AND** the final SQL is extracted from the execute_sql tool call arguments (or equivalent mechanism via callback/intermediate steps)

---

### Requirement: Async Tool Execution

The system SHALL support async tool execution for database operations.

#### Scenario: Async get_tables call
- **WHEN** Agent calls `get_tables()` tool
- **THEN** system performs async database query
- **AND** returns result without blocking

#### Scenario: Async get_columns call
- **WHEN** Agent calls `get_columns(table_name)` tool
- **THEN** system performs async column metadata query
- **AND** returns result without blocking

---

## REMOVED Requirements

### Requirement: create_openai_tools_agent AgentExecutor Pattern

**Reason**: Replaced by LCEL Chain with explicit bind_tools and tool execution loop
**Migration**: Use new `app/services/chain.py` LCEL Chain implementation

### Requirement: ReAct Agent Pattern

**Reason**: Legacy pattern that produced free text instead of structured tool calls with MiniMax
**Migration**: Use new LCEL Chain with bind_tools approach; `create_sql_react_agent_executor` retained for A-B comparison only
