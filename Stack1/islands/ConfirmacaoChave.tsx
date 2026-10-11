import { useEffect, useState } from "preact/hooks"
import CabecalhoPagina from "../components/CabecalhoPagina.tsx"
import ConfirmacaoNovaChave from "../components/ConfirmacaoNovaChave.tsx"

export default function ConfirmacaoChave({ titulo, endereco, chaveArmazenamento, mensagem }: {
    titulo: string
    endereco: string
    chaveArmazenamento: string
    mensagem: string
}) {
    const [chave, definirChave] = useState<string | null>(null)
    useEffect(() => {
        let ativo = true
        async function restaurar() {
            definirChave(null)
            const idPendente = sessionStorage.getItem(chaveArmazenamento)
            if (!idPendente) {
                globalThis.location.replace("/")
                return
            }
            const resposta = await fetch(endereco, {
                method: "POST",
                body: new URLSearchParams({ pendingId: idPendente, intent: "read" })
            })
            if (resposta.redirected) {
                sessionStorage.removeItem(chaveArmazenamento)
                globalThis.location.replace(resposta.url)
                return
            }
            if (!resposta.ok) throw new Error("Confirmação: resposta inesperada")
            const dados: { key: string } = await resposta.json()
            if (ativo) definirChave(dados.key)
        }
        const aoExibir = (evento: PageTransitionEvent) => {
            if (evento.persisted) void restaurar()
        }
        const aoOcultar = () => definirChave(null)
        void restaurar()
        globalThis.addEventListener("pageshow", aoExibir)
        globalThis.addEventListener("pagehide", aoOcultar)
        return () => {
            ativo = false
            globalThis.removeEventListener("pageshow", aoExibir)
            globalThis.removeEventListener("pagehide", aoOcultar)
        }
    }, [endereco, chaveArmazenamento])
    if (!chave) return null
    return (
        <>
            <CabecalhoPagina titulo={titulo} />
            <main class="rememore-conteiner pagina-com-cabecalho">
                <ConfirmacaoNovaChave
                    novaChave={chave}
                    mensagem={mensagem}
                    informacao="Esta chave será exibida somente agora. O Rememore não poderá mostrá-la novamente depois que você sair desta página."
                    aoConfirmar={async () => {
                        const idPendente = sessionStorage.getItem(chaveArmazenamento) ?? ""
                        const resposta = await fetch(endereco, {
                            method: "POST",
                            body: new URLSearchParams({ pendingId: idPendente, intent: "confirm" })
                        })
                        if (!resposta.ok) throw new Error("Confirmação: resposta inesperada")
                        sessionStorage.removeItem(chaveArmazenamento)
                        definirChave(null)
                        globalThis.location.replace(resposta.redirected ? resposta.url : "/principal")
                    }}
                />
            </main>
        </>
    )
}
