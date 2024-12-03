import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_IDS = process.env.TELEGRAM_CHAT_IDS?.split(',') || [];

export async function POST(req: NextRequest) {
    const { requestType, message, type = 'info', timestamp = new Date().toISOString() } = await req.json();

    const emoji = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️', 
        error: '❌'
    } as const;

    const formattedMessage = `${emoji[type as keyof typeof emoji] || 'ℹ️'} *Log*
━━━━━━━━━━━━━━━━
*Request Type:* ${requestType}
*Time:* ${new Date(timestamp).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium'
    })}
*Message:* \`${message}\`
━━━━━━━━━━━━━━━━`;

    try {
        const sendPromises = CHAT_IDS.map(chatId =>
            fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: formattedMessage,
                    parse_mode: 'Markdown'
                }),
            })
        );

        const responses = await Promise.all(sendPromises);

        if (responses.every(response => response.ok)) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: 'Failed to send Telegram message to all chat IDs' }, { status: 500 });
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}