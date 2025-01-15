<template>
  <div :class="$style['app-content']">
    <div :class="$style['navbar']">
      <div 
        :class="{[$style['navbar-item']]: true, [$style['active']]: 'VL' === activeTest }" 
        @click="activeTest='VL'"
      >
        Virtual List
      </div>
    </div>

    <div :class="$style['test-content']">
      <TestVirtualList v-if="activeTest === 'VL'"/>

    </div>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import TestVirtualList from './pages/TestVirtualList.vue';

const activeTest = ref('VL')
</script>


<style module>
.app-content {
  --q-primary: rgb(107, 220, 235);
  --nav-height: 40px;

  width: 100vw;
  height: 100vh;
}

.navbar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;

  width: 100%;
  height: var(--nav-height);
  padding: 0 20px;

  background-color: rgb(0, 0, 0);
}

.navbar-item {
  font-weight: bold;
  padding: 0 10px;
  
  border: 1px solid rgb(255, 255, 255);
  border-radius: 5px;

  color: white;
  cursor: pointer;
}

.navbar-item.active {
  border-color: rgb(183, 218, 181);
  color: rgb(183, 218, 181);
}

.test-content {
  width: 100%;
  height: calc(100% - var(--nav-height));
}
</style>