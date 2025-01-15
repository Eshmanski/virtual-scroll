<template>
  <div :class="$style['layer-header']">
    <template v-for="item of state.parent_list" :key="item.key">
      <div :class="$style['header-block']">
        <BlockParent
          v-if="item.type === 'v-parent'"
          :parent="item"
          :block-height="blockHeight"
          :expand="state.expand_id === item.vGroup.id"
          :class="{
            [parentClass]: true,
            ['selected']: isSelected(item.vGroup.id),
          }"
          @expand="expand"
          @click="(e: MouseEvent) => selectGroup(item.vGroup, e)"
          @drop:item="$emit('drop:item', $event, item.vGroup)"
        >
          <template v-slot:parent="data">
            <slot name="parent" v-bind="data" />
          </template>
        </BlockParent>

        <div
          v-if="item.isShow && isHelper"
          :style="{ height: blockHeight + 'px' }"
          :class="{
            [$style['helper']]: true,
            [helperClass]: true,
            ['selected']: isSelected(item.vGroup.id),
          }"
        >
          <slot
            name="helper"
            :value="item.vGroup"
            :items="item.children"
            :key="item.key"
          />
        </div>
      </div>

      <div v-if="item.isShow" :style="getEmptyStyle(item)" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';
import BlockParent from './BlockParent.vue';
import VirtualListState from './core/VirtualListState';
import { VGroup, VirtualParent } from './core/_type';

const emit = defineEmits(['select:group', 'expand', 'drop:item']);

const props = defineProps({
  parentClass: {
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

  state: {
    type: Object as PropType<VirtualListState>,
    required: true,
  },

  selectedGroups: {
    type: Array as PropType<VGroup[]>,
    default: () => [],
  },

  isHelper: Boolean,
});

const selectedIds = computed(() => props.selectedGroups.map((item) => item.id));

const isSelected = (id: number) => {
  return selectedIds.value.includes(id);
};

const selectGroup = (g: VGroup, e: MouseEvent) => {
  const isMultiple = e.ctrlKey || e.metaKey;
  emit('select:group', g, isMultiple);
};

const getEmptyStyle = (item: VirtualParent) => {
  return {
    height: props.blockHeight * item.children.length + 'px',
  };
};

const expand = (id: number, flag: boolean) => {
  emit('expand', id, flag);
};
</script>

<style module>
.helper {
  width: 100%;
  pointer-events: all;
}

.header-block {
  position: sticky;
  top: 0;
}

.layer-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;

  pointer-events: none;
}
</style>
