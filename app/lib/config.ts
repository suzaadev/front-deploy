const stripTrailingSlash = (value: string) =>
  value.endsWith('/') ? value.slice(0, -1) : value;

export const PAYMENT_PORTAL_BASE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_PAYMENT_PORTAL_URL || 'http://localhost:3065',
);

export const PUBLIC_API_BASE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3060',
);
