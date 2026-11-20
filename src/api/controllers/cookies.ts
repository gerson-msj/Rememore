const nomeCookieSessao = "rememore_sessao";

function atributosCookie(request: Request) {
  const seguro = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `Path=/api; HttpOnly; SameSite=Lax${seguro}`;
}

export function criarCookieSessao(request: Request, valor: string) {
  return `${nomeCookieSessao}=${valor}; ${atributosCookie(request)}; Max-Age=31536000`;
}

export function removerCookieSessao(request: Request) {
  return `${nomeCookieSessao}=; ${atributosCookie(request)}; Max-Age=0`;
}

export function lerCookieSessao(request: Request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;

  const entrada = cookie
    .split(";")
    .map((parte) => parte.trim())
    .find((parte) => parte.startsWith(`${nomeCookieSessao}=`));

  if (!entrada) return null;

  try {
    return decodeURIComponent(entrada.slice(nomeCookieSessao.length + 1));
  } catch {
    return null;
  }
}
