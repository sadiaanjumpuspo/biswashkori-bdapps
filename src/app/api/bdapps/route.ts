import { NextRequest, NextResponse } from 'next/server';
import { bdappsService } from '@/lib/bdapps';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, mobile, otp, referenceNo } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    if (action === 'check_subscription') {
      if (!mobile) return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
      const res = await bdappsService.checkSubscription(mobile);
      return NextResponse.json(res);
    }

    if (action === 'send_otp') {
      if (!mobile) return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
      const res = await bdappsService.sendOtp(mobile);
      return NextResponse.json(res);
    }

    if (action === 'verify_otp') {
      if (!otp || !referenceNo) {
        return NextResponse.json({ error: 'Otp and referenceNo are required' }, { status: 400 });
      }
      const res = await bdappsService.verifyOtp(otp, referenceNo);
      return NextResponse.json(res);
    }

    if (action === 'unsubscribe') {
      if (!mobile) return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
      const res = await bdappsService.unsubscribe(mobile);
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('BDApps API Proxy Error:', error);
    return NextResponse.json(
      { error: error.message || 'BDApps server error' },
      { status: 500 }
    );
  }
}
