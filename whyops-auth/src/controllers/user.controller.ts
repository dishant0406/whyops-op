import { createServiceLogger } from '@whyops/shared/logger';
import { Context } from 'hono';
import { auth } from '../lib/auth';
import { ResponseUtil } from '../utils';

const logger = createServiceLogger('auth:user-controller');

export class UserController {
  /**
   * Get current user profile
   */
  static async getCurrentUser(c: Context) {
    try {
      const user = c.get('user');

      if (!user) {
        return ResponseUtil.unauthorized(c, 'Not authenticated');
      }

      return ResponseUtil.success(c, {
        id: user.id,
        email: user.email,
        name: user.name,
        metadata: user.metadata,
        isActive: user.isActive,
      });
    } catch (error: any) {
      logger.error({ error }, 'Failed to fetch user');
      return ResponseUtil.internalError(c, 'Failed to fetch user');
    }
  }

  /**
   * Update current user profile
   */
  static async updateCurrentUser(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user) {
        return ResponseUtil.unauthorized(c, 'Not authenticated');
      }

      const data = await c.req.json();
      
      // Use Better Auth's update user API
      await auth.api.updateUser({
        headers: c.req.raw.headers,
        body: {
          name: data.name,
          image: data.image,
        },
      });

      // For custom fields, we'd need to update them separately
      // This is a simplified version - you might want to extend Better Auth
      // or use hooks to handle custom fields

      return ResponseUtil.success(c, {
        message: 'User updated successfully',
      });
    } catch (error: any) {
      logger.error({ error }, 'Failed to update user');
      return ResponseUtil.internalError(c, 'Failed to update user');
    }
  }
}
