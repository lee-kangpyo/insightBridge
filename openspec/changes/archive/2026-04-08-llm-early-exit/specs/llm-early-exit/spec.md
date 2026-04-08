## ADDED Requirements

### Requirement: done tool for explicit termination

The system SHALL provide a `done(reason: str)` tool that LLM calls when it reaches a final conclusion that cannot be resolved with further schema exploration or SQL generation.

#### Scenario: LLM calls done with "no data" reason
- **WHEN** LLM determines that the requested data does not exist in the database schema
- **THEN** LLM calls `done(reason="데이터베이스에 해당 데이터가 없습니다.")`
- **AND** the chain terminates immediately without further iterations

#### Scenario: LLM calls done with other final conclusion
- **WHEN** LLM reaches any other final conclusion (e.g., requires user clarification)
- **THEN** LLM calls `done(reason="<conclusion>")`
- **AND** the chain terminates immediately

### Requirement: done tool call detection

The chain SHALL detect when LLM calls the `done` tool and terminate immediately.

#### Scenario: done tool call detected
- **WHEN** LLM invokes the `done` tool in any iteration
- **THEN** the chain stops processing further iterations
- **AND** returns the `done` reason to the caller

### Requirement: Iterations fallback for repeated content

The system SHALL detect when LLM produces repeated "no data" content across consecutive iterations and terminate early.

#### Scenario: Content pattern repeats N times
- **WHEN** LLM responds with tool_calls=[] and content containing similar "no data" language for 3 or more consecutive iterations
- **THEN** the chain terminates early before reaching MAX_ITERATIONS
- **AND** returns None to indicate no SQL could be generated

### Requirement: Early termination response handling

The system SHALL return early termination results to the frontend with appropriate HTTP status and message.

#### Scenario: LLM terminates via done tool
- **WHEN** chain terminates due to `done()` tool call
- **THEN** API returns HTTP 200 with `{data: null, message: <done_reason>}`

#### Scenario: Chain terminates via iterations fallback
- **WHEN** chain terminates due to repeated content detection (same LLM response 3+ consecutive times)
- **THEN** API returns HTTP 200 with `{data: null, message: <last_llm_content>}`
- **NOTE** The message is the actual LLM-generated content from the last repeated response (dynamic, not hardcoded), providing more informative feedback to the user

#### Scenario: LLM generates valid SQL
- **WHEN** LLM successfully generates SQL via `execute_sql` tool call
- **THEN** chain returns the SQL normally
- **AND** API processes the query and returns results
