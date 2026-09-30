import { definir } from "../utilitarios.ts"
import EstruturaProtegida from "../islands/EstruturaProtegida.tsx"

const DIAS_PRESERVADOS_MOCK = [
    "2025-01-01",
    "2025-01-06",
    "2025-01-08",
    "2025-01-27",
    "2025-01-30"
]

export default definir.page(function PaginaRememorar() {
    return (
        <EstruturaProtegida
            titulo="Rememorar"
            regiaoPrincipal="rememorar"
            diasPreservadosMock={DIAS_PRESERVADOS_MOCK}
        />
    )
})
