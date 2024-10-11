import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(req: NextRequest) {
    const { message } = await req.json();

    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
        }),
      });

      if (response.ok) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ success: false, error: 'Failed to send Telegram message' }, { status: 500 });
      }
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}