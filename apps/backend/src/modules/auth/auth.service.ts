
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env';

export class AuthService {
  static generateToken(userId: string, email: string): string {
    return jwt.sign(
      { id: userId, email },
      ENV.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // Future logic: OAuth2, Password hashing, User registration
}
