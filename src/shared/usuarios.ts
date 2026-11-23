export type Perfil = "usuario" | "admin";

export type CriarContaRequest = {
  convite: string;
  nomeUsuario: string;
  senha: string;
};

export type CriarContaResponse = {
  perfil: Perfil;
  chaveRedefinicao: string;
};

export type SessaoResponse = {
  perfil: Perfil;
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

export type RedefinirSenhaResponse = {
  perfil: Perfil;
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
