import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import qs from 'qs';

/**
 * GET /api/vnpay/ipn
 * Handle VNPay IPN (Instant Payment Notification) - based on vnpay_nodejs implementation
 * This endpoint is called by VNPay server to notify payment status
 *
 * IMPORTANT: This endpoint must return status 200 for all responses
 * VNPay requires specific response codes to confirm IPN receipt
 */
export async function GET(request: NextRequest) {
  console.group('VNPay IPN Notification');

  try {
    const searchParams = request.nextUrl.searchParams;

    // Convert URL search params to object
    let vnp_Params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      vnp_Params[key] = value;
    });

    // Extract key parameters
    const secureHash = vnp_Params['vnp_SecureHash'];
    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const amount = vnp_Params['vnp_Amount'];
    const transactionNo = vnp_Params['vnp_TransactionNo'];
    const bankCode = vnp_Params['vnp_BankCode'];
    const payDate = vnp_Params['vnp_PayDate'];

    console.log('Received IPN parameters:', {
      orderId,
      responseCode: rspCode,
      amount: amount ? parseInt(amount) / 100 : 0,
      transactionNo,
      bankCode,
      payDate,
      timestamp: new Date().toISOString(),
    });

    // Validate required parameters
    if (!secureHash || !orderId || !rspCode || !amount) {
      console.error('Missing required IPN parameters');
      console.groupEnd();
      return NextResponse.json(
        { RspCode: '99', Message: 'Missing required parameters' },
        { status: 200 }
      );
    }

    // Remove hash parameters before verification
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const hashSecret = process.env.VNPAY_HASH_SECRET || '';

    if (!hashSecret) {
      console.error('VNPay hash secret not configured');
      console.groupEnd();
      return NextResponse.json(
        { RspCode: '99', Message: 'Configuration error' },
        { status: 200 }
      );
    }

    // Sort object for verification
    function sortObject(obj: Record<string, any>): Record<string, any> {
      const sorted: Record<string, any> = {};
      const str: string[] = [];
      let key: string;

      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          str.push(encodeURIComponent(key));
        }
      }
      str.sort();
      for (let i = 0; i < str.length; i++) {
        sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, '+');
      }
      return sorted;
    }

    vnp_Params = sortObject(vnp_Params);

    // Verify signature
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const isSignatureValid = secureHash === signed;

    console.log('Signature verification:', {
      isValid: isSignatureValid,
      receivedHash: secureHash?.substring(0, 10) + '...',
      calculatedHash: signed?.substring(0, 10) + '...',
    });

    if (!isSignatureValid) {
      console.error('Signature verification failed - possible security issue');
      console.groupEnd();
      return NextResponse.json(
        { RspCode: '97', Message: 'Checksum failed' },
        { status: 200 }
      );
    }

    // TODO: Implement database integration
    // The following logic needs to be replaced with actual database operations

    // Step 1: Check if order exists in database
    console.log('Checking if order exists:', orderId);
    const checkOrderId = true; // TODO: Replace with: await checkOrderExists(orderId)

    if (!checkOrderId) {
      console.error('Order not found:', orderId);
      console.groupEnd();
      return NextResponse.json(
        { RspCode: '01', Message: 'Order not found' },
        { status: 200 }
      );
    }

    // Step 2: Verify amount matches the order amount in database
    console.log('Verifying amount:', parseInt(amount) / 100);
    const checkAmount = true; // TODO: Replace with: await verifyOrderAmount(orderId, parseInt(amount) / 100)

    if (!checkAmount) {
      console.error('Amount mismatch for order:', orderId);
      console.groupEnd();
      return NextResponse.json(
        { RspCode: '04', Message: 'Amount invalid' },
        { status: 200 }
      );
    }

    // Step 3: Get current payment status from database
    // Payment status: '0' = pending, '1' = success, '2' = failed
    console.log('Checking payment status');
    const paymentStatus = '0'; // TODO: Replace with: await getPaymentStatus(orderId)

    // Step 4: Only update if payment is still pending
    if (paymentStatus !== '0') {
      console.warn('Order already processed:', orderId, 'Status:', paymentStatus);
      console.groupEnd();
      return NextResponse.json(
        { RspCode: '02', Message: 'This order has been updated to the payment status' },
        { status: 200 }
      );
    }

    // Step 5: Update payment status based on response code
    if (rspCode === '00') {
      // Payment successful
      console.log('Processing successful payment for order:', orderId);
      console.log('Payment details:', {
        transactionNo,
        bankCode,
        payDate,
        amount: parseInt(amount) / 100,
      });

      // TODO: Implement database update
      // await updatePaymentStatus(orderId, {
      //   status: '1',
      //   transactionNo,
      //   bankCode,
      //   payDate,
      //   amount: parseInt(amount) / 100,
      //   responseCode: rspCode,
      //   updatedAt: new Date()
      // });

      console.log('Payment successful for order:', orderId);
      console.groupEnd();

      return NextResponse.json(
        { RspCode: '00', Message: 'Success' },
        { status: 200 }
      );
    } else {
      // Payment failed
      console.log('Processing failed payment for order:', orderId, 'Response code:', rspCode);

      // Map response codes to readable messages
      const errorMessages: Record<string, string> = {
        '07': 'Suspicious transaction',
        '09': 'Card not registered for internet banking',
        '10': 'Card authentication failed (exceeded attempts)',
        '11': 'Payment timeout',
        '12': 'Card is locked',
        '13': 'Wrong OTP',
        '24': 'Customer cancelled transaction',
        '51': 'Insufficient balance',
        '65': 'Daily transaction limit exceeded',
        '75': 'Bank under maintenance',
        '79': 'Wrong password (exceeded attempts)',
      };

      console.log('Failure reason:', errorMessages[rspCode] || 'Unknown error');

      // TODO: Implement database update
      // await updatePaymentStatus(orderId, {
      //   status: '2',
      //   transactionNo,
      //   bankCode,
      //   responseCode: rspCode,
      //   failureReason: errorMessages[rspCode] || 'Unknown error',
      //   updatedAt: new Date()
      // });

      console.log('Payment failed for order:', orderId);
      console.groupEnd();

      return NextResponse.json(
        { RspCode: '00', Message: 'Success' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Unexpected error processing VNPay IPN:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.groupEnd();

    return NextResponse.json(
      { RspCode: '99', Message: 'Unknown error' },
      { status: 200 }
    );
  }
}
