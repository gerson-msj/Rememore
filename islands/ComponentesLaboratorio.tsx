import { useState } from "preact/hooks"
import CabecalhoPagina from "../components/CabecalhoPagina.tsx"
import MensagemPopup, { type CorPopup, type ResultadoPopup } from "../components/MensagemPopup.tsx"

export default function ComponentesLaboratorio() {
    const [cabecalho, definirCabecalho] = useState("home")
    const [titulo, definirTitulo] = useState("Rememore")
    const [resultadoCabecalho, definirResultadoCabecalho] = useState("Nenhuma ação acionada.")
    const [mensagem, definirMensagem] = useState("Deseja realmente sair?")
    const [acoes, definirAcoes] = useState<"yesNo" | "yes" | "no" | "okCancel" | "ok" | "none">("yesNo")
    const [icone, definirIcone] = useState("")
    const [cor, definirCor] = useState<CorPopup | "">("")
    const [aberto, definirAberto] = useState(false)
    const [fecharAoReceberResultado, definirFecharAoReceberResultado] = useState(true)
    const [resultado, definirResultado] = useState("Nenhum resultado recebido.")
    const [eventos, definirEventos] = useState(0)
    const [resultadoPendente, definirResultadoPendente] = useState(false)

    function receberResultado(valor: ResultadoPopup) {
        definirEventos((contagem) => contagem + 1)
        definirResultado(valor === "confirm" ? "Confirmação recebida." : "Cancelamento recebido.")
        if (fecharAoReceberResultado || resultadoPendente) definirAberto(false)
        else definirResultadoPendente(true)
    }

    return (
        <section class="lab-secao lab-componentes" id="componentes" aria-labelledby="titulo-componentes">
            <CabecalhoPagina
                titulo={titulo}
                aoVoltar={cabecalho === "login" ? () => definirResultadoCabecalho("Retorno recebido pelo laboratório.") : undefined}
                aoSair={cabecalho === "principal" ? () => definirResultadoCabecalho("Saída recebida pelo laboratório.") : undefined}
            />
            <h2 class="title is-3" id="titulo-componentes">Cabeçalho e popup</h2>
            <p class="mb-5">
                Use os temas acima e role a página para avaliar o cabeçalho fixo. As ações desta amostra permanecem no laboratório.
            </p>
            <div class="lab-grade">
                <div class="box">
                    <h3 class="title is-4">Cabeçalho de Página</h3>
                    <div class="field">
                        <label class="label" for="lab-header-mode">Configuração</label>
                        <div class="select is-fullwidth">
                            <select
                                id="lab-header-mode"
                                value={cabecalho}
                                onChange={(evento) => {
                                    const modo = evento.currentTarget.value
                                    definirCabecalho(modo)
                                    definirTitulo(modo === "login" ? "Entrar" : "Rememore")
                                }}
                            >
                                <option value="home">Sem retorno e sem saída</option>
                                <option value="login">Com retorno e sem saída</option>
                                <option value="principal">Sem retorno e com saída</option>
                            </select>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label" for="lab-header-title">Título</label>
                        <input
                            id="lab-header-title"
                            class="input"
                            value={titulo}
                            onInput={(evento) => definirTitulo(evento.currentTarget.value)}
                        />
                    </div>
                    <p role="status">{resultadoCabecalho}</p>
                </div>
                <div class="box">
                    <h3 class="title is-4">Mensagem em Popup</h3>
                    <div class="field">
                        <label class="label" for="lab-popup-message">Mensagem</label>
                        <textarea
                            id="lab-popup-message"
                            class="textarea"
                            rows={2}
                            value={mensagem}
                            onInput={(evento) => definirMensagem(evento.currentTarget.value)}
                        />
                    </div>
                    <div class="field">
                        <label class="label" for="lab-popup-actions">Ações</label>
                        <div class="select is-fullwidth">
                            <select
                                id="lab-popup-actions"
                                value={acoes}
                                onChange={(evento) => definirAcoes(evento.currentTarget.value as typeof acoes)}
                            >
                                <option value="yesNo">Sim e Não</option>
                                <option value="yes">Somente Sim</option>
                                <option value="no">Somente Não</option>
                                <option value="okCancel">OK e Cancelar</option>
                                <option value="ok">Somente OK</option>
                                <option value="none">Nenhuma ação</option>
                            </select>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label" for="lab-popup-icon">Ícone Font Awesome</label>
                        <div class="select is-fullwidth">
                            <select id="lab-popup-icon" value={icone} onChange={(evento) => definirIcone(evento.currentTarget.value)}>
                                <option value="">Sem ícone</option>
                                <option value="fas fa-info-circle">Informação</option>
                                <option value="fas fa-question-circle">Pergunta</option>
                                <option value="fas fa-check-circle">Confirmação</option>
                                <option value="fas fa-exclamation-triangle">Atenção</option>
                                <option value="fas fa-book-open">Livro aberto</option>
                            </select>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label" for="lab-popup-color">Cor</label>
                        <div class="select is-fullwidth">
                            <select
                                id="lab-popup-color"
                                value={cor}
                                onChange={(evento) => definirCor(evento.currentTarget.value as typeof cor)}
                            >
                                <option value="">Padrão do tema</option>
                                <option value="primary">Principal</option>
                                <option value="link">Link</option>
                                <option value="info">Informação</option>
                                <option value="success">Sucesso</option>
                                <option value="warning">Atenção</option>
                                <option value="danger">Perigo</option>
                            </select>
                        </div>
                    </div>
                    <div class="field">
                        <label class="checkbox">
                            <input
                                type="checkbox"
                                checked={fecharAoReceberResultado}
                                onChange={(evento) => definirFecharAoReceberResultado(evento.currentTarget.checked)}
                            />{" "}
                            O chamador fecha ao receber o resultado
                        </label>
                        <p class="help">
                            Desmarque para manter aberto após o primeiro resultado. Nesta amostra, o chamador fechará no segundo resultado.
                        </p>
                    </div>
                    <button
                        type="button"
                        class="button is-primary"
                        onClick={() => {
                            definirResultadoPendente(false)
                            definirAberto(true)
                        }}
                    >
                        Abrir popup
                    </button>
                    <p class="mt-4" role="status">{resultado} Resultados recebidos: {eventos}.</p>
                </div>
            </div>
            <MensagemPopup
                aberto={aberto}
                mensagem={resultadoPendente
                    ? `${mensagem} ${resultado} O chamador manteve aberto; a próxima resposta fechará esta amostra.`
                    : mensagem}
                acoes={acoes}
                icone={icone || undefined}
                cor={cor || undefined}
                aoResponder={receberResultado}
            />
        </section>
    )
}
