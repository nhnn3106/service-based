# Food Service API Documentation

## Base Information

- **Base URL:** `http://localhost:8083`
- **Resource path:** `/foods`
- **Content-Type (request):** `application/json`
- **Content-Type (response):** `application/json`

---

## 1) Get all foods

- **Method:** `GET`
- **Endpoint:** `/foods`
- **Request body:** Không có

### Response

- **Status:** `200 OK`
- **Body (example):**

```json
[
  {
    "id": 1,
    "name": "Com tam",
    "price": 35000.00,
    "description": "Vietnamese broken rice with grilled pork",
    "createdAt": "2026-04-01T10:20:30.123456"
  },
  {
    "id": 2,
    "name": "Pho bo",
    "price": 45000.00,
    "description": "Beef noodle soup",
    "createdAt": "2026-04-01T10:20:30.123456"
  }
]
```

---

## 2) Create a new food

- **Method:** `POST`
- **Endpoint:** `/foods`
- **Request body:** Có

### Request body (example)

```json
{
  "name": "Bun bo Hue",
  "price": 50000.00,
  "description": "Spicy beef noodle soup"
}
```

> Ghi chú:
> - `id` không cần gửi (server tự sinh).
> - `createdAt` không cần gửi (server tự set khi tạo).

### Response

- **Status:** `201 Created`
- **Body (example):**

```json
{
  "id": 5,
  "name": "Bun bo Hue",
  "price": 50000.00,
  "description": "Spicy beef noodle soup",
  "createdAt": "2026-04-01T11:00:00.000000"
}
```

---

## 3) Update food by ID

- **Method:** `PUT`
- **Endpoint:** `/foods/{id}`
- **Path variable:** `id` (Integer)
- **Request body:** Có

### Request body (example)

```json
{
  "name": "Pho bo tai",
  "price": 48000.00,
  "description": "Beef noodle soup (rare beef)"
}
```

### Response (success)

- **Status:** `200 OK`
- **Body (example):**

```json
{
  "id": 2,
  "name": "Pho bo tai",
  "price": 48000.00,
  "description": "Beef noodle soup (rare beef)",
  "createdAt": "2026-04-01T10:20:30.123456"
}
```

### Response (not found)

- **Status:** `404 Not Found`
- **Body (example):**

```json
{
  "message": "Food not found with id: 999"
}
```

---

## 4) Delete food by ID

- **Method:** `DELETE`
- **Endpoint:** `/foods/{id}`
- **Path variable:** `id` (Integer)
- **Request body:** Không có

### Response (success)

- **Status:** `204 No Content`
- **Body:** Không có

### Response (not found)

- **Status:** `404 Not Found`
- **Body (example):**

```json
{
  "message": "Food not found with id: 999"
}
```

---

## Food Object Schema

```json
{
  "id": "Integer (auto-generated)",
  "name": "String (required, max 120)",
  "price": "BigDecimal (required)",
  "description": "String (nullable)",
  "createdAt": "LocalDateTime (auto-set on create)"
}
```
