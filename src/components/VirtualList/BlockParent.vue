<template>
  <div
    :style="{ height: blockHeight + 'px' }"
    :class="{
      [$style['parent-node']]: true,
      'drag-overed-allow': dragOvered === 'allow',
      'drag-overed-deny': dragOvered === 'deny',
    }"
    @dragover.prevent="dragover"
    @dragleave.prevent="dragOvered = null"
    @drop="dropItem"
  >
    <div :class="$style['row']">
      <span
        class="material-icons"
        :class="{ [$style['expand-btn']]: true, [$style['expanded']]: expand }"
        @click.stop="toggle"
      >
        arrow_drop_down
      </span>

      <slot
        name="parent"
        :key="parent.key"
        :value="parent.vGroup"
        :isOpen="parent.isShow"
        :items="parent.children"
        :dragOvered="dragOvered"
      >
        <div :class="$style['text']">
          {{ parent.vGroup.name }}
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType, Ref, ref } from 'vue';
import { VirtualParent } from './core/_type';

const emit = defineEmits(['expand', 'drop:item']);

const props = defineProps({
  parent: {
    type: Object as PropType<VirtualParent>,
    required: true,
  },

  expand: {
    type: Boolean,
    default: false,
  },

  blockHeight: {
    type: Number,
    required: true,
  },
});

const childIds = computed(() => props.parent.children.map((item) => item.id));
const dragOvered: Ref<null | string> = ref(null);

const toggle = () => {
  emit('expand', props.parent.vGroup.id, !props.expand);
};

const dragover = (e: DragEvent) => {
  const id = e.dataTransfer?.types[0];

  if (id) {
    const [dragParentId, dragChildId] = id.split('-');

    if (dragParentId === props.parent.id) return;

    const numChildId = Number(dragChildId.replace('c#', ''));
    if (childIds.value.includes(numChildId)) {
      dragOvered.value = 'deny';
    } else {
      dragOvered.value = 'allow';
    }
  }
};

const dropItem = (event: DragEvent) => {
  const isAllow = dragOvered.value === 'allow';
  dragOvered.value = null;

  if (!isAllow) return;

  const id = event.dataTransfer?.types[0];
  if (id) emit('drop:item', id);
};
</script>

<style module>
.parent-node {
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;

  width: 100%;
  padding: 0 10px;

  background-color: black;
  color: white;

  box-sizing: border-box;
  pointer-events: all;
  cursor: pointer;
}

.expand-btn {
  cursor: pointer;
  margin-right: 10px;
  transition: transform 0.3s;
  font-size: 20px;
}

.expanded {
  transform: rotate(180deg);
}

.row {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: start;
}

.text {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: start;
}
</style>
