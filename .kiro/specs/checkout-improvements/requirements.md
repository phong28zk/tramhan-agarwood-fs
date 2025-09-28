# Requirements Document

## Introduction

This feature focuses on improving the checkout form functionality in the Tram Han Agarwood e-commerce application. The improvements include fixing cart calculation issues, enhancing the shipping form submission flow, adding form data logging for debugging, and implementing QR code generation for payment amounts. These enhancements will provide a smoother checkout experience and better payment integration.

## Requirements

### Requirement 1

**User Story:** As a customer, I want the shipping form to automatically proceed to the payment step when I click "Tiếp tục thanh toán", so that I can complete my checkout process seamlessly.

#### Acceptance Criteria

1. WHEN a customer fills out all required shipping form fields AND clicks "Tiếp tục thanh toán" THEN the system SHALL validate the form data
2. WHEN the shipping form validation passes THEN the system SHALL automatically navigate to the payment step
3. WHEN the shipping form is submitted THEN the system SHALL log the form data to the browser console for debugging purposes
4. IF the shipping form has validation errors THEN the system SHALL display error messages and prevent navigation to the next step

### Requirement 2

**User Story:** As a customer, I want the cart total calculation to be accurate, so that I can see the correct amount I need to pay.

#### Acceptance Criteria

1. WHEN the cart contains multiple items THEN the system SHALL calculate the subtotal by summing all item prices multiplied by their quantities
2. WHEN calculating the total THEN the system SHALL correctly add subtotal + shipping + tax - discount
3. WHEN the cart shows 850,000đ and 6,400,000đ items THEN the system SHALL display a subtotal of 7,250,000đ
4. WHEN the order summary is displayed THEN the system SHALL show accurate line-by-line calculations for subtotal, shipping, tax, and discount

### Requirement 3

**User Story:** As a customer, I want to see a QR code with the payment amount, so that I can easily make mobile payments using Vietnamese payment methods.

#### Acceptance Criteria

1. WHEN the order summary is displayed THEN the system SHALL generate a QR code containing the total payment amount
2. WHEN the QR code is generated THEN it SHALL include the order total in Vietnamese Dong format
3. WHEN a customer scans the QR code THEN it SHALL contain payment information compatible with Vietnamese mobile payment apps
4. WHEN the payment amount changes THEN the system SHALL automatically update the QR code with the new amount

### Requirement 4

**User Story:** As a developer, I want form submission data to be logged to the console, so that I can debug checkout issues effectively.

#### Acceptance Criteria

1. WHEN the shipping form is submitted THEN the system SHALL log all form field values to the browser console
2. WHEN form validation occurs THEN the system SHALL log validation results and any errors
3. WHEN the checkout process progresses between steps THEN the system SHALL log the current step and relevant data
4. WHEN payment methods are selected THEN the system SHALL log the selected payment method details

### Requirement 5

**User Story:** As a customer, I want the checkout flow to be intuitive and responsive, so that I can complete my purchase without confusion.

#### Acceptance Criteria

1. WHEN I complete the shipping form THEN the system SHALL provide clear visual feedback that the form was submitted successfully
2. WHEN I navigate between checkout steps THEN the system SHALL maintain my previously entered data
3. WHEN form submission is in progress THEN the system SHALL show loading states to indicate processing
4. WHEN errors occur during form submission THEN the system SHALL display user-friendly error messages in Vietnamese