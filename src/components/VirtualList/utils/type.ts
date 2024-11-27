export interface VGroupable {
    id: number;
    groups: number[];
}

export interface VGroup {
    id: number;
    name: string;
}

export type VirtualNode = VirtualParent | VirtualChild;

export type VirtualParent = {
    type: 'v-parent';

    id: string;
    key: number;
    childrenCount: number;
    isShow?: boolean;

    vGroup: VGroup;
}

export type VirtualChild = {
    type: 'v-child';

    id: string;
    key: number;
    vGroupable: VGroupable;
}