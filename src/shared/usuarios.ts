export type Perfil = "usuario" | "admin";

export type CriarContaRequest = {
  convite: string;
  nomeUsuario: string;
  senha: string;
};

export type CriarContaResponse = SessaoResponse & {
  chaveRedefinicao: string;
};

export type SessaoResponse = {
  perfil: Perfil;
  /** Identidade estável do usuário, independente da credencial de sessão. */
  idUsuario: string;
};

export type EntrarRequest = {
  nomeUsuario: string;
  senha: string;
};

export type EntrarResponse = SessaoResponse;

export type RedefinirSenhaRequest = {
  nomeUsuario: string;
  chaveRedefinicao: string;
  novaSenha: string;
};

export type RedefinirSenhaResponse = SessaoResponse & {
  chaveRedefinicao: string;
};

export type ErrosCamposCadastro = Partial<
  Record<"convite" | "nomeUsuario" | "senha", string>
>;

export type ErroAplicacao = {
  tipo: "erroAplicacao";
  mensagem?: string;
  errosCampos?: ErrosCamposCadastro;
};
