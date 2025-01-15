import Group from "../models/group";
import Item from "../models/item";

export function* itemGenerate(allGroupsCount: number) {
    let i = 0 

    while(true) {
        const ItemId = i;
        const name = 'Item-' + i;
        const groupsCount = Math.floor(Math.random() * allGroupsCount);
        const groups = getRandomArrayIds(Math.floor(groupsCount / 2));

        i++;
        yield new Item(ItemId, name, groups);
    }
}

export function getRandomArrayIds(count: number): number[] {
    const set: Set<number> = new Set();

    const setToSet = (value: number, isReverse?: boolean) => {
        if (value > count || value <= 0) return false;

        if (set.has(value)) {
            const result = !isReverse ? setToSet(value + 1) : null;
            if (!result) setToSet(value - 1, true);
        } else {
            set.add(value)
            return true;
        };
    } 

    for (let i = 0; i < count; i++) {   
        setToSet(Math.floor(Math.random() * count + 1));
    }

    return Array.from(set);
}

export function geMockGroups(items: Item[]) {
    const set: Set<number> = new Set();
    items.forEach(item => item.groups.forEach(set.add.bind(set)));

    return Array.from(set).map((id: number, index: number) => {
        return new Group(id, `Group-${index}`)
    });
}