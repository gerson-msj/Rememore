import { define } from "../utils.ts"
import ProtectedShell from "../islands/ProtectedShell.tsx"

export default define.page(function RememorarPage() {
    return <ProtectedShell title="Rememorar" />
})
