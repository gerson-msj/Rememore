export function formatarDataLocal(data: Date) {
  const ano = String(data.getFullYear()).padStart(4, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function validarDataCaptura(valor: string, hoje = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || valor > formatarDataLocal(hoje)) return false;
  const ano = Number(valor.slice(0, 4));
  const mes = Number(valor.slice(5, 7));
  const dia = Number(valor.slice(8, 10));
  if (ano === 0 || mes < 1 || mes > 12 || dia < 1) return false;

  // UTC evita que mudanças locais de fuso afetem a validação do calendário.
  const data = new Date(0);
  data.setUTCFullYear(ano, mes - 1, dia);
  return data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
}

export function rotularDataCaptura(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}
