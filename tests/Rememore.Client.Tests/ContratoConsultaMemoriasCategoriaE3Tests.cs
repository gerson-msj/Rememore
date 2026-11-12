using System.Text.Json;
using Rememore.Client.Infraestrutura.Rememorar;

namespace Rememore.Client.Tests;

public sealed class ContratoConsultaMemoriasCategoriaE3Tests
{
    [Fact]
    public void RespostaJsComDataETomNuloDesserializaNoContratoDotNet()
    {
        const string json = """
            {"estado":0,"revisao":"7","itens":[
              {"identidade":"m1","data":"2026-11-02","ordem":0,"conteudo":"Preservada","tom":null},
              {"identidade":"m2","data":"2026-11-03","ordem":1,"conteudo":"Neutra","tom":0}
            ],"temMais":true,"proximoCursor":"cursor-opaco"}
            """;

        var resposta = JsonSerializer.Deserialize<RespostaMemoriasCategoria>(
            json, new JsonSerializerOptions(JsonSerializerDefaults.Web));

        Assert.NotNull(resposta);
        Assert.Equal(EstadoConsultaMemoriasCategoria.Sucesso, resposta.Estado);
        Assert.Equal("7", resposta.Revisao);
        Assert.Equal(new DateOnly(2026, 11, 2), resposta.Itens![0].Data);
        Assert.Null(resposta.Itens[0].Tom);
        Assert.Equal(0, resposta.Itens[1].Tom);
        Assert.True(resposta.TemMais);
        Assert.Equal("cursor-opaco", resposta.ProximoCursor);
    }
}
