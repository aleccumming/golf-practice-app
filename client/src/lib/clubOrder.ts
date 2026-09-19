// Bag order from longest/lowest-lofted to shortest/highest-lofted, as the user actually
// hits them (their own equivalences between woods/hybrids/irons, not a generic loft chart).
const CLUB_ORDER_GROUPS: string[][] = [
  ["Driver"],
  ["3W"],
  ["5W"],
  ["2i", "3H"],
  ["4H", "7W"],
  ["5H"],
  ["6H"],
  ["3i"],
  ["4i"],
  ["5i"],
  ["6i"],
  ["7i"],
  ["8i"],
  ["9i"],
  ["PW"],
  ["50°"],
  ["GW"],
  ["52°"],
  ["54°"],
  ["56°", "SW"],
  ["58°", "LW"],
  ["60°"],
  ["Putter"],
];

const RANK_BY_NAME = new Map<string, number>();
CLUB_ORDER_GROUPS.forEach((group, rank) => group.forEach((name) => RANK_BY_NAME.set(name, rank)));

export function clubSortRank(name: string): number {
  return RANK_BY_NAME.get(name) ?? Number.MAX_SAFE_INTEGER;
}

export function sortClubs<T extends { name: string }>(clubs: T[]): T[] {
  return [...clubs].sort((a, b) => clubSortRank(a.name) - clubSortRank(b.name));
}
