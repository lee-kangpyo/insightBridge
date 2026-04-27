-- Task 1.1: ts_scr_info에 template_id 컬럼 추가
ALTER TABLE ts_scr_info ADD COLUMN IF NOT EXISTS template_id INTEGER;
COMMENT ON COLUMN ts_scr_info.template_id IS '화면이 사용하는 템플릿 ID (ts_scr_template_info 참조)';

-- Task 1.2: ts_scr_item 통합 테이블 생성
CREATE TABLE IF NOT EXISTS ts_scr_item (
    item_id SERIAL PRIMARY KEY,
    item_nm VARCHAR(200) NOT NULL,
    shape_cnts_id INTEGER,
    sql_cnts_id INTEGER,
    mapping_json JSONB,
    reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    del_fg CHAR(1) DEFAULT 'N'
);

COMMENT ON TABLE ts_scr_item IS '화면 아이템 통합 테이블 (형태/SQL/매핑 규칙)';
COMMENT ON COLUMN ts_scr_item.item_id IS '아이템 ID';
COMMENT ON COLUMN ts_scr_item.item_nm IS '아이템 이름';
COMMENT ON COLUMN ts_scr_item.shape_cnts_id IS '형태(차트/그리드/카드)용 ts_cnts_info 참조';
COMMENT ON COLUMN ts_scr_item.sql_cnts_id IS 'SQL 데이터용 ts_cnts_info 참조 (cnts_tp=sql)';
COMMENT ON COLUMN ts_scr_item.mapping_json IS 'SQL 결과를 UI에 매핑하는 규칙 (JSON)';

-- Task 1.3: ts_scr_slot_item 테이블 생성
CREATE TABLE IF NOT EXISTS ts_scr_slot_item (
    scr_id VARCHAR(50) NOT NULL,
    slot_id VARCHAR(50) NOT NULL,
    item_id INTEGER,
    reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (scr_id, slot_id)
);

COMMENT ON TABLE ts_scr_slot_item IS '화멸별 슬롯-아이템 배치 테이블';
COMMENT ON COLUMN ts_scr_slot_item.scr_id IS '화면 ID';
COMMENT ON COLUMN ts_scr_slot_item.slot_id IS '슬롯 ID';
COMMENT ON COLUMN ts_scr_slot_item.item_id IS '배치된 아이템 ID (ts_scr_item 참조)';

-- Task 1.4: 기존 테이블에 "삭제 예정" 코멘트 추가
COMMENT ON TABLE ts_scr_item_info_map IS '삭제 예정: ts_scr_item으로 대첸';
COMMENT ON TABLE ts_scr_item_info_map_dtl IS '삭제 예정: ts_scr_item.mapping_json으로 대첸';
COMMENT ON TABLE ts_scr_item_map IS '삭제 예정: ts_scr_slot_item으로 대첸';
COMMENT ON TABLE ts_scr_template_slot_scr IS '삭제 예정: ts_scr_slot_item으로 대첸';
