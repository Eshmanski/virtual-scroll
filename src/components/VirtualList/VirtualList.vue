<template>
  <div :class="$style['virtual-list-wrapper']">
    <div
      ref="viewportEl"
      :class="{
        [$style['virtual-list']]: true,
        [$style['hide-scroll']]: customScroll,
      }"
      @scroll="scrollHandler"
    >
      <div v-if="isLoading" :class="isLoading" :style="{ height: blockHeight + 'px' }">
        <slot name="loading">
          Загрузка...
        </slot>
      </div>

      <div ref="contentEl">
        <LayerContent
          :selected-items="selectedItems"
          :child-class="childClass"
          :block-height="blockHeight"
          :state="virtualList.state"
          @drag:start="dragStart"
          @select:item="selectItem"
        >
          <template v-slot:child="data">
            <slot name="child" v-bind="data" />
          </template>

          <template v-slot:footer>
            <slot v-if="!isLoading && groups.length && items.length" name="footer" />
          </template>
        </LayerContent>
      </div>

      <LayerHeader
        :selected-groups="selectedGroups"
        :parent-class="parentClass"
        :helper-class="helperClass"
        :block-height="blockHeight"
        :state="virtualList.state"
        :is-helper="isHelper"
        @expand="expand"
        @drop:item="dropItem"
        @select:group="selectGroup"
      >
        <template v-slot:parent="data">
          <slot name="parent" v-bind="data" />
        </template>

        <template v-slot:helper="data">
          <slot name="helper" v-bind="data" />
        </template>
      </LayerHeader>
    </div>

    <div ref="scrollEl" v-if="customScroll" :class="$style['scroll']">
      <div ref="thumbEl" :class="$style['thumb']"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GetFilterFn, GetSortFn, VGroup, VGroupable } from './core/_type';
import VirtualListCore from './core/VirtualListCore';
import { nextTick, onMounted, PropType, Ref, ref, watch } from 'vue';
import ScrollCore from './core/ScrollCore';
import LayerContent from './LayerContent.vue';
import LayerHeader from './LayerHeader.vue';
import useDragDrop from './hooks/useDragDrop';

const emit = defineEmits([
  'scrolling',
  'expand:group',
  'select:group',
  'select:item',
  'drop:item',
]);

const props = defineProps({
  groups: {
    type: Array as PropType<VGroup[]>,
    required: true,
  },

  items: {
    type: Array as PropType<VGroupable[]>,
    required: true,
  },

  customScroll: {
    type: Boolean,
    default: () => false,
  },

  parentClass: {
    type: String,
    default: () => '',
  },

  childClass: {
    type: String,
    default: () => '',
  },

  helperClass: {
    type: String,
    default: () => '',
  },

  blockHeight: {
    type: Number,
    default: () => 50,
  },

  getFilterFn: Function as PropType<GetFilterFn>,
  getSortFn: Function as PropType<GetSortFn>,
  isHelper: Boolean,

  selectedGroups: Array as PropType<VGroup[]>,
  selectedItems: Array as PropType<VGroupable[]>,
  isLoading: {
    type: Boolean,
    default: () => false,
  },
});

const viewportEl: Ref<HTMLDivElement | null> = ref(null);
const contentEl: Ref<HTMLDivElement | null> = ref(null);
const scrollEl: Ref<HTMLDivElement | null> = ref(null);
const thumbEl: Ref<HTMLDivElement | null> = ref(null);

const virtualList = new VirtualListCore();
const scroll = new ScrollCore();
const { dragStart, dropItem, setOnDrop } = useDragDrop(virtualList);

const expand = (id: number, flag: boolean) => {
  virtualList.expandGroup(id, flag);
  emit('expand:group', id, flag);
};

const scrollHandler = () => {
  virtualList.scrollHandle();
};

const selectGroup = (id: number, flag: boolean) => {
  emit('select:group', id, flag);
};

const selectItem = (id: number, flag: boolean) => {
  emit('select:item', id, flag);
};

const onDrop = (item: VGroupable, gFrom: VGroup, gTo: VGroup) => {
  emit('drop:item', item, gFrom, gTo);
};

const update = () => {
  virtualList.computeList();
};

const focus = (itemId: number) => {
  const result = virtualList.moveToItem(itemId);

  if (!result) {
    virtualList.expandGroup(0, true);

    nextTick(() => virtualList.moveToItem(itemId));
  }
};

watch(
  [() => props.groups, () => props.items],
  ([groups, items]) => virtualList.setData(groups, items),
  { immediate: true },
);

onMounted(() => {
  setOnDrop(onDrop);

  if (viewportEl.value && contentEl.value && scrollEl.value && thumbEl.value) {
    virtualList.setConfig({
      viewport_el: viewportEl.value,
      block_height: props.blockHeight,
      with_helpers: props.isHelper,
      getFilterFn: props.getFilterFn,
      getSortFn: props.getSortFn,
    });

    virtualList.setData(props.groups, props.items);

    scroll.setConfig({
      block_height: props.blockHeight,
      disabled: false,
      viewport_el: viewportEl.value,
      content_el: contentEl.value,
      scroll_el: scrollEl.value,
      thumb_el: thumbEl.value,
    });

    scroll.setOnFastScrolling((flag: boolean) => emit('scrolling', flag));
  }
});

defineExpose({ update, focus });
</script>

<style module>
.virtual-list-wrapper {
  display: flex;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.scroll {
  cursor: pointer;
  width: 6px;
  height: calc(100% - 10px);

  margin: 5px 2px;

  background-color: #e1e1e1;
  border-radius: 2px;
  overflow: hidden;
}

.thumb {
  cursor: pointer;
  background-color: var(--q-primary);
  border-radius: 5px;
}

.virtual-list {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  position: relative;
}
.virtual-list.hide-scroll {
  overflow-y: hidden;
}
.virtual-list.hide-scroll::-webkit-scrollbar {
  display: none;
}

.parent-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;

  pointer-events: none;
}

.loader {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
}
</style>
