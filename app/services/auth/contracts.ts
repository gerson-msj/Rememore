export interface Credentials {
    username: string
    password: string
}

export type AuthenticationResult = "accepted" | "invalid"

export interface AuthenticationService {
    authenticate(credentials: Credentials): Promise<AuthenticationResult>
}

export interface SessionService {
    isAuthenticated(request: Request): Promise<boolean>
    establish(request: Request, headers: Headers): Promise<void>
    end(request: Request, headers: Headers): Promise<void>
}

export type RegistrationErrors = Partial<Record<"invitation" | "username" | "password", boolean>>
export interface RegistrationService {
    register(input: Credentials & { invitation: string }): Promise<
        { status: "accepted"; pendingId: string } | { status: "invalid"; errors: RegistrationErrors }
    >
}

export interface PendingKeyService {
    read(pendingId: string, operation: KeyOperation): Promise<string | null>
    consume(pendingId: string, operation: KeyOperation): Promise<boolean>
}

export type KeyOperation = "registration" | "passwordReset"

export interface PasswordResetService {
    reset(input: Credentials & { key: string }): Promise<
        { status: "accepted"; pendingId: string } | { status: "invalid" }
    >
}
