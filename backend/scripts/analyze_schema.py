import asyncio
import json
import logging
import re
import sys
from pathlib import Path
from typing import Any, Dict, List

# backend 팩키지 경로 추가
sys.path.append(str(Path(__file__).parent.parent.parent))

from backend.app.database import get_pool

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def validate_identifier(identifier: str) -> bool:
    """
    SQL 식별자(테이블/컬럼명) 전용 화이트리스트 정규식 검증.
    영문 대소문자, 숫자, 언더스코어(_)만 허용하며 숫자로 시작할 수 없음.
    """
    if not identifier:
        return False
    return bool(re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", identifier))

async def analyze():
    pool = await get_pool()
    async with pool.acquire() as conn:
        logger.info("Fetching tables...")
        # 1. 테이블과 컬럼 목록 추출
        tables = await conn.fetch(
            "SELECT relname FROM pg_class WHERE relkind = 'r' AND relnamespace = 'public'::regnamespace"
        )
        table_names = [t["relname"] for t in tables]
        logger.info(f"Found {len(table_names)} tables.")

        schema_data: Dict[str, List[Dict[str, str]]] = {}
        for tname in table_names:
            if not validate_identifier(tname):
                logger.warning(f"Skipping potentially unsafe table name: {tname}")
                continue

            cols = await conn.fetch(
                """
                SELECT attname, format_type(atttypid, atttypmod) as data_type
                FROM pg_attribute
                WHERE attrelid = $1::regclass AND attnum > 0 AND not attisdropped
                """,
                tname,
            )
            schema_data[tname] = [{"name": c["attname"], "type": c["data_type"]} for c in cols]

        relations = []
        samples = {}
        sql_comments = []

        logger.info("Extracting samples...")
        # 2. 관계(FK) 유추 및 카테고리 데이터 샘플 추출
        for tname, cols in schema_data.items():
            if not validate_identifier(tname):
                continue

            for c in cols:
                cname = c["name"]
                ctype = c["type"]
                
                if not validate_identifier(cname):
                    logger.warning(f"Skipping potentially unsafe column name: {tname}.{cname}")
                    continue

                # Enum 샘플 추출: 모든 텍스트 컬럼 중 카디널리티가 낮은(<=20) 항목을 샘플링합니다.
                if "char" in ctype or "text" in ctype:
                    try:
                        # 이미 validate_identifier를 통과했으므로 f-string 사용이 안전함
                        dist_cnt_row = await conn.fetchrow(f'SELECT COUNT(DISTINCT "{cname}") as cnt FROM "{tname}"')
                        dist_cnt = dist_cnt_row["cnt"] if dist_cnt_row else 0
                        
                        if 0 < dist_cnt <= 20:
                            top_vals = await conn.fetch(
                                f'SELECT "{cname}" FROM "{tname}" WHERE "{cname}" IS NOT NULL GROUP BY "{cname}" ORDER BY count(*) DESC LIMIT 5'
                            )
                            vals = [str(r[cname]) for r in top_vals]
                            samples[f"{tname}.{cname}"] = vals
                            
                            vals_str = ", ".join(vals)
                            sql_comments.append(
                                f'COMMENT ON COLUMN "{tname}"."{cname}" IS \'샘플: {vals_str} 등\';'
                            )
                    except Exception as e:
                        logger.warning(f"Failed to analyze {tname}.{cname}: {e}")

        logger.info("Finding relations...")
        # JOIN 관계 찾기 (이름이 완전히 동일한 경우만 확인)
        for i in range(len(table_names)):
            for j in range(i + 1, len(table_names)):
                t1 = table_names[i]
                t2 = table_names[j]
                
                if not (validate_identifier(t1) and validate_identifier(t2)):
                    continue

                if t1 not in schema_data or t2 not in schema_data:
                    continue

                t1_cols_dict = {c["name"]: c["type"] for c in schema_data[t1]}
                t2_cols_dict = {c["name"]: c["type"] for c in schema_data[t2]}
                
                common_cols = set(t1_cols_dict.keys()).intersection(t2_cols_dict.keys())
                for common_col in common_cols:
                    if not validate_identifier(common_col):
                        continue

                    if not (common_col.endswith("_cd") or common_col.endswith("_code") or common_col.endswith("_id")):
                        continue
                    if common_col in ("year", "base_year", "id"):
                        continue
                    if t1_cols_dict[common_col] != t2_cols_dict[common_col]:
                        continue

                    try:
                        q1 = await conn.fetchrow(f'SELECT COUNT(DISTINCT "{common_col}") as cnt FROM "{t1}"')
                        q2 = await conn.fetchrow(f'SELECT COUNT(DISTINCT "{common_col}") as cnt FROM "{t2}"')
                        c1 = q1["cnt"]
                        c2 = q2["cnt"]
                        
                        if c1 == 0 or c2 == 0:
                            continue
                            
                        inter_q = await conn.fetchrow(
                            f'SELECT COUNT(DISTINCT "{common_col}") as cnt FROM "{t1}" WHERE "{common_col}" IN (SELECT "{common_col}" FROM "{t2}")'
                        )
                        inter = inter_q["cnt"]
                        
                        # 교집합이 두 테이블 중 더 작은 쪽의 50% 이상이면 관계 성립으로 간주
                        if inter / min(c1, c2) > 0.5:
                            relations.append({
                                "source_table": t1,
                                "source_column": common_col,
                                "target_table": t2,
                                "target_column": common_col
                            })
                    except Exception as e:
                        logger.warning(f"Failed to find intersection for {t1}.{common_col} and {t2}.{common_col}: {e}")

        # 결과 저장 (backend 디렉토리 최상단)
        logger.info("Saving metadata...")
        metadata = {
            "relations": relations,
            "samples": samples
        }
        
        backend_dir = Path(__file__).parent.parent
        json_path = backend_dir / "schema_metadata.json"
        sql_path = backend_dir / "schema_comments.sql"
        
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
            
        with open(sql_path, "w", encoding="utf-8") as f:
            f.write("\n".join(sql_comments))

        logger.info(f"Analysis complete. Found {len(relations)} relations and {len(samples)} enums. Saved to {backend_dir}")

if __name__ == "__main__":
    asyncio.run(analyze())
