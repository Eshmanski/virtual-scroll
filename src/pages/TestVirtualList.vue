<template>
    <div :class="$style['test-window']">

        <div :class="$style['wrapper']">
            <VirtualList 
                is-helper
                custom-scroll
                :items="items" 
                :groups="groups"
                :block-height="35"
                :isLoading="isLoading"
                :child-class="$style['child-block']"
                :parent-class="$style['parent-block']"
                :helper-class="$style['helper-block']"
            >
                <template #parent="{ value, items }">
                    <!-- prettier-ignore -->
                    <GroupRow :group="(value as Group)" :items="(items as Item[])" />
                </template>

                <template #child="{ value }">
                    <!-- prettier-ignore -->
                     <ItemRow :item="(value as Item)" />
                </template>

                <template #helper>
                    <CustomRow name="Helper" />
                </template>

                <template #footer>
                    <CustomRow name="Footer" />
                </template>
            </VirtualList>
        </div>
    </div>
</template>

<script setup lang="ts">
import VirtualList from '../components/VirtualList/VirtualList.vue';
import { itemGenerate, geMockGroups } from '../mock/mockGenerators';
import CustomRow from '../components/Some/CustomRow.vue';
import GroupRow from '../components/Some/GroupRow.vue';
import ItemRow from '../components/Some/ItemRow.vue';
import { onMounted, ref, Ref } from 'vue';
import Group from '../models/group';
import Item from '../models/item'; 

const items: Ref<Item[]> = ref([]);
const groups: Ref<Group[]> = ref([]);
const isLoading: Ref<boolean> = ref(false);

onMounted(async () => {
    isLoading.value = true;

    try {
        const api = 'http://127.0.0.1:3658/m1/742749-719577-default';

        const pRes_1 = fetch(api+ '/items');
        const pRes_2 = fetch(api+ '/groups');

        const [res_1, res_2] = await Promise.all([pRes_1, pRes_2]).then(values => Promise.all(values.map(item => item.json())));

        items.value = Item.getItemList(res_1);
        groups.value = Group.getGroupList(res_2);
    } catch {
        const itemGenerator = itemGenerate(10);
        const mItems = new Array(1000).fill(0).map(() => itemGenerator.next().value) as Item[];
        const mGroups = geMockGroups(mItems);
        
        items.value = mItems;
        groups.value = [new Group(0, 'All'), ...mGroups];
    } finally {
        isLoading.value = false;
    }
});
</script>

<style module>
.test-window {
    display: flex;
    justify-content: center;
    align-items: center;
    
    width: 100%;
    height: 100%;
}

.wrapper {
    width: 300px;
    height: 70%;

    border: 2px dashed rgba(255, 0, 0, 0.199);
}

.parent-content {
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: space-between;
    align-items: center;
}

.parent-block {
    color: rgb(255, 255, 255);
    background-color: #000000;

}

.parent-block:global(.selected) {
  background-color: #f0f0f0;
  border-color: #f0f0f0;
}

.child-block {
  background-color: white;
}
</style>