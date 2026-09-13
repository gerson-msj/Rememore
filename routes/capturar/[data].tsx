import { define } from "../../utils.ts"
import { session } from "../../app/services/auth.ts"
import { isCaptureDate } from "../../app/utils/captureDate.ts"
import CaptureDay from "../../islands/CaptureDay.tsx"

export const handler = define.handlers({
    async GET(ctx) {
        const accountId = await session.accountId(ctx.req)
        if (!accountId) return new Response(null, { status: 303, headers: { Location: "/entrar" } })
        const date = ctx.params.data
        // Calendar validity is checked here; "today" belongs to the browser's civil calendar.
        if (!isCaptureDate(date, "9999-12-31")) {
            return new Response(null, { status: 303, headers: { Location: "/capturar?data-invalida" } })
        }
        return { data: { accountId, date } }
    }
})

export default define.page<typeof handler>(function CaptureDayPage({ data }) {
    return <CaptureDay {...data} />
})
