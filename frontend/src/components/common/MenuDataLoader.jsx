export async function loadMenuData(univCd) {
  console.log('[MenuDataLoader]Loading menu data from ts_menu_info...');
  try {
    const mockMenuData = [
      { menu_id: 1, menu_cd: 'test_menu1', menu_nm: '종합현황', up_menu_id: null, menu_lvl: 1, menu_path: '/overview', sort_order: 1, del_fg: 'N', univ_cd: '0131000' },
      { menu_id: 2, menu_cd: 'test_menu2', menu_nm: '입시/충원', up_menu_id: null, menu_lvl: 1, menu_path: '/admission', sort_order: 2, del_fg: 'N', univ_cd: '0131000' },
      { menu_id: 3, menu_cd: 'test_menu3', menu_nm: '학생/진로', up_menu_id: null, menu_lvl: 1, menu_path: '/student', sort_order: 3, del_fg: 'N', univ_cd: '0131000' },
      { menu_id: 4, menu_cd: 'test_menu4', menu_nm: '교육/교원', up_menu_id: null, menu_lvl: 1, menu_path: '/education', sort_order: 4, del_fg: 'N', univ_cd: '0131000' },
      { menu_id: 5, menu_cd: 'test_menu5', menu_nm: '연국/산학/창업', up_menu_id: null, menu_lvl: 1, menu_path: '/research', sort_order: 5, del_fg: 'N', univ_cd: '0131000' },
      { menu_id: 6, menu_cd: 'test_menu6', menu_nm: '재정/등록금/학생지원', up_menu_id: null, menu_lvl: 1, menu_path: '/finance', sort_order: 6, del_fg: 'N', univ_cd: '0131000' },
      { menu_id: 7, menu_cd: 'test_menu7', menu_nm: '캠퍼스/복지/안전', up_menu_id: null, menu_lvl: 1, menu_path: '/campus', sort_order: 7, del_fg: 'N', univ_cd: '0131000' },
      { menu_id: 8, menu_cd: 'test_menu8', menu_nm: '거버넌스', up_menu_id: null, menu_lvl: 1, menu_path: '/governance', sort_order: 8, del_fg: 'N', univ_cd: '0131000' },
      { menu_id: 9, menu_cd: 'test_menu9', menu_nm: '삭제된 메뉴', up_menu_id: null, menu_lvl: 1, menu_path: '/deleted', sort_order: 9, del_fg: 'Y', univ_cd: '0131000' },
    ];

    let filteredData = mockMenuData.filter(menu => menu.del_fg !== 'Y');

    if (univCd) {
      filteredData = filteredData.filter(menu => menu.univ_cd === univCd);
    }

    filteredData.sort((a, b) => a.sort_order - b.sort_order);

    console.log('[MenuDataLoader]Loaded menu data:', JSON.stringify(filteredData, null, 2));
    return filteredData;
  } catch (error) {
    console.error('[MenuDataLoader]Error loading menu data:', error);
    return [];
  }
}
