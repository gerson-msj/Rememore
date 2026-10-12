import { Head } from "fresh/runtime"
import { definir } from "../utilitarios.ts"
import Laboratorio from "../islands/Laboratorio.tsx"

export default definir.page(function PaginaLaboratorio() {
    return (
        <main class="rememore-conteiner" id="laboratorio">
            <Head>
                <title>Laboratório visual — Rememore</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <header class="lab-secao">
                <p class="is-size-7 has-text-weight-semibold mb-3">REMEMORE · DESENVOLVIMENTO</p>
                <h1 class="title is-2">Laboratório visual</h1>
                <p class="rememore-leitura mb-5">
                    Experimente temas, cores e componentes. Redimensione a janela e percorra as amostras também com o teclado.
                </p>
            </header>
            <Laboratorio />
        </main>
    )
})
