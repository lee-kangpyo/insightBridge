import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import AdminSearchBar from "../../../../components/common/AdminSearchBar";
import MenuTreeNode from "./MenuTreeNode";
import DragGhost from "./DragGhost";
import { findNodeById } from "../utils/menuTree";

export default function MenuTreePanel({
  roots,
  selectedId,
  onSelect,
  searchTerm,
  onSearchChange,
  onExpandAll,
  onAddRoot,
  onAddScreen,
  loading,
  expandedIds,
  onToggleExpand,
  activeId,
  overId,
  dropPosition,
  invalidTargetIds,
  sensors,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
  menuTree,
  scrollRef,
}) {
  const activeNode = activeId ? findNodeById(menuTree, activeId) : null;

  return (
    <aside className="w-full lg:w-[350px] shrink-0 bg-surface-container-lowest rounded-lg p-6 flex flex-col gap-5 relative min-h-[600px] shadow-[0_8px_32px_rgba(24,28,30,0.04)]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-headline font-semibold text-lg text-primary">
          시스템 계층 구조
        </h2>
        <button
          type="button"
          className="text-secondary hover:bg-secondary-fixed/50 p-1.5 rounded-full transition-colors"
          title="전체 펼치기"
          onClick={onExpandAll}
        >
          <span className="material-symbols-outlined text-[20px]">
            unfold_more
          </span>
        </button>
      </div>
      <AdminSearchBar
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="메뉴 항목 검색..."
        showSubmitButton={false}
      />
      <div ref={scrollRef} className="overflow-y-auto no-scrollbar flex-1 min-h-0 -mx-2 px-2 flex flex-col gap-1 text-sm mt-2">
        {loading ? (
          <p className="text-on-surface-variant text-sm py-4">불러오는 중…</p>
        ) : roots.length === 0 ? (
          <p className="text-on-surface-variant text-sm py-4">
            표시할 메뉴가 없습니다.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
          >
            <SortableContext
              items={roots.map((n) => n.menu_id)}
              strategy={verticalListSortingStrategy}
            >
              {roots.map((node) => (
                <MenuTreeNode
                  key={node.menu_id}
                  node={node}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  searchTerm={searchTerm}
                  expandedIds={expandedIds}
                  onToggleExpand={onToggleExpand}
                  overId={overId}
                  dropPosition={dropPosition}
                  invalidTargetIds={invalidTargetIds}
                  activeId={activeId}
                />
              ))}
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activeNode ? <DragGhost node={activeNode} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
      <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-outline-variant/15">
        <button
          type="button"
          className="flex items-center justify-center gap-2 text-sm font-medium text-secondary hover:text-primary transition-colors"
          onClick={onAddRoot}
        >
          <span className="material-symbols-outlined text-[18px]">
            add_circle
          </span>
          최상위 메뉴 추가
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 text-sm font-medium text-tertiary hover:text-primary transition-colors"
          onClick={onAddScreen}
        >
          <span className="material-symbols-outlined text-[18px]">
            dashboard_customize
          </span>
          슬롯 화면 추가
        </button>
      </div>
    </aside>
  );
}
