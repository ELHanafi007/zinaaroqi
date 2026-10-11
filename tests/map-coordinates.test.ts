import { test } from "node:test";
import assert from "node:assert/strict";
import { mapCoordinates } from "../lib/map-coordinates";
test("pins use saved coordinates and prioritize place markers", () => {
  assert.deepEqual(mapCoordinates("https://maps.google.com/?q=25.905355,45.375950"), [25.905355,45.37595]);
  assert.deepEqual(mapCoordinates("https://www.google.com/maps/place/Example/@24,45,12z/data=!3d25.9!4d45.3"), [25.9,45.3]);
});
test("map never guesses locations from a camera center, address, or unsafe URL", () => {
  for (const url of ["https://example.com/?q=25,45", "https://www.google.com/maps/@25,45,12z", "https://maps.google.com/?q=Riyadh", "https://maps.google.com/?q=99,45"]) assert.equal(mapCoordinates(url), null);
});
