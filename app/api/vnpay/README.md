# VNPay Payment Gateway API Integration

This directory contains the complete VNPay payment gateway integration for the Next.js application, migrated from the Node.js Express implementation.

## API Endpoints

### 1. Create Payment URL
**POST** `/api/vnpay/create-payment`

Creates a VNPay payment URL for redirecting users to the payment gateway.

**Request Body:**
```json
{
  "amount": 100000,
  "orderId": "optional-custom-id",
  "orderInfo": "Payment for order #123",
  "language": "vn",
  "bankCode": "NCB"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "orderId": "08143520"
}
```

**Usage Example:**
```typescript
const response = await fetch('/api/vnpay/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 100000,
    orderInfo: 'Payment for order #123'
  })
});

const { paymentUrl } = await response.json();
window.location.href = paymentUrl;
```

---

### 2. Return URL Handler
**GET** `/api/vnpay/return`

Handles user return from VNPay after payment. This endpoint verifies the payment signature and redirects to the result page.

**Query Parameters:** (automatically provided by VNPay)
- `vnp_Amount`: Transaction amount (multiplied by 100)
- `vnp_BankCode`: Bank code
- `vnp_ResponseCode`: Payment result code
- `vnp_TxnRef`: Order ID
- `vnp_TransactionNo`: VNPay transaction number
- `vnp_SecureHash`: Payment signature

**Behavior:**
- Verifies the payment signature
- Redirects to `/payment/vnpay/result` with payment details
- Handles both successful and failed payments

---

### 3. IPN (Instant Payment Notification)
**GET** `/api/vnpay/ipn`

Handles VNPay server-to-server notification. This endpoint is called by VNPay to confirm payment status.

**Query Parameters:** (automatically provided by VNPay)
- Same as return URL parameters

**Response:**
```json
{
  "RspCode": "00",
  "Message": "Success"
}
```

**Response Codes:**
- `00`: Success
- `01`: Order not found
- `02`: Order already updated
- `04`: Invalid amount
- `97`: Checksum failed
- `99`: Unknown error

**Important Notes:**
- This endpoint MUST return HTTP 200 for all responses
- VNPay requires specific RspCode to confirm IPN receipt
- Contains TODOs for database integration

**Database Integration TODO:**
```typescript
// Replace these with actual database calls:
const checkOrderId = await checkOrderExists(orderId);
const checkAmount = await verifyOrderAmount(orderId, amount);
const paymentStatus = await getPaymentStatus(orderId);
await updatePaymentStatus(orderId, { status, transactionNo, ... });
```

---

### 4. Query Transaction
**POST** `/api/vnpay/query`

Queries VNPay API for transaction status.

**Request Body:**
```json
{
  "orderId": "08143520",
  "transDate": "20250108143520"
}
```

**Response:**
```json
{
  "success": true,
  "statusMessage": "Query successful",
  "data": {
    "responseCode": "00",
    "message": "Success",
    "orderId": "08143520",
    "amount": 100000,
    "transactionNo": "14012345",
    "transactionStatus": "00",
    "bankCode": "NCB",
    "payDate": "20250108143530"
  }
}
```

**Usage Example:**
```typescript
const response = await fetch('/api/vnpay/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: '08143520',
    transDate: '20250108143520'
  })
});

const { success, data } = await response.json();
if (success) {
  console.log('Transaction status:', data.transactionStatus);
}
```

---

### 5. Refund Transaction
**POST** `/api/vnpay/refund`

Initiates a refund request to VNPay API.

**Request Body:**
```json
{
  "orderId": "08143520",
  "transDate": "20250108143520",
  "amount": 100000,
  "transType": "02",
  "user": "admin@example.com",
  "transactionNo": "14012345"
}
```

**Transaction Types:**
- `02`: Full refund
- `03`: Partial refund

**Response:**
```json
{
  "success": true,
  "statusMessage": "Refund successful",
  "data": {
    "responseCode": "00",
    "message": "Success",
    "orderId": "08143520",
    "amount": 100000,
    "transactionNo": "14012345",
    "transactionStatus": "00"
  }
}
```

**Response Codes:**
- `00`: Refund successful
- `01`: Order not found
- `02`: Invalid request
- `03`: Invalid merchant
- `04`: Invalid signature
- `13`: Invalid amount
- `91`: Transaction not found
- `93`: Invalid refund amount
- `94`: Duplicate refund request
- `95`: Transaction already refunded

