import { VGroup } from "../components/VirtualList_1/core/_type";

export default class Group implements VGroup  {
    id: number;
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    static getGroupList(groups: { id: number, name: string }[]) {
        const groupAll = new Group(0, 'All');
        const groupRest = groups.map(group => new Group(group.id, group.name));

        return [groupAll, ...groupRest];
    }
}