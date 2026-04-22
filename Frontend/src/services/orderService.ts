import { createRealApi } from './api'
import { serviceUrls } from './env'
import type { OrderCreateRequest, OrderResult } from '../types'

const api = createRealApi(serviceUrls.order)

export const orderService = {
    createOrder: async (payload: OrderCreateRequest) => {
        const response = await api.post<OrderResult>('/orders', payload)
        return response.data
    },
    getOrder: async () => {
        const response = await api.get<OrderResult>('/orders', {})
        return response.data
    }
}
