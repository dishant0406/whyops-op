import { createServiceLogger } from '@whyops/shared/logger';
import { Context } from 'hono';
import { AuthService, LoginData, RegisterData } from '../services';
import { ResponseUtil } from '../utils';

const logger = createServiceLogger('auth:auth-controller');

export class AuthController {
  /**
   * Register a new user
   */
  static async register(c: Context) {
    try {
      const data = c.req.valid('json') as RegisterData;
      const result = await AuthService.register(data);
      return ResponseUtil.created(c, result);
    } catch (error: any) {
      logger.error({ error }, 'Registration failed');
      
      if (error.message === 'User already exists') {
        return ResponseUtil.badRequest(c, error.message);
      }
      
      return ResponseUtil.internalError(c, 'Registration failed');
    }
  }

  /**
   * Login user
   */
  static async login(c: Context) {
    try {
      const data = c.req.valid('json') as LoginData;
      const result = await AuthService.login(data);
      return ResponseUtil.success(c, result);
    } catch (error: any) {
      logger.error({ error }, 'Login failed');
      
      if (error.message === 'Invalid credentials' || error.message === 'Account is inactive') {
        return ResponseUtil.unauthorized(c, error.message);
      }
      
      return ResponseUtil.internalError(c, 'Login failed');
    }
  }
}
