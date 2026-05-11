from __future__ import annotations

import re
from typing import Any

_SAFE_VARS: dict[str, dict[str, Any]] = {
    "base_year": {
        "type": "int",
        "validate": lambda v: 1900 <= int(v) <= 3000,
    },
}

_PLACEHOLDER_RE = re.compile(r"\{\{(\w+)\}\}")


def substitute_placeholders(sql: str, ctx: dict | None) -> str:
    if ctx is None:
        return sql

    placeholders = set(_PLACEHOLDER_RE.findall(sql))
    if not placeholders:
        return sql

    for name in placeholders:
        if name not in _SAFE_VARS:
            raise ValueError(f"Unknown placeholder: {{{{{name}}}}}")

    def _replace(m: re.Match) -> str:
        name = m.group(1)
        spec = _SAFE_VARS[name]
        raw = ctx.get(name)
        if raw is None:
            raise ValueError(f"Missing value for placeholder: {{{{{name}}}}}")

        if spec["type"] == "int":
            try:
                val = int(raw)
            except (TypeError, ValueError) as e:
                raise ValueError(
                    f"Invalid integer value for {name}: {raw!r}"
                ) from e
            if not spec["validate"](val):
                raise ValueError(f"Value out of range for {name}: {val}")
            return str(val)

        raise ValueError(f"Unsupported type for placeholder: {name}")

    return _PLACEHOLDER_RE.sub(_replace, sql)
