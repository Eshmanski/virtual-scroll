<script setup lang="ts"></script>

<template>
    <div :class="$style['empty-node']"></div>
</template>

<style module>
.empty-node {
    width: 100%;
    height: 50px;
    padding: 10px;

    background-color: rgb(12, 12, 12);
    color: white;

    box-sizing: border-box;
}
</style>