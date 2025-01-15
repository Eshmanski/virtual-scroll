<template>
  <div
    :draggable="true"
    :data-id="child.id"
    :style="{ height: blockHeight + 'px' }"
    :class="$style['child-node']"
    @dragstart="startDrag"
  >
    <slot name="child" :value="child.vGroupable">
      <div :class="$style['text']">
        {{ child.vGroupable.id }}
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { VirtualChild } from './core/_type';

const emit = defineEmits(['drag:start', 'drag:end']);

const props = defineProps({
  child: {
    type: Object as PropType<VirtualChild>,
    required: true,
  },

  blockHeight: {
    type: Number,
    required: true,
  },
});

const startDrag = (e: DragEvent) => {
  e.dataTransfer?.setData(props.child.id, '');
  emit('drag:start', e);
};
</script>

<style module>
.child-node {
  width: 100%;

  background-color: rgb(209, 209, 209);
  color: rgb(0, 0, 0);

  box-sizing: border-box;
  cursor: pointer;
}

.text {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
