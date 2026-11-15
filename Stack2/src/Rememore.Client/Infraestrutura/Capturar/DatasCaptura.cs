using System.Globalization;

namespace Rememore.Client.Infraestrutura.Capturar;

public static class DatasCaptura
{
    public static bool TentarValidar(string? valor, DateOnly hoje, out DateOnly data) =>
        DateOnly.TryParseExact(valor, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out data)
        && data.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) == valor
        && data <= hoje;

    public static string Apresentar(DateOnly data) => data.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture);
}
