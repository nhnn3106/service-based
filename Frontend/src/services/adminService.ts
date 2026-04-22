import { serviceUrls } from './env'
import { menuService } from './menuService'
import { authStorage } from './authService'
import type { FoodPayload, UserProfile } from '../types'

const authBase = `${serviceUrls.auth}/api`

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

const fetchJson = async <T>(path: string, options: RequestInit): Promise<T> => {
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

export const adminService = {
    getUsers: async () => {
        const token = authStorage.get()?.token
        if (!token) {
            throw new Error('Missing auth token')
        }

        const users = await fetchJson<UserProfile[]>(`${authBase}/users`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        return users.map((user) => ({
            ...user,
            role: normalizeRole(user.role),
        }))
    },
    getFoods: async () => {
        return menuService.getMenu()
    },
    createFood: async (payload: FoodPayload) => {
        return menuService.createFood(payload)
    },
    updateFood: async (id: number, payload: FoodPayload) => {
        return menuService.updateFood(id, payload)
    },
    deleteFood: async (id: number) => {
        await menuService.deleteFood(id)
    },
}
