import type { CartItem } from '../types'

// Enhanced debugging utilities
export const logCheckoutStep = (step: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🛒 Checkout Step: ${step}`)
    console.log('Data:', data)
    console.log('Timestamp:', new Date().toISOString())
    console.groupEnd()
  }
}

export const validateCartCalculation = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    const price = item.selectedVariant?.price || item.product.price
    return sum + (price * item.quantity)
  }, 0)
}

// Development environment detection
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development'
}

// Cart state debugging
export const logCartDebug = (message: string, data: any) => {
  if (isDevelopment()) {
    console.group(`🛒 Cart Debug: ${message}`)
    console.log('Data:', data)
    console.log('Timestamp:', new Date().toISOString())
    console.groupEnd()
  }
}

// Form submission debugging
export const logFormSubmission = (formName: string, formData: any, validationState?: any) => {
  if (isDevelopment()) {
    console.group(`📝 Form Submission: ${formName}`)
    console.log('Form Data:', formData)
    if (validationState) {
      console.log('Validation State:', validationState)
    }
    console.log('Timestamp:', new Date().toISOString())
    console.groupEnd()
  }
}

// Payment method debugging
export const logPaymentSelection = (method: string, details: any) => {
  if (isDevelopment()) {
    console.group(`💳 Payment Selection: ${method}`)
    console.log('Payment Details:', details)
    console.log('Timestamp:', new Date().toISOString())
    console.groupEnd()
  }
}

// Error logging with context
export const logError = (context: string, error: any, additionalData?: any) => {
  console.group(`❌ Error in ${context}`)
  console.error('Error:', error)
  if (additionalData) {
    console.log('Additional Data:', additionalData)
  }
  console.log('Timestamp:', new Date().toISOString())
  console.groupEnd()
}

// Performance logging
export const logPerformance = (operation: string, startTime: number) => {
  if (isDevelopment()) {
    const endTime = performance.now()
    const duration = endTime - startTime
    console.log(`⚡ Performance: ${operation} took ${duration.toFixed(2)}ms`)
  }
}

// Validation helpers
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhoneFormat = (phone: string): boolean => {
  // Vietnamese phone number validation
  const phoneRegex = /^(\+84|84|0[3|5|7|8|9])+([0-9]{8})\b$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Cart calculation validation
export const validateCartTotals = (items: CartItem[], calculatedSubtotal: number): boolean => {
  const expectedSubtotal = validateCartCalculation(items)
  const difference = Math.abs(calculatedSubtotal - expectedSubtotal)

  if (difference > 0.01) {
    logError('Cart Calculation Mismatch', {
      calculated: calculatedSubtotal,
      expected: expectedSubtotal,
      difference: difference,
      items: items
    })
    return false
  }

  return true
}

// Development-only debug panel helper
export const createDebugInfo = () => {
  if (!isDevelopment()) return null

  return {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }
}