import jwt from 'jsonwebtoken';

// TODO: Add secure claims, expirations, and key rotation strategy.
export function generateJwt(payload) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}
