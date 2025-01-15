type NodeId = number | string;

export function generateParentId(parentId: NodeId) {
  return `p#${parentId}`;
}

export function generateHelpId(parentId: NodeId) {
  return `ph#${parentId}`;
}

export function generateChildId(parentId: NodeId, childId: NodeId) {
  return `p#${parentId}-c#${childId}`;
}

export function inRange(value: number, min: number, max: number) {
  if (value > max) return max;
  if (value < min) return min;
  else return value;
}

export function toRange(
  value: number,
  minOld: number,
  maxOld: number,
  minNew: number,
  maxNew: number,
) {
  return ((maxNew - minNew) * (value - minOld)) / (maxOld - minOld) + minNew;
}
