import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'taskho-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function generateResetToken() {
  return jwt.sign({ purpose: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
}
