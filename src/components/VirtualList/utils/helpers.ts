export function generateParentId(parentId: number | string) {
    return `p#${parentId}`
}

export function generateChildId(parentId: number | string, childId: number | string) {
    return `p#${parentId}-c#${childId}`
}