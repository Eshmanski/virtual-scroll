import { nextTick, reactive } from 'vue';
import VirtualListState from './VirtualListState';
import { generateChildId, generateHelpId, generateParentId } from './helpers';
import {
  GetFilterFn,
  GetSortFn,
  VGroup,
  VGroupable,
  VirtualChild,
  VirtualHelp,
  VirtualNode,
  VirtualParent,
} from './_type';

export default class VirtualListCore {
  viewport_el: HTMLDivElement = document.createElement('div');
  block_height: number = 0;
  with_helpers: boolean = false;

  state: VirtualListState = reactive(new VirtualListState());

  private _groupMap = new Map<number, VGroup>();
  private _itemMap = new Map<number, VGroupable>();
  getFilterFn: GetFilterFn | null = null;
  getSortFn: GetSortFn | null = null;
  groups: VGroup[] = [];
  items: VGroupable[] = [];

  private _render_cursor: number = 0;

  setConfig(config: VisualListConfig) {
    this.viewport_el = config.viewport_el ?? document.createElement('div');
    this.block_height = config.block_height ?? 0;
    this.with_helpers = config.with_helpers ?? false;
    this.getFilterFn = config.getFilterFn ?? null;
    this.getSortFn = config.getSortFn ?? null;

    let prevHeight: number | null = null;
    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const height = entries[0].borderBoxSize?.[0].blockSize;

      if (typeof height === 'number' && height !== prevHeight) {
        prevHeight = height;
        this.updateVisibleList();
      }
    });

    observer.observe(this.viewport_el);
  }

  setData(groups: VGroup[], items: VGroupable[]) {
    this.groups = groups;
    this.items = items;

    this.computeList();
  }

  getGroup(id: number) {
    return this._groupMap.get(id);
  }

  getItem(id: number) {
    return this._itemMap.get(id);
  }

  scrollHandle() {
    const newIndex = Math.floor(this.viewport_el.scrollTop / this.block_height);
    this.state.cursor = newIndex;

    if (Math.abs(newIndex - this._render_cursor) > 10) {
      this.updateVisibleList();
      this._render_cursor = newIndex;
    }
  }

  open(position: { id: number; cursor: number }) {
    this.state.expand_id = position.id;
    this.state.cursor = position.cursor;

    this.computeList();

    nextTick(
      () => (this.viewport_el.scrollTop = position.cursor * this.block_height),
    );
  }

  close() {
    const id = this.state.expand_id;
    const cursor = this.state.cursor;

    if (id === null) return null;

    this.state.expand_id = null;
    this.computeList();

    return { id, cursor };
  }

  expandGroup(id: number, flag: boolean) {
    const parentCursorId = this.getParentCursor() ?? 0;

    if (flag) this.state.expand_id = id;
    else this.state.expand_id = null;

    this.computeList();

    if (parentCursorId !== null) this.moveToGroup(parentCursorId);
  }

  getParentCursor() {
    for (let i = this.state.cursor; i >= 0; i--) {
      const node = this.state.flat_list[i];

      if (node.type === 'v-parent') {
        return node.vGroup.id;
      }
    }

    return null;
  }

  moveToGroup(id: number) {
    let scrollTop = 0;
    for (let i = 0; i < this.state.parent_list.length; i++) {
      const item = this.state.parent_list[i];

      if (item.id === generateParentId(id)) {
        scrollTop = item.key * this.block_height;
        break;
      }
    }

    this.viewport_el.scrollTop = scrollTop;
  }

  moveToItem(id: number) {
    const index = this.state.flat_list.findIndex((node) => {
      if (node.type === 'v-child') {
        return node.vGroupable.id === id;
      } else return false;
    });

    if (index === -1) return false;
    else {
      this.viewport_el.scrollTop = Math.max(index - 2, 0) * this.block_height;
      return true;
    }
  }

  computeList() {
    this.updateMaps(this.groups, this.items);

    const { fl, pl } = this.getFlatLists(this.groups, this.items);

    this.state.flat_list = fl;
    this.state.parent_list = pl;

    this.updateScrollHeight();
    this.updateVisibleList();
  }

  updateVisibleList() {
    const viewportHeight = this.viewport_el.clientHeight;

    const index = this.state.cursor;
    const count = Math.ceil(viewportHeight / this.block_height);

    const startIndex = Math.max(0, index - count);
    const endIndex = Math.min(this.state.flat_list.length, index + count * 2);

    this.state.visible_list = this.state.flat_list.slice(startIndex, endIndex);

    this.state.padding_top = startIndex * this.block_height;
    this.state.padding_bottom = this.state.flat_list.length * this.block_height;
  }

  updateMaps(groups: VGroup[], items: VGroupable[]) {
    this._groupMap.clear();
    this._itemMap.clear();

    groups.forEach((group) => this._groupMap.set(group.id, group));
    items.forEach((item) => this._itemMap.set(item.id, item));
  }

  updateScrollHeight() {
    this.state.content_height =
      (this.state.flat_list.length + 1) * this.block_height;
  }

  private getGroupedList(groups: VGroup[], items: VGroupable[]) {
    const filteredItems = this.filter(items);
    const groupedList: Map<VGroup, VGroupable[]> = new Map();

    groups.forEach((group) =>
      groupedList.set(group, group.id === 0 ? filteredItems : []),
    );

    filteredItems.forEach((item) => {
      item.groups.forEach((groupId: number) => {
        const group = this._groupMap.get(groupId);
        if (!group) return;

        if (!groupedList.has(group)) groupedList.set(group, []);

        const arr = groupedList.get(group);
        if (arr) arr.push(item);
      });
    });

    return groupedList;
  }

  private getFlatLists(groups: VGroup[], items: VGroupable[]) {
    const groupedList = this.getGroupedList(groups, items);

    const fl: VirtualNode[] = [];
    const pl: VirtualParent[] = [];

    let key = 0;
    Array.from(groupedList.entries()).forEach(([group, items]) => {
      const isShowGroup = this.state.expand_id === group.id;
      const processedItems = isShowGroup ? this.sort(group.id, items) : items;
      const parent = this.getParentNode(group, processedItems, key++);
      const helper = this.getHelperNode(group, key++);
      const children = isShowGroup
        ? processedItems.map((item, index) =>
            this.getChildNode(group, item, key++, index),
          )
        : [];

      parent.isShow = isShowGroup;

      const toAddHelper = isShowGroup && this.with_helpers;

      pl.push(parent);
      fl.push(parent);
      if (toAddHelper) fl.push(helper);
      fl.push(...children);
    });

    return { fl, pl };
  }

  private getParentNode(group: VGroup, items: VGroupable[], index: number) {
    return {
      type: 'v-parent',
      id: generateParentId(group.id),
      key: index,
      vGroup: group,
      children: items,
      isShow: false,
    } as VirtualParent;
  }

  private getHelperNode(group: VGroup, index: number) {
    return {
      type: 'v-help',
      id: generateHelpId(group.id),
      key: index,
    } as VirtualHelp;
  }

  private getChildNode(
    group: VGroup,
    item: VGroupable,
    index: number,
    localIndex: number,
  ) {
    return {
      type: 'v-child',
      id: generateChildId(group.id, item.id),
      key: index,
      localIndex: localIndex,
      parentId: group.id,
      vGroupable: item,
    } as VirtualChild;
  }

  private filter(items: VGroupable[]) {
    if (!this.getFilterFn) return items;

    const filterFn = this.getFilterFn();
    return [...items].filter((item) => filterFn(item));
  }

  private sort(groupId: number, items: VGroupable[]) {
    if (!this.getSortFn) return items;

    const sortFn = this.getSortFn(groupId);
    return [...items].sort((a, b) => sortFn(a, b));
  }
}

type VisualListConfig = {
  viewport_el?: HTMLDivElement;
  block_height?: number;
  with_helpers?: boolean;
  getFilterFn?: GetFilterFn | null;
  getSortFn?: GetSortFn | null;
};
