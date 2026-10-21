namespace Rememore.Client.Componentes.Lab;

internal static class MovimentacaoListaDemonstrativa
{
    internal static bool MoverUmaPosicao<T>(IList<T> itens, int indice, int deslocamento)
    {
        var destino = indice + deslocamento;
        if (deslocamento is not (-1 or 1) || indice < 0 || indice >= itens.Count || destino < 0 || destino >= itens.Count)
        {
            return false;
        }

        var item = itens[indice];
        itens.RemoveAt(indice);
        itens.Insert(destino, item);
        return true;
    }
}
