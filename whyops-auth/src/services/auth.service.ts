import { createServiceLogger } from '@whyops/shared/logger';
import { User } from '@whyops/shared/models';
import bcrypt from 'bcrypt';
import { generateJWT } from '../middleware/jwtAuth';

const logger = createServiceLogger('auth:auth-service');

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  token: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    const { email, password, name } = data;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      name,
      isActive: true,
    });

    logger.info({ userId: user.id, email }, 'User registered');

    // Generate JWT
    const token = generateJWT({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if active
    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    logger.info({ userId: user.id, email }, 'User logged in');

    // Generate JWT
    const token = generateJWT({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<{ userId: string; email: string }> {
    // JWT verification is handled by middleware
    // This is a placeholder for additional token validation if needed
    throw new Error('Not implemented - use middleware');
  }
}
