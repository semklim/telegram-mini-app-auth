import { createHmac, webcrypto } from 'crypto';

export default async function isHashValid(
  data: Record<string, string>,
  botToken: string,
) {
  const encoder = new TextEncoder();

  const checkString = Object.keys(data)
    .filter((key) => key !== 'hash')
    .map((key) => `${key}=${data[key]}`)
    .sort()
    .join('\n');

  const secretKey = await webcrypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign'],
  );

  const secret = await webcrypto.subtle.sign(
    'HMAC',
    secretKey,
    encoder.encode(botToken),
  );

  const signatureKey = await webcrypto.subtle.importKey(
    'raw',
    secret,
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign'],
  );

  const signature = await webcrypto.subtle.sign(
    'HMAC',
    signatureKey,
    encoder.encode(checkString),
  );

  const hex = Buffer.from(signature).toString('hex');

  return data.hash === hex;
}

/**
 * Validates data received from the Telegram Mini App.
 * @param initData - The `Telegram.WebApp.initData` string.
 * @param botToken - Your Telegram bot's token.
 * @returns `true` if the data is valid, otherwise `false`.
 */
export function validateTelegramData(
  initData: string,
  botToken: string,
): boolean {
  if (!initData || !botToken) {
    throw new Error('initData and botToken are required');
  }

  const data = new URLSearchParams(initData);

  // Extract the hash from the data
  const receivedHash = data.get('hash');
  if (!receivedHash) {
    return false;
  }
  data.delete('hash'); // Remove hash for validation

  // Construct the data-check-string
  const dataCheckString = Array.from(data.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Generate the secret key
  const secretKey = createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  // Generate the HMAC for the data-check-string
  const computedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  // Compare the computed hash with the received hash
  return computedHash === receivedHash;
}
