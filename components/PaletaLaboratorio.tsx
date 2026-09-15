import { useEffect, useRef, useState } from "preact/hooks"
import {
    camposPaleta,
    chaveArmazenamentoPaleta,
    type ChaveCor,
    estilosPaleta,
    exportarPaleta,
    interpretarRascunhos,
    normalizarHexadecimal,
    type Paleta,
    type Rascunhos,
    type TemaPaleta
} from "../app/utilitarios/paletaLaboratorio.ts"

function lerPadroes(): Record<TemaPaleta, Paleta> {
    const raiz = document.documentElement
    const anterior = raiz.getAttribute("data-theme")
    const sonda = document.createElement("span")
    sonda.hidden = true
    raiz.append(sonda)
    const paletas = {} as Record<TemaPaleta, Paleta>
    try {
        for (const tema of ["light", "dark"] as const) {
            raiz.dataset.theme = tema
            paletas[tema] = {} as Paleta
            for (const [chave, , , variavel] of camposPaleta) {
                sonda.style.color = chave === "title"
                    ? "var(--bulma-text-title, var(--bulma-text-strong))"
                    : "var(--bulma-" + variavel + ")"
                const canais = getComputedStyle(sonda).color.match(/[\d.]+/g)
                if (!canais || canais.length < 3) throw new Error("Cor indisponível: " + chave)
                paletas[tema][chave] = "#" + canais.slice(0, 3)
                    .map((valor) => Math.round(Number(valor)).toString(16).padStart(2, "0")).join("").toUpperCase()
            }
        }
    } finally {
        sonda.remove()
        if (anterior === null) raiz.removeAttribute("data-theme")
        else raiz.setAttribute("data-theme", anterior)
    }
    return paletas
}

