import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { validateTelegramData } from '@/libs/helpers/tgValidateUser/tgValidateUser';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

if (!BOT_TOKEN) {
  throw new Error('Telegram bot token is missing.');
}


const mokeData = "query_id=AAF3kK0XAAAAAHeQrRfJ0bBv&user=%7B%22id%22%3A397250679%2C%22first_name%22%3A%22%D0%A0%D0%BE%D0%BC%D0%B0%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22semklim%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FFLW__Gtmj6gfITmKedJVuIsyN6nvoHO9YGucdUC-f7M.svg%22%7D&auth_date=1732441749&signature=xY7Ac2LzOdao_UOzVfIUFsBTs6ky2c2NscZDQhMMNeq73xQH4yHoHTD0GOdeghmajaHBjgbLNwRZJ2MPqJobBA&hash=c0034e18dc01b309bbc72b0b34856cdebe323cf3080fe0103b1f0425bfa8247f";

export const POST = async (req: NextRequest) => {
  try {
    const data = (await req.json()) as { initData?: string };
    const initData = data.initData ? data.initData : mokeData;
    
    if (req.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        {
          status: 405,
        },
      );
    }

    if (!initData) {
      return NextResponse.json(
        {
          error: 'Missing required field initData',
        },
        {
          status: 400,
        },
      );
    }

    if (!BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }

    const isValid = validateTelegramData(initData, BOT_TOKEN);

    if (isValid) {
      const data = new URLSearchParams(initData);
      const authDate = Number(data.get('auth_date'));
      const now = Math.floor(Date.now() / 1000);
      const timeDifference = now - authDate;

      // Reject data older than 24 hours
      if (timeDifference > 86400) {
        return NextResponse.json(
          { error: 'Outdated Telegram data' },
          { status: 403 },
        );
      }
      const allData = (Object.fromEntries(new Map<string, unknown>(data.entries())));
      allData.ok = true;
      allData.user = JSON.parse(data.get('user')!);
      // const user = JSON.parse(data.get('user')!);
      return NextResponse.json(allData, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid hash' }, { status: 403 });
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
