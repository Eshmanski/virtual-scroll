import { VDropEvent, VGroup } from '../core/_type';
import VirtualListCore from '../core/VirtualListCore';

export default function useDragDrop(virtualList: VirtualListCore) {
  const fn = (e: Event) => e.preventDefault();
  let oldPosition: { id: number; cursor: number } | null = null;

  let onDrop: VDropEvent = () => {};

  const dragStart = () => {
    setTimeout(() => {
      oldPosition = virtualList.close();

      window.addEventListener('dragover', fn);
      window.addEventListener('drop', dragEnd);
    }, 100);
  };

  const dragEnd = () => {
    if (!oldPosition) return;

    virtualList.open(oldPosition);

    window.removeEventListener('dragover', fn);
    window.removeEventListener('drop', dragEnd);
  };

  const dropItem = (id: string, groupTo: VGroup) => {
    const [groupIdFrom, itemId] = id
      .split('-')
      .map((str) => Number(str.split('#')[1]));

    if (!isNaN(groupIdFrom) && !isNaN(itemId)) {
      const groupFrom = virtualList.getGroup(groupIdFrom);
      const item = virtualList.getItem(itemId);

      if (groupFrom && item) onDrop(item, groupFrom, groupTo);
    }
  };

  const setOnDrop = (fn: VDropEvent) => {
    onDrop = fn;
  };

  return { dragStart, dropItem, setOnDrop };
}
