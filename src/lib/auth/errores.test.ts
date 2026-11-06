import assert from "node:assert/strict";
import { test } from "node:test";
import { mensajeDeError } from "./errores.ts";

test("traduce códigos conocidos", () => {
  assert.equal(
    mensajeDeError("otp_expired"),
    "El link venció o ya se usó. Pedí uno nuevo.",
  );
});

test("cae en un mensaje genérico", () => {
  const generico = "Algo salió mal. Probá de nuevo en un rato.";
  assert.equal(mensajeDeError("codigo_raro"), generico);
  // Auth lo usa también para links rotos: no culpar al email.
  assert.equal(mensajeDeError("validation_failed"), generico);
  assert.equal(mensajeDeError(undefined), generico);
  // No confundir con propiedades heredadas del objeto.
  assert.equal(mensajeDeError("toString"), generico);
});
