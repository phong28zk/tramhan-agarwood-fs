import { NextRequest, NextResponse } from 'next/server';
import { createVNPayPaymentUrl } from '@/lib/vnpay';

/**
 * POST /api/vnpay/create-payment
 * Create VNPay payment URL based on vnpay_nodejs implementation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, orderId, orderInfo, language, bankCode } = body;

    // Validate required fields
    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    // Get client IP address
    const ipAddr =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Generate orderId if not provided (format: DDHHmmss)
    const date = new Date();
    const generatedOrderId = orderId ||
      date.toISOString().slice(8, 10) +
      date.toISOString().slice(11, 13) +
      date.toISOString().slice(14, 16) +
      date.toISOString().slice(17, 19);

    // VNPay configuration from environment variables
    const vnpayConfig = {
      tmnCode: process.env.VNPAY_TMN_CODE || '',
      hashSecret: process.env.VNPAY_HASH_SECRET || '',
      url: process.env.VNPAY_URL || '',
      returnUrl: `${request.nextUrl.origin}/api/vnpay/return`,
    };

    // Log VNPay configuration
    console.log('VNPay configuration:', vnpayConfig);

    // Validate configuration
    if (!vnpayConfig.tmnCode || !vnpayConfig.hashSecret || !vnpayConfig.url) {
      console.error('VNPay configuration is incomplete');
      return NextResponse.json(
        { error: 'Payment gateway configuration error' },
        { status: 500 }
      );
    }

    const locale = language || 'vn';

    // Create payment URL
    const paymentUrl = createVNPayPaymentUrl(vnpayConfig, {
      amount: parseInt(amount),
      orderId: generatedOrderId,
      orderInfo: orderInfo || `Thanh toan cho ma GD:${generatedOrderId}`,
      ipAddress: ipAddr,
      locale,
      bankCode: bankCode || undefined,
    });

    console.log('✅ VNPay payment URL created:', {
      orderId: generatedOrderId,
      amount: parseInt(amount),
      ipAddress: ipAddr,
      locale,
      bankCode: bankCode || 'none',
      timestamp: new Date().toISOString(),
    });
    
    console.log('Redirect user to:', paymentUrl);
    return NextResponse.json({
      success: true,
      paymentUrl,
      orderId: generatedOrderId,
    });
  } catch (error) {
    console.error('❌ Error creating VNPay payment URL:', error);
    return NextResponse.json(
      {
        error: 'Failed to create payment URL',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
