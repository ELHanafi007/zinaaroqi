import assert from "node:assert/strict";
import { test } from "node:test";
import { propertyLocationUrl, propertyShareMessage } from "../lib/property-share";

test("sharing includes the listing and its saved location URL", () => {
  const location = propertyLocationUrl({ description: "Spacious apartment", location: { mapUrl: "https://maps.app.goo.gl/example" } });
  assert.equal(location, "https://maps.app.goo.gl/example");
  assert.equal(propertyShareMessage("Apartment 104", "https://www.41real-estate.site/properties/123", location, "Location"), "Apartment 104\nhttps://www.41real-estate.site/properties/123\n\n📍 Location\nhttps://maps.app.goo.gl/example");
});

test("older descriptions with map links produce a location button", () => {
  assert.equal(propertyLocationUrl({ description: "Apartment https://maps.google.com/?q=25.905355,45.375950" }), "https://maps.google.com/?q=25.905355,45.375950");
  assert.equal(propertyLocationUrl({ description: "Location: https://maps.app.goo.gl/example)." }), "https://maps.app.goo.gl/example");
});

test("address-only listings have a maps search link; absent locations are omitted", () => {
  assert.equal(propertyLocationUrl({ description: "Apartment", location: { city: "Riyadh", district: "Al Waha" } }), "https://www.google.com/maps?q=Al%20Waha%2C%20Riyadh");
  assert.equal(propertyLocationUrl({ description: "https://evil.example/maps" }), null);
  assert.equal(propertyShareMessage("Apartment", "https://example.com/properties/1", null, "Location"), "Apartment\nhttps://example.com/properties/1");
});
