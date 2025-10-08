import { NextRequest, NextResponse } from 'next/server';
import { verifyVNPayReturn, getVNPayResponseMessage } from '@/lib/vnpay';

/**
 * GET /api/vnpay/return
 * Handle VNPay return callback - based on vnpay_nodejs implementation
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Convert URL search params to object
    const vnp_Params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      vnp_Params[key] = value;
    });

    const secureHash = vnp_Params['vnp_SecureHash'];
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const orderId = vnp_Params['vnp_TxnRef'];
    const amount = vnp_Params['vnp_Amount'];
    const transactionNo = vnp_Params['vnp_TransactionNo'];
    const bankCode = vnp_Params['vnp_BankCode'];

    // Remove hash parameters before verification
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const hashSecret = process.env.VNPAY_HASH_SECRET || '';

    // Verify signature
    const isValid = verifyVNPayReturn(vnp_Params, hashSecret);

    console.log('🔔 VNPay Return Callback:', {
      orderId,
      responseCode,
      amount: amount ? parseInt(amount) / 100 : 0,
      transactionNo,
      bankCode,
      isValid,
      timestamp: new Date().toISOString(),
    });

    if (isValid) {
      // Redirect to payment result page with query parameters
      const resultUrl = new URL('/payment/vnpay/result', request.nextUrl.origin);
      resultUrl.searchParams.set('vnp_ResponseCode', responseCode);
      resultUrl.searchParams.set('vnp_TxnRef', orderId);
      resultUrl.searchParams.set('vnp_Amount', amount);
      resultUrl.searchParams.set('vnp_TransactionNo', transactionNo || '');
      resultUrl.searchParams.set('vnp_BankCode', bankCode || '');

      return NextResponse.redirect(resultUrl);
    } else {
      // Invalid signature - redirect with error code 97
      const resultUrl = new URL('/payment/vnpay/result', request.nextUrl.origin);
      resultUrl.searchParams.set('vnp_ResponseCode', '97');
      resultUrl.searchParams.set('vnp_TxnRef', orderId);

      console.error('❌ VNPay signature verification failed');
      return NextResponse.redirect(resultUrl);
    }
  } catch (error) {
    console.error('❌ Error processing VNPay return:', error);

    // Redirect to error page
    const errorUrl = new URL('/payment/vnpay/result', request.nextUrl.origin);
    errorUrl.searchParams.set('vnp_ResponseCode', '99');

    return NextResponse.redirect(errorUrl);
  }
}
