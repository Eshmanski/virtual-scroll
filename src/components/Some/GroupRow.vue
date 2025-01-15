<template>
  <div :class="$style['group']">
    <div>{{ group.name }}</div>
    <div>({{ items.length }})</div>
  </div>
</template>

<script setup lang="ts">

import { PropType } from 'vue';
import Group from '../../models/group';
import Item from '../../models/item';

const emit = defineEmits(['select:rows']);

defineProps({
  group: {
    type: Object as PropType<Group>,
    required: true,
  },

  items: {
    type: Array as PropType<Item[]>,
    required: true,
  },
});
</script>

<style module>
.group {
  display: flex;
  gap: 20px;

  font-weight: bold;

  justify-content: center;
  align-items: center;
}
</style>
