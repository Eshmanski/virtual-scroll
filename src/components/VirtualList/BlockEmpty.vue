<template>
  <div
    :style="{ height: blockHeight + 'px' }"
    :class="$style['empty-node']"
  ></div>
</template>

<script setup lang="ts">
defineProps({
  blockHeight: {
    type: Number,
    required: true,
  },
});
</script>

<style module>
.empty-node {
  width: 100%;
  padding: 10px;

  background-color: rgb(12, 12, 12);
  color: white;

  box-sizing: border-box;
}
</style>
