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
