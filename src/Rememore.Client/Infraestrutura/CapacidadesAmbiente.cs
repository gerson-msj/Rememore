namespace Rememore.Client.Infraestrutura;

public sealed record CapacidadesPrincipal(
    bool EncontrarMemorias,
    bool ReverDia,
    bool Rememorar,
    bool Administracao);

public interface ICapacidadesAmbiente
{
    Task<CapacidadesPrincipal> ObterAsync(string identificadorConta);
}

public sealed class CapacidadesAmbienteSimuladas : ICapacidadesAmbiente
{
    public string ContaConfigurada { get; set; } = "usuario";
    public int DiasPreservados { get; set; } = 3;
    public int CategoriasDistintas { get; set; } = 3;
    public bool Administrador { get; set; } = true;

    public Task<CapacidadesPrincipal> ObterAsync(string identificadorConta)
    {
        if (!string.Equals(identificadorConta, ContaConfigurada, StringComparison.Ordinal))
            return Task.FromResult(new CapacidadesPrincipal(false, false, false, false));

        return Task.FromResult(new CapacidadesPrincipal(
            EncontrarMemorias: DiasPreservados >= 1,
            ReverDia: DiasPreservados >= 1,
            Rememorar: DiasPreservados >= 2 && CategoriasDistintas >= 2,
            Administracao: Administrador));
    }
}

public interface IPendenciaCapturaLocal
{
    Task<bool> ExisteAsync(string identificadorConta);
}

public sealed class PendenciaCapturaLocalSimulada : IPendenciaCapturaLocal
{
    public string ContaAssociada { get; set; } = "usuario";
    public bool AmbienteAtualPossuiPendencia { get; set; }

    public Task<bool> ExisteAsync(string identificadorConta) => Task.FromResult(
        AmbienteAtualPossuiPendencia
        && string.Equals(identificadorConta, ContaAssociada, StringComparison.Ordinal));
}
