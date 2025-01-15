import { VirtualNode, VirtualParent } from './_type';

export default class VirtualListState {
  cursor: number = 0;
  expand_id: number | null = null;

  viewport_height: number = 0;
  content_height: number = 0;

  padding_top: number = 0;
  padding_bottom: number = 0;

  flat_list: VirtualNode[] = [];
  parent_list: VirtualParent[] = [];
  visible_list: VirtualNode[] = [];

  get contentStyle() {
    return {
      height: this.content_height + 'px',
    };
  }

  get paddingStyle() {
    return {
      paddingTop: this.padding_top + 'px',
      paddingBottom: this.padding_bottom + 'px',
    };
  }
}
