## ADDED Requirements

### Requirement: Schema Discovery Functions

The system SHALL provide Function Calling tools for LLM to discover database schema information:

#### Function: get_tables()

The system SHALL return a list of all tables in the public schema with their COMMENT descriptions.

##### Scenario: Get tables with comments
- **WHEN** LLM calls `get_tables()`
- **THEN** system executes PostgreSQL query to retrieve table names and `obj_description`
- **AND** returns JSON array with `table_name` and `comment` fields

##### Scenario: Get tables when no comments exist
- **WHEN** LLM calls `get_tables()` and some tables have no COMMENT
- **THEN** system returns `comment` as empty string for those tables
- **AND** continues to return other tables normally

#### Function: get_columns(table_name)

The system SHALL return column information for a specified table with COMMENT descriptions.

##### Scenario: Get columns with comments
- **WHEN** LLM calls `get_columns("table_name")`
- **THEN** system executes PostgreSQL query to retrieve column names and `col_description`
- **AND** returns JSON array with `column_name`, `data_type`, and `comment` fields

##### Scenario: Get columns for non-existent table
- **WHEN** LLM calls `get_columns("nonexistent_table")`
- **THEN** system returns empty array

---

### Requirement: Automatic Schema Exploration

The LLM SHALL automatically explore database schema before generating SQL queries.

##### Scenario: User asks about sales data
- **WHEN** user asks "Show me monthly sales"
- **THEN** LLM calls `get_tables()` to discover available tables
- **AND** LLM identifies relevant table based on table name and COMMENT
- **AND** LLM calls `get_columns()` on the identified table
- **AND** LLM generates SQL based on column information
- **AND** LLM calls `execute_sql()` to submit the generated SQL string (the tool does not run the query; the `/api/query` handler executes SQL against the database)

##### Scenario: User asks about table that doesn't exist
- **WHEN** user asks about data not in any table
- **THEN** LLM completes schema exploration
- **AND** LLM returns message indicating no matching table found

---

### Requirement: SQL Generation with Schema Context

The LLM SHALL generate accurate SQL queries based on discovered schema information.

##### Scenario: Generate aggregation query
- **WHEN** schema exploration reveals a table with columns including date and amount
- **AND** user asks for monthly totals
- **THEN** LLM generates SQL with GROUP BY on date column
- **AND** uses appropriate aggregation function (SUM, AVG, etc.)

##### Scenario: Generate query with JOIN
- **WHEN** data requires joining multiple tables
- **THEN** LLM identifies related tables through schema exploration
- **AND** generates SQL with proper JOIN syntax based on foreign key relationships
