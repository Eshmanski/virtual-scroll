<template>
    <div :class="$style['footer']">
        {{ name }}
    </div>
</template>

<script setup lang="ts">
defineProps({
    name: String,
});
</script>

<style module>
.footer {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;
    font-weight: bold;

    background: repeating-linear-gradient(
        45deg,
        #bcae60,
        #bcae60 10px,
        #989746 10px,
        #989746 20px
    );
}
</style>