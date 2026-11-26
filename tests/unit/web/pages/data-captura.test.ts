import { expect, it } from "bun:test";
import { validarDataCaptura } from "@web/pages/capturar/data-captura";

it("aceita o dia local e datas anteriores completas e existentes", () => {
  const hoje = new Date(2026, 10, 26, 23, 45);
  for (const valor of ["2026-11-26", "2024-02-29", "2000-02-29", "0001-01-01"]) {
    expect(validarDataCaptura(valor, hoje)).toBe(true);
  }
  for (const valor of ["2026-11-27", "1900-02-29", "2026-02-31", "2026-13-01", "2026-11-00", "0000-01-01", "2026-11", "2026-1-01", ""]) {
    expect(validarDataCaptura(valor, hoje)).toBe(false);
  }
});
