import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';

const menuData = [
  {
    id: 'M000',
    name: '시스템관리',
    icon: 'settings',
    children: [
      {
        id: 'M100',
        name: '권한관리',
        icon: 'admin_panel_settings',
        children: [
          { id: 'M110', name: '사용자관리', icon: 'group', children: [] },
          { id: 'M120', name: '권한그룹관리', icon: 'groups', children: [] },
        ],
      },
      {
        id: 'M200',
        name: '메뉴관리',
        icon: 'menu',
        children: [
          { id: 'M210', name: '메뉴조회', icon: 'list', children: [] },
          { id: 'M220', name: '메뉴상세조회', icon: 'manage_search', active: true, children: [] },
        ],
      },
    ],
  },
  {
    id: 'M300',
    name: '학사관리',
    icon: 'school',
    children: [
      {
        id: 'M310',
        name: '교원관리',
        icon: 'person',
        children: [
          { id: 'M311', name: '교원현황', icon: 'analytics', children: [] },
        ],
      },
      {
        id: 'M320',
        name: '학생관리',
        icon: 'face',
        children: [
          { id: 'M321', name: '학생현황', icon: 'analytics', children: [] },
        ],
      },
    ],
  },
];

function MenuTreeNode({ node, level = 0, selectedId, onSelect, searchTerm }) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;
  const isActive = node.active;
  const isHighlighted = searchTerm && node.name.toLowerCase().includes(searchTerm.toLowerCase());

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary-container/10 text-error'
            : isActive
            ? 'bg-primary-container/10 text-error'
            : isHighlighted
            ? 'bg-yellow-100 text-primary font-semibold'
            : 'hover:bg-surface-container text-on-surface'
        }`}
        style={{ paddingLeft: level > 0 ? `${level * 12 + 8}px` : '8px' }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <span
            className="material-symbols-outlined text-[18px] text-on-surface-variant cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? 'arrow_drop_down' : 'arrow_right'}
          </span>
        ) : (
          <span className="w-4" />
        )}
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          {node.icon}
        </span>
        <span className={`font-medium text-sm ${isSelected || isActive ? 'text-error font-semibold' : ''}`}>
          {node.name}
        </span>
        {isActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-error ml-1" />
        )}
      </div>
      {hasChildren && expanded && (
        <div className="flex flex-col ml-6 pl-2 border-l border-outline-variant/30 gap-1">
          {node.children.map((child) => (
            <MenuTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuTree({ selectedId, onSelect, searchTerm, onSearchChange }) {
  return (
    <aside className="w-full lg:w-[350px] shrink-0 bg-surface-container-lowest rounded-lg p-6 flex flex-col gap-5 relative group">
      <div className="absolute inset-0 rounded-lg shadow-[0_8px_32px_rgba(24,28,30,0.04)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-headline font-semibold text-lg text-primary">시스템 계층 구조</h2>
        <button className="text-secondary hover:bg-secondary-fixed/50 p-1.5 rounded-full transition-colors" title="Expand All">
          <span className="material-symbols-outlined text-[20px]">unfold_more</span>
        </button>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            className="w-full bg-surface-container-low text-sm text-on-surface py-2 pl-9 pr-3 rounded-md border-b-2 border-transparent focus:bg-surface-container-lowest focus:border-secondary focus:outline-none transition-all placeholder:text-on-surface-variant/70"
            placeholder="메뉴 항목 검색..."
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button
          className="bg-secondary text-on-secondary px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-container transition-colors"
          onClick={() => onSearchChange(searchTerm)}
        >
          검색
        </button>
      </div>
      <div className="overflow-y-auto no-scrollbar max-h-[600px] -mx-2 px-2 flex flex-col gap-1 text-sm mt-2">
        {menuData.map((node) => (
          <MenuTreeNode
            key={node.id}
            node={node}
            selectedId={selectedId}
            onSelect={onSelect}
            searchTerm={searchTerm}
          />
        ))}
      </div>
      <button className="mt-auto pt-4 flex items-center justify-center gap-2 text-sm font-medium text-secondary hover:text-primary transition-colors border-t border-outline-variant/15">
        <span className="material-symbols-outlined text-[18px]">add_circle</span>
        최상위 메뉴 추가
      </button>
    </aside>
  );
}

function MenuDetailForm({ node, formData, onChange, onSave }) {
  if (!node) {
    return (
      <div className="flex-1 bg-surface-container-lowest rounded-lg flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(24,28,30,0.02)]">
        <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-primary to-primary-container" />
        <div className="p-8 flex items-center justify-center h-full">
          <p className="text-on-surface-variant">왼쪽에서 메뉴를 선택하세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-surface-container-lowest rounded-lg flex flex-col relative overflow-hidden shadow-[0_8px_32px_rgba(24,28,30,0.02)]">
      <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-primary to-primary-container" />
      <div className="p-8 flex flex-col gap-6 h-full overflow-y-auto">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="font-label text-xs tracking-wider text-error uppercase mb-1 block">선택 메뉴 상세</span>
            <h2 className="font-headline font-bold text-2xl text-primary flex items-center gap-3">
              <span className="text-error font-medium text-lg">{node.name}</span>
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Menu ID</span>
            <span className="text-xl font-semibold text-primary">{node.id}</span>
          </div>
          <div className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Parent ID</span>
            <span className="text-xl font-semibold text-secondary">-</span>
          </div>
          <div className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Menu Level</span>
            <span className="text-xl font-semibold text-secondary">-</span>
          </div>
          <div className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Sort Order</span>
            <span className="text-xl font-semibold text-secondary">-</span>
          </div>
        </div>
        <div className="border border-outline-variant/50 rounded-xl p-6 flex flex-col gap-8 bg-surface-container-lowest shadow-sm">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
            <h3 className="text-xl font-headline font-semibold text-primary">Node Configuration</h3>
            <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              ACTIVE
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface-variant">메뉴명 (Menu Name)</label>
              <input
                className="border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-medium"
                type="text"
                value={formData.menuName}
                onChange={(e) => onChange({ ...formData, menuName: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface-variant">메뉴유형 (Type)</label>
              <select
                className="bg-surface-container-low border-0 rounded-md px-4 py-2 text-on-surface font-medium focus:ring-2 focus:ring-primary"
                value={formData.menuType}
                onChange={(e) => onChange({ ...formData, menuType: e.target.value })}
              >
                <option>SCREEN</option>
                <option>FOLDER</option>
                <option>LINK</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface-variant">URL / 라우트 (Route Path)</label>
            <input
              className="border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-mono text-sm"
              type="text"
              value={formData.menuUrl}
              onChange={(e) => onChange({ ...formData, menuUrl: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface-variant">화면컴포넌트 (Component Mapping)</label>
            <input
              className="border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 bg-transparent text-on-surface font-mono text-sm"
              type="text"
              value={formData.component}
              onChange={(e) => onChange({ ...formData, component: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface-variant">아이콘 설정 (Icon Configuration)</label>
            <div className="flex items-center gap-4 bg-surface-container-low p-3 rounded-md border border-outline-variant/30">
              <div className="w-10 h-10 bg-surface-container-lowest rounded flex items-center justify-center border border-outline-variant/50 shadow-sm">
                <span className="material-symbols-outlined text-[24px] text-on-surface-variant">{node.icon}</span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  className="flex-1 bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 py-1 text-sm font-mono text-on-surface"
                  readOnly
                  type="text"
                  value={node.icon}
                />
                <button className="px-4 py-1.5 bg-secondary/10 text-secondary text-xs font-semibold rounded hover:bg-secondary/20 transition-colors border border-secondary/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  아이콘 찾기
                </button>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-lg p-5 flex flex-wrap gap-x-12 gap-y-6 items-center">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm font-medium text-on-surface">사용여부</div>
                <div className="text-xs text-on-surface-variant">System active state</div>
              </div>
              <button
                className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none ${
                  formData.useYn ? 'bg-primary' : 'bg-outline'
                }`}
                onClick={() => onChange({ ...formData, useYn: !formData.useYn })}
              >
                <span className={`absolute top-1 w-4 h-4 bg-on-primary rounded-full transition-transform ${
                  formData.useYn ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center gap-4 border-l border-outline-variant/30 pl-8">
              <div>
                <div className="text-sm font-medium text-on-surface">노출여부</div>
                <div className="text-xs text-on-surface-variant">Visible in sidebar</div>
              </div>
              <button
                className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none ${
                  formData.dispYn ? 'bg-primary' : 'bg-outline'
                }`}
                onClick={() => onChange({ ...formData, dispYn: !formData.dispYn })}
              >
                <span className={`absolute top-1 w-4 h-4 bg-on-primary rounded-full transition-transform ${
                  formData.dispYn ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center gap-4 border-l border-outline-variant/30 pl-8">
              <div>
                <div className="text-sm font-medium text-on-surface">권한체크</div>
                <div className="text-xs text-on-surface-variant">Require authorization</div>
              </div>
              <button
                className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none ${
                  formData.authCheck ? 'bg-primary' : 'bg-outline'
                }`}
                onClick={() => onChange({ ...formData, authCheck: !formData.authCheck })}
              >
                <span className={`absolute top-1 w-4 h-4 bg-on-primary rounded-full transition-transform ${
                  formData.authCheck ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface-variant">설명 (Description)</label>
            <textarea
              className="bg-surface-container-low border-0 rounded-md p-4 text-on-surface focus:ring-2 focus:ring-primary resize-none text-sm"
              rows="3"
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-2">
            <button className="px-6 py-2.5 rounded-md border border-error/50 text-error font-medium hover:bg-error/5 transition-colors text-sm">
              삭제 (Delete)
            </button>
            <button
              className="px-6 py-2.5 rounded-md bg-primary text-on-primary font-medium hover:bg-primary-container transition-colors text-sm flex items-center gap-2 shadow-sm"
              onClick={onSave}
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              저장 (Save)
            </button>
          </div>
        </div>
        <div className="mt-auto flex flex-col text-sm text-on-surface-variant border border-outline-variant/50 bg-surface-container-lowest rounded-md p-4 gap-1">
          <div>등록정보: admin / 2026-04-15 09:10</div>
          <div>수정정보: admin / 2026-04-15 14:35</div>
        </div>
        <div className="bg-yellow-100/50 border border-yellow-300 rounded-md p-4 text-sm text-primary font-mono mt-4">
          ts_menu_info 핵심 컬럼 예시: menu_id, up_menu_id, menu_nm, menu_lvl, sort_no, menu_url, use_yn, disp_yn, menu_desc
        </div>
      </div>
    </div>
  );
}

export default function MenuManagement() {
  const [selectedNode, setSelectedNode] = useState(menuData[0].children[1].children[1]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    menuName: '메뉴상세조회',
    menuType: 'SCREEN',
    menuUrl: '/system/menu/detail',
    component: 'MenuDetailPage',
    useYn: true,
    dispYn: true,
    authCheck: true,
    description: '트리에서 선택한 메뉴의 상세 메타정보와 변경 이력을 조회',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    setFormData({
      menuName: node.name,
      menuType: 'SCREEN',
      menuUrl: '/system/menu/detail',
      component: 'MenuDetailPage',
      useYn: true,
      dispYn: true,
      authCheck: true,
      description: '',
    });
  };

  const handleSave = () => {
    const saveData = {
      nodeId: selectedNode.id,
      ...formData,
      savedAt: new Date().toISOString(),
    };
    console.log('저장할 데이터:', JSON.stringify(saveData, null, 2));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="px-10 pb-12 max-w-[1600px] mx-auto flex flex-col gap-8">
      <PageHeader
        title="메뉴 관리"
        description="시스템 탐색 계층 구조를 구성하고, 라우팅 경로를 정의하며, 교육기관 플랫폼 전체의 컴포넌트 가시성을 관리합니다."
      />
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <MenuTree
          selectedId={selectedNode?.id}
          onSelect={handleNodeSelect}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <MenuDetailForm
          node={selectedNode}
          formData={formData}
          onChange={setFormData}
          onSave={handleSave}
        />
      </div>
      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-tertiary-fixed text-on-tertiary-fixed px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[expandIn_0.3s_ease-out]">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="font-medium">변경사항이 저장되었습니다.</span>
        </div>
      )}
    </div>
  );
}