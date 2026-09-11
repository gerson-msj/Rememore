import { define } from "../utils.ts"
import ProtectedShell from "../islands/ProtectedShell.tsx"

export default define.page(function CapturarPage() {
    return <ProtectedShell title="Capturar" />
})
