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

const groupMap = new Map<number, VGroup>();
const itemMap = new Map<number, VGroupable>();
const flatList: Ref<VirtualNode[]> = ref([]);

watch(props, () => {
    groupMap.clear();
    itemMap.clear();

    props.groups.forEach(group => groupMap.set(group.id, group));
    props.items.forEach(item => itemMap.set(item.id, item));

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
});
</script>

<template>
    <div :class="$style['virtual-list']">
        <div>
            <template v-for="item of flatList" :key="item.id">
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