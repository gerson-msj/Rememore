import { useState } from "preact/hooks"
import PageHeader from "../components/PageHeader.tsx"
import MessagePopup, { type PopupColor, type PopupResult } from "../components/MessagePopup.tsx"

export default function LaboratorioComponents() {
    const [header, setHeader] = useState("home")
    const [title, setTitle] = useState("Rememore")
    const [headerResult, setHeaderResult] = useState("Nenhuma ação acionada.")
    const [message, setMessage] = useState("Deseja realmente sair?")
    const [actions, setActions] = useState<"yesNo" | "yes" | "no" | "okCancel" | "ok" | "none">("yesNo")
    const [icon, setIcon] = useState("")
    const [color, setColor] = useState<PopupColor | "">("")
    const [open, setOpen] = useState(false)
    const [closeOnResult, setCloseOnResult] = useState(true)
    const [result, setResult] = useState("Nenhum resultado recebido.")
    const [events, setEvents] = useState(0)
    const [pendingResult, setPendingResult] = useState(false)

    function receiveResult(value: PopupResult) {
        setEvents((count) => count + 1)
        setResult(value === "confirm" ? "Confirmação recebida." : "Cancelamento recebido.")
        if (closeOnResult || pendingResult) setOpen(false)
        else setPendingResult(true)
    }

    return (
        <section class="lab-section lab-components" id="componentes" aria-labelledby="titulo-componentes">
            <PageHeader
                title={title}
                onBack={header === "login" ? () => setHeaderResult("Retorno recebido pelo laboratório.") : undefined}
                onLogout={header === "principal" ? () => setHeaderResult("Saída recebida pelo laboratório.") : undefined}
            />
            <h2 class="title is-3" id="titulo-componentes">Cabeçalho e popup</h2>
            <p class="mb-5">
                Use os temas acima e role a página para avaliar o cabeçalho fixo. As ações desta amostra permanecem no laboratório.
            </p>
            <div class="lab-grid">
                <div class="box">
                    <h3 class="title is-4">Cabeçalho de Página</h3>
                    <div class="field">
                        <label class="label" for="lab-header-mode">Configuração</label>
                        <div class="select is-fullwidth">
                            <select
                                id="lab-header-mode"
                                value={header}
                                onChange={(event) => {
                                    const mode = event.currentTarget.value
                                    setHeader(mode)
                                    setTitle(mode === "login" ? "Entrar" : "Rememore")
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
                        <input id="lab-header-title" class="input" value={title} onInput={(event) => setTitle(event.currentTarget.value)} />
                    </div>
                    <p role="status">{headerResult}</p>
                </div>
                <div class="box">
                    <h3 class="title is-4">Mensagem em Popup</h3>
                    <div class="field">
                        <label class="label" for="lab-popup-message">Mensagem</label>
                        <textarea
                            id="lab-popup-message"
                            class="textarea"
                            rows={2}
                            value={message}
                            onInput={(event) => setMessage(event.currentTarget.value)}
                        />
                    </div>
                    <div class="field">
                        <label class="label" for="lab-popup-actions">Ações</label>
                        <div class="select is-fullwidth">
                            <select
                                id="lab-popup-actions"
                                value={actions}
                                onChange={(event) => setActions(event.currentTarget.value as typeof actions)}
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
                            <select id="lab-popup-icon" value={icon} onChange={(event) => setIcon(event.currentTarget.value)}>
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
                                value={color}
                                onChange={(event) => setColor(event.currentTarget.value as typeof color)}
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
                                checked={closeOnResult}
                                onChange={(event) => setCloseOnResult(event.currentTarget.checked)}
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
                            setPendingResult(false)
                            setOpen(true)
                        }}
                    >
                        Abrir popup
                    </button>
                    <p class="mt-4" role="status">{result} Resultados recebidos: {events}.</p>
                </div>
            </div>
            <MessagePopup
                open={open}
                message={pendingResult
                    ? `${message} ${result} O chamador manteve aberto; a próxima resposta fechará esta amostra.`
                    : message}
                actions={actions}
                icon={icon || undefined}
                color={color || undefined}
                onResult={receiveResult}
            />
        </section>
    )
}
