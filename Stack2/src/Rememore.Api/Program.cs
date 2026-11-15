using System.Data.Common;
using Turso.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
    options.AddDefaultPolicy(policy => policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod());
});

var connectionString = ResolveConnectionString(
    builder.Configuration.GetConnectionString("Rememore")
        ?? throw new InvalidOperationException("A connection string 'Rememore' não foi configurada."),
    builder.Environment.ContentRootPath);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

await InicializarBancoAsync(connectionString);

app.MapGet("/api/categorias", async () =>
{
    await using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();

    await using var command = connection.CreateCommand();
    command.CommandText = "SELECT Id, Nome FROM Categorias ORDER BY Nome;";

    var categorias = new List<Categoria>();
    await using var reader = await command.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        categorias.Add(new Categoria(reader.GetInt32(0), reader.GetString(1)));
    }

    return categorias;
})
.WithName("GetCategorias");

app.Run();

static string ResolveConnectionString(string connectionString, string contentRootPath)
{
    var parsed = new DbConnectionStringBuilder { ConnectionString = connectionString };
    if (!parsed.TryGetValue("Data Source", out var dataSourceValue))
    {
        return connectionString;
    }

    var dataSource = Convert.ToString(dataSourceValue);
    if (string.IsNullOrWhiteSpace(dataSource)
        || dataSource == ":memory:"
        || dataSource.Contains("://", StringComparison.Ordinal))
    {
        return connectionString;
    }

    var repositoryRoot = FindRepositoryRoot(contentRootPath);
    var databasePath = Path.GetFullPath(dataSource, repositoryRoot);
    Directory.CreateDirectory(Path.GetDirectoryName(databasePath)!);
    parsed["Data Source"] = databasePath;
    return parsed.ConnectionString;
}

static string FindRepositoryRoot(string contentRootPath)
{
    var directory = new DirectoryInfo(contentRootPath);
    while (directory is not null)
    {
        if (File.Exists(Path.Combine(directory.FullName, "Rememore.slnx")))
        {
            return directory.FullName;
        }

        directory = directory.Parent;
    }

    return contentRootPath;
}

static async Task InicializarBancoAsync(string connectionString)
{
    await using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();

    await using (var createTable = connection.CreateCommand())
    {
        createTable.CommandText = """
            CREATE TABLE IF NOT EXISTS Categorias (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Nome TEXT NOT NULL UNIQUE
            );
            """;
        await createTable.ExecuteNonQueryAsync();
    }

    var nomes = new[] { "Família", "Amigos", "Trabalho", "Saúde", "Estudos", "Lazer" };
    foreach (var nome in nomes)
    {
        await using var insertCategory = connection.CreateCommand();
        insertCategory.CommandText = "INSERT OR IGNORE INTO Categorias (Nome) VALUES (@nome);";
        var parameter = insertCategory.CreateParameter();
        parameter.ParameterName = "@nome";
        parameter.Value = nome;
        insertCategory.Parameters.Add(parameter);
        await insertCategory.ExecuteNonQueryAsync();
    }
}

record Categoria(int Id, string Nome);

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
