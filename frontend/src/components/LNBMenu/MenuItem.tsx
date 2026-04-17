import { useState } from 'react';
import MaterialIcon from '../MaterialIcon';

export default function MenuItem({ menu }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = menu.children && menu.children.length > 0;

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 px-4 py-2.5 cursor-pointer rounded-r-lg transition-colors duration-150 hover:bg-surface-container-high"
        onClick={() => hasChildren && setExpanded(!expanded)}
        role={hasChildren ? 'button' : undefined}
        aria-expanded={hasChildren ? expanded : undefined}
      >
        <span className="text-sm font-medium text-on-surface flex-1">
          {menu.menu_nm}
        </span>
        {hasChildren && (
          <MaterialIcon
            name={expanded ? 'expand_less' : 'expand_more'}
            className="text-on-surface-variant text-base"
          />
        )}
      </div>
      {hasChildren && expanded && (
        <div className="ml-4 border-l border-outline-variant pl-2">
          {menu.children.map((child) => (
            <MenuItem key={child.menu_id} menu={child} />
          ))}
        </div>
      )}
    </div>
  );
}