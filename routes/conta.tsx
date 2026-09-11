import { define } from "../utils.ts"
import ProtectedShell from "../islands/ProtectedShell.tsx"

export default define.page(function ContaPage() {
    return <ProtectedShell title="Minha Conta e Meus Dados" />
})
