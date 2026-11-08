// Tipos para autenticación sandbox (porque no hay base ni nada)

export type Role = "B2C" | "B2B" | "ADMIN"
export type BranchId = "san_jose" | "guanacaste" | "limon" // sucursales asignadas a los usuarios (para saber de donde compran)

export interface Company {
    name: string
    legalId: string // Cedula juridica con formato: "3-101-123456" VALIDAR
    contactName: string
}

/**
 * Usuario validado para almacenamiento, de aqui se consume info real en toda la pagina
 */
export interface AppUser {
    objectID: string
    username: string
    email: string
    displayName: string
    phone: string
    role: Role
    active: boolean
    defaultBranch: BranchId
    company?: Company
}

/**
 * Usuario en crudo sin tipos de datos especificos
 */
export interface RawUser {
    objectID: string
    username: string
    email: string
    displayName: string
    phone?: string // puede no venir
    role?: string // string porque puede venir cualquier cosa, para validarse y parecear a appUser
    active: boolean
    defaultBranch?: string // misma razon de arriba
    company?: Company // misma razon de arriba
}

// Los tipos de error que puede devolver el directorio
export type LookupFailure = "NOT_FOUND" | "INACTIVE" | "INVALID_ROLE" | "INVALID_RECORD"

export type LookupResult = 
| { ok: true, user: AppUser }
| { ok: false, reason: LookupFailure }

/**
 * Sesion por pestaña. Solo guarda quien esta conectado:
 * el rol y demas datos se resuelven desde el directorio.
 */
export interface Session {
    userId: string
    sessionId: string
    loginAt: string
}

export type LoginResult =
| { ok: true }
| { ok: false, reason: LookupFailure }

/**
 * Iterface para el directorio con funciones que debe implementar para cumplir con estos tipos
 * (contrato pues xd)
 */
export interface UserDirectory {
    findByLogin(login: string): Promise<LookupResult>;
    findById(id: string): Promise<AppUser | null>;
    list(): Promise<AppUser[]>;
}