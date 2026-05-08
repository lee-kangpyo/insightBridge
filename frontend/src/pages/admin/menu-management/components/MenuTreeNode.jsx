import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { menuIcon } from "../utils/menuTree";

export default function MenuTreeNode({
  node,
  level = 0,
  selectedId,
  onSelect,
  searchTerm,
  expandedIds,
  onToggleExpand,
  overId,
  dropPosition,
  invalidTargetIds,
  activeId,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.menu_id,
    disabled: node.del_fg === "Y",
  });

  const expanded = expandedIds.has(node.menu_id);
  const hasChildren = node.children && node.children.length > 0;
  const mid = node.menu_id;
  const isSelected = selectedId === mid;
  const isDeleted = node.del_fg === "Y";
  const isDisabled = String(node.use_yn ?? "Y").toUpperCase() === "N";
  const isHighlighted =
    searchTerm &&
    (node.menu_nm || "").toLowerCase().includes(searchTerm.toLowerCase());
  const icon = menuIcon(node);

  const isOverTarget = overId === mid;
  const isInvalid = isOverTarget && invalidTargetIds.has(mid);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    border: isDragging ? "1px dashed var(--color-outline-variant)" : undefined,
    borderRadius: isDragging ? 6 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-menu-id={mid}
      className="select-none"
    >
      {isOverTarget && dropPosition === "before" && !isInvalid && (
        <div
          className="relative h-0 mx-2 animate-[dropLineIn_0.2s_ease-out]"
          style={{ top: "-1px" }}
        >
          <div className="absolute left-0 right-0 h-[3px] bg-primary rounded-full" />
        </div>
      )}

      <div
        className={`flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer transition-all duration-150 ${
          isSelected
            ? "bg-primary-container/10 text-error"
            : isDeleted
              ? "opacity-40"
              : isDisabled
                ? "opacity-70"
                : isHighlighted
                  ? "bg-yellow-100 text-primary font-semibold"
                  : "hover:bg-surface-container text-on-surface"
        } ${
          isOverTarget && dropPosition === "inside" && !isInvalid
            ? "!bg-primary-container/15 border-l-2 !border-primary"
            : ""
        } ${
          isInvalid
            ? "!bg-error/10 border-l-2 !border-error"
            : ""
        }`}
        style={{ paddingLeft: level > 0 ? `${level * 12 + 8}px` : "8px" }}
        onClick={() => onSelect(node)}
        {...attributes}
        {...listeners}
      >
        {hasChildren ? (
          <span
            className="material-symbols-outlined text-[18px] text-on-surface-variant cursor-pointer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(mid);
            }}
          >
            {expanded ? "arrow_drop_down" : "arrow_right"}
          </span>
        ) : (
          <span className="w-4" />
        )}
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
          {icon}
        </span>
        <span
          className={`font-medium text-sm ${isSelected ? "text-error font-semibold" : ""}`}
        >
          {node.menu_nm}
        </span>
        {node.screen_id ? (
          <span className="text-[10px] uppercase bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded ml-1">슬롯</span>
        ) : null}
        {isDeleted ? (
          <span className="text-[10px] uppercase text-outline ml-1">del</span>
        ) : isDisabled ? (
          <span className="text-[10px] uppercase text-outline ml-1">off</span>
        ) : null}
      </div>

      {isOverTarget && dropPosition === "after" && !isInvalid && (
        <div
          className="relative h-0 mx-2 animate-[dropLineIn_0.2s_ease-out]"
          style={{ top: "-1px" }}
        >
          <div className="absolute left-0 right-0 h-[3px] bg-primary rounded-full" />
        </div>
      )}

      {hasChildren && expanded && (
        <div className="flex flex-col ml-6 pl-2 border-l border-outline-variant/30 gap-1">
          {node.children.map((child) => (
            <MenuTreeNode
              key={child.menu_id}
              node={child}
              level={level + 1}
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
        </div>
      )}
    </div>
  );
}
