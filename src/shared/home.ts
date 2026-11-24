import type { Perfil } from "@shared/usuarios";

export type HomeResponse = {
  perfil: Perfil;
  encontrarMemorias: boolean;
  reverUmDia: boolean;
  rememorar: boolean;
};
