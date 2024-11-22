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
    vGroup: VGroup;

    nextItem?: VirtualNode;
    prevItem?: VirtualNode;
}

export type VirtualChild = {
    type: 'v-child';

    id: string;
    vGroupable: VGroupable;

    nextItem?: VirtualNode;
    prevItem?: VirtualNode;
}