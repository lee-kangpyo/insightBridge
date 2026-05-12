import { countDescendants, menuIcon } from "../utils/menuTree";

export default function DragGhost({ node }) {
  const dc = countDescendants(node);
  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-md bg-surface-container-lowest shadow-lg border border-primary/40 opacity-85 select-none">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
        {menuIcon(node)}
      </span>
      <span className="font-medium text-sm text-on-surface">
        {node.menu_nm}
      </span>
      {dc > 0 && (
        <span className="text-[10px] bg-primary-container text-on-primary-container px-1.5 py-0.5 rounded ml-1">
          외 {dc}개
        </span>
      )}
    </div>
  );
}
