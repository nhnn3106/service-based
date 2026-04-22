import { createRealApi } from './api'
import { serviceUrls } from './env'
import type { FoodPayload, MenuItem } from '../types'

const api = createRealApi(serviceUrls.menu)

export const menuService = {
    getMenu: async () => {
        const response = await api.get<MenuItem[]>('/foods')
        return response.data
    },
    createFood: async (payload: FoodPayload) => {
        const response = await api.post<MenuItem>('/foods', payload)
        return response.data
    },
    updateFood: async (id: number, payload: FoodPayload) => {
        const response = await api.put<MenuItem>(`/foods/${id}`, payload)
        return response.data
    },
    deleteFood: async (id: number) => {
        await api.delete(`/foods/${id}`)
    },
}
