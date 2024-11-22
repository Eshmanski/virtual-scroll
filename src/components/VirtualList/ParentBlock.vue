<template>
    <div :class="$style['parent-node']">
        <div :class="$style['text']">
            {{ parent.vGroup.name }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { VirtualParent } from './utils/type';

defineProps({
    parent: {
        type: Object as PropType<VirtualParent>,
        required: true
    }
})
</script>

<style module>
.parent-node {
    width: 100%;
    height: 50px;
    padding: 10px;

    background-color: rgb(12, 12, 12);
    color: white;

    box-sizing: border-box;
}

.text {
    width: 100%;
    height: 100%;

    display: flex;
    align-items: start;
    justify-content: start;
}
</style>
