Payment API Contract cho Frontend

1. Endpoint
   Method: POST
   URL: http://localhost:8084/payments
   Content-Type: application/json
2. Request Body
   Dùng đúng 3 field sau:

Ý nghĩa:

orderId: số id đơn hàng
userId: số id người dùng
method: COD hoặc BANKING
Ví dụ BANKING:

3. Response Thành Công
   HTTP 200

{
"status": "SUCCESS",
"message": "Payment successful"
}

4. Response Lỗi Chuẩn
   Format lỗi thống nhất:

Các lỗi chính frontend cần handle:

Order không tồn tại
HTTP 404

{
"error": "ORDER_NOT_FOUND",
"message": "Order not found: 999999"
}

Trạng thái order không hợp lệ (không phải CREATED)
HTTP 400

{
"error": "INVALID_ORDER_STATUS",
"message": "Order status must be CREATED to process payment"
}

Method thanh toán không hợp lệ
HTTP 400

{
"error": "INVALID_PAYMENT_METHOD",
"message": "Method must be COD or BANKING"
}

Timeout khi gọi Order Service
HTTP 504

{
"error": "REST_TEMPLATE_TIMEOUT",
"message": "Request to Order Service timed out"
}

Lỗi hệ thống khác
HTTP 500

{
"error": "INTERNAL_SERVER_ERROR",
"message": "..."
}

5. Frontend Gợi Ý Mapping
   Nếu 200: hiển thị thanh toán thành công
   Nếu 400: hiển thị lỗi dữ liệu đầu vào hoặc trạng thái đơn hàng
   Nếu 404: thông báo không tìm thấy đơn hàng
   Nếu 504: thông báo hệ thống đơn hàng đang bận, cho phép bấm thử lại
   Nếu 500: thông báo lỗi hệ thống chung
