<script setup lang="ts">
import { VGroup, VGroupable, VirtualChild, VirtualNode, VirtualParent } from './utils/type';
import { generateChildId, generateParentId } from './utils/helpers';
import { PropType, Ref, ref, watch } from 'vue';
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
const marginTop = ref(0);

const visibleList: Ref<VirtualNode[]> = ref([]);
const flatList: Ref<VirtualNode[]> = ref([]);
const groupMap = new Map<number, VGroup>();
const itemMap = new Map<number, VGroupable>();

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

const updateScrollheight = () => {
    scrollHeight.value = flatList.value.length * nodeHeight.value;
}

const updateVisibleList = (index: number) => {
    const count = Math.ceil(viewportHeight.value / nodeHeight.value);
    console.log(count)
    const startIndex = Math.max(0, index - count);
    const endIndex = Math.min(flatList.value.length, index + count + count);
    console.log(startIndex, endIndex)
    visibleList.value = flatList.value.slice(startIndex, endIndex);
    marginTop.value = startIndex * nodeHeight.value;

    console.log(visibleList.value)
}

let index = 0;
const scroll = (e: Event) => {
    console.log('scroll')
    const newIndex = Math.round((e.target as HTMLElement).scrollTop / nodeHeight.value);

    if (newIndex !== index) {
        updateVisibleList(newIndex);
        index = newIndex;

        console.log(visibleList.value)
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
    Object.entries(virtualMap).forEach(([groupId, ids]) => {
        const vGroup = groupMap.get(Number(groupId));
        if (!vGroup) return; 

        const parent: VirtualParent = {
            type: 'v-parent',

            id: generateParentId(groupId),
            vGroup: vGroup
        }

        const children: VirtualChild[] = [];
        ids.forEach(id => {
            const vItem = itemMap.get(Number(id));
            if (!vItem) return;

            children.push({
                type: 'v-child',

                id: generateChildId(groupId, id),
                vGroupable: vItem
            });
        });

        fl.push(parent, ...children);
    });

    console.log(fl);
    flatList.value = fl;

    updateViewportHeight();
    updateScrollheight();
    updateVisibleList(0);
});
</script>

<template>
    <div ref="viewportEl" :class="$style['virtual-list']" @scroll="scroll">
        <div :style="{ height: scrollHeight + 'px' }">
            <template v-for="item of visibleList" :key="item.id">
                <ParentBlock v-if="item.type === 'v-parent'" :parent="item" />

                <ChildBlock v-else="item.type === 'v-child'" :child="item">
                    <template v-slot:child="{ value }">
                        <slot name="child" :value="value" />
                    </template>
                </ChildBlock>
            </template>
        </div>
    </div>
</template>

<style module>
.virtual-list {
    width: 100%;
    height: 100%;
    overflow: auto;
}
</style>