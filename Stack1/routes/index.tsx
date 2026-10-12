import { Head } from "fresh/runtime"
import { definir } from "../utilitarios.ts"
import CabecalhoPagina from "../components/CabecalhoPagina.tsx"

export default definir.page(function PaginaInicial() {
    return (
        <div class="rememore-conteiner pagina-inicial pagina-com-cabecalho">
            <Head>
                <title>Rememore</title>
                <meta name="description" content="Preserve lembranças do cotidiano e volte a elas ao longo do tempo com o Rememore." />
            </Head>
            <CabecalhoPagina titulo="Rememore" />
            <main class="inicio-conteudo">
                <h1 class="inicio-titulo">Nem todos os dias são iguais. Às vezes, é a memória que os torna parecidos.</h1>
                <p class="inicio-descricao">
                    O Rememore ajuda você a preservar lembranças do cotidiano e voltar a elas ao longo do tempo, recuperando detalhes que
                    poderiam se perder com a passagem dos dias.
                </p>
                <p class="inicio-convite">Entre na sua conta ou, se recebeu um convite, comece por aqui.</p>
                <nav class="inicio-acoes" aria-label="Acesso ao Rememore">
                    <a class="button is-primary is-medium" href="/entrar">Entrar</a>
                    <a class="button is-medium" href="/cadastro">Criar conta</a>
                </nav>
            </main>
        </div>
    )
})
