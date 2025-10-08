# VNPay Integration - Quick Start Guide

## Setup (5 minutes)

### 1. Configure Environment Variables

```bash
# Copy the example file
cp .env.vnpay.example .env.local

# Edit .env.local and add your VNPay credentials
VNPAY_TMN_CODE=your_terminal_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
```

### 2. Test the Integration

```bash
# Start the development server
npm run dev

# Open http://localhost:3000
```

---

## Usage Examples

### Create a Payment

```typescript
// In your React component
const handlePayment = async () => {
  const response = await fetch('/api/vnpay/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 100000, // 100,000 VND
      orderInfo: 'Payment for Order #123'
    })
  });

  const { paymentUrl } = await response.json();

  // Redirect user to VNPay
  window.location.href = paymentUrl;
};
```

### Query Transaction Status

```typescript
const checkPaymentStatus = async (orderId: string, transDate: string) => {
  const response = await fetch('/api/vnpay/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      transDate // Format: YYYYMMDDHHmmss
    })
  });

  const { success, data } = await response.json();

  if (success && data.transactionStatus === '00') {
    console.log('Payment successful!');
  }
};
```

### Process a Refund

```typescript
const processRefund = async (orderId: string, transDate: string) => {
  const response = await fetch('/api/vnpay/refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      transDate,
      amount: 100000,
      transType: '02', // Full refund
      user: 'admin@example.com'
    })
  });

  const { success, statusMessage } = await response.json();
  console.log(statusMessage);
};
```

---

## API Endpoints Overview

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/vnpay/create-payment` | POST | Create payment URL | Ready |
| `/api/vnpay/return` | GET | Handle user return | Ready |
| `/api/vnpay/ipn` | GET | IPN notification | Needs DB |
| `/api/vnpay/query` | POST | Query transaction | Ready |
| `/api/vnpay/refund` | POST | Process refund | Ready |

---

## Next Steps

1. **Integrate with Database**
   - See TODOs in `/app/api/vnpay/ipn/route.ts`
   - Implement the 4 database functions

2. **Create Payment Result Page**
   - Create `/app/payment/vnpay/result/page.tsx`
   - Display success/failure message

3. **Test the Flow**
   - Create payment
   - Complete on VNPay sandbox
   - Check IPN logs
   - Verify in database

---

## File Locations

- **API Documentation**: `/app/api/vnpay/README.md`
- **Implementation Summary**: `/VNPAY_IMPLEMENTATION_SUMMARY.md`
- **Type Definitions**: `/types/vnpay.ts`
- **Test Utilities**: `/lib/vnpay-test-utils.ts`
- **Environment Template**: `/.env.vnpay.example`

---

## Getting Help

- Full documentation: `/app/api/vnpay/README.md`
- VNPay docs: https://sandbox.vnpayment.vn/apis/docs/
- VNPay support: support@vnpay.vn

---

## Common Issues

### Payment URL not working
- Check environment variables are set
- Verify VNPAY_TMN_CODE and VNPAY_HASH_SECRET
- Check console logs for errors

### IPN not being called
- Configure IPN URL in VNPay merchant portal
- Use ngrok or similar for local testing
- Check VNPay logs in merchant portal

### Signature verification fails
- Ensure VNPAY_HASH_SECRET matches merchant portal
- Check parameter sorting (alphabetical)
- Verify HMAC SHA512 implementation

---

## Production Checklist

- [ ] Get production credentials from VNPay
- [ ] Update environment variables
- [ ] Implement database integration
- [ ] Create payment result page
- [ ] Set up error monitoring (Sentry)
- [ ] Configure IPN URL in VNPay portal
- [ ] Test with real payment (small amount)
- [ ] Set up IP whitelist for IPN
- [ ] Enable logging to external service
- [ ] Load test the endpoints
