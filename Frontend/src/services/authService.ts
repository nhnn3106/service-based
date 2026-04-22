import { serviceUrls } from './env'
import type { AuthResponse, UserProfile } from '../types'

const authBase = `${serviceUrls.auth}/api`
const storageKey = 'chefhub-auth'

type StoredAuth = {
    token: string | null
    user: UserProfile | null
    expiresAt?: string
}

const getErrorMessage = async (response: Response) => {
    const text = await response.text()
    if (!text) return 'Request failed'
    try {
        const data = JSON.parse(text) as { message?: string }
        return data.message ?? text
    } catch {
        return text
    }
}

const fetchJson = async <T>(
    path: string,
    options: RequestInit,
): Promise<T> => {
    const response = await fetch(path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    })

    if (!response.ok) {
        const message = await getErrorMessage(response)
        throw new Error(message)
    }

    return (await response.json()) as T
}

const normalizeRole = (role?: string): UserProfile['role'] =>
    role?.toLowerCase() === 'admin' ? 'admin' : 'user'

const normalizeUser = (
    user: UserProfile | undefined,
    fallbackEmail: string,
): UserProfile => {
    if (user) {
        return {
            ...user,
            role: normalizeRole(user.role),
        }
    }

    const name = fallbackEmail.split('@')[0] || fallbackEmail
    return {
        id: fallbackEmail,
        name,
        email: fallbackEmail,
        role: 'user',
    }
}

export const authStorage = {
    get: (): StoredAuth | null => {
        const raw = localStorage.getItem(storageKey)
        if (!raw) return null
        try {
            return JSON.parse(raw) as StoredAuth
        } catch {
            return null
        }
    },
    set: (value: StoredAuth) => {
        localStorage.setItem(storageKey, JSON.stringify(value))
    },
    clear: () => {
        localStorage.removeItem(storageKey)
    },
}

export const authService = {
    login: async (email: string, password: string) => {
        const data = await fetchJson<AuthResponse>(`${authBase}/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        })

        return {
            token: data.token,
            expiresAt: data.expiresAt,
            user: normalizeUser(data.user, email),
        }
    },
    register: async (name: string, email: string, password: string) => {
        const user = await fetchJson<UserProfile>(`${authBase}/register`, {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        })

        return {
            user: {
                ...user,
                role: normalizeRole(user.role),
            },
        }
    },
}
