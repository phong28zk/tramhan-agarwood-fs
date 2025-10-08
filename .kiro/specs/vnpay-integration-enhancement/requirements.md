# Requirements Document

## Introduction

This feature enhances the existing VNPay integration by migrating and improving the payment gateway functionality from the reference vnpay_nodejs implementation. The goal is to provide a complete, production-ready VNPay payment system that includes payment creation, return handling, IPN processing, transaction querying, and refund capabilities, all integrated with the existing order management system.

## Requirements

### Requirement 1

**User Story:** As a customer, I want to make payments using VNPay with all supported Vietnamese banks, so that I can complete my purchase using my preferred payment method.

#### Acceptance Criteria

1. WHEN a customer selects VNPay as payment method THEN the system SHALL create a secure payment URL with proper signature
2. WHEN the payment URL is generated THEN the system SHALL include all required VNPay parameters (vnp_Version, vnp_Command, vnp_TmnCode, etc.)
3. WHEN a bank code is specified THEN the system SHALL include it in the payment parameters to direct users to specific bank
4. WHEN the payment URL is created THEN the system SHALL redirect the customer to VNPay gateway
5. WHEN generating order ID THEN the system SHALL use format DDHHmmss to ensure uniqueness

### Requirement 2

**User Story:** As a customer, I want to be redirected back to the website after completing payment, so that I can see the payment result and continue with my order.

#### Acceptance Criteria

1. WHEN VNPay processes the payment THEN the system SHALL receive the return callback with payment status
2. WHEN the return callback is received THEN the system SHALL verify the signature using vnp_SecureHash
3. WHEN signature verification succeeds THEN the system SHALL redirect to payment result page with transaction details
4. WHEN signature verification fails THEN the system SHALL redirect to error page with code 97
5. WHEN payment is successful (code 00) THEN the system SHALL display success message with transaction details
6. WHEN payment fails THEN the system SHALL display appropriate error message based on response code

### Requirement 3

**User Story:** As a system administrator, I want to receive instant payment notifications (IPN) from VNPay, so that the system can update order status automatically without relying on user return.

#### Acceptance Criteria

1. WHEN VNPay sends IPN notification THEN the system SHALL verify the signature before processing
2. WHEN IPN signature is valid THEN the system SHALL check if order exists in database
3. WHEN order exists THEN the system SHALL verify the payment amount matches the order amount
4. WHEN payment status is initial (0) AND response code is 00 THEN the system SHALL update order status to paid
5. WHEN payment status is initial (0) AND response code is not 00 THEN the system SHALL update order status to failed
6. WHEN order has already been processed THEN the system SHALL return code 02 (already updated)
7. WHEN order not found THEN the system SHALL return code 01 (order not found)
8. WHEN amount mismatch THEN the system SHALL return code 04 (amount invalid)
9. WHEN signature verification fails THEN the system SHALL return code 97 (checksum failed)

### Requirement 4

**User Story:** As a system administrator, I want to query transaction status from VNPay, so that I can verify payment status and resolve any discrepancies.

#### Acceptance Criteria

1. WHEN querying transaction status THEN the system SHALL create proper API request with required parameters
2. WHEN creating query request THEN the system SHALL include vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode, vnp_TxnRef, vnp_TransactionDate
3. WHEN generating query signature THEN the system SHALL use pipe-separated data format as per VNPay specification
4. WHEN sending query request THEN the system SHALL use POST method to VNPay API endpoint
5. WHEN receiving query response THEN the system SHALL parse and return transaction status information

### Requirement 5

**User Story:** As a system administrator, I want to process refunds through VNPay, so that I can handle customer refund requests efficiently.

#### Acceptance Criteria

1. WHEN processing refund THEN the system SHALL create proper refund request with required parameters
2. WHEN creating refund request THEN the system SHALL include vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode, vnp_TransactionType, vnp_TxnRef, vnp_Amount
3. WHEN generating refund signature THEN the system SHALL use pipe-separated data format with all required fields
4. WHEN sending refund request THEN the system SHALL use POST method to VNPay API endpoint
5. WHEN refund amount is specified THEN the system SHALL multiply by 100 to convert to VNPay format
6. WHEN refund type is specified THEN the system SHALL support both partial (03) and full (02) refund types

### Requirement 6

**User Story:** As a developer, I want the VNPay integration to be properly integrated with the existing order system, so that payment status updates are reflected in order management.

#### Acceptance Criteria

1. WHEN payment is successful THEN the system SHALL update the corresponding order status to 'paid'
2. WHEN payment fails THEN the system SHALL update the corresponding order status to 'failed'
3. WHEN IPN is received THEN the system SHALL log payment details for audit purposes
4. WHEN order status changes THEN the system SHALL maintain payment history and transaction references
5. WHEN payment is processed THEN the system SHALL store VNPay transaction ID for future reference

### Requirement 7

**User Story:** As a system administrator, I want proper error handling and logging for all VNPay operations, so that I can troubleshoot payment issues effectively.

#### Acceptance Criteria

1. WHEN any VNPay operation occurs THEN the system SHALL log request and response details
2. WHEN signature verification fails THEN the system SHALL log the failure with relevant details
3. WHEN API calls to VNPay fail THEN the system SHALL log error details and return appropriate error codes
4. WHEN invalid parameters are provided THEN the system SHALL validate and return clear error messages
5. WHEN environment configuration is missing THEN the system SHALL fail gracefully with configuration error message

### Requirement 8

**User Story:** As a developer, I want the VNPay integration to use environment variables for configuration, so that sensitive credentials are properly managed across different environments.

#### Acceptance Criteria

1. WHEN configuring VNPay THEN the system SHALL use environment variables for TMN code, hash secret, and URLs
2. WHEN environment variables are missing THEN the system SHALL return configuration error
3. WHEN different environments are used THEN the system SHALL support sandbox and production configurations
4. WHEN return URLs are configured THEN the system SHALL dynamically generate based on current domain
5. WHEN API endpoints are configured THEN the system SHALL support both sandbox and production VNPay URLs