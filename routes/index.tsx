import { Head } from "fresh/runtime"
import { define } from "../utils.ts"
import PageHeader from "../components/PageHeader.tsx"

export default define.page(function Home() {
    return (
        <div class="rememore-container home page-with-header">
            <Head>
                <title>Rememore</title>
                <meta name="description" content="Preserve lembranças do cotidiano e volte a elas ao longo do tempo com o Rememore." />
            </Head>
            <PageHeader title="Rememore" />
            <main class="home-content">
                <h1 class="home-title">Nem todos os dias são iguais. Às vezes, é a memória que os torna parecidos.</h1>
                <p class="home-description">
                    O Rememore ajuda você a preservar lembranças do cotidiano e voltar a elas ao longo do tempo, recuperando detalhes que
                    poderiam se perder com a passagem dos dias.
                </p>
                <p class="home-invitation">Entre na sua conta ou, se recebeu um convite, comece por aqui.</p>
                <nav class="home-actions" aria-label="Acesso ao Rememore">
                    <a class="button is-primary is-medium" href="/entrar">Entrar</a>
                    <a class="button is-medium" href="/cadastro">Criar conta</a>
                </nav>
            </main>
        </div>
    )
})
