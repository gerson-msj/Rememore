using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Infraestrutura.Capturar;

public sealed class PendenciaCapturaLocalIndexedDb(ICapturasLocais capturas) : IPendenciaCapturaLocal
{
    public async Task<ResultadoLocal<bool>> ExisteAsync(string identidadeConta)
    {
        var consulta = await capturas.ConsultarAsync(identidadeConta);
        if (!consulta.Sucesso)
            return new(consulta.Estado, false, consulta.Falha);
        if (consulta.Valor is null)
            return new(EstadoOperacaoLocal.Falha, false, new("consulta", "RespostaInvalida"));

        return new(EstadoOperacaoLocal.Sucesso, consulta.Valor.Any(captura => captura.Alterado));
    }
}
