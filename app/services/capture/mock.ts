import type { LocalMemory } from "../local/captures.ts"
import type { PreservedCapturesService } from "./contracts.ts"

export interface CaptureMockScenario {
    status: "absent" | "found" | "failed"
    revision: string
    editWindowDays: number
    memories: LocalMemory[]
    failRead?: boolean
}

export function createCaptureMock(
    scenario: (accountId: string, date: string) => CaptureMockScenario,
    observe: (operation: "metadata" | "download", accountId: string, date: string) => void = () => {}
): PreservedCapturesService {
    return {
        inspect(accountId, date) {
            observe("metadata", accountId, date)
            const current = scenario(accountId, date)
            if (current.status === "failed") return Promise.resolve({ status: "failed" })
            return Promise.resolve(
                current.status === "found"
                    ? { status: "found", revision: current.revision, editWindowDays: current.editWindowDays }
                    : { status: "absent", editWindowDays: current.editWindowDays }
            )
        },
        read(accountId, date) {
            observe("download", accountId, date)
            const current = scenario(accountId, date)
            if (current.failRead || current.status === "failed") return Promise.resolve({ status: "failed" })
            if (current.status === "absent") return Promise.resolve({ status: "absent" })
            return Promise.resolve({
                status: "found",
                revision: current.revision,
                editWindowDays: current.editWindowDays,
                memories: structuredClone(current.memories)
            })
        }
    }
}

const initial: CaptureMockScenario = { status: "absent", revision: "X", editWindowDays: 3, memories: [] }
// A long composition for the operator's desktop/mobile layout checkpoint.
const layoutScenario: CaptureMockScenario = {
    status: "found",
    revision: "layout-B",
    editWindowDays: 3,
    memories: Array.from({ length: 18 }, (_, order) => ({
        id: `layout-memory-${order + 1}`,
        content: `Lembrança ${order + 1}. ` + (
            "Uma conversa ao fim da tarde trouxe de volta detalhes de um dia especial. " +
            "Lembrei da luz entrando pela janela, do café na mesa e das histórias que contamos sem pressa.\n\n"
        ).repeat(order === 0 ? 18 : 2),
        order,
        firstPreservedAt: "2026-09-01T12:00:00.000Z",
        complements: []
    }))
}
const development = import.meta.env?.DEV && typeof window !== "undefined"
const mockKey = (date: string) => `rememore:dev:capture:${date}`

// Console-only development fixtures, excluded from production behavior.
if (development) {
    Object.assign(globalThis, {
        rememoreCaptureMock: {
            set(date: string, status: CaptureMockScenario["status"], revision = "X", editWindowDays = 3) {
                const scenario: CaptureMockScenario = {
                    status,
                    revision,
                    editWindowDays,
                    memories: [{
                        id: `mock-memory:${date}`,
                        content: `Memória de teste — revisão ${revision}`,
                        order: 0,
                        firstPreservedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                        complements: []
                    }]
                }
                localStorage.setItem(mockKey(date), JSON.stringify(scenario))
            },
            configure(date: string, scenario: CaptureMockScenario) {
                localStorage.setItem(mockKey(date), JSON.stringify(scenario))
            },
            reset(date: string) {
                localStorage.removeItem(mockKey(date))
            }
        }
    })
}

export const mockPreservedCaptures = createCaptureMock(
    (_accountId, date) => {
        const configured = development ? localStorage.getItem(mockKey(date)) : null
        return configured ? JSON.parse(configured) as CaptureMockScenario : development && date === "2026-09-08" ? layoutScenario : initial
    },
    (operation, _accountId, date) => {
        if (development) console.info(`[Capturar mock] ${operation}: ${date}`)
    }
)
