import jwt from 'jsonwebtoken';

export function generateJwt(payload) {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_samadhan_setu_2026';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export default generateJwt;
