import { define } from "../utils.ts"
import CaptureSelection from "../islands/CaptureSelection.tsx"
import { session } from "../app/services/auth.ts"

export const handler = define.handlers({
    async GET(ctx) {
        const accountId = await session.accountId(ctx.req)
        if (!accountId) return new Response(null, { status: 303, headers: { Location: "/entrar" } })
        return { data: { accountId } }
    }
})

export default define.page<typeof handler>(function CapturarPage({ data }) {
    return <CaptureSelection accountId={data.accountId} />
})
