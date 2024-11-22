<script setup lang="ts">
import VirtualLIst from '../components/VirtualList/VirtualList.vue';
import { onMounted, ref, Ref } from 'vue';
import Group from '../models/group';
import Item from '../models/item'; 

const items: Ref<Item[]> = ref([]);
const groups: Ref<Group[]> = ref([]);

onMounted(async () => {
    const api = 'http://127.0.0.1:3658/m1/742749-719577-default'

    const pRes_1 = fetch(api+ '/items');
    const pRes_2 = fetch(api+ '/groups');

    const [res_1, res_2] = await Promise.all([pRes_1, pRes_2]).then(values => Promise.all(values.map(item => item.json())));

    items.value = Item.getItemList(res_1);
    groups.value = Group.getGroupList(res_2);
})
</script>

<template>
    <div :class="$style['test-window']">
        <VirtualLIst :items="items" :groups="groups">
            <template v-slot:child="{ value }">
                {{(value as Item).name}}
            </template>
        </VirtualLIst>
    </div>
</template>

<style module>
.test-window {
    width: 500px;
    height: 700px;

    border: 1px dashed red;
}
</style>