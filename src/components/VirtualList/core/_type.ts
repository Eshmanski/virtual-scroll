export interface VGroupable {
  id: number;
  groups: number[];
}

export interface VGroup {
  id: number;
  name: string;
}

export type VirtualNode = VirtualParent | VirtualHelp | VirtualChild;

export type VirtualParent = {
  type: 'v-parent';

  id: string;
  key: number;
  children: VGroupable[];
  isShow?: boolean;

  vGroup: VGroup;
};

export type VirtualHelp = {
  type: 'v-help';
  id: string;
  key: number;
};

export type VirtualChild = {
  type: 'v-child';

  id: string;
  key: number;
  localIndex: number;
  vGroupable: VGroupable;
  parentId: number;
};

export type GetFilterFn = () => (a: VGroupable) => boolean;
export type GetSortFn = (
  groupId: number,
) => (a: VGroupable, b: VGroupable) => number;

export type ScrollProgressConfig = {
  scrollTop: number;
  minSY: number;
  minCY: number;
  maxSY: number;
  maxCY: number;
  offset: number;
};

export type ScrollConfig = {
  block_height?: number;
  disabled?: boolean;
  viewport_el?: HTMLDivElement;
  content_el?: HTMLDivElement;
  scroll_el?: HTMLDivElement;
  thumb_el?: HTMLDivElement;
};

export type VDropEvent = (item: VGroupable, gFrom: VGroup, gTo: VGroup) => void;
