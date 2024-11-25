<script setup lang="ts">
import { VGroup, VGroupable, VirtualChild, VirtualNode, VirtualParent } from './utils/type';
import { generateChildId, generateParentId } from './utils/helpers';
import { PropType, Ref, ref, watch } from 'vue';
import EmptyBlock from './EmptyBlock.vue';
import ParentBlock from './ParentBlock.vue';
import ChildBlock from './ChildBlock.vue';

const props = defineProps({
    groups: {
        type: Array as PropType<VGroup[]>,
        required: true
    },

    items: {
        type: Array as PropType<VGroupable[]>,
        required: true
    }
});

const viewportEl: Ref<HTMLDivElement | null> = ref(null);

const nodeHeight = ref(50);
const viewportHeight = ref(100);
const scrollHeight = ref(100);
const paddingTop = ref(0);
const paddingBottom = ref(0);

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

const updateVisibleList = (index: number) => {
    const count = Math.ceil(viewportHeight.value / nodeHeight.value);

    const startIndex = Math.max(0, index - count);
    const endIndex = Math.min(flatList.value.length, index + count + count);

    visibleList.value = flatList.value.slice(startIndex, endIndex);

    paddingTop.value = startIndex * nodeHeight.value;
    paddingBottom.value = (flatList.value.length - endIndex) * nodeHeight.value

    console.log(visibleList.value)
}

let index = 0;
const scroll = (e: Event) => {
    const newIndex = Math.floor((e.target as HTMLElement).scrollTop / nodeHeight.value);

    if (Math.abs(newIndex - index) > 5) {
        updateVisibleList(newIndex);
        index = newIndex;
    }
}


watch(props, () => {
    updateMaps(props.groups, props.items);

    const virtualMap: { [key: VGroup['id']]: VGroupable['id'][] } = {}
    props.items.forEach(item => {
        item.groups.forEach(group => {
            if (!virtualMap[group]) virtualMap[group] = [];

            virtualMap[group].push(item.id);
        });
    });

    const fl: VirtualNode[] = [];
    const pl: VirtualParent[] = [];
    let key = 0;
    Object.entries(virtualMap).forEach(([groupId, ids]) => {
        const vGroup = groupMap.get(Number(groupId));
        if (!vGroup) return; 

        const parent: VirtualParent = {
            type: 'v-parent',

            id: generateParentId(groupId),
            key: key++,
            childrenCount: ids.length,

            vGroup: vGroup
        }

        const children: VirtualChild[] = [];
        ids.forEach(id => {
            const vItem = itemMap.get(Number(id));
            if (!vItem) return;

            children.push({
                type: 'v-child',

                id: generateChildId(groupId, id),
                key: key++,
                vGroupable: vItem
            });
        });
        
        pl.push(parent);
        fl.push(parent, ...children);
    });

    parentList.value = pl;
    flatList.value = fl;

    updateViewportHeight();
    updateScrollHeight();
    updateVisibleList(0);
});
</script>

<template>
    <div ref="viewportEl" :class="$style['virtual-list']" @scroll="scroll">
        <div :style="{ height: scrollHeight + 'px' }">
            <div :style="{ paddingBottom: paddingBottom + 'px', paddingTop: paddingTop + 'px' }">
                <div v-for="item of visibleList" :key="item.key" :data-id="item.id">
                     <EmptyBlock v-if="item.type === 'v-parent'" />

                    <ChildBlock v-else="item.type === 'v-child'" :child="item">
                        <template v-slot:child="{ value }">
                            <slot name="child" :value="value" />
                        </template>
                    </ChildBlock>
                </div>
            </div>
        </div>

        <div :style="{ position: 'absolute', top: 0, height: scrollHeight + 'px', width: '100%' }">
            <template v-for="parent of parentList" :key="parent.key">
                <div :style="{ position: 'sticky', top: 0 }">
                    <ParentBlock v-if="parent.type === 'v-parent'" :parent="parent" />
                </div>

                <div :style="{ height: (nodeHeight * parent.childrenCount) + 'px'}"></div>
            </template>
        </div>
    </div>
</template>

<style module>
.virtual-list {
    width: 100%;
    height: 100%;
    overflow: auto;

    position: relative;
}
</style>