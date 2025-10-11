import { NextRequest, NextResponse } from 'next/server';
import { createVNPayPaymentUrl } from '@/lib/vnpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, orderId, orderInfo, locale, bankCode } = body;

    // Validate required fields
    if (!amount || !orderId || !orderInfo) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, orderId, orderInfo' },
        { status: 400 }
      );
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '127.0.0.1';

    // VNPay configuration
    const vnpayConfig = {
      tmnCode: process.env.VNPAY_TMN_CODE || '',
      hashSecret: process.env.VNPAY_HASH_SECRET || '',
      url: process.env.VNPAY_URL || '',
      returnUrl: `${request.nextUrl.origin}/payment/vnpay/return`,
    };
    console.log('💳 VNPay configuration:', vnpayConfig);

    // Validate configuration
    if (!vnpayConfig.tmnCode || !vnpayConfig.hashSecret || !vnpayConfig.url) {
      console.error('VNPay configuration is incomplete');
      return NextResponse.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    // Create payment URL
    const paymentUrl = createVNPayPaymentUrl(vnpayConfig, {
      amount: parseInt(amount),
      orderId,
      orderInfo,
      ipAddress,
      locale: locale || 'vn',
      bankCode,
    });

    console.log('VNPay payment URL created:', {
      orderId,
      amount,
      ipAddress,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      paymentUrl,
    });
  } catch (error) {
    console.error('Error creating VNPay payment URL:', error);
    return NextResponse.json(
      { error: 'Failed to create payment URL' },
      { status: 500 }
    );
  }
}
