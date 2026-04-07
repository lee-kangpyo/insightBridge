## ADDED Requirements

### Requirement: LangChain Agent Executor

The system SHALL use LangChain Agent to handle multi-step tool calling for database queries.

#### Scenario: Agent processes user question
- **WHEN** user asks "월별 매출 보여줘"
- **THEN** Agent typically calls `get_tables()` tool first to discover schema
- **AND** Agent may call `get_columns()` tool based on table selection
- **AND** Agent generates SQL query
- **AND** Agent returns the generated SQL (actual execution happens at API layer)

#### Scenario: Agent handles tool errors
- **WHEN** a tool returns an error
- **THEN** system logs the error
- **AND** returns error message to user

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
