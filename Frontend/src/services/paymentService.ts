import { createApi } from './api'
import { serviceUrls } from './env'
import type { PaymentRequest, PaymentResponse } from '../types'

const api = createApi(serviceUrls.payment)

export const paymentService = {
    createPayment: async (payload: PaymentRequest) => {
        const response = await api.post<PaymentResponse>('/payments', payload)
        return response.data
    },
}