**Usage Example:**
```typescript
const response = await fetch('/api/vnpay/refund', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: '08143520',
    transDate: '20250108143520',
    amount: 100000,
    transType: '02', // Full refund
    user: 'admin@example.com'
  })
});

const { success, statusMessage } = await response.json();
```

---

## Environment Variables

Required environment variables (add to `.env.local`):

```env
# VNPay Configuration
VNPAY_TMN_CODE=your_terminal_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction

# For production:
# VNPAY_URL=https://vnpayment.vn/paymentv2/vpcpay.html
# VNPAY_API=https://vnpayment.vn/merchant_webapi/api/transaction
```

---

## Library Functions

Located in `/lib/vnpay.ts`:

### Payment URL Creation
```typescript
createVNPayPaymentUrl(config: VNPayConfig, params: VNPayPaymentParams): string
```

### Signature Verification
```typescript
verifyVNPayReturn(params: Record<string, any>, hashSecret: string): boolean
```

### Helper Functions
```typescript
getVNPayResponseMessage(responseCode: string): string
getVNPayTransactionStatusMessage(status: string): string
createVNPayQuerySignature(...params): string
createVNPayRefundSignature(...params): string
```

---

## VNPay Response Codes

### Payment Response Codes
- `00`: Success
- `07`: Suspicious transaction
- `09`: Card not registered for internet banking
- `10`: Authentication failed (exceeded attempts)
- `11`: Payment timeout
- `12`: Card is locked
- `13`: Wrong OTP
- `24`: Customer cancelled transaction
- `51`: Insufficient balance
- `65`: Daily transaction limit exceeded
- `75`: Bank under maintenance
- `79`: Wrong password (exceeded attempts)
- `99`: Unknown error

### Transaction Status Codes
- `00`: Transaction successful
- `01`: Transaction pending
- `02`: Transaction rejected by bank
- `04`: Transaction violates regulations
- `05`: VNPay processing refund
- `06`: VNPay sent refund request to bank
- `07`: Suspicious transaction
- `09`: Refund rejected

---

## Security Notes

1. **HMAC SHA512 Signature**: All requests use HMAC SHA512 for signature verification
2. **Amount Format**: Amounts are multiplied by 100 before sending to VNPay
3. **Timezone**: All dates use Asia/Ho_Chi_Minh timezone
4. **IP Address**: Client IP is extracted from headers and sent to VNPay
5. **Parameter Sorting**: Parameters must be sorted alphabetically before signing

---

## Testing

### Test Payment Flow
1. Create payment URL via `/api/vnpay/create-payment`
2. Redirect user to VNPay payment page
3. User completes payment
4. VNPay redirects to `/api/vnpay/return`
5. VNPay calls `/api/vnpay/ipn` (server-to-server)
6. Update order status in database

### Test Credentials
Use VNPay sandbox credentials for testing. Contact VNPay support for sandbox access.

---

## Migration Notes

This implementation is based on the official VNPay Node.js SDK (`vnpay_nodejs`) with the following improvements:

1. **TypeScript Support**: Full type safety with interfaces
2. **Next.js App Router**: Uses Next.js 14+ App Router conventions
3. **Enhanced Logging**: Comprehensive logging using console.group/console.log
4. **Error Handling**: Proper error handling and validation
5. **Modern Fetch API**: Uses native fetch instead of request library
6. **Modular Design**: Separated library functions from route handlers

---

## Architecture

```
app/api/vnpay/
├── create-payment/route.ts  # Payment URL creation
├── return/route.ts          # User return handler
├── ipn/route.ts            # IPN notification handler
├── query/route.ts          # Transaction query
├── refund/route.ts         # Refund processing
└── README.md               # This file

lib/
└── vnpay.ts                # VNPay utility functions
```

---

## Next Steps

1. **Database Integration**: Implement the TODO items in `/api/vnpay/ipn/route.ts`
2. **Payment Result Page**: Create `/app/payment/vnpay/result/page.tsx`
3. **Admin Dashboard**: Build admin interface for querying and refunding
4. **Webhook Security**: Add IP whitelist for IPN endpoint
5. **Monitoring**: Add logging to external service (e.g., Sentry)
6. **Testing**: Write integration tests for all endpoints

---

## Support

For VNPay API documentation and support:
- Documentation: https://sandbox.vnpayment.vn/apis/docs/
- Support: support@vnpay.vn
