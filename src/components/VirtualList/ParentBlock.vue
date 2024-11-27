<template>
    <div :class="$style['parent-node']">
        <div :class="$style['row']">
            <span :class="{[$style['expand-btn']]: true, [$style['expanded']]: expand}" class="material-icons" @click="toggle">
                arrow_drop_down
            </span>

            <slot name="parent" :value="parent.vGroup" :count="parent.childrenCount">
                <div :class="$style['text']">
                    {{ parent.vGroup.name }}
                </div>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { VirtualParent } from './utils/type';

const emit = defineEmits(['expand']);

const props = defineProps({
    parent: {
        type: Object as PropType<VirtualParent>,
        required: true
    },

    expand: {
        type: Boolean,
        default: false
    }
});

const toggle = () => {
    emit('expand', props.parent.vGroup.id, !props.expand);
}
</script>

<style module>
.parent-node {
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none; 

    width: 100%;
    height: 50px;
    padding: 10px;

    background-color: rgb(12, 12, 12);
    color: white;

    box-sizing: border-box;

    pointer-events: all;
}

.expand-btn {
    cursor: pointer;
    margin-right: 10px;
    transition: transform 0.3s;
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
