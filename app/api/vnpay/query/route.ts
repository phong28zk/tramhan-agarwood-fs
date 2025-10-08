import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/vnpay/query
 * Query VNPay transaction status - based on vnpay_nodejs querydr implementation
 * This endpoint queries VNPay API to get transaction status
 */

interface QueryRequest {
  orderId: string;
  transDate: string; // Format: YYYYMMDDHHmmss
}

interface VNPayQueryResponse {
  vnp_ResponseId?: string;
  vnp_Command?: string;
  vnp_ResponseCode?: string;
  vnp_Message?: string;
  vnp_TmnCode?: string;
  vnp_TxnRef?: string;
  vnp_Amount?: string;
  vnp_OrderInfo?: string;
  vnp_BankCode?: string;
  vnp_PayDate?: string;
  vnp_TransactionNo?: string;
  vnp_TransactionType?: string;
  vnp_TransactionStatus?: string;
  vnp_PromotionCode?: string;
  vnp_PromotionAmount?: string;
}

export async function POST(request: NextRequest) {
  console.group('VNPay Transaction Query');

  try {
    const body = await request.json();
    const { orderId, transDate }: QueryRequest = body;

    // Validate required fields
    if (!orderId) {
      console.error('Missing required field: orderId');
      console.groupEnd();
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (!transDate) {
      console.error('Missing required field: transDate');
      console.groupEnd();
      return NextResponse.json(
        { error: 'Transaction date is required (format: YYYYMMDDHHmmss)' },
        { status: 400 }
      );
    }

    // Set timezone to Vietnam
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const date = new Date();

    // Get VNPay configuration from environment
    const vnp_TmnCode = process.env.VNPAY_TMN_CODE || '';
    const secretKey = process.env.VNPAY_HASH_SECRET || '';
    const vnp_Api = process.env.VNPAY_API || '';

    // Validate configuration
    if (!vnp_TmnCode || !secretKey || !vnp_Api) {
      console.error('VNPay configuration is incomplete');
      console.groupEnd();
      return NextResponse.json(
        { error: 'Payment gateway configuration error' },
        { status: 500 }
      );
    }

    // Get client IP address
    const vnp_IpAddr =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Format dates
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    const vnp_RequestId = hours + minutes + seconds;
    const vnp_CreateDate = year + month + day + hours + minutes + seconds;

    // VNPay query parameters
    const vnp_Version = '2.1.0';
    const vnp_Command = 'querydr';
    const vnp_TxnRef = orderId;
    const vnp_TransactionDate = transDate;
    const vnp_OrderInfo = `Truy van GD ma:${vnp_TxnRef}`;

    console.log('Query parameters:', {
      orderId: vnp_TxnRef,
      transactionDate: vnp_TransactionDate,
      requestId: vnp_RequestId,
      createDate: vnp_CreateDate,
      ipAddress: vnp_IpAddr,
    });

    // Create secure hash according to VNPay specification for querydr
    // Format: vnp_RequestId|vnp_Version|vnp_Command|vnp_TmnCode|vnp_TxnRef|vnp_TransactionDate|vnp_CreateDate|vnp_IpAddr|vnp_OrderInfo
    const data = [
      vnp_RequestId,
      vnp_Version,
      vnp_Command,
      vnp_TmnCode,
      vnp_TxnRef,
      vnp_TransactionDate,
      vnp_CreateDate,
      vnp_IpAddr,
      vnp_OrderInfo,
    ].join('|');

    console.log('Hash data string:', data);

    const hmac = crypto.createHmac('sha512', secretKey);
    const vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');

    // Build request body
    const dataObj = {
      vnp_RequestId,
      vnp_Version,
      vnp_Command,
      vnp_TmnCode,
      vnp_TxnRef,
      vnp_OrderInfo,
      vnp_TransactionDate,
      vnp_CreateDate,
      vnp_IpAddr,
      vnp_SecureHash,
    };

    console.log('Sending request to VNPay API:', vnp_Api);

    // Make request to VNPay API
    const response = await fetch(vnp_Api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataObj),
    });

    if (!response.ok) {
      console.error('VNPay API request failed:', response.status, response.statusText);
      console.groupEnd();
      return NextResponse.json(
        {
          error: 'Failed to query VNPay API',
          status: response.status,
          statusText: response.statusText,
        },
        { status: 500 }
      );
    }

    const responseData: VNPayQueryResponse = await response.json();

    console.log('VNPay API response:', {
      responseCode: responseData.vnp_ResponseCode,
      message: responseData.vnp_Message,
      transactionStatus: responseData.vnp_TransactionStatus,
      amount: responseData.vnp_Amount ? parseInt(responseData.vnp_Amount) / 100 : 0,
      transactionNo: responseData.vnp_TransactionNo,
    });

    // Interpret response codes
    let statusMessage = '';
    switch (responseData.vnp_ResponseCode) {
      case '00':
        statusMessage = 'Query successful';
        break;
      case '01':
        statusMessage = 'Order not found';
        break;
      case '02':
        statusMessage = 'Invalid request';
        break;
      case '03':
        statusMessage = 'Invalid merchant';
        break;
      case '04':
        statusMessage = 'Invalid signature';
        break;
      case '91':
        statusMessage = 'Transaction not found';
        break;
      default:
        statusMessage = 'Unknown error';
    }

    console.log('Query result:', statusMessage);
    console.groupEnd();

    return NextResponse.json({
      success: responseData.vnp_ResponseCode === '00',
      statusMessage,
      data: {
        responseCode: responseData.vnp_ResponseCode,
        message: responseData.vnp_Message,
        orderId: responseData.vnp_TxnRef,
        amount: responseData.vnp_Amount ? parseInt(responseData.vnp_Amount) / 100 : 0,
        orderInfo: responseData.vnp_OrderInfo,
        bankCode: responseData.vnp_BankCode,
        payDate: responseData.vnp_PayDate,
        transactionNo: responseData.vnp_TransactionNo,
        transactionType: responseData.vnp_TransactionType,
        transactionStatus: responseData.vnp_TransactionStatus,
        promotionCode: responseData.vnp_PromotionCode,
        promotionAmount: responseData.vnp_PromotionAmount,
      },
    });
  } catch (error) {
    console.error('Error querying VNPay transaction:', error);
    console.groupEnd();

    return NextResponse.json(
      {
        error: 'Failed to query transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
