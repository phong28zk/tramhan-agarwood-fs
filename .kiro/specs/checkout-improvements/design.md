# Design Document

## Overview

This design document outlines the improvements needed for the checkout form functionality in the Tram Han Agarwood e-commerce application. The improvements focus on three main areas: fixing cart calculation logic, enhancing shipping form submission flow with debugging capabilities, and implementing QR code generation for Vietnamese payment methods.

## Architecture

The checkout system follows a multi-step wizard pattern with the following components:
- **CheckoutForm**: Main orchestrator component managing step navigation
- **ShippingForm**: Handles address collection and validation
- **OrderSummary**: Displays cart totals and generates QR codes
- **CartStore**: Zustand store managing cart state and calculations

## Components and Interfaces

### 1. Cart Calculation System

**Current Issue**: The cart calculation logic in `recalculateTotal()` method has incorrect subtotal calculation that doesn't properly sum item prices.

**Solution Design**:
```typescript
// Enhanced calculation logic
recalculateTotal: () => {
  const state = get()
  
  // Fix: Properly calculate subtotal by summing all items
  const subtotal = state.items.reduce((sum, item) => {
    const itemPrice = item.selectedVariant?.price || item.product.price
    return sum + (itemPrice * item.quantity)
  }, 0)
  
  // Calculate other fees
  const tax = calculateTax(subtotal)
  const finalTotal = subtotal + state.shipping + tax - state.discount
  
  set({
    subtotal,
    tax,
    total: Math.max(0, finalTotal),
    itemCount: state.items.reduce((count, item) => count + item.quantity, 0)
  })
}
```

### 2. Enhanced Shipping Form

**Current Issue**: Form submission doesn't provide debugging information and may have validation flow issues.

**Solution Design**:
```typescript
// Enhanced form submission with logging
const handleFormSubmit = (data: ShippingFormData) => {
  // Debug logging
  console.group('🚚 Shipping Form Submission')
  console.log('Form Data:', data)
  console.log('Validation State:', { hasAttemptedSubmit, errors })
  console.log('Timestamp:', new Date().toISOString())
  console.groupEnd()
  
  setHasAttemptedSubmit(true)
  
  const shippingAddress: ShippingAddress = {
    fullName: data.fullName,
    phone: data.phone,
    email: data.email || undefined,
    address: data.address,
    ward: data.ward,
    district: data.district,
    province: data.province,
    postalCode: data.postalCode || undefined,
  }

  // Additional logging for address processing
  console.log('📍 Processed Shipping Address:', shippingAddress)
  
  if (data.saveAddress) {
    addAddress(shippingAddress)
    console.log('💾 Address saved to user store')
  }

  onSubmit(shippingAddress)
}
```

### 3. QR Code Generation System

**New Component Design**:
```typescript
interface QRCodeGeneratorProps {
  amount: number
  orderId?: string
  paymentMethods?: string[]
}

// QR Code component for Vietnamese payment integration
const PaymentQRCode: React.FC<QRCodeGeneratorProps> = ({ 
  amount, 
  orderId, 
  paymentMethods = ['momo', 'zalopay', 'vnpay'] 
}) => {
  const qrData = useMemo(() => {
    return {
      amount: amount,
      currency: 'VND',
      orderId: orderId || `TH${Date.now()}`,
      description: `Thanh toán đơn hàng Trầm Hân`,
      methods: paymentMethods
    }
  }, [amount, orderId, paymentMethods])
  
  return (
    <div className="qr-payment-section">
      <QRCodeSVG 
        value={JSON.stringify(qrData)}
        size={200}
        level="M"
        includeMargin={true}
      />
      <p className="text-center text-sm mt-2">
        Quét mã QR để thanh toán {formatVNDCurrency(amount)}
      </p>
    </div>
  )
}
```

## Data Models

### Enhanced Cart State
```typescript
interface EnhancedCartStore extends CartStore {
  // Add debugging methods
  logCartState: () => void
  validateCalculations: () => boolean
  
  // Enhanced calculation method
  recalculateTotal: () => void
}
```

