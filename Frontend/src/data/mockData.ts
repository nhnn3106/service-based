import type { MenuItem, OrderRecord, PaymentRecord, UserProfile } from '../types'

export const menuItems: MenuItem[] = [
    {
        id: 1,
        name: 'Com tam',
        description: 'Vietnamese broken rice with grilled pork',
        price: 35000,
        createdAt: '2026-04-01T14:23:23.525992',
    },
    {
        id: 2,
        name: 'Pho bo',
        description: 'Beef noodle soup',
        price: 45000,
        createdAt: '2026-04-01T14:23:23.54628',
    },
    {
        id: 3,
        name: 'Banh mi',
        description: 'Vietnamese baguette sandwich',
        price: 20000,
        createdAt: '2026-04-01T14:23:23.54764',
    },
    {
        id: 4,
        name: 'Tra dao',
        description: null,
        price: 25000,
        createdAt: '2026-04-01T14:23:23.54764',
    },
]

export const usersMock: UserProfile[] = [
    {
        id: 'admin-001',
        name: 'Admin ChefHub',
        email: 'admin@chefhub.vn',
        role: 'admin',
        password: 'admin123',
    },
    {
        id: 'u-1001',
        name: 'Nguyen Lan',
        email: 'lan.nguyen@example.com',
        role: 'user',
        password: 'lan123',
    },
    {
        id: 'u-1002',
        name: 'Tran Minh',
        email: 'minh.tran@example.com',
        role: 'user',
        password: 'minh123',
    },
]

export const ordersMock: OrderRecord[] = [
    {
        id: 'DH-1201',
        customerName: 'Nguyen Lan',
        phone: '0909 123 456',
        address: '12 Ly Tu Trong, Q1, TP.HCM',
        note: 'It cay, khong hanh',
        paymentMethod: 'cash',
        items: [
            { id: 1, quantity: 1 },
            { id: 3, quantity: 2 },
        ],
        total: 75000,
        status: 'confirmed',
        createdAt: '2026-03-29T09:20:00.000Z',
    },
    {
        id: 'DH-1202',
        customerName: 'Tran Minh',
        phone: '0911 222 333',
        address: '98 Nguyen Hue, Q1, TP.HCM',
        note: 'Giao trong gio nghi',
        paymentMethod: 'bank',
        items: [
            { id: 2, quantity: 1 },
            { id: 4, quantity: 1 },
        ],
        total: 70000,
        status: 'pending',
        createdAt: '2026-03-30T11:05:00.000Z',
    },
]

export const paymentsMock: PaymentRecord[] = [
    {
        id: 'PM-9001',
        orderId: 'DH-1201',
        method: 'cash',
        amount: 102000,
        status: 'pending',
        paidAt: null,
    },
    {
        id: 'PM-9002',
        orderId: 'DH-1202',
        method: 'bank',
        amount: 125000,
        status: 'paid',
        paidAt: '2026-03-30T11:06:00.000Z',
    },
]
