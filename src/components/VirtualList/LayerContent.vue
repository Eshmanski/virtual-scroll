<template>
  <div :style="contentStyle">
    <div :style="paddingStyle">
      <div
        v-for="item of state.visible_list"
        :key="item.key"
        :data-id="item.id"
      >
        <BlockChild
          v-if="item.type === 'v-child'"
          :child="item"
          :block-height="blockHeight"
          :class="{
            [childClass]: true,
            ['selected']: isSelected(item.vGroupable.id),
          }"
          @click="(e: MouseEvent) => selectItem(item.vGroupable, e)"
          @drag:start="$emit('drag:start', $event)"
        >
          <template v-slot:child="{ value }">
            <slot
              name="child"
              :value="value"
              :parentId="item.parentId"
              :index="item.localIndex"
              :key="item.key"
            />
          </template>
        </BlockChild>

        <BlockEmpty v-else :block-height="blockHeight" />
      </div>

      <div
        :style="{ height: blockHeight + 'px' }"
        class="full-width"
        :class="$style['footer']"
      >
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';
import BlockChild from './BlockChild.vue';
import BlockEmpty from './BlockEmpty.vue';
import VirtualListState from './core/VirtualListState';
import { VGroupable } from './core/_type';

const emit = defineEmits(['drag:start', 'select:item']);

const props = defineProps({
  childClass: {
    type: String,
    default: () => '',
  },

  blockHeight: {
    type: Number,
    default: () => 50,
  },

  state: {
    type: Object as PropType<VirtualListState>,
    required: true,
  },

  selectedItems: {
    type: Array as PropType<VGroupable[]>,
    default: () => [],
  },
});

const selectedIds = computed(() => props.selectedItems.map((item) => item.id));

const contentStyle = computed(() => {
  return {
    height: props.state.content_height + 'px',
  };
});

const isSelected = (id: number) => {
  return selectedIds.value.includes(id);
};

const selectItem = (v: VGroupable, e: MouseEvent) => {
  const isMultiple = e.ctrlKey || e.metaKey;
  emit('select:item', v, isMultiple);
};

const paddingStyle = computed(() => {
  return {
    paddingTop: props.state.padding_top + 'px',
    paddingBottom: props.state.padding_bottom + 'px',
  };
});
</script>

<style module>
.footer {
  position: sticky;
  bottom: -1px;
  z-index: 101;
  background-color: white;
}

.parent-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;

  pointer-events: none;
}
</style>
