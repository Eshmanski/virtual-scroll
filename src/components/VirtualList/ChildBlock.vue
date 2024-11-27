<template>
    <div :class="$style['child-node']">
        <slot name="child" :value="child.vGroupable">
            <div :class="$style['text']">
                {{ child.vGroupable }}
            </div>
        </slot>
    </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { VirtualChild } from './utils/type';

defineProps({
    child: {
        type: Object as PropType<VirtualChild>,
        required: true
    }
})
</script>

<style module>
.child-node {
    width: 100%;
    height: 50px;
    padding: 10px;

    background-color: rgb(209, 209, 209);
    color: rgb(0, 0, 0);

    box-sizing: border-box;
    border-bottom: 1px solid white;
}

.text {
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
}
</style>