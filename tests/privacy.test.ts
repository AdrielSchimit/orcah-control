import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { asaasEnvironment, companyIdFromExternalReference } from "../src/lib/asaas";
import { maskDocument, maskExternalId } from "../src/lib/format";

describe("privacy helpers", () => {
  it("masks CPF and CNPJ", () => {
    assert.equal(maskDocument("12345678942"), "***.***.***-42");
    assert.equal(maskDocument("11222333000181"), "**.***.***/****-81");
  });

  it("masks long external ids", () => {
    assert.equal(maskExternalId("sub_1234567890abcdef"), "sub_...cdef");
  });

  it("detects sandbox and production Asaas environments", () => {
    assert.equal(asaasEnvironment("https://api-sandbox.asaas.com/v3"), "SANDBOX");
    assert.equal(asaasEnvironment("https://api.asaas.com/v3"), "PRODUCAO");
    assert.equal(asaasEnvironment(""), "NAO_CONFIGURADO");
  });

  it("crosses externalReference to company id only when numeric", () => {
    assert.equal(companyIdFromExternalReference("17"), 17);
    assert.equal(companyIdFromExternalReference("company-17"), null);
  });
});
