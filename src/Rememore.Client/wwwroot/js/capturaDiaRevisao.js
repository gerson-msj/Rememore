let observadorRedimensionamento;
let alvoObservado;
let referenciaDotNet;
let ultimoEstadoRolavel;

function atualizar() {
    if (!(alvoObservado instanceof HTMLElement)) return false;
    const conteudo = document.querySelector(".captura-dia__conteudo--revisao");
    const rolavel = conteudo instanceof HTMLElement
        && conteudo.getBoundingClientRect().bottom > window.innerHeight + 1;
    if (rolavel !== ultimoEstadoRolavel) {
        ultimoEstadoRolavel = rolavel;
        referenciaDotNet?.invokeMethodAsync("AtualizarVisibilidadeVoltarTopo", rolavel);
    }
    return rolavel;
}

export function conectar(revisao, referencia) {
    desconectar();
    referenciaDotNet = referencia;
    ultimoEstadoRolavel = undefined;
    alvoObservado = document.querySelector(revisao
        ? ".captura-dia__conteudo--revisao"
        : ".captura-dia__conteudo");
    observadorRedimensionamento = new ResizeObserver(() => atualizar());
    if (alvoObservado instanceof HTMLElement) observadorRedimensionamento.observe(alvoObservado);
    window.addEventListener("resize", atualizar);
    window.addEventListener("scroll", atualizar, { passive: true });
    requestAnimationFrame(atualizar);
}

export function atualizarVisibilidadeVoltarTopo() {
    const conteudo = document.querySelector(".captura-dia__conteudo--revisao");
    if (!(conteudo instanceof HTMLElement)) return false;
    return conteudo.getBoundingClientRect().bottom > window.innerHeight + 1;
}

export function voltarAoTopo() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

export function desconectar() {
    observadorRedimensionamento?.disconnect();
    observadorRedimensionamento = null;
    window.removeEventListener("resize", atualizar);
    window.removeEventListener("scroll", atualizar);
    alvoObservado = null;
    referenciaDotNet = null;
}
