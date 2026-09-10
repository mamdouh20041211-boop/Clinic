import { getAuthThrottleKey } from './auth-throttler.guard';

describe('getAuthThrottleKey', () => {
  it('uses the Cloudflare client IP only for explicitly enabled non-production proxying', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalTrustProxy = process.env.AUTH_LOGIN_THROTTLE_TRUST_PROXY;
    process.env.NODE_ENV = 'development';
    process.env.AUTH_LOGIN_THROTTLE_TRUST_PROXY = 'true';

    const firstSessionKey = getAuthThrottleKey({
      ip: '172.18.0.1',
      headers: { 'cf-connecting-ip': '203.0.113.10' },
    });
    const secondSessionKey = getAuthThrottleKey({
      ip: '172.18.0.1',
      headers: { 'cf-connecting-ip': '203.0.113.11' },
    });

    expect(firstSessionKey).toBe('203.0.113.10');
    expect(secondSessionKey).not.toBe(firstSessionKey);

    process.env.NODE_ENV = originalNodeEnv;
    process.env.AUTH_LOGIN_THROTTLE_TRUST_PROXY = originalTrustProxy;
  });

  it('ignores forwarded client IPs in production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalTrustProxy = process.env.AUTH_LOGIN_THROTTLE_TRUST_PROXY;
    process.env.NODE_ENV = 'production';
    process.env.AUTH_LOGIN_THROTTLE_TRUST_PROXY = 'true';

    expect(
      getAuthThrottleKey({
        ip: '172.18.0.1',
        headers: { 'cf-connecting-ip': '203.0.113.10' },
      }),
    ).toBe('172.18.0.1');

    process.env.NODE_ENV = originalNodeEnv;
    process.env.AUTH_LOGIN_THROTTLE_TRUST_PROXY = originalTrustProxy;
  });

  it('falls back to the request IP when no trusted proxy header exists', () => {
    expect(getAuthThrottleKey({ ip: '203.0.113.10' })).toBe(
      '203.0.113.10',
    );
  });
});
