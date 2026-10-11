import assert from "node:assert/strict";
import { test } from "node:test";
import { configuredPublicSiteOrigin, publicSiteOrigin } from "../lib/site-url";

test("public links use the site's origin without extra paths or query strings", () => {
  assert.equal(publicSiteOrigin("https://www.41real-estate.site/"), "https://www.41real-estate.site");
  assert.equal(publicSiteOrigin("https://www.41real-estate.site/something?q=x"), "https://www.41real-estate.site");
});

test("localhost, private networks, credentials and non-web URLs are rejected", () => {
  for (const origin of ["http://localhost:3000", "http://127.0.0.1:3000", "http://[::1]:3000", "http://192.168.1.5", "http://10.0.0.1", "http://172.16.1.5", "https://user:password@example.com", "javascript:alert(1)", "invalid"]) {
    assert.equal(publicSiteOrigin(origin), null);
  }
});

test("configured site URL takes precedence over local authentication URL", () => {
  const oldSite = process.env.SITE_URL;
  const oldAuth = process.env.NEXTAUTH_URL;
  try {
    process.env.SITE_URL = "https://www.41real-estate.site/";
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    assert.equal(configuredPublicSiteOrigin(), "https://www.41real-estate.site");
  } finally {
    if (oldSite === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = oldSite;
    if (oldAuth === undefined) delete process.env.NEXTAUTH_URL; else process.env.NEXTAUTH_URL = oldAuth;
  }
});
