API — Demo Driven Service
=========================

Base URL
--------
- Development default: http://localhost:8081/api

Chung
-----
- Content-Type: application/json
- Các endpoint liên quan tới user:
  - POST /register — đăng ký người dùng mới
  - POST /login — đăng nhập, trả về JWT
  - GET /users — lấy danh sách người dùng (Yêu cầu Authorization: Bearer <token>)

1) POST /register
------------------
Mục đích: Tạo tài khoản mới.

Request
- URL: POST /api/register
- Headers:
  - Content-Type: application/json
- Body (application/json):
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "Tên người dùng"
  }

- Validation:
  - email: required, phải đúng định dạng email, phải unique
  - password: required, tối thiểu 6 ký tự
  - name: required

Responses
- 201 Created
  - Body: UserResponse
    {
      "id": 1,
      "email": "user@example.com",
      "name": "Tên người dùng",
      "role": "USER",
      "createdAt": "2026-04-15T08:00:00"
    }
- 400 Bad Request
  - Khi validation lỗi hoặc email đã tồn tại
  - Body: plain text hoặc JSON message (ví dụ: "email.exists" hoặc thông báo validation)

2) POST /login
---------------
Mục đích: Xác thực user, trả về JWT để dùng cho các request cần xác thực.

Request
- URL: POST /api/login
- Headers:
  - Content-Type: application/json
- Body (application/json):
  {
    "email": "user@example.com",
    "password": "password123"
  }

Responses
- 200 OK
  - Body: Authentication response (JSON)
    Option A (recommended):
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "expiresAt": "2026-04-15T09:00:00",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "Tên người dùng",
        "role": "USER",
        "createdAt": "2026-04-15T08:00:00"
      }
    }
    Option B (minimal):
    {
      "token": "eyJhbGciOi..."
    }

- 401 Unauthorized
  - Khi thông tin đăng nhập sai
  - Body: plain text hoặc JSON message (ví dụ: "invalid.credentials")

Notes
- JWT: frontend lưu token (ví dụ localStorage) và gửi header:
  Authorization: Bearer <token>
- Token thường hết hạn (expiration); backend cung cấp expiresAt hoặc expiration ms.

3) GET /users
-------------
Mục đích: Lấy danh sách người dùng (dành cho admin hoặc nội bộ). Trả về array UserResponse.

Request
- URL: GET /api/users
- Headers:
  - Authorization: Bearer <token>

Responses
- 200 OK
  - Body: [ UserResponse, ... ]
    [
      {
        "id": 1,
        "email": "user1@example.com",
        "name": "User One",
        "role": "USER",
        "createdAt": "2026-04-15T08:00:00"
      },
      {
        "id": 2,
        "email": "user2@example.com",
        "name": "User Two",
        "role": "USER",
        "createdAt": "2026-04-14T10:00:00"
      }
    ]
- 401 Unauthorized
  - Nếu token không hợp lệ hoặc missing

Common error codes
- 400 Bad Request — validation lỗi, dữ liệu gửi không hợp lệ
- 401 Unauthorized — đăng nhập thất bại hoặc token không hợp lệ
- 403 Forbidden — (tùy trường hợp) thiếu quyền
- 500 Internal Server Error — lỗi server

Example cURL
------------
Đăng ký:

```bash
curl -X POST "http://localhost:8081/api/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"Test User"}'
```

Đăng nhập:

```bash
curl -X POST "http://localhost:8081/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Lấy users (ví dụ sau khi có token):

```bash
curl -X GET "http://localhost:8081/api/users" \
  -H "Authorization: Bearer eyJhbGciOi..."
```

Postman / Frontend notes
------------------------
- Import collection (nếu tôi đã gửi file postman_collection_demo_driven.json) và environment để có sẵn biến baseUrl/email/password/token.
- Khi login thành công, lưu `token` trả về và thêm header Authorization cho các request bảo mật.
- Nếu backend trả cả `user` trong response login, frontend có thể lưu thông tin user để hiển thị ngay.

Mapping DTOs (backend)
-----------------------
- UserRegisterRequest: { email: string, password: string, name: string }
- UserLoginRequest: { email: string, password: string }
- UserResponse: { id: number, email: string, name: string, role: string, createdAt: string }
- AuthResponse: { token: string, expiresAt?: string, user?: UserResponse }

Ghi chú triển khai
------------------
- Hiện tại server chạy port 8081 (xem `src/main/resources/application.properties`). Nếu frontend chạy khác, cập nhật `baseUrl`.
- Bí mật JWT (app.jwt.secret) cần được lưu an toàn trên backend; ở môi trường dev có thể dùng giá trị mặc định, nhưng production phải thay đổi.

Nếu muốn, tôi có thể:
- Export một Postman collection cập nhật (kèm pre-request script để tự đặt email ngẫu nhiên).
- Sinh ví dụ responses chính xác theo implementation hiện tại (ví dụ nếu login trả chỉ token hay token+user).
- Thêm route để refresh token hoặc revoke.

File đã được tạo: `API.md` tại gốc repo. Bạn muốn tôi chỉnh lại tiếng Anh song song hay thêm ví dụ fetch/Axios cho frontend không?
