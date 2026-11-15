using System.Text.Json;
using Microsoft.JSInterop;

namespace Rememore.Client.Infraestrutura;

public enum ResultadoConfirmacaoChave
{
    SessaoEstabelecida,
    ContextoInvalido,
    FalhaRecuperavel,
    FalhaSemContexto
}

public sealed class ConfirmacaoChavePendente(
    IContextoChavePendente contextoPendente,
    EstadoAutenticacaoProvider estadoAutenticacao)
{
    public Task<ContextoChavePendente?> RestaurarAsync(OrigemChavePendente origem) => contextoPendente.RestaurarAsync(origem);

    public async Task<ResultadoConfirmacaoChave> ConfirmarEntradaAsync(
        OrigemChavePendente origem,
        ContextoChavePendente contexto)
    {
        var contextoConsumido = false;
        try
        {
            contextoConsumido = await contextoPendente.ConsumirAsync(origem, contexto.IdentificadorContexto);
            if (!contextoConsumido) return ResultadoConfirmacaoChave.ContextoInvalido;

            await estadoAutenticacao.EstabelecerSessaoAsync();
            return ResultadoConfirmacaoChave.SessaoEstabelecida;
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException or JsonException)
        {
            if (estadoAutenticacao.Autenticado) return ResultadoConfirmacaoChave.SessaoEstabelecida;
            if (!contextoConsumido) return ResultadoConfirmacaoChave.FalhaRecuperavel;

            try
            {
                await contextoPendente.ReporAsync(contexto);
                return ResultadoConfirmacaoChave.FalhaRecuperavel;
            }
            catch (Exception erro) when (erro is JSException or InvalidOperationException or JsonException or ArgumentException)
            {
                return ResultadoConfirmacaoChave.FalhaSemContexto;
            }
        }
    }
}