### QR Code Data Structure
```typescript
interface PaymentQRData {
  amount: number
  currency: 'VND'
  orderId: string
  description: string
  methods: string[]
  timestamp: string
}
```

## Error Handling

### Form Validation Enhancement
```typescript
// Enhanced error handling with detailed logging
const validateAndSubmit = async (data: ShippingFormData) => {
  try {
    console.log('🔍 Starting form validation...')
    
    // Validate required fields
    const validationResult = shippingSchema.safeParse(data)
    
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.issues)
      setHasAttemptedSubmit(true)
      return
    }
    
    console.log('✅ Validation passed')
    await handleFormSubmit(validationResult.data)
    
  } catch (error) {
    console.error('💥 Form submission error:', error)
    showToast('Có lỗi xảy ra khi xử lý form', 'error')
  }
}
```

### Cart Calculation Validation
```typescript
// Add validation to ensure calculations are correct
const validateCalculations = (): boolean => {
  const state = get()
  
  // Validate subtotal calculation
  const expectedSubtotal = state.items.reduce((sum, item) => {
    const price = item.selectedVariant?.price || item.product.price
    return sum + (price * item.quantity)
  }, 0)
  
  const isValid = Math.abs(state.subtotal - expectedSubtotal) < 0.01
  
  if (!isValid) {
    console.error('💰 Cart calculation mismatch:', {
      calculated: state.subtotal,
      expected: expectedSubtotal,
      items: state.items
    })
  }
  
  return isValid
}
```

## Testing Strategy

### Unit Tests
1. **Cart Calculation Tests**
   - Test subtotal calculation with multiple items
   - Test calculation with variants vs base prices
   - Test edge cases (empty cart, zero prices)

2. **Form Validation Tests**
   - Test required field validation
   - Test Vietnamese phone number validation
   - Test address format validation

3. **QR Code Generation Tests**
   - Test QR data structure generation
   - Test amount formatting
   - Test different payment method combinations

### Integration Tests
1. **Checkout Flow Tests**
   - Test complete shipping form submission
   - Test step navigation after form completion
   - Test cart state persistence through steps

2. **Logging Tests**
   - Verify console logging output
   - Test error logging scenarios
   - Test debugging information completeness

### Manual Testing Scenarios
1. **Cart Calculation Verification**
   - Add items with prices 850,000đ and 6,400,000đ
   - Verify subtotal shows 7,250,000đ
   - Test with different quantities and variants

2. **Form Submission Flow**
   - Fill shipping form completely
   - Click "Tiếp tục thanh toán" button
   - Verify automatic navigation to payment step
   - Check console for logged form data

3. **QR Code Display**
   - Verify QR code appears in OrderSummary
   - Test QR code updates when cart total changes
   - Verify QR code contains correct payment amount

## Implementation Dependencies

### Required Libraries
```json
{
  "qrcode.react": "^3.1.0",
  "@types/qrcode.react": "^1.0.2"
}
```

### Utility Functions
```typescript
// Enhanced debugging utilities
export const logCheckoutStep = (step: string, data: any) => {
  console.group(`🛒 Checkout Step: ${step}`)
  console.log('Data:', data)
  console.log('Timestamp:', new Date().toISOString())
  console.groupEnd()
}

export const validateCartCalculation = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    const price = item.selectedVariant?.price || item.product.price
    return sum + (price * item.quantity)
  }, 0)
}
```

## Performance Considerations

1. **QR Code Generation**: Use `useMemo` to prevent unnecessary re-generation
2. **Form Validation**: Debounce validation to avoid excessive re-renders
3. **Console Logging**: Use development-only logging to avoid production overhead
4. **Cart Calculations**: Optimize calculation triggers to prevent unnecessary recalculations

## Security Considerations

1. **Form Data Logging**: Ensure sensitive data is not logged in production
2. **QR Code Data**: Validate QR code data structure to prevent injection
3. **Payment Information**: Never log payment method details
4. **Address Data**: Sanitize address inputs to prevent XSS