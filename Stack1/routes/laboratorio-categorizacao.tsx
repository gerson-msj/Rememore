import { Head } from "fresh/runtime"
import { definir } from "../utilitarios.ts"
import LaboratorioCategorizacao from "../islands/LaboratorioCategorizacao.tsx"

export default definir.page(function PaginaLaboratorioCategorizacao() {
    return (
        <>
            <Head>
                <title>Categorização · Laboratório — Rememore</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <LaboratorioCategorizacao />
        </>
    )
})
