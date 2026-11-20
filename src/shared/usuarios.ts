export type Perfil = "usuario" | "admin";

export type DadosCriarConta = {
  convite: string;
  nomeUsuario: string;
  senha: string;
};

export type RespostaCriarConta = {
  perfil: Perfil;
  chaveRedefinicao: string;
};

export type RespostaSessao = {
  perfil: Perfil;
};

export type ErrosCamposCadastro = Partial<
  Record<"convite" | "nomeUsuario" | "senha", string>
>;

export type ErroAplicacao = {
  tipo: "erroAplicacao";
  mensagem?: string;
  errosCampos?: ErrosCamposCadastro;
};
