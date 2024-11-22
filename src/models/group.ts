import { VGroup } from "../components/VirtualList/utils/type";

export default class Group implements VGroup  {
    id: number;
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    static getGroupList(groups: { id: number, name: string }[]) {
        return groups.map(group => new Group(group.id, group.name));
    }
}