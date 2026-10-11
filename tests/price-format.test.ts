import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPrice, formatPriceWithPeriod, normalizePriceInput } from "../lib/format";

test("prices group large amounts and preserve decimals", () => {
  assert.equal(formatPrice(1250000), "1,250,000");
  assert.equal(formatPrice(1250.75), "1,250.75");
  assert.equal(formatPriceWithPeriod(1250.75, "rent", "monthly"), "1,250.75 SAR / mo");
  assert.equal(formatPriceWithPeriod(undefined, "sale"), "Price on request");
});

test("pasted English and Arabic prices retain the same numeric value", () => {
  assert.equal(normalizePriceInput("1,250,000.75"), "1250000.75");
  assert.equal(normalizePriceInput("١٬٢٥٠٬٠٠٠٫٧٥"), "1250000.75");
  assert.equal(normalizePriceInput("۱٬۲۵۰٫۷۵"), "1250.75");
  assert.equal(normalizePriceInput(""), "");
  assert.equal(normalizePriceInput("1250."), "1250.");
  for (const invalid of ["12.3.4", "-100", "12abc", "1e6", "1.234"]) assert.equal(normalizePriceInput(invalid), null);
});
