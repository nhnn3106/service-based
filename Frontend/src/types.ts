export type AuthMode = 'login' | 'register'

export type MenuItem = {
    id: number
    name: string
    description: string | null
    price: number
    createdAt: string
}

export type CartItem = MenuItem & {
    quantity: number
}

export type OrderPayload = {
    customerName: string
    phone: string
    note: string
    paymentMethod: 'cash' | 'bank'
    items: Array<{ id: number; quantity: number }>
}

export type OrderCreateRequest = {
    userId: number
    foodId: number
    quantity: number
}

export type OrderResult = {
    orderId: string
    total: number
    etaMinutes: number
}

export type OrderRecord = {
    id: string
    customerName: string
    phone: string
    note: string
    paymentMethod: 'cash' | 'bank'
    items: Array<{ id: number; quantity: number }>
    total: number
    status: 'pending' | 'success' | 'fail'
    createdAt: string
}

export type PaymentRecord = {
    id: string
    orderId: string
    method: 'cash' | 'bank'
    amount: number
    status: 'pending' | 'paid' | 'failed'
    paidAt: string | null
}

export type PaymentMethod = 'COD' | 'BANKING'

export type PaymentRequest = {
    orderId: number
    userId: number
    method: PaymentMethod
}

export type PaymentResponse = {
    status: 'SUCCESS'
    message: string
}

export type UserProfile = {
    id: string | number
    name: string
    email: string
    role: 'user' | 'admin'
    createdAt?: string
    password?: string
}

export type AuthResponse = {
    token: string
    expiresAt?: string
    user?: UserProfile
}

export type FoodPayload = {
    name: string
    description: string | null
    price: number
}
