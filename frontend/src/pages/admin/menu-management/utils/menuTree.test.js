import { describe, it, expect } from "vitest";
import {
  filterMenuTree,
  detachNode,
  moveNodeInTree,
} from "./menuTree";

const sampleTree = [
  {
    menu_id: 1,
    menu_nm: "시스템관리",
    menu_cd: "SYS",
    children: [
      {
        menu_id: 10,
        menu_nm: "메뉴관리",
        menu_cd: "SYS_MENU",
        children: [
          { menu_id: 100, menu_nm: "메뉴조회", menu_cd: "SYS_MENU_READ", children: [] },
        ],
      },
      { menu_id: 11, menu_nm: "사용자관리", menu_cd: "SYS_USER", children: [] },
    ],
  },
  { menu_id: 2, menu_nm: "대시보드", menu_cd: "DASH", children: [] },
];

describe("filterMenuTree", () => {
  it("빈 검색어면 원본 그대로 반환", () => {
    expect(filterMenuTree(sampleTree, "")).toBe(sampleTree);
    expect(filterMenuTree(sampleTree, "  ")).toBe(sampleTree);
    expect(filterMenuTree(sampleTree, null)).toBe(sampleTree);
  });

  it("이름으로 매칭 시 자식은 재귀 필터링", () => {
    const result = filterMenuTree(sampleTree, "메뉴");
    expect(result).toHaveLength(1);
    expect(result[0].menu_id).toBe(1);
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children[0].menu_id).toBe(10);
    expect(result[0].children[0].children).toHaveLength(1);
    expect(result[0].children[0].children[0].menu_id).toBe(100);
  });

  it("자식이 매칭되면 부모도 포함, 일치하지 않는 형제는 제외", () => {
    const result = filterMenuTree(sampleTree, "사용자");
    expect(result).toHaveLength(1);
    expect(result[0].menu_id).toBe(1);
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children[0].menu_id).toBe(11);
  });

  it("코드로 매칭", () => {
    const result = filterMenuTree(sampleTree, "DASH");
    expect(result).toHaveLength(1);
    expect(result[0].menu_id).toBe(2);
  });

  it("매칭 없으면 빈 배열", () => {
    expect(filterMenuTree(sampleTree, "없는메뉴")).toEqual([]);
  });
});

describe("detachNode", () => {
  it("존재하는 노드를 제거하고 반환, 원본 배열은 불변", () => {
    const tree = [
      { menu_id: 1, children: [] },
      { menu_id: 2, children: [] },
      { menu_id: 3, children: [] },
    ];
    const result = detachNode(tree, 2);
    expect(result).not.toBeNull();
    expect(result.detached.menu_id).toBe(2);
    expect(result.tree).toHaveLength(2);
    expect(result.tree.map((n) => n.menu_id)).toEqual([1, 3]);
    expect(tree).toHaveLength(3);
  });

  it("중첩 노드 제거", () => {
    const tree = [
      {
        menu_id: 1,
        children: [
          { menu_id: 10, children: [] },
          { menu_id: 11, children: [] },
        ],
      },
    ];
    const result = detachNode(tree, 10);
    expect(result).not.toBeNull();
    expect(result.detached.menu_id).toBe(10);
    expect(result.tree[0].children).toHaveLength(1);
    expect(result.tree[0].children[0].menu_id).toBe(11);
  });

  it("없는 id면 null 반환, 원본 배열 불변", () => {
    const tree = [{ menu_id: 1, children: [] }];
    const removed = detachNode(tree, 999);
    expect(removed).toBeNull();
    expect(tree).toHaveLength(1);
  });
});

describe("moveNodeInTree", () => {
  const baseTree = () => [
    { menu_id: 1, menu_nm: "A", children: [] },
    { menu_id: 2, menu_nm: "B", children: [] },
    { menu_id: 3, menu_nm: "C", children: [] },
  ];

  it("before: target 앞에 삽입", () => {
    const result = moveNodeInTree(baseTree(), 3, 1, "before");
    expect(result.didMove).toBe(true);
    expect(result.tree.map((n) => n.menu_id)).toEqual([3, 1, 2]);
  });

  it("after: target 뒤에 삽입", () => {
    const result = moveNodeInTree(baseTree(), 1, 2, "after");
    expect(result.didMove).toBe(true);
    expect(result.tree.map((n) => n.menu_id)).toEqual([2, 1, 3]);
  });

  it("inside: target의 children 끝에 추가", () => {
    const tree = [
      { menu_id: 1, menu_nm: "A", children: [] },
      { menu_id: 2, menu_nm: "B", children: [] },
    ];
    const result = moveNodeInTree(tree, 2, 1, "inside");
    expect(result.didMove).toBe(true);
    expect(result.tree).toHaveLength(1);
    expect(result.tree[0].children).toHaveLength(1);
    expect(result.tree[0].children[0].menu_id).toBe(2);
  });

  it("없는 draggedId면 didMove false", () => {
    const result = moveNodeInTree(baseTree(), 999, 1, "before");
    expect(result.didMove).toBe(false);
  });

  it("없는 targetId면 didMove false", () => {
    const result = moveNodeInTree(baseTree(), 1, 999, "before");
    expect(result.didMove).toBe(false);
  });

  it("원본 트리는 변경하지 않음", () => {
    const original = baseTree();
    const originalIds = original.map((n) => n.menu_id);
    moveNodeInTree(original, 3, 1, "before");
    expect(original.map((n) => n.menu_id)).toEqual(originalIds);
  });

  it("다른 레벨 간 이동", () => {
    const tree = [
      {
        menu_id: 1,
        menu_nm: "A",
        children: [{ menu_id: 10, menu_nm: "A-1", children: [] }],
      },
      { menu_id: 2, menu_nm: "B", children: [] },
    ];
    const result = moveNodeInTree(tree, 10, 2, "before");
    expect(result.didMove).toBe(true);
    expect(result.tree[0].children).toHaveLength(0);
    expect(result.tree.map((n) => n.menu_id)).toEqual([1, 10, 2]);
  });
});
