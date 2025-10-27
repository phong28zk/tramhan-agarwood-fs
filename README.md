# Tích hợp Cổng Thanh Toán VNPay

Hướng dẫn đầy đủ về tích hợp cổng thanh toán VNPay cho ứng dụng Next.js, được chuyển đổi từ implementation Node.js Express.

---

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Sơ đồ luồng thanh toán](#sơ-đồ-luồng-thanh-toán)
3. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
4. [Cấu hình môi trường](#cấu-hình-môi-trường)
5. [Hướng dẫn tích hợp từng bước](#hướng-dẫn-tích-hợp-từng-bước)
6. [API Endpoints chi tiết](#api-endpoints-chi-tiết)
7. [Hàm thư viện](#hàm-thư-viện)
8. [Mã phản hồi VNPay](#mã-phản-hồi-vnpay)
9. [Bảo mật](#bảo-mật)
10. [Kiểm thử](#kiểm-thử)
11. [Xử lý sự cố](#xử-lý-sự-cố)
12. [Các bước tiếp theo](#các-bước-tiếp-theo)
13. [ông nghệ sử dụng](#công-nghệ-sử-dụng)

---

## Tổng quan

Hệ thống tích hợp VNPay này cung cấp đầy đủ các chức năng:

- ✅ **Tạo URL thanh toán**: Tạo link để chuyển hướng người dùng đến VNPay
- ✅ **Xử lý người dùng quay về**: Nhận thông tin khi người dùng hoàn tất thanh toán
- ✅ **IPN (Thông báo tức thì)**: Nhận thông báo server-to-server từ VNPay
- ✅ **Truy vấn giao dịch**: Kiểm tra trạng thái giao dịch
- ✅ **Hoàn tiền**: Xử lý yêu cầu hoàn tiền (toàn bộ hoặc một phần)
- ✅ **TypeScript**: Hỗ trợ đầy đủ type safety
- ✅ **Logging chi tiết**: Dễ dàng debug và theo dõi

---

## Sơ đồ luồng thanh toán

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          LUỒNG THANH TOÁN VNPAY                          │
└─────────────────────────────────────────────────────────────────────────┘

[1] Người dùng chọn sản phẩm/dịch vụ
                ↓
[2] Tạo đơn hàng trong hệ thống
                ↓
[3] POST /api/vnpay/create-payment
    {
      amount: 500000,
      orderInfo: "Thanh toán đơn hàng #DH12345"
    }
                ↓
[4] Nhận Payment URL
    { paymentUrl: "https://sandbox.vnpayment.vn/...", orderId: "..." }
                ↓
[5] Chuyển hướng người dùng đến VNPay
    window.location.href = paymentUrl
                ↓
[6] Người dùng thanh toán tại VNPay
    (Chọn ngân hàng, nhập thông tin thẻ, xác thực OTP)
                ↓
                ┌───────────────────┴────────────────────┐
                ↓                                        ↓
    ┌───────────────────────┐              ┌────────────────────────┐
    │ [7A] Return Endpoint  │              │ [7B] IPN Endpoint      │
    │ GET /api/vnpay/return │              │ GET /api/vnpay/ipn     │
    │ (Người dùng quay về)  │              │ (Server notification)  │
    └───────────────────────┘              └────────────────────────┘
                ↓                                        ↓
    ┌───────────────────────┐              ┌────────────────────────┐
    │ - Xác minh chữ ký     │              │ - Xác minh chữ ký      │
    │ - Extract parameters  │              │ - Kiểm tra đơn hàng    │
    │ - Redirect đến result │              │ - Verify số tiền       │
    │   page với thông tin  │              │ - Cập nhật database    │
    └───────────────────────┘              │ - Trả về RspCode       │
                ↓                           └────────────────────────┘
                                                        ↓
[8] Trang kết quả thanh toán                [9] VNPay nhận xác nhận
    /payment/vnpay/result                       (RspCode: 00 = Success)
    - Hiển thị trạng thái
    - Thông tin giao dịch
    - Hướng dẫn tiếp theo

┌─────────────────────────────────────────────────────────────────────────┐
│ LƯU Ý QUAN TRỌNG:                                                       │
│ - Return endpoint: Cho người dùng thấy kết quả (có thể bị fake)        │
│ - IPN endpoint: Cho server cập nhật database (tin cậy, không fake được)│
│ - LUÔN cập nhật trạng thái thanh toán qua IPN, KHÔNG qua Return!       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Cấu trúc thư mục

```
app/api/vnpay/
├── create-payment/
│   └── route.ts          # [POST] Tạo URL thanh toán
├── return/
│   └── route.ts          # [GET] Xử lý người dùng quay về từ VNPay
├── ipn/
│   └── route.ts          # [GET] Nhận thông báo từ VNPay (IPN)
├── query/
│   └── route.ts          # [POST] Truy vấn trạng thái giao dịch
├── refund/
│   └── route.ts          # [POST] Xử lý hoàn tiền
└── README.md             # Tài liệu này

lib/
└── vnpay.ts              # Các hàm tiện ích VNPay
    ├── createVNPayPaymentUrl()         # Tạo URL thanh toán
    ├── verifyVNPayReturn()             # Xác minh chữ ký
    ├── createVNPayQuerySignature()     # Tạo chữ ký truy vấn
    ├── createVNPayRefundSignature()    # Tạo chữ ký hoàn tiền
    ├── getVNPayResponseMessage()       # Lấy message từ response code
    └── getVNPayTransactionStatusMessage() # Lấy message từ status code
```

---

## Cấu hình môi trường

### Tạo file `.env.local`

```env
# VNPay Configuration - SANDBOX (Môi trường test)
VNPAY_TMN_CODE=your_terminal_code_here
VNPAY_HASH_SECRET=your_hash_secret_here
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction

# VNPay Configuration - PRODUCTION (Môi trường thật)
# VNPAY_TMN_CODE=your_production_terminal_code
# VNPAY_HASH_SECRET=your_production_hash_secret
# VNPAY_URL=https://vnpayment.vn/paymentv2/vpcpay.html
# VNPAY_API=https://vnpayment.vn/merchant_webapi/api/transaction
```

### So sánh Sandbox vs Production

| Thuộc tính | Sandbox (Test) | Production (Thật) |
|-----------|----------------|-------------------|
| **VNPAY_URL** | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` | `https://vnpayment.vn/paymentv2/vpcpay.html` |
| **VNPAY_API** | `https://sandbox.vnpayment.vn/merchant_webapi/api/transaction` | `https://vnpayment.vn/merchant_webapi/api/transaction` |
| **TMN Code** | Test code từ VNPay | Production code từ VNPay |
| **Hash Secret** | Test secret | Production secret |
| **Thẻ test** | Có sẵn | Không (dùng thẻ thật) |
| **Tiền thật** | Không | Có |

### Lấy thông tin đăng ký

1. Đăng ký tài khoản sandbox: https://sandbox.vnpayment.vn/devreg/
2. Sau khi đăng ký, bạn sẽ nhận được:
   - `VNPAY_TMN_CODE`: Mã merchant/terminal
   - `VNPAY_HASH_SECRET`: Mã bí mật để tạo chữ ký
3. Cho production, liên hệ: support@vnpay.vn

---

## Hướng dẫn tích hợp từng bước

### Bước 1: Cấu hình biến môi trường

**Mục đích**: Thiết lập thông tin kết nối với VNPay

**Thực hiện**:
- Tạo file `.env.local` trong thư mục gốc của project
- Copy các biến môi trường từ phần [Cấu hình môi trường](#cấu-hình-môi-trường)
- Thay thế các giá trị `your_terminal_code_here` và `your_hash_secret_here`

**Kiểm tra**:
```bash
# Chạy lệnh để xem env variables
node -e "console.log(process.env.VNPAY_TMN_CODE)"
```

---

### Bước 2: Tạo trang/form thanh toán

**Mục đích**: Nơi người dùng nhập thông tin và bắt đầu thanh toán

**Ví dụ**: `app/checkout/page.tsx`

```typescript
'use client';

import { useState } from 'react';

export default function CheckoutPage() {
  const [amount, setAmount] = useState(500000);
  const [orderInfo, setOrderInfo] = useState('Thanh toán đơn hàng #DH12345');
  const [bankCode, setBankCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/vnpay/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          orderInfo: orderInfo,
          bankCode: bankCode || undefined,
          language: 'vn'
        })
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // Chuyển hướng người dùng đến VNPay
        window.location.href = data.paymentUrl;
      } else {
        alert('Lỗi tạo thanh toán: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Có lỗi xảy ra khi tạo thanh toán');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Thanh toán VNPay</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Số tiền (VND)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded"
            min="10000"
            step="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Thông tin đơn hàng
          </label>
          <input
            type="text"
            value={orderInfo}
            onChange={(e) => setOrderInfo(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Ngân hàng (Tùy chọn)
          </label>
          <select
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">-- Chọn ngân hàng --</option>
            <option value="VIETCOMBANK">Vietcombank</option>
            <option value="VNPAYQR">VNPay QR</option>
            <option value="VNBANK">VNBank</option>
            <option value="NCB">NCB</option>
            <option value="TECHCOMBANK">Techcombank</option>
            <option value="BIDV">BIDV</option>
            <option value="VIETINBANK">VietinBank</option>
          </select>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || !amount || !orderInfo}
          className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
        </button>
      </div>
    </div>
  );
}
```

**Điểm cần lưu ý**:
- Số tiền tối thiểu: 10,000 VND
- `orderInfo` nên rõ ràng, dễ hiểu
- `bankCode` là tùy chọn - nếu không chọn, VNPay sẽ hiển thị tất cả ngân hàng

---

### Bước 3: API Endpoint đã sẵn sàng

**Mục đích**: Các endpoint API đã được implement sẵn, bạn chỉ cần sử dụng

Các endpoint sau đã sẵn sàng:
- ✅ `POST /api/vnpay/create-payment` - Tạo URL thanh toán
- ✅ `GET /api/vnpay/return` - Xử lý người dùng quay về
- ✅ `GET /api/vnpay/ipn` - Nhận thông báo từ VNPay
- ✅ `POST /api/vnpay/query` - Truy vấn giao dịch
- ✅ `POST /api/vnpay/refund` - Hoàn tiền

**Điểm cần lưu ý**:
- Không cần chỉnh sửa các endpoint này
- Chỉ cần cấu hình `.env.local` là đủ
- Tất cả đã có logging chi tiết để debug

---

### Bước 4: Tạo trang kết quả thanh toán

**Mục đích**: Hiển thị kết quả thanh toán cho người dùng

**Tạo file**: `app/payment/vnpay/result/page.tsx`

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResultContent() {
  const searchParams = useSearchParams();

  const responseCode = searchParams.get('vnp_ResponseCode');
  const orderId = searchParams.get('vnp_TxnRef');
  const amount = searchParams.get('vnp_Amount');
  const transactionNo = searchParams.get('vnp_TransactionNo');
  const bankCode = searchParams.get('vnp_BankCode');

  const isSuccess = responseCode === '00';
  const amountInVND = amount ? parseInt(amount) / 100 : 0;

  // Mapping mã lỗi sang thông báo tiếng Việt
  const getErrorMessage = (code: string | null): string => {
    const messages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán',
      '12': 'Thẻ/Tài khoản bị khóa',
      '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định',
      '97': 'Chữ ký không hợp lệ',
      '99': 'Lỗi không xác định'
    };
    return messages[code || '99'] || 'Lỗi không xác định';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Icon và tiêu đề */}
        <div className="text-center mb-6">
          {isSuccess ? (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}

          <h1 className={`text-2xl font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>
          <p className="text-gray-600 mt-2">
            {getErrorMessage(responseCode)}
          </p>
        </div>

        {/* Thông tin giao dịch */}
        <div className="border-t border-b border-gray-200 py-4 my-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Mã đơn hàng:</span>
            <span className="font-medium">{orderId || 'N/A'}</span>
          </div>

          {isSuccess && transactionNo && (
            <div className="flex justify-between">
              <span className="text-gray-600">Mã giao dịch VNPay:</span>
              <span className="font-medium">{transactionNo}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Số tiền:</span>
            <span className="font-medium text-lg">
              {amountInVND.toLocaleString('vi-VN')} VND
            </span>
          </div>

          {bankCode && (
            <div className="flex justify-between">
              <span className="text-gray-600">Ngân hàng:</span>
              <span className="font-medium">{bankCode}</span>
            </div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="space-y-3">
          {isSuccess ? (
            <>
              <a
                href="/orders"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded font-medium hover:bg-blue-700"
              >
                Xem đơn hàng
              </a>
              <a
                href="/"
                className="block w-full bg-gray-200 text-gray-800 text-center py-3 rounded font-medium hover:bg-gray-300"
              >
                Về trang chủ
              </a>
            </>
          ) : (
            <>
              <a
                href="/checkout"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded font-medium hover:bg-blue-700"
              >
                Thử lại
              </a>
              <a
                href="/support"
                className="block w-full bg-gray-200 text-gray-800 text-center py-3 rounded font-medium hover:bg-gray-300"
              >
                Liên hệ hỗ trợ
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <ResultContent />
    </Suspense>
  );
}
```

**Điểm cần lưu ý**:
- Sử dụng `Suspense` để tránh lỗi với `useSearchParams`
- Hiển thị đầy đủ thông tin giao dịch
- Cung cấp các hành động tiếp theo rõ ràng (xem đơn hàng, thử lại, v.v.)

---

### Bước 5: ⚠️ QUAN TRỌNG - Tích hợp Database vào IPN

**Mục đích**: Cập nhật trạng thái thanh toán trong database khi nhận được xác nhận từ VNPay

**⚠️ LƯU Ý QUAN TRỌNG**:
- IPN (Instant Payment Notification) là endpoint server-to-server
- Đây là nơi DUY NHẤT bạn nên cập nhật trạng thái thanh toán
- KHÔNG cập nhật trạng thái qua Return endpoint (có thể bị fake)

**File cần chỉnh sửa**: `app/api/vnpay/ipn/route.ts`

Tìm các đoạn code có comment `// TODO:` và thay thế bằng database calls thực tế:

```typescript
// TODO #1: Kiểm tra đơn hàng có tồn tại không
// Dòng 116 trong file ipn/route.ts
const checkOrderId = true; // TODO: Replace with:
// ↓↓↓ Thay bằng code này ↓↓↓
const order = await prisma.order.findUnique({
  where: { id: orderId }
});
const checkOrderId = !!order;

// TODO #2: Xác minh số tiền khớp với đơn hàng
// Dòng 129 trong file ipn/route.ts
const checkAmount = true; // TODO: Replace with:
// ↓↓↓ Thay bằng code này ↓↓↓
const expectedAmount = parseInt(amount) / 100;
const checkAmount = order && order.totalAmount === expectedAmount;

// TODO #3: Lấy trạng thái thanh toán hiện tại
// Dòng 143 trong file ipn/route.ts
const paymentStatus = '0'; // TODO: Replace with:
// ↓↓↓ Thay bằng code này ↓↓↓
const payment = await prisma.payment.findUnique({
  where: { orderId: orderId }
});
const paymentStatus = payment?.status || '0';
// '0' = pending, '1' = success, '2' = failed

// TODO #4: Cập nhật trạng thái thanh toán THÀNH CÔNG
// Dòng 166-175 trong file ipn/route.ts
// TODO: Implement database update
// ↓↓↓ Thay bằng code này ↓↓↓
await prisma.payment.update({
  where: { orderId: orderId },
  data: {
    status: '1',
    transactionNo: transactionNo,
    bankCode: bankCode,
    payDate: payDate,
    amount: parseInt(amount) / 100,
    responseCode: rspCode,
    updatedAt: new Date()
  }
});

// Cập nhật trạng thái đơn hàng
await prisma.order.update({
  where: { id: orderId },
  data: {
    status: 'PAID',
    paidAt: new Date()
  }
});

// TODO #5: Cập nhật trạng thái thanh toán THẤT BẠI
// Dòng 206-213 trong file ipn/route.ts
// TODO: Implement database update
// ↓↓↓ Thay bằng code này ↓↓↓
await prisma.payment.update({
  where: { orderId: orderId },
  data: {
    status: '2',
    transactionNo: transactionNo || null,
    bankCode: bankCode || null,
    responseCode: rspCode,
    failureReason: errorMessages[rspCode] || 'Unknown error',
    updatedAt: new Date()
  }
});

await prisma.order.update({
  where: { id: orderId },
  data: {
    status: 'PAYMENT_FAILED'
  }
});
```

**Ví dụ schema Prisma** (tham khảo):

```prisma
model Order {
  id          String    @id @default(cuid())
  totalAmount Float
  status      String    @default("PENDING") // PENDING, PAID, PAYMENT_FAILED, CANCELLED
  paidAt      DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  payment     Payment?
}

model Payment {
  id            String    @id @default(cuid())
  orderId       String    @unique
  amount        Float
  status        String    @default("0") // 0=pending, 1=success, 2=failed
  transactionNo String?
  bankCode      String?
  payDate       String?
  responseCode  String?
  failureReason String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  order         Order     @relation(fields: [orderId], references: [id])
}
```

**Kiểm tra tích hợp IPN**:
- Sau khi thanh toán test, kiểm tra logs trong console
- Xác nhận database đã được cập nhật
- Test cả trường hợp thành công và thất bại

---

### Bước 6: (Tùy chọn) Tích hợp Query và Refund

**6A. Truy vấn trạng thái giao dịch**

Sử dụng khi bạn muốn kiểm tra trạng thái giao dịch với VNPay:

```typescript
// Ví dụ: Admin dashboard
const handleQueryTransaction = async (orderId: string, transDate: string) => {
  const response = await fetch('/api/vnpay/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: orderId,           // Ví dụ: '08143520'
      transDate: transDate        // Format: YYYYMMDDHHmmss
    })
  });

  const result = await response.json();

  if (result.success) {
    console.log('Transaction status:', result.data.transactionStatus);
    console.log('Amount:', result.data.amount);
    console.log('Transaction No:', result.data.transactionNo);
  } else {
    console.error('Query failed:', result.statusMessage);
  }
};
```

**6B. Hoàn tiền**

Sử dụng khi cần hoàn tiền cho khách hàng:

```typescript
// Ví dụ: Admin refund page
const handleRefund = async (orderData: any) => {
  const response = await fetch('/api/vnpay/refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: orderData.orderId,           // Mã đơn hàng gốc
      transDate: orderData.transDate,       // Ngày GD gốc (YYYYMMDDHHmmss)
      amount: orderData.amount,             // Số tiền hoàn (VND)
      transType: '02',                      // '02' = hoàn toàn bộ, '03' = hoàn một phần
      user: 'admin@example.com',            // Email người thực hiện
      transactionNo: orderData.transactionNo // Mã GD VNPay (nếu có)
    })
  });

  const result = await response.json();

  if (result.success) {
    alert('Hoàn tiền thành công!');
  } else {
    alert('Hoàn tiền thất bại: ' + result.statusMessage);
  }
};
```

---

## API Endpoints chi tiết

### 1. Tạo URL thanh toán

**POST** `/api/vnpay/create-payment`

Tạo URL thanh toán để chuyển hướng người dùng đến VNPay.

**Request Body:**
```json
{
  "amount": 500000,
  "orderId": "DH12345",
  "orderInfo": "Thanh toán đơn hàng #DH12345",
  "language": "vn",
  "bankCode": "NCB"
}
```

| Tham số | Bắt buộc | Mô tả | Ví dụ |
|---------|----------|-------|-------|
| `amount` | ✅ Có | Số tiền thanh toán (VND) | 500000 |
| `orderId` | ❌ Không | Mã đơn hàng (tự tạo nếu không có) | "DH12345" |
| `orderInfo` | ❌ Không | Thông tin đơn hàng | "Thanh toán..." |
| `language` | ❌ Không | Ngôn ngữ (`vn` hoặc `en`) | "vn" |
| `bankCode` | ❌ Không | Mã ngân hàng (xem danh sách bên dưới) | "NCB" |

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=...",
  "orderId": "08143520"
}
```

**Mã ngân hàng phổ biến**:
- `VNPAYQR`: Thanh toán qua VNPay QR
- `VNBANK`: Thanh toán qua ngân hàng nội địa
- `INTCARD`: Thanh toán qua thẻ quốc tế
- `VIETCOMBANK`: Vietcombank
- `TECHCOMBANK`: Techcombank
- `BIDV`: BIDV
- `VIETINBANK`: VietinBank
- `NCB`: NCB Bank

---

### 2. Xử lý người dùng quay về (Return URL)

**GET** `/api/vnpay/return`

VNPay tự động gọi endpoint này sau khi người dùng hoàn tất thanh toán.

**Query Parameters** (VNPay tự động gửi):
- `vnp_Amount`: Số tiền (đã nhân 100)
- `vnp_BankCode`: Mã ngân hàng
- `vnp_ResponseCode`: Mã kết quả thanh toán
- `vnp_TxnRef`: Mã đơn hàng
- `vnp_TransactionNo`: Mã giao dịch VNPay
- `vnp_SecureHash`: Chữ ký điện tử

**Hành động**:
1. Xác minh chữ ký điện tử
2. Extract thông tin giao dịch
3. Chuyển hướng người dùng đến `/payment/vnpay/result` với thông tin

**⚠️ LƯU Ý**: Endpoint này chỉ để hiển thị kết quả cho người dùng. KHÔNG cập nhật database tại đây!

---

### 3. IPN - Instant Payment Notification

**GET** `/api/vnpay/ipn`

VNPay gọi endpoint này (server-to-server) để xác nhận thanh toán.

**Query Parameters** (VNPay tự động gửi):
- Giống như Return URL

**Response cần trả về**:
```json
{
  "RspCode": "00",
  "Message": "Success"
}
```

**Mã RspCode trả về cho VNPay**:
- `00`: Thành công
- `01`: Đơn hàng không tồn tại
- `02`: Đơn hàng đã được cập nhật
- `04`: Số tiền không hợp lệ
- `97`: Chữ ký không hợp lệ
- `99`: Lỗi không xác định

**⚠️ QUAN TRỌNG**:
- Endpoint này PHẢI trả về HTTP 200 cho mọi request
- Đây là nơi DUY NHẤT để cập nhật trạng thái thanh toán
- Phải xác minh chữ ký trước khi cập nhật database
- VNPay sẽ gọi lại IPN nếu không nhận được response 200

**🔧 CẦN THỰC HIỆN**:
- Implement các TODO trong file `app/api/vnpay/ipn/route.ts`
- Tích hợp database để lưu trạng thái thanh toán
- Test kỹ cả trường hợp thành công và thất bại

---

### 4. Truy vấn giao dịch

**POST** `/api/vnpay/query`

Truy vấn trạng thái giao dịch từ VNPay.

**Request Body:**
```json
{
  "orderId": "08143520",
  "transDate": "20250108143520"
}
```

| Tham số | Bắt buộc | Mô tả | Format |
|---------|----------|-------|--------|
| `orderId` | ✅ Có | Mã đơn hàng | String |
| `transDate` | ✅ Có | Ngày giao dịch gốc | YYYYMMDDHHmmss |

**Response:**
```json
{
  "success": true,
  "statusMessage": "Query successful",
  "data": {
    "responseCode": "00",
    "message": "Success",
    "orderId": "08143520",
    "amount": 500000,
    "transactionNo": "14012345",
    "transactionStatus": "00",
    "bankCode": "NCB",
    "payDate": "20250108143530"
  }
}
```

**Khi nào sử dụng**:
- Kiểm tra trạng thái giao dịch khi không chắc chắn
- Admin dashboard để xem lịch sử giao dịch
- Reconciliation (đối soát) hàng ngày

---

### 5. Hoàn tiền

**POST** `/api/vnpay/refund`

Gửi yêu cầu hoàn tiền đến VNPay.

**Request Body:**
```json
{
  "orderId": "08143520",
  "transDate": "20250108143520",
  "amount": 500000,
  "transType": "02",
  "user": "admin@example.com",
  "transactionNo": "14012345"
}
```

| Tham số | Bắt buộc | Mô tả | Giá trị |
|---------|----------|-------|---------|
| `orderId` | ✅ Có | Mã đơn hàng gốc | String |
| `transDate` | ✅ Có | Ngày GD gốc | YYYYMMDDHHmmss |
| `amount` | ✅ Có | Số tiền hoàn (VND) | Number |
| `transType` | ✅ Có | Loại hoàn tiền | "02" hoặc "03" |
| `user` | ✅ Có | Người thực hiện | Email/username |
| `transactionNo` | ❌ Không | Mã GD VNPay | String |

**Transaction Type**:
- `02`: Hoàn toàn bộ số tiền
- `03`: Hoàn một phần

**Response:**
```json
{
  "success": true,
  "statusMessage": "Refund successful",
  "data": {
    "responseCode": "00",
    "message": "Success",
    "orderId": "08143520",
    "amount": 500000,
    "transactionNo": "14012345",
    "transactionStatus": "00"
  }
}
```

**Mã lỗi hoàn tiền**:
- `00`: Hoàn tiền thành công
- `01`: Đơn hàng không tồn tại
- `13`: Số tiền không hợp lệ
- `91`: Giao dịch không tồn tại
- `93`: Số tiền hoàn không hợp lệ
- `94`: Yêu cầu hoàn tiền trùng lặp
- `95`: Giao dịch đã được hoàn tiền

---

## Hàm thư viện

File: `lib/vnpay.ts`

### `createVNPayPaymentUrl(config, params): string`

Tạo URL thanh toán VNPay với chữ ký điện tử.

```typescript
import { createVNPayPaymentUrl } from '@/lib/vnpay';

const paymentUrl = createVNPayPaymentUrl(
  {
    tmnCode: 'YOUR_TMN_CODE',
    hashSecret: 'YOUR_HASH_SECRET',
    url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: 'https://yourdomain.com/api/vnpay/return'
  },
  {
    amount: 500000,
    orderId: 'DH12345',
    orderInfo: 'Thanh toán đơn hàng',
    ipAddress: '127.0.0.1',
    locale: 'vn',
    bankCode: 'NCB'
  }
);
```

---

### `verifyVNPayReturn(params, secureHash, hashSecret): boolean`

Xác minh chữ ký điện tử từ VNPay.

```typescript
import { verifyVNPayReturn } from '@/lib/vnpay';

const isValid = verifyVNPayReturn(
  vnp_Params,           // Các parameters từ VNPay (không bao gồm vnp_SecureHash)
  secureHash,           // Chữ ký từ VNPay
  'YOUR_HASH_SECRET'    // Hash secret của bạn
);

if (isValid) {
  // Chữ ký hợp lệ, có thể tin tưởng dữ liệu
} else {
  // Chữ ký không hợp lệ, có thể bị giả mạo
}
```

---

### `getVNPayResponseMessage(responseCode): string`

Lấy thông báo lỗi tiếng Việt từ mã phản hồi.

```typescript
import { getVNPayResponseMessage } from '@/lib/vnpay';

const message = getVNPayResponseMessage('24');
// Output: "Giao dịch không thành công do: Khách hàng hủy giao dịch"
```

---

### `getVNPayTransactionStatusMessage(status): string`

Lấy thông báo trạng thái giao dịch tiếng Việt.

```typescript
import { getVNPayTransactionStatusMessage } from '@/lib/vnpay';

const statusMsg = getVNPayTransactionStatusMessage('00');
// Output: "Giao dịch thanh toán được thực hiện thành công"
```

---

## Mã phản hồi VNPay

### Mã phản hồi thanh toán (Response Code)

| Mã | Ý nghĩa | Xử lý |
|----|---------|-------|
| `00` | ✅ Giao dịch thành công | Hiển thị thành công |
| `07` | ⚠️ Trừ tiền thành công nhưng giao dịch nghi ngờ | Cần kiểm tra thủ công |
| `09` | ❌ Thẻ chưa đăng ký Internet Banking | Yêu cầu đăng ký |
| `10` | ❌ Xác thực sai quá 3 lần | Thử lại sau |
| `11` | ❌ Hết hạn chờ thanh toán | Tạo giao dịch mới |
| `12` | ❌ Thẻ bị khóa | Liên hệ ngân hàng |
| `13` | ❌ Sai OTP | Thử lại |
| `24` | ❌ Khách hàng hủy giao dịch | Cho phép thử lại |
| `51` | ❌ Không đủ số dư | Yêu cầu nạp tiền |
| `65` | ❌ Vượt hạn mức giao dịch | Thử số tiền nhỏ hơn |
| `75` | ⏳ Ngân hàng bảo trì | Thử lại sau |
| `79` | ❌ Sai mật khẩu quá nhiều lần | Thử lại sau |
| `99` | ❌ Lỗi không xác định | Liên hệ hỗ trợ |

---

### Mã trạng thái giao dịch (Transaction Status)

| Mã | Ý nghĩa | Ghi chú |
|----|---------|---------|
| `00` | ✅ Giao dịch thành công | Final state |
| `01` | 🕐 Giao dịch đang chờ xử lý | Pending |
| `02` | ❌ Bị từ chối bởi ngân hàng | Final state |
| `04` | ❌ Vi phạm quy định | Final state |
| `05` | 🔄 VNPay đang xử lý hoàn tiền | In progress |
| `06` | 🔄 Đã gửi yêu cầu hoàn tiền đến ngân hàng | In progress |
| `07` | ⚠️ Giao dịch nghi ngờ gian lận | Cần xử lý |
| `09` | ❌ Hoàn tiền bị từ chối | Final state |

---

## Bảo mật

### 1. Xác minh chữ ký (HMAC SHA512)

Tất cả request đều sử dụng HMAC SHA512 để bảo mật:

```
Hash = HMAC-SHA512(data, secretKey)
```

**Quy trình**:
1. Sắp xếp parameters theo thứ tự alphabet
2. URL encode các giá trị
3. Nối các parameters thành chuỗi: `key1=value1&key2=value2...`
4. Tạo HMAC-SHA512 hash từ chuỗi trên với secret key
5. So sánh hash với chữ ký nhận được

**⚠️ QUAN TRỌNG**: Luôn xác minh chữ ký ở cả Return và IPN endpoint!

---

### 2. Định dạng số tiền

VNPay yêu cầu số tiền được nhân với 100:

```typescript
// Khi gửi lên VNPay
vnp_Amount = amount * 100  // 500,000 VND → 50,000,000

// Khi nhận về từ VNPay
actualAmount = vnp_Amount / 100  // 50,000,000 → 500,000 VND
```

---

### 3. Múi giờ

Luôn sử dụng múi giờ Việt Nam:

```typescript
process.env.TZ = 'Asia/Ho_Chi_Minh';
```

Format ngày giờ: `YYYYMMDDHHmmss`

Ví dụ: `20250108143520` = 2025-01-08 14:35:20

---

### 4. IP Address

VNPay yêu cầu IP address của người dùng:

```typescript
const ipAddr =
  request.headers.get('x-forwarded-for')?.split(',')[0] ||
  request.headers.get('x-real-ip') ||
  '127.0.0.1';
```

**Lưu ý khi deploy**:
- Vercel: Tự động forward IP
- Docker/Nginx: Cấu hình proxy headers
- Cloudflare: Enable "True-Client-IP"

---

### 5. Best Practices

✅ **NÊN**:
- Luôn xác minh chữ ký trước khi xử lý
- Cập nhật database chỉ qua IPN endpoint
- Log tất cả giao dịch để audit
- Validate amount và orderId trước khi tạo payment
- Sử dụng HTTPS cho tất cả endpoints
- Whitelist IP của VNPay cho IPN endpoint
- Kiểm tra duplicate IPN calls (idempotency)

❌ **KHÔNG NÊN**:
- Tin tưởng dữ liệu từ client
- Cập nhật trạng thái qua Return endpoint
- Log hash secret hoặc thông tin nhạy cảm
- Hardcode credentials trong code
- Bỏ qua việc xác minh chữ ký
- Cho phép amount âm hoặc bằng 0

---

## Kiểm thử

### 1. Luồng thanh toán cơ bản

**Test Case 1: Thanh toán thành công**

```bash
# Bước 1: Tạo payment URL
curl -X POST http://localhost:3000/api/vnpay/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500000,
    "orderInfo": "Test payment"
  }'

# Bước 2: Mở paymentUrl trong browser
# Bước 3: Chọn ngân hàng test và thanh toán
# Bước 4: Kiểm tra logs console để xem IPN được gọi
# Bước 5: Kiểm tra database đã được cập nhật
```

**Test Case 2: Thanh toán thất bại (Khách hủy)**

```bash
# Tương tự Test Case 1, nhưng ở bước 3, click "Hủy giao dịch"
# Kiểm tra responseCode = '24' (Customer cancelled)
```

---

### 2. Thẻ test cho Sandbox

VNPay cung cấp thẻ test cho môi trường sandbox:

| Ngân hàng | Số thẻ | Tên | Ngày hết hạn | Mã CVV |
|-----------|--------|-----|--------------|---------|
| NCB | 9704198526191432198 | NGUYEN VAN A | 07/15 | 123456 |

**OTP test**: `123456`

**Lưu ý**: Thông tin chính xác cần lấy từ tài liệu VNPay sandbox.

---

### 3. Test Query và Refund

**Query transaction:**

```bash
curl -X POST http://localhost:3000/api/vnpay/query \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "08143520",
    "transDate": "20250108143520"
  }'
```

**Refund transaction:**

```bash
curl -X POST http://localhost:3000/api/vnpay/refund \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "08143520",
    "transDate": "20250108143520",
    "amount": 500000,
    "transType": "02",
    "user": "admin@example.com"
  }'
```

---

### 4. Test IPN với ngrok (Local development)

Vì VNPay cần gọi IPN qua internet, bạn cần expose localhost:

```bash
# Cài ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000

# Sẽ nhận được URL như: https://abc123.ngrok.io

# Cập nhật VNPAY config để sử dụng ngrok URL cho returnUrl
```

**Lưu ý**: Cần đăng ký IPN URL trong VNPay dashboard.

---

## Xử lý sự cố

### ❌ Lỗi: "Chữ ký không hợp lệ" (Invalid signature)

**Nguyên nhân**:
- `VNPAY_HASH_SECRET` sai hoặc không khớp
- Parameters bị thay đổi trong quá trình truyền
- Encoding/decoding không đúng

**Cách khắc phục**:
1. Kiểm tra `VNPAY_HASH_SECRET` trong `.env.local`
2. Xem logs để so sánh signature:
   ```
   🔐 Signature verification: {
     receivedHash: "abc123...",
     calculatedHash: "def456..."
   }
   ```
3. Đảm bảo không chỉnh sửa parameters sau khi tạo URL
4. Kiểm tra xem có middleware nào modify request không

---

### ❌ Lỗi: "IPN không được gọi"

**Nguyên nhân**:
- VNPay không thể truy cập IPN URL (localhost, firewall)
- IPN URL chưa được đăng ký trong VNPay dashboard
- IP bị block

**Cách khắc phục**:
1. Sử dụng ngrok hoặc deploy lên server công khai
2. Kiểm tra IPN URL trong VNPay merchant dashboard
3. Xem logs trong VNPay dashboard
4. Kiểm tra firewall/security groups
5. Đảm bảo endpoint trả về HTTP 200

---

### ❌ Lỗi: "Số tiền không khớp"

**Nguyên nhân**:
- Quên nhân/chia 100
- Sai kiểu dữ liệu (string vs number)

**Cách khắc phục**:
```typescript
// ✅ ĐÚNG
vnp_Amount = amount * 100  // Khi gửi
actualAmount = parseInt(vnp_Amount) / 100  // Khi nhận

// ❌ SAI
vnp_Amount = amount  // Thiếu * 100
```

---

### ❌ Lỗi: "Ngày giờ không hợp lệ"

**Nguyên nhân**:
- Sai múi giờ
- Sai format datetime

**Cách khắc phục**:
```typescript
// ✅ ĐÚNG
process.env.TZ = 'Asia/Ho_Chi_Minh';
const createDate = '20250108143520';  // YYYYMMDDHHmmss

// ❌ SAI
const createDate = '2025-01-08 14:35:20';  // ISO format
```

---

### ❌ Lỗi: "Hoàn tiền thất bại"

**Nguyên nhân**:
- Giao dịch chưa hoàn thành (status không phải '00')
- Số tiền hoàn > số tiền gốc
- Đã hoàn tiền rồi (duplicate refund)
- Sai `transactionNo` hoặc `transDate`

**Cách khắc phục**:
1. Query transaction trước khi refund
2. Kiểm tra `transactionStatus = '00'`
3. Validate `refundAmount <= originalAmount`
4. Lưu lịch sử refund trong database để check duplicate
5. Đảm bảo `transDate` là ngày giao dịch GỐC (không phải ngày hiện tại)

---

### 🔍 Debug Tips

**1. Bật logs chi tiết**:
```typescript
// Tất cả endpoints đã có console.log chi tiết
// Kiểm tra terminal/console để xem logs
```

**2. Test với Postman/Insomnia**:
```bash
# Import collection hoặc tự tạo requests
# Test từng endpoint riêng lẻ
```

**3. Kiểm tra VNPay Dashboard**:
- Login vào merchant dashboard
- Xem transaction logs
- Xem IPN callback logs
- Kiểm tra configuration

**4. Sử dụng VNPay support**:
- Email: support@vnpay.vn
- Hotline: 1900 55 55 77
- Documentation: https://sandbox.vnpayment.vn/apis/docs/

---

## Các bước tiếp theo

Sau khi hoàn thành tích hợp cơ bản, bạn nên:

### 1. ✅ Hoàn thiện Database Integration

**Ưu tiên cao**:
- [ ] Implement các TODO trong `app/api/vnpay/ipn/route.ts`
- [ ] Tạo Prisma schema cho Order và Payment
- [ ] Migrate database
- [ ] Test đầy đủ payment flow với database

**File cần chỉnh sửa**: `app/api/vnpay/ipn/route.ts:116-213`

---

### 2. 🎨 Tạo trang Payment Result

**Ưu tiên cao**:
- [ ] Tạo file `app/payment/vnpay/result/page.tsx`
- [ ] Hiển thị trạng thái thanh toán đẹp mắt
- [ ] Thêm các hành động tiếp theo (xem đơn, về trang chủ)
- [ ] Handle tất cả response codes

**Tham khảo**: Xem ví dụ ở [Bước 4](#bước-4-tạo-trang-kết-quả-thanh-toán)

---

### 3. 🔐 Bảo mật nâng cao

**Ưu tiên trung bình**:
- [ ] Whitelist IP của VNPay cho IPN endpoint
- [ ] Implement rate limiting
- [ ] Add request validation middleware
- [ ] Setup monitoring/alerting cho failed payments
- [ ] Encrypt sensitive logs

**IP VNPay** (cần confirm với VNPay):
```typescript
// middleware.ts
const VNPAY_IPS = [
  '113.160.92.202',
  '113.52.45.78',
  // ... danh sách IP VNPay
];

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/vnpay/ipn') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0];
    if (!VNPAY_IPS.includes(ip || '')) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
}
```

---

### 4. 📊 Admin Dashboard

**Ưu tiên trung bình**:
- [ ] Trang xem danh sách giao dịch
- [ ] Chức năng query transaction
- [ ] Chức năng refund với xác nhận
- [ ] Export báo cáo Excel/CSV
- [ ] Đối soát (reconciliation) với VNPay

**Ví dụ route**:
```
/admin/payments          # Danh sách giao dịch
/admin/payments/[id]     # Chi tiết giao dịch
/admin/refunds           # Quản lý hoàn tiền
/admin/reports           # Báo cáo
```

---

### 5. 📧 Email Notifications

**Ưu tiên thấp**:
- [ ] Gửi email xác nhận thanh toán thành công
- [ ] Gửi email thông báo thanh toán thất bại
- [ ] Gửi email xác nhận hoàn tiền
- [ ] Template email đẹp với Resend/SendGrid

---

### 6. 🧪 Testing

**Ưu tiên trung bình**:
- [ ] Viết integration tests cho payment flow
- [ ] Test với các response codes khác nhau
- [ ] Test signature verification
- [ ] Test IPN idempotency
- [ ] E2E testing với Playwright/Cypress

**Ví dụ test**:
```typescript
// __tests__/vnpay/create-payment.test.ts
describe('VNPay Create Payment', () => {
  it('should create payment URL successfully', async () => {
    const response = await fetch('/api/vnpay/create-payment', {
      method: 'POST',
      body: JSON.stringify({ amount: 500000 })
    });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.paymentUrl).toContain('vnpayment.vn');
  });
});
```

---

### 7. 📝 Logging & Monitoring

**Ưu tiên cao (Production)**:
- [ ] Tích hợp Sentry/LogRocket cho error tracking
- [ ] Setup alerts cho failed payments
- [ ] Track payment metrics (success rate, average amount, etc.)
- [ ] Dashboards với Grafana/Datadog

---

### 8. 🚀 Production Checklist

Trước khi lên production:

- [ ] Đổi sang production credentials
- [ ] Đổi `VNPAY_URL` và `VNPAY_API` sang production
- [ ] Test kỹ trên staging environment
- [ ] Setup backup cho database
- [ ] Whitelist production IP cho VNPay IPN
- [ ] Setup SSL certificate (HTTPS bắt buộc)
- [ ] Đăng ký IPN URL chính thức với VNPay
- [ ] Verify email notifications hoạt động
- [ ] Load testing cho peak traffic
- [ ] Prepare rollback plan

---

## Hỗ trợ

### Tài liệu VNPay

- **Sandbox Documentation**: https://sandbox.vnpayment.vn/apis/docs/
- **API Reference**: https://sandbox.vnpayment.vn/apis/
- **FAQs**: https://sandbox.vnpayment.vn/apis/vnpay-FAQs.pdf

### Liên hệ VNPay

- **Email**: support@vnpay.vn
- **Hotline**: 1900 55 55 77 (24/7)
- **Website**: https://vnpay.vn

### Issues & Bugs

Nếu gặp vấn đề với implementation này:
1. Kiểm tra [Xử lý sự cố](#xử-lý-sự-cố)
2. Xem logs trong console
3. Tham khảo VNPay documentation
4. Liên hệ VNPay support

---

## Công nghệ sử dụng

Implementation này được chuyển đổi từ official VNPay Node.js SDK với các cải tiến:

✅ **Cải tiến**:
1. **TypeScript**: Hỗ trợ đầy đủ type safety với Typescript version 5 (https://www.typescriptlang.org/)
2. **Next.js App Router**: Sử dụng Next.js 14 với App Router và API routes (https://nextjs.org/docs/app)
3. **Logging nâng cao**: Console.group và structured logging
4. **Error Handling**: Xử lý lỗi toàn diện hơn
5. **Modern Fetch API**: Không dùng thư viện request deprecated
6. **Modular Design**: Tách biệt utility functions và route handlers
7. **Comprehensive Documentation**: Tài liệu tiếng Việt chi tiết

📦 **Tương thích**:
- VNPay API version: 2.1.0
- Node.js: 18+
- Next.js: 14+
- TypeScript: 5+

---

## License

Tích hợp này tuân theo các điều khoản sử dụng của VNPay.

---

**Chúc bạn tích hợp thành công! 🎉**

*Cập nhật lần cuối: 2025-01-08*
