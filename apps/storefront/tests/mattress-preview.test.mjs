import { test } from "node:test";
import assert from "node:assert/strict";
import { mattressGeometry, CM_TO_SVG } from "../src/lib/mattress-preview.js";
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
test("every mattress uses the same absolute scale on both axes", () => {
  for (const size of ["65x180", "90x190", "140x190", "160x190", "160x200", "200x200"]) {
    const { width, length, corners: [a, b, , d] } = mattressGeometry(size);
    near(distance(a, b), width * CM_TO_SVG);
    near(distance(a, d), length * CM_TO_SVG);
  }
  const square = mattressGeometry("200x200").corners;
  near(distance(square[0], square[1]), 120);
  near(distance(square[0], square[3]), 120);
});
test("length changes independently of width and sizes stay centered", () => {
  const first = mattressGeometry("160x190").corners;
  const second = mattressGeometry("160x200").corners;
  near(distance(first[0], first[1]), distance(second[0], second[1]));
  near(distance(second[0], second[3]) - distance(first[0], first[3]), 6);
  for (const points of [first, second, mattressGeometry("65x180").corners]) {
    near((points[0].x + points[2].x) / 2, 180);
    near((points[0].y + points[2].y) / 2, 125);
  }
});
