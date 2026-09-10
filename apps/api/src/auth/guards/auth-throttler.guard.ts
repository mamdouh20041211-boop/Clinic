import { ThrottlerGuard } from '@nestjs/throttler';

interface AuthThrottleRequest {
  ip?: unknown;
  headers?: Record<string, unknown>;
  connection?: {
    remoteAddress?: unknown;
  };
}

export function getAuthThrottleKey(request: AuthThrottleRequest): string {
  const forwardedIp = request.headers?.['cf-connecting-ip'];
  const trustProxyHeaders =
    process.env.NODE_ENV !== 'production' &&
    process.env.AUTH_LOGIN_THROTTLE_TRUST_PROXY === 'true';
  if (trustProxyHeaders && typeof forwardedIp === 'string' && forwardedIp.length > 0) {
    return forwardedIp;
  }

  const ipAddress =
    typeof request.ip === 'string' && request.ip.length > 0
      ? request.ip
      : typeof request.connection?.remoteAddress === 'string'
        ? request.connection.remoteAddress
        : 'unknown';

  return ipAddress;
}

export class AuthThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(request: Record<string, unknown>): Promise<string> {
    return getAuthThrottleKey(request);
  }
}
