import { describe, expect, it } from "vitest";
import { parseUserRecord } from "../auth/UserRecord";
import type { RawUser } from "../auth/types";

const base: RawUser = {
  objectID: "usr-1",
  username: "cliente",
  email: "cliente@demo.cr",
  displayName: "Cliente Demo",
  role: "B2C",
  active: true,
  defaultBranch: "san_jose",
};

describe("Usuarios: validación de registros (login simulado)", () => {
  it("acepta un usuario B2C válido", () => {
    const result = parseUserRecord(base);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.user.role).toBe("B2C");
  });

  it("rechaza un usuario inactivo", () => {
    expect(parseUserRecord({ ...base, active: false })).toEqual({ ok: false, reason: "INACTIVE" });
  });

  it("rechaza un usuario sin rol válido", () => {
    expect(parseUserRecord({ ...base, role: "SUPERVISOR" })).toEqual({ ok: false, reason: "INVALID_ROLE" });
    expect(parseUserRecord({ ...base, role: undefined })).toEqual({ ok: false, reason: "INVALID_ROLE" });
  });

  it("rechaza registros incompletos", () => {
    expect(parseUserRecord({ ...base, email: "" })).toEqual({ ok: false, reason: "INVALID_RECORD" });
    expect(parseUserRecord({ ...base, defaultBranch: "cartago" })).toEqual({ ok: false, reason: "INVALID_RECORD" });
  });

  it("exige empresa a los usuarios B2B", () => {
    expect(parseUserRecord({ ...base, role: "B2B" })).toEqual({ ok: false, reason: "INVALID_RECORD" });
    const result = parseUserRecord({
      ...base,
      role: "B2B",
      company: { name: "Transportes Demo S.A.", legalId: "3-101-123456", contactName: "Carlos" },
    });
    expect(result.ok).toBe(true);
  });
});
