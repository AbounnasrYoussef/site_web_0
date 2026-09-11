const {
  generateRefreshToken,
  hashRefreshToken,
  generateAccessToken,
  verifyAccessToken,
  getDeviceFingerprint,
} = require('../../controllers/auth.helpers');

describe('Auth Helpers', () => {
  test('generateRefreshToken returns a 32-byte hex string', () => {
    const token = generateRefreshToken();
    expect(token).toHaveLength(64);
    expect(typeof token).toBe('string');
  });

  test('hashRefreshToken returns a SHA-256 hash', () => {
    const token = 'abcdef123456';
    const hash = hashRefreshToken(token);
    expect(hash).toHaveLength(64);
    expect(hash).toBe(hashRefreshToken(token));
  });

  test('generateAccessToken returns a JWT', () => {
    const payload = { id: '123', role: 'USER' };
    const token = generateAccessToken(payload);
    expect(token).toMatch(/^eyJ/); // JWT starts with 'eyJ'
  });

  test('verifyAccessToken returns decoded payload for valid token', () => {
    const payload = { id: '123', role: 'USER' };
    const token = generateAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded).toMatchObject({ id: '123', role: 'USER' });
  });

  test('verifyAccessToken returns null for invalid token', () => {
    const decoded = verifyAccessToken('invalid.token.here');
    expect(decoded).toBeNull();
  });

  test('getDeviceFingerprint generates consistent hash for same request', () => {
    const req = {
      headers: { 'user-agent': 'Chrome' },
      ip: '192.168.1.1',
    };
    const fp1 = getDeviceFingerprint(req);
    const fp2 = getDeviceFingerprint(req);
    expect(fp1).toBe(fp2);
  });

  test('getDeviceFingerprint handles missing ip/userAgent', () => {
    const req = { headers: {}, ip: undefined };
    const fp = getDeviceFingerprint(req);
    expect(fp).toHaveLength(64);
  });
});