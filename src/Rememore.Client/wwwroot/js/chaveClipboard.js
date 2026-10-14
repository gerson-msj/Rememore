export async function copiar(texto) {
  if (!navigator.clipboard?.writeText) return false;
  await navigator.clipboard.writeText(texto);
  return true;
}
