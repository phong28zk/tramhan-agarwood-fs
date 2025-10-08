# VNPay Payment Integration

This document describes the VNPay payment integration based on the official `vnpay_nodejs` implementation.

## Overview

The VNPay integration allows customers to pay for orders using Vietnamese banking methods including:
- Local bank accounts (ATM/Internet Banking)
- QR Code payments
- Credit/Debit cards

## Architecture

### Files Created

```
lib/vnpay.ts                              # VNPay utility functions
app/api/vnpay/create-payment/route.ts    # Create payment URL endpoint
app/api/vnpay/return/route.ts            # Handle return from VNPay
app/api/vnpay/ipn/route.ts               # Instant Payment Notification webhook
app/payment/vnpay/result/page.tsx        # Payment result display page
components/payment/PaymentMethodSelector.tsx # Updated with VNPay integration
```

## Payment Flow

1. **User selects VNPay** in `PaymentMethodSelector`
2. **Frontend calls** `POST /api/vnpay/create-payment` with:
   - `amount`: Order total (e.g., 935000 for 935,000 VND)
   - `orderId`: Order ID
   - `orderInfo`: Order description
   - `language`: "vn" (Vietnamese) or "en" (English)
   - `bankCode`: (optional) Specific bank code

3. **API creates payment URL** with:
   - HMAC-SHA512 signature for security
   - All required VNPay parameters
   - Returns payment URL

4. **User redirects to VNPay** payment gateway
5. **User completes payment** at VNPay
6. **VNPay redirects back** to `/api/vnpay/return`
7. **Return handler verifies** signature and redirects to `/payment/vnpay/result`
8. **Result page displays** success or error message

## Configuration

Environment variables in `.env`:

```bash
VNPAY_TMN_CODE=DMNUKV3X                              # Your merchant code
VNPAY_HASH_SECRET=RLKOSOQP4AYLK664YDZESYYJDNMAZ6Q8  # Hash secret key
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

## API Endpoints

### POST /api/vnpay/create-payment

Create a payment URL for VNPay.

**Request Body:**
```json
{
  "amount": 935000,
  "orderId": "ORDER123",
  "orderInfo": "Thanh toan don hang ORDER123 - Tram Han Agarwood",
  "language": "vn",
  "bankCode": "" // optional
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Version=2.1.0&...",
  "orderId": "ORDER123"
}
```

### GET /api/vnpay/return

Handles return from VNPay after payment. This endpoint:
- Verifies the signature from VNPay
- Redirects to `/payment/vnpay/result` with payment status

**Query Parameters:** (sent by VNPay)
- `vnp_ResponseCode`: "00" for success, other codes for errors
- `vnp_TxnRef`: Order ID
- `vnp_Amount`: Amount paid (in smallest unit)
- `vnp_TransactionNo`: VNPay transaction number
- `vnp_SecureHash`: HMAC signature

### GET /api/vnpay/ipn

Instant Payment Notification webhook. VNPay calls this endpoint to notify payment status.

**Important:** This endpoint must be configured in VNPay admin panel.

**Response Codes:**
- `00`: Success
- `01`: Order not found
- `02`: Order already updated
- `04`: Amount invalid
- `97`: Checksum failed
- `99`: Unknown error

## Response Codes

| Code | Description |
|------|-------------|
| 00 | Giao dịch thành công |
| 07 | Trừ tiền thành công. Giao dịch bị nghi ngờ |
| 09 | Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking |
| 10 | Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần |
| 11 | Đã hết hạn chờ thanh toán |
| 12 | Thẻ/Tài khoản bị khóa |
| 13 | Nhập sai mật khẩu OTP |
| 24 | Khách hàng hủy giao dịch |
| 51 | Tài khoản không đủ số dư |
| 65 | Vượt quá hạn mức giao dịch trong ngày |
| 75 | Ngân hàng thanh toán đang bảo trì |
| 79 | Nhập sai mật khẩu thanh toán quá số lần quy định |
| 97 | Chữ ký không hợp lệ |
| 99 | Lỗi khác |

## Testing

### Test with Sandbox

1. **Use sandbox credentials** from `.env`
2. **Click VNPay** payment method in checkout
3. **You'll be redirected** to VNPay sandbox
4. **Use test cards:**
   - Bank: NCB
   - Card Number: 9704198526191432198
   - Card Holder: NGUYEN VAN A
   - Issue Date: 07/15
   - OTP: 123456

5. **Complete payment** and verify redirect back to result page

### Test Payment Example

```javascript
// Example: Pay 935,000 VND
const response = await fetch('/api/vnpay/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 935000,
    orderId: 'TEST_' + Date.now(),
    orderInfo: 'Test payment for 935,000 VND',
    language: 'vn'
  })
})

const data = await response.json()
window.location.href = data.paymentUrl
```

## Security

### Signature Generation

All requests to VNPay are signed using HMAC-SHA512:

```typescript
const signData = qs.stringify(sortedParams, { encode: false })
const hmac = crypto.createHmac('sha512', hashSecret)
const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
```

### Signature Verification

Return callbacks from VNPay are verified:

```typescript
// Remove signature from params
delete params.vnp_SecureHash
delete params.vnp_SecureHashType

// Sort and verify
const sorted = sortObject(params)
const signData = qs.stringify(sorted, { encode: false })
const hmac = crypto.createHmac('sha512', hashSecret)
const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

if (signed === receivedSignature) {
  // Valid signature
}
```

## Production Checklist

- [ ] Update `VNPAY_URL` to production URL: `https://vnpayment.vn/paymentv2/vpcpay.html`
- [ ] Update `VNPAY_TMN_CODE` with production merchant code
- [ ] Update `VNPAY_HASH_SECRET` with production hash secret
- [ ] Configure IPN URL in VNPay admin panel: `https://yourdomain.com/api/vnpay/ipn`
- [ ] Implement database integration in IPN handler
- [ ] Add order status updates
- [ ] Set up logging and monitoring
- [ ] Test with production credentials

## Database Integration (TODO)

The IPN handler (`/api/vnpay/ipn/route.ts`) currently has placeholder code for database integration:

```typescript
// TODO: Check if order exists in database
const checkOrderId = true // Replace with: await db.order.findOne({ id: orderId })

// TODO: Check if amount matches
const checkAmount = true // Replace with: order.total === amount

// TODO: Get payment status from database
const paymentStatus = '0' // Replace with: order.paymentStatus

// TODO: Update payment status in database
if (rspCode === '00') {
  // await db.order.update({ id: orderId }, { paymentStatus: '1' })
}
```

## Support

- VNPay Documentation: https://sandbox.vnpayment.vn/apis/
- VNPay Support: support@vnpay.vn
- Hotline: 1900 5555 88

## Example Usage in Component

```tsx
// In your checkout component
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector'

function CheckoutPage() {
  const order = {
    id: 'ORDER123',
    total: 935000, // 935,000 VND
    items: [...]
  }

  return (
    <PaymentMethodSelector
      order={order}
      onMethodSelect={(method) => {
        // VNPay will handle automatically and redirect
        console.log('Payment method selected:', method)
      }}
    />
  )
}
```

When user clicks VNPay:
1. Spinner shows on VNPay card
2. API creates payment URL
3. Browser redirects to VNPay
4. User completes payment
5. Returns to result page with success/error