function CampoCor({ chaveCor, rotulo, descricao, value: valor, disabled, onChange: aoAlterar }: {
    chaveCor: ChaveCor
    rotulo: string
    descricao: string
    value: string
    disabled: boolean
    onChange: (chave: ChaveCor, valor: string) => void
}) {
    const [entrada, definirEntrada] = useState(valor)
    const [invalido, definirInvalido] = useState(false)
    useEffect(() => {
        definirEntrada(valor)
        definirInvalido(false)
    }, [valor])
    const id = "palette-" + chaveCor
    return (
        <div class="lab-campo-cor">
            <label class="label" for={id}>{rotulo}</label>
            <div class="lab-entradas-cor">
                <input
                    type="color"
                    value={valor}
                    disabled={disabled}
                    aria-label={"Escolher " + rotulo.toLowerCase()}
                    onInput={(evento) => aoAlterar(chaveCor, evento.currentTarget.value.toUpperCase())}
                />
                <input
                    id={id}
                    class={"input" + (invalido ? " is-danger" : "")}
                    value={entrada}
                    disabled={disabled}
                    spellcheck={false}
                    autoComplete="off"
                    maxLength={7}
                    aria-invalid={invalido}
                    aria-describedby={id + "-help"}
                    onInput={(evento) => {
                        const proximo = evento.currentTarget.value
                        definirEntrada(proximo)
                        definirInvalido(false)
                        if (/^#?[0-9a-f]{6}$/i.test(proximo)) aoAlterar(chaveCor, normalizarHexadecimal(proximo)!)
                    }}
                    onBlur={() => {
                        const hex = normalizarHexadecimal(entrada)
                        if (hex) {
                            definirEntrada(hex)
                            aoAlterar(chaveCor, hex)
                        } else definirInvalido(true)
                    }}
                />
            </div>
            <p class={"help" + (invalido ? " is-danger" : "")} id={id + "-help"}>
                {invalido ? "Informe uma cor hexadecimal, como #F5F2EB." : descricao}
            </p>
        </div>
    )
}

export default function PaletaLaboratorio({ tema }: { tema: "system" | TemaPaleta }) {
    const [padroes, definirPadroes] = useState<Record<TemaPaleta, Paleta> | null>(null)
    const [rascunhos, definirRascunhos] = useState<Rascunhos>({ light: {}, dark: {} })
    const [temaSistema, definirTemaSistema] = useState<TemaPaleta>("light")
    const [mensagem, definirMensagem] = useState("")
    const [avisoArmazenamento, definirAvisoArmazenamento] = useState(false)
    const referenciaEstilo = useRef<HTMLStyleElement | null>(null)
    const ativo = tema === "system" ? temaSistema : tema

    useEffect(() => {
        const estilo = document.createElement("style")
        estilo.dataset.labPalette = ""
        document.head.append(estilo)
        referenciaEstilo.current = estilo
        const consultaMidia = matchMedia("(prefers-color-scheme: dark)")
        const atualizarSistema = () => definirTemaSistema(consultaMidia.matches ? "dark" : "light")
        atualizarSistema()
        consultaMidia.addEventListener("change", atualizarSistema)
        try {
            definirPadroes(lerPadroes())
            try {
                definirRascunhos(interpretarRascunhos(localStorage.getItem(chaveArmazenamentoPaleta)))
            } catch {
                definirAvisoArmazenamento(true)
            }
        } catch {
            definirMensagem("Não foi possível ler a paleta do CSS. Recarregue o laboratório.")
        }
        const sincronizar = (evento: StorageEvent) => {
            if (evento.key === chaveArmazenamentoPaleta || evento.key === null) definirRascunhos(interpretarRascunhos(evento.newValue))
        }
        globalThis.addEventListener("storage", sincronizar)
        return () => {
            estilo.remove()
            consultaMidia.removeEventListener("change", atualizarSistema)
            globalThis.removeEventListener("storage", sincronizar)
        }
    }, [])

    useEffect(() => {
        if (padroes && referenciaEstilo.current) referenciaEstilo.current.textContent = estilosPaleta(padroes, rascunhos)
    }, [padroes, rascunhos])

    useEffect(() => definirMensagem(""), [tema])

    function guardar(proximo: Rascunhos) {
        definirRascunhos(proximo)
        definirMensagem("")
        try {
            localStorage.setItem(chaveArmazenamentoPaleta, JSON.stringify(proximo))
            definirAvisoArmazenamento(false)
        } catch {
            definirAvisoArmazenamento(true)
        }
    }

    function alterar(chave: ChaveCor, cor: string) {
        if (tema === "system" || !padroes) return
        const proximo = { ...rascunhos[ativo], [chave]: cor }
        if (cor === padroes[ativo][chave]) delete proximo[chave]
        guardar({ ...rascunhos, [ativo]: proximo })
    }

    const paleta = padroes ? { ...padroes[ativo], ...rascunhos[ativo] } : null
    const exportado = paleta ? exportarPaleta(ativo, paleta) : ""
    async function copiar() {
        try {
            await navigator.clipboard.writeText(exportado)
            definirMensagem("Paleta copiada.")
        } catch {
            definirMensagem("Selecione e copie o texto no campo abaixo.")
        }
    }

    return (
        <section class="lab-paleta mt-5" aria-labelledby="palette-title">
            <h2 class="title is-4" id="palette-title">Paleta de cores</h2>
            <p class="mb-4">
                Ajuste cada cor e observe as amostras abaixo. Os rascunhos Claro e Escuro ficam salvos neste navegador. Quando terminar,
                copie a paleta para definirmos as cores do projeto.
            </p>
            <p class="has-text-weight-semibold mb-3">
                {tema === "system" ? "Prévia do sistema: " : "Editando tema: "}
                {ativo === "light" ? "Claro" : "Escuro"}
            </p>
            {tema === "system" && (
                <p class="notification is-light">Selecione Claro ou Escuro no controle de tema acima para editar a paleta.</p>
            )}
            {avisoArmazenamento && <p role="status">O navegador não permitiu salvar o rascunho. Copie a paleta antes de sair.</p>}
            {paleta && (
                <>
                    <div class="lab-paleta-grade">
                        {camposPaleta.map(([chave, rotulo, descricao]) => (
                            <CampoCor
                                key={ativo + chave}
                                chaveCor={chave}
                                rotulo={rotulo}
                                descricao={descricao}
                                value={paleta[chave]}
                                disabled={tema === "system"}
                                onChange={alterar}
                            />
                        ))}
                    </div>
                    <div class="buttons mt-5">
                        <button type="button" class="button is-link" onClick={copiar}>
                            Copiar paleta {ativo === "light" ? "clara" : "escura"}
                        </button>
                        <button
                            type="button"
                            class="button"
                            disabled={tema === "system" || !Object.keys(rascunhos[ativo]).length}
                            onClick={() => guardar({ ...rascunhos, [ativo]: {} })}
                        >
                            Restaurar cores do CSS deste tema
                        </button>
                    </div>
                    <label class="label" for="palette-export">As 16 cores do tema {ativo === "light" ? "claro" : "escuro"}</label>
                    <textarea
                        id="palette-export"
                        class="textarea lab-paleta-exportacao"
                        rows={6}
                        readOnly
                        value={exportado}
                        onFocus={(evento) => evento.currentTarget.select()}
                    />
                    <p class="help">
                        Copie este texto para guardar uma versão ou enviar a paleta. Os rascunhos não alteram o CSS do projeto.
                    </p>
                </>
            )}
            <p role="status" aria-live="polite" class="mt-3">{mensagem}</p>
        </section>
    )
}
