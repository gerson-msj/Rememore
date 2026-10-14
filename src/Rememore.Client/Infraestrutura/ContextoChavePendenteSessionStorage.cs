using System.Text.Json;
using Microsoft.JSInterop;

namespace Rememore.Client.Infraestrutura;

public sealed class ContextoChavePendenteSessionStorage(IJSRuntime js) : IContextoChavePendente, IAsyncDisposable
{
    private const int VersaoAtual = 1;
    private static readonly JsonSerializerOptions OpcoesJson = new(JsonSerializerDefaults.Web);
    private readonly SemaphoreSlim sincronizacao = new(1, 1);
    private IJSObjectReference? modulo;

    public async Task<ContextoChavePendente> CriarAsync(OrigemChavePendente origem, string chave)
    {
        if (!Enum.IsDefined(origem)) throw new ArgumentOutOfRangeException(nameof(origem));
        if (!Guid.TryParseExact(chave, "D", out var identificadorChave))
            throw new ArgumentException("A chave fictícia deve ter o formato UUID.", nameof(chave));

        var identificadorContexto = Guid.NewGuid();
        while (identificadorContexto == identificadorChave) identificadorContexto = Guid.NewGuid();
        var contexto = new ContextoChavePendente(VersaoAtual, identificadorContexto, origem, chave);
        await sincronizacao.WaitAsync();
        try
        {
            await GarantirModuloAsync();
            await modulo!.InvokeVoidAsync("gravar", ChaveStorage(origem), JsonSerializer.Serialize(contexto, OpcoesJson));
            return contexto;
        }
        finally { sincronizacao.Release(); }
    }

    public async Task<ContextoChavePendente?> RestaurarAsync(OrigemChavePendente origem)
    {
        await sincronizacao.WaitAsync();
        try
        {
            await GarantirModuloAsync();
            var json = await modulo!.InvokeAsync<string?>("ler", ChaveStorage(origem));
            if (string.IsNullOrWhiteSpace(json)) return null;

            ContextoChavePendente? contexto;
            try { contexto = JsonSerializer.Deserialize<ContextoChavePendente>(json, OpcoesJson); }
            catch (JsonException) { return null; }

            if (contexto is null || !Guid.TryParseExact(contexto.Chave, "D", out var identificadorChave)) return null;

            return contexto.Versao == VersaoAtual
                && contexto.Origem == origem
                && contexto.IdentificadorContexto != Guid.Empty
                && contexto.IdentificadorContexto != identificadorChave
                    ? contexto
                    : null;
        }
        finally { sincronizacao.Release(); }
    }

    public async Task<bool> ConsumirAsync(OrigemChavePendente origem, Guid identificadorContexto)
    {
        await sincronizacao.WaitAsync();
        try
        {
            await GarantirModuloAsync();
            var json = await modulo!.InvokeAsync<string?>("ler", ChaveStorage(origem));
            if (string.IsNullOrWhiteSpace(json)) return false;

            ContextoChavePendente? contexto;
            try { contexto = JsonSerializer.Deserialize<ContextoChavePendente>(json, OpcoesJson); }
            catch (JsonException) { return false; }

            if (contexto is null
                || contexto.Versao != VersaoAtual
                || contexto.Origem != origem
                || contexto.IdentificadorContexto != identificadorContexto)
                return false;

            await modulo!.InvokeVoidAsync("remover", ChaveStorage(origem));
            return true;
        }
        finally { sincronizacao.Release(); }
    }

    public async Task ReporAsync(ContextoChavePendente contexto)
    {
        if (contexto is null
            || !Enum.IsDefined(contexto.Origem)
            || contexto.Versao != VersaoAtual
            || contexto.IdentificadorContexto == Guid.Empty
            || !Guid.TryParseExact(contexto.Chave, "D", out var identificadorChave)
            || contexto.IdentificadorContexto == identificadorChave)
            throw new ArgumentException("O contexto pendente não é válido.", nameof(contexto));

        await sincronizacao.WaitAsync();
        try
        {
            await GarantirModuloAsync();
            await modulo!.InvokeVoidAsync("gravar", ChaveStorage(contexto.Origem), JsonSerializer.Serialize(contexto, OpcoesJson));
        }
        finally { sincronizacao.Release(); }
    }

    private static string ChaveStorage(OrigemChavePendente origem) => origem switch
    {
        OrigemChavePendente.Cadastro => "rememore.chave-pendente.cadastro.v1",
        OrigemChavePendente.RedefinicaoSenha => "rememore.chave-pendente.redefinicao-senha.v1",
        _ => throw new ArgumentOutOfRangeException(nameof(origem))
    };

    private async Task GarantirModuloAsync()
    {
        if (modulo is null) modulo = await js.InvokeAsync<IJSObjectReference>("import", "./js/sessaoSimulada.js");
    }

    public async ValueTask DisposeAsync()
    {
        sincronizacao.Dispose();
        if (modulo is not null) await modulo.DisposeAsync();
    }
}
