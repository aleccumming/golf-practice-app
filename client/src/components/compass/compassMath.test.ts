import { describe, expect, it } from "vitest";
import { pointToMissDirection, WEDGE_ORDER, polarToPoint } from "./compassMath";

const CX = 100;
const CY = 100;
const RADIUS = 100;

describe("pointToMissDirection", () => {
  it("returns straight for the center point", () => {
    expect(pointToMissDirection(CX, CY, CX, CY, RADIUS)).toBe("straight");
  });

  it("returns straight for a point just inside the center radius", () => {
    expect(pointToMissDirection(CX + 5, CY, CX, CY, RADIUS)).toBe("straight");
  });

  for (const direction of WEDGE_ORDER) {
    const index = WEDGE_ORDER.indexOf(direction);
    const midAngle = index * 60 + 30;

    it(`returns "${direction}" for the midpoint of its wedge (${midAngle}deg)`, () => {
      const { x, y } = polarToPoint(CX, CY, RADIUS * 0.7, midAngle);
      expect(pointToMissDirection(x, y, CX, CY, RADIUS)).toBe(direction);
    });
  }

  it("falls cleanly on the pull side of the pull/push boundary at 0deg", () => {
    const { x, y } = polarToPoint(CX, CY, RADIUS * 0.7, 1);
    expect(pointToMissDirection(x, y, CX, CY, RADIUS)).toBe("pull");
  });

  it("falls cleanly on the push side just before the boundary at 360deg", () => {
    const { x, y } = polarToPoint(CX, CY, RADIUS * 0.7, 359);
    expect(pointToMissDirection(x, y, CX, CY, RADIUS)).toBe("push");
  });
});
