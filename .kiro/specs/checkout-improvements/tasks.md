# Implementation Plan

- [ ] 1. Fix cart calculation logic in store
  - Modify the `recalculateTotal` method in `store/index.ts` to properly sum item prices
  - Add validation method to verify calculation accuracy
  - Add debugging console logs for cart state changes
  - Write unit tests for cart calculation scenarios
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 2. Install and configure QR code dependencies
  - Add `qrcode.react` and `@types/qrcode.react` to package.json
  - Install the dependencies using the project's package manager
  - _Requirements: 3.1, 3.2_

- [ ] 3. Create QR code generation component
  - Create `components/payment/PaymentQRCode.tsx` component
  - Implement QR data structure for Vietnamese payment methods
  - Add amount formatting and display logic
  - Include responsive design for mobile and desktop
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 4. Integrate QR code into OrderSummary component
  - Import and add PaymentQRCode component to OrderSummary
  - Pass cart total and order information to QR component
  - Ensure QR code updates when cart total changes
  - Add conditional rendering based on payment context
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 5. Enhance shipping form with debugging and logging
  - Add comprehensive console logging to `handleFormSubmit` method in ShippingForm
  - Log form data, validation state, and processing steps
  - Add error logging for form submission failures
  - Ensure logging is development-only to avoid production overhead
  - _Requirements: 4.1, 4.2, 4.3, 1.3_

- [ ] 6. Fix shipping form submission flow
  - Ensure form validation properly triggers before submission
  - Verify automatic navigation to payment step after successful submission
  - Add loading states during form processing
  - Implement proper error handling with user-friendly messages
  - _Requirements: 1.1, 1.2, 1.4, 5.1, 5.3, 5.4_

- [ ] 7. Add checkout step logging and debugging
  - Implement logging in CheckoutForm for step transitions
  - Log payment method selection in PaymentForm
  - Add debugging utilities for checkout flow troubleshooting
  - Create development-only debug panel for checkout state
  - _Requirements: 4.3, 4.4_

- [ ] 8. Create utility functions for debugging
  - Create `utils/checkout-debug.ts` with logging utilities
  - Implement cart validation helper functions
  - Add development environment detection for conditional logging
  - Export debugging functions for use across checkout components
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Write comprehensive tests for cart calculations
  - Create test file `__tests__/store/cart-calculations.test.ts`
  - Test subtotal calculation with multiple items and variants
  - Test edge cases like empty cart and zero prices
  - Verify calculation accuracy with the specific 850,000đ + 6,400,000đ = 7,250,000đ scenario
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 10. Write tests for form submission and QR code generation
  - Create test file `__tests__/components/checkout-form.test.tsx`
  - Test shipping form validation and submission flow
  - Test QR code generation with different amounts
  - Test checkout step navigation after form completion
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.4_

- [ ] 11. Update TypeScript types for new functionality
  - Add QR code data interface to `types/index.ts`
  - Add debugging utility types
  - Update cart store interface with new debugging methods
  - Ensure type safety for all new components and functions
  - _Requirements: 3.1, 4.1_

- [ ] 12. Implement responsive design improvements
  - Ensure QR code displays properly on mobile devices
  - Optimize form layout for better mobile experience
  - Test checkout flow on different screen sizes
  - Add loading states and visual feedback improvements
  - _Requirements: 5.1, 5.2, 5.3_