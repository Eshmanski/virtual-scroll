import { VGroupable } from "../components/VirtualList_1/core/_type";

export default class Item implements VGroupable {
    id: number;
    name: string;
    groups: number[];

    constructor(id: number, name: string, groups: number[]) {
        this.id = id;
        this.name = name;
        this.groups = groups;
    }

    static getItemList(items: { id: number, name: string, groups: number[] }[]) {
        return items.map(item => new Item(item.id, item.name, item.groups));
    }
}