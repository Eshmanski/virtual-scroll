<script setup lang="ts">
import { VGroup, VGroupable } from './utils/type';
import { onMounted, PropType, Ref, ref, watch } from 'vue';
import EmptyBlock from './EmptyBlock.vue';
import ParentBlock from './ParentBlock.vue';
import ChildBlock from './ChildBlock.vue';
import useVirtualList from './hooks/useVirtualList';
import useScroll from './hooks/useScroll';

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
const contentEl: Ref<HTMLDivElement | null> = ref(null);
const scrollEl: Ref<HTMLDivElement | null> = ref(null);
const thumbEl: Ref<HTMLDivElement | null> = ref(null);

const { 
    paddingBottom, 
    scrollHeight,
    visibleList,
    nodeHeight,
    paddingTop,
    parentList,
    expandId,
    getParentCursor,
    moveToGroup,
    updateAll,
    scroll,
} = useVirtualList(viewportEl);

const { thumbHeight } = useScroll({ viewportEl, contentEl, scrollEl, thumbEl });

const expand = (id: number, flag: boolean) => {
    const parentCursorId = getParentCursor();

    if (flag) expandId.value = id;
    else expandId.value = null;

    updateAll(props.groups, props.items);

    if (parentCursorId !== null) moveToGroup(parentCursorId);
}

watch(
    [() => props.groups, () => props.items], 
    ([groups, items]) => {
        updateAll(groups, items);
    },
    { immediate: true }
);

onMounted(() => {
    if (viewportEl.value) {
        const observer = new ResizeObserver(() => {
            updateAll(props.groups, props.items);
        })

        observer.observe(viewportEl.value);
    }
});
</script>

<template>
    <div :class="$style['virtual-list-wrapper']" >
        <div ref="viewportEl" :class="$style['virtual-list']" @scroll="scroll">
            <div ref="contentEl" :style="{ height: scrollHeight + 'px' }">
                <div :style="{ paddingBottom: paddingBottom + 'px', paddingTop: paddingTop + 'px' }">
                    <div v-for="item of visibleList" :key="item.key" :data-id="item.id">
                        <EmptyBlock v-if="item.type === 'v-parent'" />

                        <ChildBlock v-else="item.type === 'v-child'" :child="item" @click="() => console.log('child ', item.id)">
                            <template v-slot:child="{ value }">
                                <slot name="child" :value="value" />
                            </template>
                        </ChildBlock>
                    </div>
                </div>
            </div>

            <div :class="$style['parent-layer']">
                <template v-for="parent of parentList" :key="parent.key">
                    <div :style="{ position: 'sticky', top: 0 }">
                        <ParentBlock 
                            :expand="expandId === parent.vGroup.id"
                            :parent="parent" 
                            @expand="expand"
                        >
                            <template v-slot:parent="{ value, count }">
                                <slot name="parent" :value="value" :count="count" />
                            </template>
                        </ParentBlock>
                    </div>

                    <div v-if="parent.isShow" :style="{ height: (nodeHeight * parent.childrenCount) + 'px'}"></div>
                </template>
            </div>
        </div>

        <div ref="scrollEl" :class="$style['scroll']">
            <div ref="thumbEl" :class="$style['thumb']" :style="{ height: thumbHeight + 'px' }"></div>
        </div>
    </div>
</template>

<style module>
.virtual-list-wrapper {
    display: flex;
    overflow: hidden;
    width: 100%;
    height: 100%;
}

.scroll {
    width: 10px;
    height: 100%;

    background-color: rgb(194, 230, 227);
    border-radius: 2px;
    overflow: hidden;
}

.thumb {
    cursor: pointer;
    background-color: rgb(82, 151, 216);
    border-radius: 5px;
}

.virtual-list {
    width: 100%;
    height: 100%;
    overflow: auto;

    position: relative;
}

.virtual-list::-webkit-scrollbar {
  display: none;
}

.parent-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1;

    pointer-events: none;
}
</style>