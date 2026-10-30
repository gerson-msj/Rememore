let referencia;

function aoMostrarPagina(evento) {
    if (evento.persisted) referencia?.invokeMethodAsync("AoRestaurarPaginaDoCacheAsync");
}

export function conectar(dotnet) {
    referencia = dotnet;
    window.addEventListener("pageshow", aoMostrarPagina);
}

export function desconectar() {
    window.removeEventListener("pageshow", aoMostrarPagina);
    referencia = null;
}
