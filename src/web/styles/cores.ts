export const coresSemanticas = [
  { cor: "padrao", rotulo: "Padrão" },
  { cor: "link", rotulo: "Link" },
  { cor: "perigo", rotulo: "Perigo" },
  { cor: "alerta", rotulo: "Alerta" },
  { cor: "info", rotulo: "Info" },
] as const;

export type CorSemantica = (typeof coresSemanticas)[number]["cor"];
