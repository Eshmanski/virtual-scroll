<template>
  <div :class="$style['item']">
    {{ item.name }}
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import Item from '../../models/item';

defineProps({
  item: {
    type: Object as PropType<Item>,
    required: true,
  },
});
</script>

<style module>
.item {
  display: flex;
  justify-content: start;
  align-items: center;
  
  height: 100%;
  padding: 0 10px;
}
</style>
