INSERT INTO ts_grp_menu (grp_id, menu_id, reg_dt)
SELECT 6, menu_id, NOW()
FROM ts_menu_info
WHERE del_fg = 'N'
ON CONFLICT (grp_id, menu_id) DO NOTHING;
