const protocol = import.meta.env.VITE_API_PROTOCOL ?? 'http'

const buildUrl = (host: string, port: string) => `${protocol}://${host}:${port}`

export const serviceUrls = {
    auth: buildUrl(
        import.meta.env.VITE_AUTH_HOST ?? 'localhost',
        import.meta.env.VITE_AUTH_PORT ?? '4001',
    ),
    menu: buildUrl(
        import.meta.env.VITE_MENU_HOST ?? 'localhost',
        import.meta.env.VITE_MENU_PORT ?? '4002',
    ),
    order: buildUrl(
        import.meta.env.VITE_ORDER_HOST ?? 'localhost',
        import.meta.env.VITE_ORDER_PORT ?? '4003',
    ),
    admin: buildUrl(
        import.meta.env.VITE_ADMIN_HOST ?? 'localhost',
        import.meta.env.VITE_ADMIN_PORT ?? '4004',
    ),
    payment: buildUrl(
        import.meta.env.VITE_PAYMENT_HOST ?? 'localhost',
        import.meta.env.VITE_PAYMENT_PORT ?? '8084',
    ),
}
