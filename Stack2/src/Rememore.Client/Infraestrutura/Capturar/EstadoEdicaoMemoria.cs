namespace Rememore.Client.Infraestrutura.Capturar;

public sealed record FatosEstadoEdicaoMemoria(
    bool DadosValidos, bool Autorizada, bool TextoValido, bool Suja,
    bool ComplementosConhecidos, int ComplementosConfirmados,
    bool OperacaoEmAndamento, bool CapturaAlterada);

public sealed record EstadoEdicaoMemoria(
    bool PermiteEditar, bool PermiteConfirmar, bool PermiteExcluirMemoria,
    bool ExigeConfirmacaoDeSaida, int ComplementosConfirmados, bool CapturaAlterada);

public static class ResolutorEstadoEdicaoMemoria
{
    public static EstadoEdicaoMemoria Resolver(FatosEstadoEdicaoMemoria fatos) => new(
        fatos.DadosValidos && fatos.Autorizada,
        fatos.DadosValidos && fatos.Autorizada && fatos.TextoValido && !fatos.OperacaoEmAndamento,
        fatos.DadosValidos && fatos.ComplementosConhecidos && fatos.ComplementosConfirmados == 0
            && !fatos.Suja && !fatos.OperacaoEmAndamento,
        fatos.Suja,
        fatos.ComplementosConfirmados,
        fatos.CapturaAlterada);
}
