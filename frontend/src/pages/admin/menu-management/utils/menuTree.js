export function menuIcon(node) {
  if (node.screen_id) return "dashboard";
  if (node.children && node.children.length > 0) return "folder";
  return "description";
}

export function filterMenuTree(nodes, term) {
  if (!term || !term.trim()) return nodes;
  const q = term.trim().toLowerCase();
  const walk = (list) => {
    const out = [];
    for (const n of list) {
      const nm = (n.menu_nm || "").toLowerCase();
      const cd = (n.menu_cd || "").toLowerCase();
      const selfMatch = nm.includes(q) || cd.includes(q);
      const kids = n.children ? walk(n.children) : [];
      if (selfMatch || kids.length) {
        out.push({ ...n, children: kids });
      }
    }
    return out;
  };
  return walk(nodes);
}

export function findNodeById(nodes, id) {
  for (const n of nodes) {
    if (n.menu_id === id) return n;
    if (n.children?.length) {
      const f = findNodeById(n.children, id);
      if (f) return f;
    }
  }
  return null;
}

export function getDescendantIds(node) {
  const ids = new Set();
  function walk(n) {
    if (n.children) {
      for (const child of n.children) {
        ids.add(child.menu_id);
        walk(child);
      }
    }
  }
  walk(node);
  return ids;
}

export function countDescendants(node) {
  if (!node.children) return 0;
  let count = node.children.length;
  for (const child of node.children) {
    count += countDescendants(child);
  }
  return count;
}

export function findParentChain(nodes, targetId, path = []) {
  for (const node of nodes) {
    if (node.menu_id === targetId) return path;
    if (node.children?.length) {
      const result = findParentChain(node.children, targetId, [
        ...path,
        node.menu_id,
      ]);
      if (result) return result;
    }
  }
  return null;
}

export function cloneMenuTree(nodes) {
  return nodes.map((n) => ({
    ...n,
    children: n.children ? cloneMenuTree(n.children) : [],
  }));
}

export function detachNode(nodes, nodeId) {
  for (let i = 0; i < nodes.length; i += 1) {
    if (nodes[i].menu_id === nodeId) {
      const removed = nodes[i];
      const newNodes = nodes.filter((_, idx) => idx !== i);
      return { tree: newNodes, detached: removed };
    }
    if (nodes[i].children?.length) {
      const result = detachNode(nodes[i].children, nodeId);
      if (result) {
        const newChildren = result.tree;
        const newNode = { ...nodes[i], children: newChildren };
        const newNodes = [
          ...nodes.slice(0, i),
          newNode,
          ...nodes.slice(i + 1),
        ];
        return { tree: newNodes, detached: result.detached };
      }
    }
  }
  return null;
}

export function findParentListForTarget(nodes, targetId) {
  for (const n of nodes) {
    if (n.menu_id === targetId) {
      return { list: nodes, index: nodes.indexOf(n), target: n };
    }
    if (n.children?.length) {
      const r = findParentListForTarget(n.children, targetId);
      if (r) return r;
    }
  }
  return null;
}

export function moveNodeInTree(tree, draggedId, targetId, position) {
  const next = cloneMenuTree(tree);
  const result = detachNode(next, draggedId);
  if (!result) return { tree: next, didMove: false };

  const { tree: treeWithoutDragged, detached } = result;
  const targetInfo = findParentListForTarget(treeWithoutDragged, targetId);
  if (!targetInfo) return { tree: next, didMove: false };

  if (position === "inside") {
    const t = targetInfo.target;
    if (!t.children) t.children = [];
    t.children.push(detached);
    return { tree: treeWithoutDragged, didMove: true };
  }

  const insertIndex =
    position === "before" ? targetInfo.index : targetInfo.index + 1;
  targetInfo.list.splice(insertIndex, 0, detached);
  return { tree: treeWithoutDragged, didMove: true };
}

export function collectAllIds(nodes) {
  const ids = new Set();
  function walk(list) {
    for (const n of list) {
      ids.add(n.menu_id);
      if (n.children) walk(n.children);
    }
  }
  walk(nodes);
  return ids;
}