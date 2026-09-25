import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { adminEmailSet, controlCookieOptions, emailIsAllowed, readControlSession } from "../src/lib/auth";

describe("control auth", () => {
  it("authorizes e-mail present in CONTROL_ADMIN_EMAILS style list", () => {
    const list = adminEmailSet("admin@orcah.com.br, dono@orcah.com.br");
    assert.equal(emailIsAllowed("ADMIN@orcah.com.br", list), true);
  });

  it("rejects user outside allowlist", () => {
    const list = adminEmailSet("admin@orcah.com.br");
    assert.equal(emailIsAllowed("cliente@orcah.com.br", list), false);
  });

  it("treats missing session as unauthenticated", async () => {
    assert.equal(await readControlSession(), null);
  });

  it("uses httpOnly session cookie with lax sameSite", () => {
    const options = controlCookieOptions();
    assert.equal(options.httpOnly, true);
    assert.equal(options.sameSite, "lax");
    assert.equal(options.path, "/");
  });
});
