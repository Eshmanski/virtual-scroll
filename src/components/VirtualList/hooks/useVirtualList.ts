import { Ref, ref } from "vue";
import { VGroup, VGroupable, VirtualChild, VirtualNode, VirtualParent } from "../utils/type";
import { generateChildId, generateParentId } from "../utils/helpers";

export default function useVirtualList(viewportEl: Ref<HTMLElement | null>) {
    const cursor = ref(0);

    const nodeHeight = ref(50);
    const viewportHeight = ref(100);
    const scrollHeight = ref(100);
    const paddingTop = ref(0);
    const paddingBottom = ref(0);

    const expandId: Ref<number | null> = ref(null);
    const parentList: Ref<VirtualParent[]> = ref([]);
    const visibleList: Ref<VirtualNode[]> = ref([]);
    const flatList: Ref<VirtualNode[]> = ref([]);

    const itemMap = new Map<number, VGroupable>();
    const groupMap = new Map<number, VGroup>();

    const updateMaps = (groups: VGroup[], items: VGroupable[]) => {
        groupMap.clear();
        itemMap.clear();

        groups.forEach(group => groupMap.set(group.id, group));
        items.forEach(item => itemMap.set(item.id, item));
    }

    const updateViewportHeight = () => {
        if (viewportEl.value) 
            viewportHeight.value = viewportEl.value.clientHeight;
    }

    const updateScrollHeight = () => {
        scrollHeight.value = flatList.value.length * nodeHeight.value;
    }

    const updateVisibleList = () => {
        const index = cursor.value;

        const count = Math.ceil(viewportHeight.value / nodeHeight.value);

        const startIndex = Math.max(0, index - count);
        const endIndex = Math.min(flatList.value.length, index + count + count);

        visibleList.value = flatList.value.slice(startIndex, endIndex);

        paddingTop.value = startIndex * nodeHeight.value;
        paddingBottom.value = (flatList.value.length - endIndex) * nodeHeight.value
    }

    let index = 0;
    const scroll = (e: Event) => {
        const newIndex = Math.floor((e.target as HTMLElement).scrollTop / nodeHeight.value);

        if (Math.abs(newIndex - index) > 5) {
            cursor.value = newIndex;
            updateVisibleList();
            index = newIndex;
        }
    }

    const getVirtualMap = (groups: VGroup[], items: VGroupable[]) => {
        const virtualMap: { [key: VGroup['id']]: VGroupable['id'][] } = {}

        groups.forEach(group => {
            virtualMap[group.id] = [];
        })

        if (virtualMap[0]) virtualMap[0] = items.map(item => item.id);
        items.forEach(item => {
            item.groups.forEach(group => {
                if (!virtualMap[group]) virtualMap[group] = [];

                virtualMap[group].push(item.id);
            });
        });

        return virtualMap;
    }

    const getLists = (groups: VGroup[], items: VGroupable[]) => {
        const virtualMap = getVirtualMap(groups, items);

        const fl: VirtualNode[] = [];
        const pl: VirtualParent[] = [];
        let key = 0;
        const uniq = new Set<number>();
        groups.forEach((group: VGroup) => {
            if (uniq.has(group.id)) return;

            uniq.add(group.id);
            const groupId = group.id;
            const ids = virtualMap[groupId];

            const vGroup = groupMap.get(Number(groupId));
            if (!vGroup) return; 

            const parent: VirtualParent = {
                type: 'v-parent',

                id: generateParentId(groupId),
                key: key++,
                childrenCount: ids.length,
                isShow: expandId.value === groupId,

                vGroup: vGroup
            }

            const children: VirtualChild[] = [];
            if (parent.isShow) {
                ids.forEach(id => {
                    const vItem = itemMap.get(id);
                    if (!vItem) return;
    
                    children.push({
                        type: 'v-child',
    
                        id: generateChildId(groupId, id),
                        key: key++,
                        vGroupable: vItem
                    });
                });
            }

            
            pl.push(parent);
            fl.push(parent, ...children);
        });

        return { fl, pl };
    }

    const moveToGroup = (groupId: number, condition?: (oldST: number, newST: number) => boolean) => {
        if (!viewportEl.value) return

        let scrollTop = 0;

        for (let i = 0; i < parentList.value.length; i++) {
            const parent = parentList.value[i];
            if (parent.id === generateParentId(groupId)) {
                scrollTop = parent.key * nodeHeight.value;
                break;
            }  
        }

        if (!condition) viewportEl.value.scrollTop = scrollTop;
        else {
            if (condition(viewportEl.value.scrollTop, scrollTop)) viewportEl.value.scrollTop = scrollTop;
        }
    }

    const getParentCursor = (): number | null => {
        if (viewportEl.value === null) return null

        const newIndex = Math.floor(viewportEl.value.scrollTop / nodeHeight.value);

        for (let i = newIndex; i >= 0; i--) {
            const node = flatList.value[i];
            if (node.type === 'v-parent') {
                return node.vGroup.id;
            }
        }

        return null
    }

    const updateAll = (groups: VGroup[], items: VGroupable[]) => {
        updateMaps(groups, items);

        const { fl, pl } = getLists(groups, items);

        parentList.value = pl;
        flatList.value = fl;

        updateViewportHeight();
        updateScrollHeight();
        updateVisibleList();
    }

    return {
        viewportHeight,
        paddingBottom,
        scrollHeight,
        visibleList,
        parentList,
        paddingTop,
        nodeHeight,
        expandId,
        groupMap,
        flatList,
        itemMap,
        scroll,
        updateAll,
        moveToGroup,
        getParentCursor,
        updateVisibleList,
        updateScrollHeight,
        updateViewportHeight,
    }
}