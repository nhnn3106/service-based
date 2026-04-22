import axios from 'axios'
import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios'
import { menuItems, ordersMock, paymentsMock, usersMock } from '../data/mockData'
import type {
    FoodPayload,
    OrderPayload,
    OrderRecord,
    OrderResult,
    PaymentRecord,
    UserProfile,
} from '../types'

const adminEmail = 'admin@chefhub.vn'
const adminUser = usersMock.find((user) => user.email === adminEmail)

let usersStore: UserProfile[] = [...usersMock]

let foodsStore = [...menuItems]
let ordersStore: OrderRecord[] = [...ordersMock]
let paymentsStore: PaymentRecord[] = [...paymentsMock]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const buildResponse = async <T>(
    config: AxiosRequestConfig,
    data: T,
    status = 200,
): Promise<AxiosResponse<T>> => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
})

const mockAdapter: AxiosAdapter = async (config) => {
    await delay(450)

    const method = (config.method ?? 'get').toLowerCase()
    const url = config.url ?? ''
    const body =
        typeof config.data === 'string' ? JSON.parse(config.data) : config.data ?? {}

    if (method === 'get' && url === '/menu') {
        return buildResponse(config, foodsStore)
    }

    if (method === 'get' && url === '/foods') {
        return buildResponse(config, foodsStore)
    }

    if (method === 'get' && url === '/users') {
        return buildResponse(config, usersStore)
    }

    if (method === 'get' && url === '/orders') {
        return buildResponse(config, ordersStore)
    }

    if (method === 'get' && url === '/payments') {
        return buildResponse(config, paymentsStore)
    }

    if (method === 'post' && url === '/payments') {
        return buildResponse(config, {
            status: 'SUCCESS',
            message: 'Payment successful',
        })
    }

    if (method === 'post' && url === '/login') {
        const email = body.email ?? ''
        const password = body.password ?? ''
        const matched = usersStore.find(
            (entry) => entry.email === email && (!entry.password || entry.password === password),
        )
        if (matched) {
            return buildResponse(config, matched)
        }
        return buildResponse(config, { message: 'Invalid credentials' }, 401)
    }

    if (method === 'post' && url === '/register') {
        const user: UserProfile = {
            id: `u-${Math.floor(Math.random() * 9000 + 1000)}`,
            name: body.name ?? 'Thanh vien moi',
            email: body.email ?? 'member@example.com',
            role: 'user',
            password: body.password ?? '123456',
        }
        usersStore = [user, ...usersStore.filter((entry) => entry.email !== user.email)]
        return buildResponse(config, user)
    }

    if (method === 'post' && url === '/foods') {
        const payload = body as FoodPayload
        const newFood = {
            id: Math.floor(Math.random() * 9000 + 1000),
            ...payload,
            createdAt: new Date().toISOString(),
        }
        foodsStore = [newFood, ...foodsStore]
        return buildResponse(config, newFood, 201)
    }

    if (method === 'put' && url.startsWith('/foods/')) {
        const id = Number(url.replace('/foods/', ''))
        const payload = body as FoodPayload
        const index = foodsStore.findIndex((entry) => entry.id === id)
        if (index === -1) {
            return buildResponse(config, { message: 'Not found' }, 404)
        }
        const updated = { ...foodsStore[index], ...payload }
        foodsStore = foodsStore.map((entry) => (entry.id === id ? updated : entry))
        return buildResponse(config, updated)
    }

    if (method === 'delete' && url.startsWith('/foods/')) {
        const id = Number(url.replace('/foods/', ''))
        const exists = foodsStore.some((entry) => entry.id === id)
        if (!exists) {
            return buildResponse(config, { message: 'Not found' }, 404)
        }
        foodsStore = foodsStore.filter((entry) => entry.id !== id)
        return buildResponse(config, { message: 'Deleted' })
    }

    if (method === 'post' && url === '/orders') {
        const payload = body as OrderPayload
        const total = payload.items.reduce((sum, item) => {
            const menuItem = foodsStore.find((entry) => entry.id === item.id)
            return sum + (menuItem?.price ?? 0) * item.quantity
        }, 0)
        const orderId = `DH-${Math.floor(Math.random() * 9000 + 1000)}`
        const createdAt = new Date().toISOString()
        const orderRecord: OrderRecord = {
            id: orderId,
            customerName: payload.customerName,
            phone: payload.phone,
            note: payload.note,
            paymentMethod: payload.paymentMethod,
            items: payload.items,
            total,
            status: 'success',
            createdAt,
        }
        ordersStore = [orderRecord, ...ordersStore]

        const paymentRecord: PaymentRecord = {
            id: `PM-${Math.floor(Math.random() * 9000 + 1000)}`,
            orderId,
            method: payload.paymentMethod,
            amount: total,
            status: payload.paymentMethod === 'bank' ? 'paid' : 'pending',
            paidAt: payload.paymentMethod === 'bank' ? createdAt : null,
        }
        paymentsStore = [paymentRecord, ...paymentsStore]

        const result: OrderResult = {
            orderId,
            total,
            etaMinutes: Math.floor(Math.random() * 20 + 25),
        }
        return buildResponse(config, result)
    }

    return buildResponse(config, { message: 'Not found' }, 404)
}

export const createApi = (baseURL: string) =>
    axios.create({
        baseURL,
        adapter: mockAdapter,
    })

export const createRealApi = (baseURL: string) =>
    axios.create({
        baseURL,
    })
